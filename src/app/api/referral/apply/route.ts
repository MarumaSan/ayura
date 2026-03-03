import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidReferralCode } from '@/lib/referralCodes';

// Apply referral code for existing user
export async function POST(req: NextRequest) {
    try {
        const { userId, referralCode } = await req.json();

        if (!userId || !referralCode) {
            return NextResponse.json(
                { success: false, error: 'User ID and referral code are required' },
                { status: 400 }
            );
        }

        if (!isValidReferralCode(referralCode)) {
            return NextResponse.json(
                { success: false, error: 'Invalid referral code format' },
                { status: 400 }
            );
        }

        const code = referralCode.toUpperCase();

        // Check if user already has a referrer
        const { data: currentUser } = await supabaseAdmin
            .from('users')
            .select('referred_by_code')
            .eq('id', userId)
            .single();

        if (currentUser?.referred_by_code) {
            return NextResponse.json(
                { success: false, error: 'You have already used a referral code' },
                { status: 400 }
            );
        }

        // Find referrer by code
        const { data: referrer, error: referrerError } = await supabaseAdmin
            .from('users')
            .select('id, name, referral_code')
            .eq('referral_code', code)
            .single();

        if (referrerError || !referrer) {
            return NextResponse.json(
                { success: false, error: 'Referral code not found' },
                { status: 404 }
            );
        }

        // Prevent self-referral
        if (referrer.id === userId) {
            return NextResponse.json(
                { success: false, error: 'Cannot use your own referral code' },
                { status: 400 }
            );
        }

        // Update user with referral code
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ referred_by_code: code })
            .eq('id', userId);

        if (updateError) {
            return NextResponse.json(
                { success: false, error: 'Failed to apply referral code' },
                { status: 500 }
            );
        }

        // Create referral record
        await supabaseAdmin.from('referrals').insert({
            referrer_id: referrer.id,
            referred_id: userId,
            referral_code: code,
            status: 'registered'
        });

        // Award points to referrer (50 points for referral)
        await supabaseAdmin.rpc('increment_points', {
            user_id: referrer.id,
            points: 50
        });

        return NextResponse.json({
            success: true,
            message: 'Referral code applied successfully!',
            referrer: {
                name: referrer.name
            },
            pointsAwarded: 50
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Failed to apply referral code' },
            { status: 500 }
        );
    }
}
