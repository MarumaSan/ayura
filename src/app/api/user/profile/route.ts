import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Input validation and sanitization
function sanitizeString(input: string, maxLength: number = 500): string {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>\"'&]/g, '').substring(0, maxLength);
}

function validateUserId(userId: string): boolean {
    // Now userId is bigint (numeric string), not UUID
    return /^\d+$/.test(userId);
}

function validatePhone(phone: string): boolean {
    // Must be exactly 10 digits, numeric only
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function validateNumber(value: any, min: number, max: number): boolean {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId || !validateUserId(userId)) {
            return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
        }

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, phone, age, gender, weight, height, activity_level, bio, health_goal, points, streak, balance, is_profile_complete, role, referral_code, referred_by_code')
            .eq('id', parseInt(userId, 10))
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isComplete = user.is_profile_complete || (user.weight && user.weight > 0 && user.age && user.age > 0);

        // Return safe profile info (excluding password, etc.)
        return NextResponse.json({
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                age: user.age,
                gender: user.gender || '',
                weight: user.weight,
                height: user.height,
                activityLevel: user.activity_level || '',
                bio: user.bio || '',
                healthGoals: user.health_goal ? user.health_goal.split(',') : [],
                points: user.points,
                streak: user.streak,
                balance: user.balance || 0,
                isProfileComplete: isComplete,
                role: user.role || 'user',
                referralCode: user.referral_code || '',
                referredByCode: user.referred_by_code || ''
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch user profile', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const {
            userId,
            name,
            phone,
            age,
            gender,
            weight,
            height,
            activityLevel,
            bio,
            healthGoals
        } = body;

        if (!userId || !validateUserId(userId)) {
            return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
        }

        // Validate and sanitize inputs
        const sanitizedName = name ? sanitizeString(name, 100) : undefined;
        const sanitizedPhone = phone ? sanitizeString(phone, 20) : undefined;
        const sanitizedBio = bio ? sanitizeString(bio, 1000) : undefined;

        if (sanitizedPhone && !validatePhone(sanitizedPhone)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }

        if (age !== undefined && !validateNumber(age, 1, 120)) {
            return NextResponse.json({ error: 'Age must be between 1 and 120' }, { status: 400 });
        }

        if (weight !== undefined && !validateNumber(weight, 1, 500)) {
            return NextResponse.json({ error: 'Weight must be between 1 and 500 kg' }, { status: 400 });
        }

        if (height !== undefined && !validateNumber(height, 1, 300)) {
            return NextResponse.json({ error: 'Height must be between 1 and 300 cm' }, { status: 400 });
        }

        const healthGoalString = Array.isArray(healthGoals) 
            ? healthGoals.map(g => sanitizeString(g, 50)).join(',') 
            : healthGoals ? sanitizeString(healthGoals, 200) : undefined;

        const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update({
                name: sanitizedName,
                phone: sanitizedPhone,
                age,
                gender: gender ? sanitizeString(gender, 20) : undefined,
                weight,
                height,
                activity_level: activityLevel ? sanitizeString(activityLevel, 50) : undefined,
                bio: sanitizedBio,
                health_goal: healthGoalString,
                is_profile_complete: true
            })
            .eq('id', parseInt(userId, 10))
            .select('id, name, email, phone, age, gender, weight, height, activity_level, bio, health_goal, points, streak, balance, is_profile_complete, role, referral_code, referred_by_code')
            .single();

        if (error || !updatedUser) {
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone || '',
                age: updatedUser.age,
                gender: updatedUser.gender || '',
                weight: updatedUser.weight,
                height: updatedUser.height,
                activityLevel: updatedUser.activity_level || '',
                bio: updatedUser.bio || '',
                healthGoals: updatedUser.health_goal ? updatedUser.health_goal.split(',') : [],
                points: updatedUser.points,
                streak: updatedUser.streak,
                balance: updatedUser.balance || 0,
                isProfileComplete: updatedUser.is_profile_complete,
                role: updatedUser.role || 'user',
                referralCode: updatedUser.referral_code || '',
                referredByCode: updatedUser.referred_by_code || ''
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    }
}

