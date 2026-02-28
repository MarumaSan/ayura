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

        // Find all non-cancelled orders for this user, sorted newest first
        const orders = await Order.find({
            userId,
            status: { $ne: 'ยกเลิก' }
        }).sort({ createdAt: -1 });

        // Prioritize currently delivering active order over new pending pre-orders
        const now = new Date();
        let activeOrder = null;
        let mostRecentPendingOrder = null;

        for (const order of orders) {
            if (['รอยืนยันการชำระเงิน', 'รออนุมัติ', 'รอจัดส่ง', 'กำลังขนส่ง'].includes(order.status)) {
                if (!mostRecentPendingOrder) {
                    mostRecentPendingOrder = order;
                }
            } else if (order.status === 'จัดส่งสำเร็จ' && order.deliveryDate) {
                const deliveryDate = new Date(order.deliveryDate);
                const daysToAdd = order.plan === 'monthly' ? 30 : 7;
                const expiryDate = new Date(deliveryDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

                const msRemaining = expiryDate.getTime() - now.getTime();
                const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

                if (daysRemaining > 0) {
                    // We found an active delivered order. Prioritize this over pending pre-orders.
                    activeOrder = order;
                    break;
                }
            }
        }

        // If no currently delivering active order, fallback to the most recent pending order (which could be a pre-order)
        if (!activeOrder) {
            activeOrder = mostRecentPendingOrder;
        }

        if (activeOrder) {
            const isApproved = !['รอยืนยันการชำระเงิน', 'รออนุมัติ'].includes(activeOrder.status);

            // Calculate remaining days for the response
            let remainingDays = null;
            if (activeOrder.deliveryDate && ['จัดส่งสำเร็จ'].includes(activeOrder.status)) {
                const deliveryDate = new Date(activeOrder.deliveryDate);
                const daysToAdd = activeOrder.plan === 'monthly' ? 30 : 7;
                const expiryDate = new Date(deliveryDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

                // Allow it to be negative so the UI can know it expired, 
                // but technically the loop above should have moved to the next order if it expired.
                const msRemaining = expiryDate.getTime() - now.getTime();
                remainingDays = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
            }

            // Check if there is a separate pre-order
            let preOrderData = null;
            if (mostRecentPendingOrder && (activeOrder.id !== mostRecentPendingOrder.id && activeOrder._id.toString() !== mostRecentPendingOrder._id.toString())) {
                preOrderData = {
                    orderId: mostRecentPendingOrder.id || mostRecentPendingOrder._id.toString(),
                    mealSetId: mostRecentPendingOrder.mealSetId,
                    mealSetName: mostRecentPendingOrder.mealSetName,
                    plan: mostRecentPendingOrder.plan,
                    status: mostRecentPendingOrder.status,
                    boxSize: mostRecentPendingOrder.boxSize || 'M',
                    totalPrice: mostRecentPendingOrder.totalPrice,
                    targetDeliveryDate: mostRecentPendingOrder.targetDeliveryDate
                };
            }

            return NextResponse.json({
                hasMealPlan: true,
                isApproved,
                orderId: activeOrder.id || activeOrder._id.toString(),
                mealSetId: activeOrder.mealSetId,
                plan: activeOrder.plan,
                status: activeOrder.status,
                deliveryDate: activeOrder.deliveryDate,
                orderDate: activeOrder.createdAt,
                deliveredAt: activeOrder.updatedAt,
                boxSize: activeOrder.boxSize || 'M',
                sizeMultiplier: activeOrder.sizeMultiplier || 1.0,
                totalPrice: activeOrder.totalPrice,
                remainingDays,
                preOrder: preOrderData
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
