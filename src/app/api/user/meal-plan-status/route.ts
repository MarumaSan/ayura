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
            status: { $in: ['รอจัดส่ง', 'กำลังจัดเตรียม'] }
        }).sort({ createdAt: -1 });

        if (activeOrder) {
            return NextResponse.json({
                hasMealPlan: true,
                mealSetId: activeOrder.mealSetId,   // Include mealSetId for dashboard to fetch meals
                plan: activeOrder.plan,
                status: activeOrder.status,
                deliveryDate: activeOrder.deliveryDate
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
