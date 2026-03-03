import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';

// Input validation
function validateUserId(userId: string): boolean {
    // Now userId is bigint (number), not UUID
    return typeof userId === 'number' || /^\d+$/.test(userId);
}

function validateAmount(amount: number): boolean {
    return typeof amount === 'number' && amount > 0 && amount <= 100000 && Number.isFinite(amount);
}

async function topupHandler(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, amount } = body;

        if (!userId || !validateUserId(userId)) {
            return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
        }

        if (!validateAmount(amount)) {
            return NextResponse.json({ error: 'Amount must be between 1 and 100,000' }, { status: 400 });
        }

        const { data: topupRequest, error } = await supabaseAdmin
            .from('topup_requests')
            .insert({
                user_id: parseInt(userId, 10),
                amount: Math.floor(amount),
                status: 'pending'
            })
            .select('id, user_id, amount, status, created_at')
            .single();

        if (error || !topupRequest) {
            throw new Error(error?.message || 'Failed to create topup request');
        }

        return NextResponse.json({ success: true, requestId: topupRequest.id });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to create topup request', details: error.message },
            { status: 500 }
        );
    }
}

export const POST = withRateLimit(topupHandler, false);

