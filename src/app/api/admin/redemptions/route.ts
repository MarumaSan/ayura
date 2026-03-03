import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get all pending item redemptions (for admin)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        const { data: redemptions, error } = await supabaseAdmin
            .from('reward_redemptions')
            .select(`
                *,
                users!inner (name, email, phone)
            `)
            .eq('reward_type', 'item')
            .eq('status', status)
            .order('redeemed_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch redemptions' },
                { status: 500 }
            );
        }

        return NextResponse.json({ redemptions: redemptions || [] });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Update redemption status (mark as delivered/cancelled)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { redemptionId, status, notes } = body;

        if (!redemptionId || !status) {
            return NextResponse.json(
                { error: 'Redemption ID and status are required' },
                { status: 400 }
            );
        }

        const updateData: any = {
            status: status
        };

        if (status === 'delivered') {
            updateData.used_at = new Date().toISOString();
        }

        if (notes) {
            updateData.notes = notes;
        }

        const { error } = await supabaseAdmin
            .from('reward_redemptions')
            .update(updateData)
            .eq('id', redemptionId);

        if (error) {
            return NextResponse.json(
                { error: 'Failed to update redemption', details: error.message, code: error.code },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
