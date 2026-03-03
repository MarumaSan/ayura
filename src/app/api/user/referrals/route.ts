import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { referrerEmail, friendPhone } = body;

        if (!referrerEmail || !friendPhone) {
            return NextResponse.json(
                { error: 'Referrer email and friend phone are required' },
                { status: 400 }
            );
        }

        // Validate phone format (Thai phone)
        const phoneRegex = /^0[0-9]{8,9}$/;
        const sanitizedPhone = friendPhone.replace(/[^0-9]/g, '');
        
        if (!phoneRegex.test(sanitizedPhone)) {
            return NextResponse.json(
                { error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // Get referrer user
        const { data: referrer, error: referrerError } = await supabaseAdmin
            .from('users')
            .select('id, phone')
            .eq('email', referrerEmail)
            .single();

        if (referrerError || !referrer) {
            return NextResponse.json(
                { error: 'Referrer not found' },
                { status: 404 }
            );
        }

        // Check if user is trying to refer themselves
        if (referrer.phone === sanitizedPhone) {
            return NextResponse.json(
                { error: 'Cannot refer yourself' },
                { status: 400 }
            );
        }

        // Check if already referred this phone
        const { data: existingReferral, error: existingError } = await supabaseAdmin
            .from('referrals')
            .select('*')
            .eq('referrer_id', referrer.id)
            .eq('referred_phone', sanitizedPhone)
            .single();

        if (existingReferral) {
            return NextResponse.json(
                { 
                    error: 'Already referred this phone number',
                    status: existingReferral.status,
                    pointsAwarded: existingReferral.points_awarded
                },
                { status: 400 }
            );
        }

        // Check if phone is already registered by another user
        const { data: existingUser, error: userError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('phone', sanitizedPhone)
            .single();

        let initialStatus = 'pending';
        let referredId = null;

        if (existingUser) {
            initialStatus = 'registered';
            referredId = existingUser.id;
        }

        // Create referral record
        const { data: referral, error: referralError } = await supabaseAdmin
            .from('referrals')
            .insert({
                referrer_id: referrer.id,
                referred_id: referredId,
                referred_phone: sanitizedPhone,
                status: initialStatus
            })
            .select()
            .single();

        if (referralError) {
            return NextResponse.json(
                { error: 'Failed to create referral' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: existingUser 
                ? 'เพื่อนของคุณลงทะเบียนแล้ว! คุณจะได้รับ 50 แต้มเมื่อเพื่อนใช้รหัสอ้างอิง'
                : 'ส่งคำเชิญสำเร็จ! คุณจะได้รับ 50 แต้มเมื่อเพื่อนสมัครและใช้รหัสอ้างอิง',
            referralId: referral.id,
            status: initialStatus
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Get user
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get referrals
        const { data: referrals, error: referralsError } = await supabaseAdmin
            .from('referrals')
            .select('*')
            .eq('referrer_id', user.id)
            .order('created_at', { ascending: false });

        if (referralsError) {
            return NextResponse.json(
                { error: 'Failed to fetch referrals' },
                { status: 500 }
            );
        }

        // Calculate total points from referrals
        const totalPoints = referrals?.reduce((sum, r) => sum + (r.points_awarded || 0), 0) || 0;
        const pendingCount = referrals?.filter(r => r.status === 'pending').length || 0;
        const rewardedCount = referrals?.filter(r => r.status === 'rewarded').length || 0;

        return NextResponse.json({
            referrals: referrals || [],
            totalPoints,
            pendingCount,
            rewardedCount,
            totalCount: referrals?.length || 0
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
