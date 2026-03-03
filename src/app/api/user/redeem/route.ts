import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// Generate unique coupon code
function generateCouponCode(): string {
    return 'AYURA-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, rewardId, deliveryAddress, deliveryPhone } = body;

        if (!email || !rewardId) {
            return NextResponse.json(
                { error: 'Email and reward ID are required' },
                { status: 400 }
            );
        }

        // Get user
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get reward from database catalog
        const { data: reward, error: rewardError } = await supabaseAdmin
            .from('rewards_catalog')
            .select('*')
            .eq('id', rewardId)
            .single();

        if (rewardError || !reward) {
            return NextResponse.json(
                { error: 'Reward not found' },
                { status: 404 }
            );
        }

        // Check if reward is active
        if (!reward.is_active) {
            return NextResponse.json(
                { error: 'This reward is no longer available' },
                { status: 400 }
            );
        }

        // Check stock (if not unlimited)
        if (reward.stock_quantity !== -1 && reward.stock_quantity <= 0) {
            return NextResponse.json(
                { error: 'This reward is out of stock' },
                { status: 400 }
            );
        }

        // Check if user has enough points
        if (user.points < reward.points_required) {
            return NextResponse.json(
                { 
                    error: 'Insufficient points', 
                    required: reward.points_required, 
                    current: user.points 
                },
                { status: 400 }
            );
        }

        // Deduct points from user
        const newPoints = user.points - reward.points_required;
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ points: newPoints })
            .eq('id', user.id);

        if (updateError) {
            return NextResponse.json(
                { error: 'Failed to deduct points' },
                { status: 500 }
            );
        }

        let redemptionData: any = {
            user_id: user.id,
            reward_id: reward.id,
            reward_name: reward.name,
            points_used: reward.points_required,
            reward_type: reward.type,
            status: 'active'
        };

        let couponCode: string | null = null;

        // Handle different reward types
        if (reward.type === 'item') {
            // For physical items, require delivery info
            if (!deliveryAddress || !deliveryPhone) {
                return NextResponse.json(
                    { error: 'Delivery address and phone are required for item rewards' },
                    { status: 400 }
                );
            }

            // Validate phone (10 digits)
            if (!/^[0-9]{10}$/.test(deliveryPhone)) {
                return NextResponse.json(
                    { error: 'Phone number must be exactly 10 digits' },
                    { status: 400 }
                );
            }

            redemptionData.delivery_address = deliveryAddress;
            redemptionData.delivery_phone = deliveryPhone;
            redemptionData.status = 'active'; // Waiting for admin to process

        } else if (reward.type === 'discount') {
            // For discounts, generate coupon code
            couponCode = generateCouponCode();
            
            // Create coupon
            const { error: couponError } = await supabaseAdmin
                .from('user_coupons')
                .insert({
                    user_id: user.id,
                    reward_id: reward.id,
                    coupon_code: couponCode,
                    discount_value: reward.discount_value,
                    discount_type: reward.discount_type,
                    status: 'active',
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days expiry
                });

            if (couponError) {
                return NextResponse.json(
                    { error: 'Failed to create coupon' },
                    { status: 500 }
                );
            }

            redemptionData.notes = `Coupon code: ${couponCode}`;
        }

        // Create redemption record
        const { data: redemption, error: redemptionError } = await supabaseAdmin
            .from('reward_redemptions')
            .insert(redemptionData)
            .select()
            .single();

        if (redemptionError) {
            return NextResponse.json(
                { error: 'Failed to create redemption record' },
                { status: 500 }
            );
        }

        // Decrease stock if not unlimited
        if (reward.stock_quantity !== -1) {
            await supabaseAdmin
                .from('rewards_catalog')
                .update({ stock_quantity: reward.stock_quantity - 1 })
                .eq('id', reward.id);
        }

        return NextResponse.json({
            success: true,
            redemption: redemption,
            couponCode: couponCode,
            remainingPoints: newPoints,
            message: reward.type === 'discount' 
                ? `Redeemed successfully! Your coupon code: ${couponCode}`
                : 'Redeemed successfully! Your item will be delivered soon.'
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get user's redemptions and active coupons
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

        // Get redemptions
        const { data: redemptions, error: redemptionsError } = await supabaseAdmin
            .from('reward_redemptions')
            .select('*')
            .eq('user_id', user.id)
            .order('redeemed_at', { ascending: false });

        if (redemptionsError) {
            return NextResponse.json(
                { error: 'Failed to fetch redemptions' },
                { status: 500 }
            );
        }

        // Get user's active coupons
        const { data: coupons, error: couponsError } = await supabaseAdmin
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
            redemptions: redemptions || [],
            activeCoupons: coupons || []
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
