import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { withRateLimit } from '@/lib/rateLimit';
import { generateReferralCode, isValidReferralCode } from '@/lib/referralCodes';

// Input validation functions
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
}

function validatePhone(phone: string): boolean {
    // Must be exactly 10 digits, numeric only
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>\"'&]/g, '');
}

async function registerHandler(request: NextRequest) {
    try {
        const { name, email, password, referralCode, phone } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Validate inputs
        if (!validateName(name)) {
            return NextResponse.json(
                { error: 'Name must be between 2 and 100 characters' },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate phone if provided
        if (phone && !validatePhone(phone)) {
            return NextResponse.json(
                { error: 'Phone number must be exactly 10 digits' },
                { status: 400 }
            );
        }

        // Basic validation
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = email.trim().toLowerCase();

        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', sanitizedEmail)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email is already registered' },
                { status: 409 }
            );
        }

        // Validate referral code if provided
        let referrerId = null;
        let validReferralCode = null;
        if (referralCode) {
            if (!isValidReferralCode(referralCode)) {
                return NextResponse.json(
                    { error: 'Invalid referral code format' },
                    { status: 400 }
                );
            }
            
            const { data: referrer } = await supabaseAdmin
                .from('users')
                .select('id, referral_code')
                .eq('referral_code', referralCode.toUpperCase())
                .single();
            
            if (!referrer) {
                return NextResponse.json(
                    { error: 'Referral code not found' },
                    { status: 404 }
                );
            }
            
            referrerId = referrer.id;
            validReferralCode = referralCode.toUpperCase();
        }

        // Hash password with bcrypt (cost factor 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate temporary referral code (will be updated after insert)
        const newReferralCode = await generateReferralCode('TEMP');

        const { data: newUser, error } = await supabaseAdmin
            .from('users')
            .insert({
                name: sanitizedName,
                email: sanitizedEmail,
                password: hashedPassword,
                is_profile_complete: false,
                points: validReferralCode ? 50 : 0, // Bonus 50 points for using referral
                streak: 0,
                role: 'user',
                referral_code: newReferralCode,
                referred_by_code: validReferralCode
            })
            .select()
            .single();

        if (error || !newUser) {
            throw new Error(error?.message || 'Failed to insert user');
        }

        // Update referral code with actual user ID
        const finalReferralCode = await generateReferralCode(newUser.id);
        await supabaseAdmin
            .from('users')
            .update({ referral_code: finalReferralCode })
            .eq('id', newUser.id);

        // Create referral record and award points if referral code was used
        if (referrerId && validReferralCode) {
            await supabaseAdmin.from('referrals').insert({
                referrer_id: referrerId,
                referred_id: newUser.id,
                referral_code: validReferralCode,
                status: 'rewarded',
                points_awarded: 50
            });

            // Award 50 points to referrer
            const { data: referrerData } = await supabaseAdmin
                .from('users')
                .select('points')
                .eq('id', referrerId)
                .single();
            
            if (referrerData) {
                await supabaseAdmin
                    .from('users')
                    .update({ points: referrerData.points + 50 })
                    .eq('id', referrerId);
            }
        }

        return NextResponse.json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                points: newUser.points,
                isProfileComplete: newUser.is_profile_complete,
                role: newUser.role,
                referralCode: finalReferralCode,
                referralBonus: validReferralCode ? 50 : 0
            }
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Registration failed', details: error.message },
            { status: 500 }
        );
    }
}

export const POST = withRateLimit(registerHandler, true);

