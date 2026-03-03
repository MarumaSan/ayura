import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { couponCode, orderId } = body;

        if (!couponCode || !orderId) {
            return NextResponse.json(
                { error: 'Coupon code and order ID are required' },
                { status: 400 }
            );
        }

        // Update coupon status to used
        const { error } = await supabaseAdmin
            .from('user_coupons')
            .update({
                status: 'used',
                used_at: new Date().toISOString()
            })
            .eq('coupon_code', couponCode.toUpperCase());

        if (error) {
            return NextResponse.json(
                { error: 'Failed to mark coupon as used' },
                { status: 500 }
            );
        }

        // Also update redemption record
        await supabaseAdmin
            .from('reward_redemptions')
            .update({
                status: 'used',
                used_at: new Date().toISOString(),
                order_id: orderId
            })
            .ilike('notes', `%${couponCode}%`);

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
