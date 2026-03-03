import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        const { action } = body; // 'approve' | 'reject'
        const { id } = await context.params;

        const { data: topupReq, error: reqError } = await supabaseAdmin
            .from('topup_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (reqError || !topupReq) {
            return NextResponse.json({ error: 'Topup request not found' }, { status: 404 });
        }
        if (topupReq.status !== 'pending') {
            return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
        }

        if (action === 'approve') {
            const { user_id, amount } = topupReq;

            // 1. Get current user balance
            const { data: userData, error: userGetError } = await supabaseAdmin
                .from('users')
                .select('balance')
                .eq('id', user_id)
                .single();

            if (userGetError || !userData) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // 2. Add amount and update user
            const newBalance = (userData.balance || 0) + amount;

            const { error: userUpdateError } = await supabaseAdmin
                .from('users')
                .update({ balance: newBalance })
                .eq('id', user_id);

            if (userUpdateError) {
                return NextResponse.json({ error: 'Failed to update user balance' }, { status: 500 });
            }

            // 3. Update request status
            const { error: statusUpdateError } = await supabaseAdmin
                .from('topup_requests')
                .update({ status: 'approved' })
                .eq('id', id);

            if (statusUpdateError) {
                return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
            }

            return NextResponse.json({ success: true, newBalance });
        } else if (action === 'reject') {
            const { error } = await supabaseAdmin
                .from('topup_requests')
                .update({ status: 'rejected' })
                .eq('id', id);

            if (error) {
                return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to process', details: error.message }, { status: 500 });
    }
}

