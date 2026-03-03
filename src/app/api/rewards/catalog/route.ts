import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: rewards, error } = await supabaseAdmin
            .from('rewards_catalog')
            .select('*')
            .eq('is_active', true)
            .order('points_required', { ascending: true });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch rewards' },
                { status: 500 }
            );
        }

        return NextResponse.json({ rewards: rewards || [] });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
