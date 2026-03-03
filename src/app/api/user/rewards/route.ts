import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

        // Get user by email
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, points')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get user's redeemed rewards
        const { data: redemptions, error: redemptionsError } = await supabaseAdmin
            .from('reward_redemptions')
            .select('*')
            .eq('user_id', user.id)
            .order('redeemed_at', { ascending: false });

        if (redemptionsError) {
            return NextResponse.json(
                { error: 'Failed to fetch rewards' },
                { status: 500 }
            );
        }

        // Get user's active coupons (not used yet)
        const { data: activeCoupons, error: couponsError } = await supabaseAdmin
            .from('user_coupons')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (couponsError) {
            // Silent fail for coupons
        }

        return NextResponse.json({
            currentPoints: user.points || 0,
            redemptions: redemptions || [],
            activeCoupons: activeCoupons || []
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
