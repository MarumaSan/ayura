import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, amount } = body;

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        const requestId = `top-${crypto.randomUUID().split('-')[0]}`;

        const { data: topupRequest, error } = await supabase
            .from('topup_requests')
            .insert({
                id: requestId,
                user_id: userId,
                amount: Number(amount),
                status: 'pending'
            })
            .select()
            .single();

        if (error || !topupRequest) {
            throw new Error(error?.message || 'Failed to create topup request');
        }

        return NextResponse.json({ success: true, requestId: topupRequest.id });
    } catch (error: any) {
        console.error('Topup request error:', error);
        return NextResponse.json(
            { error: 'Failed to create topup request', details: error.message },
            { status: 500 }
        );
    }
}

