import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { couponCode, userId, orderTotal } = body;

        if (!couponCode || !userId || !orderTotal) {
            return NextResponse.json(
                { error: 'Coupon code, user ID, and order total are required' },
                { status: 400 }
            );
        }

        // Find the coupon
        const { data: coupon, error: couponError } = await supabaseAdmin
            .from('user_coupons')
            .select('*')
            .eq('coupon_code', couponCode.toUpperCase())
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (couponError || !coupon) {
            return NextResponse.json(
                { error: 'Invalid or expired coupon code' },
                { status: 400 }
            );
        }

        // Check if expired
        if (new Date(coupon.expires_at) < new Date()) {
            // Update status to expired
            await supabaseAdmin
                .from('user_coupons')
                .update({ status: 'expired' })
                .eq('id', coupon.id);

            return NextResponse.json(
                { error: 'Coupon has expired' },
                { status: 400 }
            );
        }

        // Calculate discount
        let discountAmount = 0;
        let discountDescription = '';

        if (coupon.discount_type === 'fixed') {
            discountAmount = coupon.discount_value;
            discountDescription = `ส่วนลด ${coupon.discount_value} บาท`;
        } else if (coupon.discount_type === 'percentage') {
            discountAmount = (orderTotal * coupon.discount_value) / 100;
            discountDescription = `ส่วนลด ${coupon.discount_value}%`;
        } else if (coupon.discount_type === 'free_shipping') {
            discountAmount = 100; // Assume 100 baht shipping
            discountDescription = 'ส่วนลดค่าจัดส่ง 100 บาท';
        }

        // Ensure discount doesn't exceed order total
        discountAmount = Math.min(discountAmount, orderTotal);

        return NextResponse.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.coupon_code,
                discountType: coupon.discount_type,
                discountValue: coupon.discount_value,
                discountAmount: discountAmount,
                description: discountDescription
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
