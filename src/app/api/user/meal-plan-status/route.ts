import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Find the most recent active order that belongs to this user
        const activeOrder = await Order.findOne({
            userId,
            status: { $in: ['รออนุมัติ', 'รอจัดส่ง', 'กำลังจัดเตรียม', 'จัดส่งแล้ว'] }
        }).sort({ createdAt: -1 });

        if (activeOrder) {
            const isApproved = activeOrder.status !== 'รออนุมัติ';
            return NextResponse.json({
                hasMealPlan: true,
                isApproved,
                mealSetId: activeOrder.mealSetId,
                plan: activeOrder.plan,
                status: activeOrder.status,
                deliveryDate: activeOrder.deliveryDate,
                orderDate: activeOrder.createdAt,
                boxSize: activeOrder.boxSize || 'M',
                sizeMultiplier: activeOrder.sizeMultiplier || 1.0,
            });
        } else {
            return NextResponse.json({ hasMealPlan: false });
        }
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to check meal plan status', details: error.message },
            { status: 500 }
        );
    }
}
