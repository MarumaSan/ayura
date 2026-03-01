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
            console.error('Error fetching redemptions:', redemptionsError);
            return NextResponse.json(
                { error: 'Failed to fetch rewards' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            currentPoints: user.points || 0,
            redemptions: redemptions || []
        });

    } catch (error: any) {
        console.error('Rewards API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
