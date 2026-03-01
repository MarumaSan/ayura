import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Reward definitions (must match frontend)
const rewards = [
    { id: 'rd1', name: 'ส่วนลด 100 บาท ค่าส่ง', pointsRequired: 1000 },
    { id: 'rd2', name: 'ฟรี น้ำผลไม้สกัดเย็น', pointsRequired: 1000 },
    { id: 'rd3', name: 'เซ็ตสมุนไพรพรีเมียม', pointsRequired: 2500 },
    { id: 'rd4', name: 'ส่วนลด 20% ออร์เดอร์ถัดไป', pointsRequired: 4000 },
    { id: 'rd5', name: 'กล่องสุขภาพรายสัปดาห์ฟรี 1 กล่อง', pointsRequired: 8000 },
];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, rewardId } = body;

        if (!email || !rewardId) {
            return NextResponse.json(
                { error: 'Email and rewardId are required' },
                { status: 400 }
            );
        }

        // Find the reward
        const reward = rewards.find(r => r.id === rewardId);
        if (!reward) {
            return NextResponse.json(
                { error: 'Invalid reward ID' },
                { status: 400 }
            );
        }

        // Get user by email
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, points, name')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user has enough points
        if ((user.points || 0) < reward.pointsRequired) {
            return NextResponse.json(
                { 
                    error: 'Insufficient points',
                    currentPoints: user.points || 0,
                    requiredPoints: reward.pointsRequired
                },
                { status: 400 }
            );
        }

        // Use the database function to atomically redeem the reward
        const { data: result, error: redeemError } = await supabaseAdmin
            .rpc('redeem_reward', {
                p_user_id: user.id,
                p_reward_id: reward.id,
                p_reward_name: reward.name,
                p_points_required: reward.pointsRequired
            });

        if (redeemError || !result || !result[0]?.success) {
            console.error('Redemption error:', redeemError || result);
            return NextResponse.json(
                { error: result?.[0]?.message || 'Failed to redeem reward' },
                { status: 500 }
            );
        }

        const redemptionResult = result[0];

        return NextResponse.json({
            success: true,
            message: redemptionResult.message,
            redemptionId: redemptionResult.redemption_id,
            reward: {
                id: reward.id,
                name: reward.name,
                pointsUsed: reward.pointsRequired
            },
            remainingPoints: (user.points || 0) - reward.pointsRequired
        });

    } catch (error: any) {
        console.error('Redemption API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
