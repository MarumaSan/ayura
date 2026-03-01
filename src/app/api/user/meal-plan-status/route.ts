import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Find all non-cancelled orders for this user, sorted newest first
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .neq('status', 'ยกเลิก')
            .order('created_at', { ascending: false });

        if (error) throw error;
        const validOrders = orders || [];

        // Prioritize currently delivering active order over new pending pre-orders
        const now = new Date();
        let activeOrder = null;
        let mostRecentPendingOrder = null;

        for (const order of validOrders) {
            if (['รอยืนยันการชำระเงิน', 'รออนุมัติ', 'รอจัดส่ง', 'กำลังขนส่ง'].includes(order.status)) {
                if (!mostRecentPendingOrder) {
                    mostRecentPendingOrder = order;
                }
            } else if (order.status === 'จัดส่งสำเร็จ' && order.delivery_date) {
                const deliveryDate = new Date(order.delivery_date);
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
            if (activeOrder.delivery_date && ['จัดส่งสำเร็จ'].includes(activeOrder.status)) {
                const deliveryDate = new Date(activeOrder.delivery_date);
                const daysToAdd = activeOrder.plan === 'monthly' ? 30 : 7;
                const expiryDate = new Date(deliveryDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

                // Allow it to be negative so the UI can know it expired
                const msRemaining = expiryDate.getTime() - now.getTime();
                remainingDays = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
            }

            // Check if there is a separate pre-order
            let preOrderData = null;
            if (mostRecentPendingOrder && activeOrder.id !== mostRecentPendingOrder.id) {
                preOrderData = {
                    orderId: mostRecentPendingOrder.id,
                    mealSetId: mostRecentPendingOrder.mealset_id,
                    mealSetName: mostRecentPendingOrder.mealset_name,
                    plan: mostRecentPendingOrder.plan,
                    status: mostRecentPendingOrder.status,
                    boxSize: mostRecentPendingOrder.box_size || 'M',
                    totalPrice: mostRecentPendingOrder.total_price,
                    targetDeliveryDate: mostRecentPendingOrder.target_delivery_date
                };
            }

            return NextResponse.json({
                hasMealPlan: true,
                isApproved,
                orderId: activeOrder.id,
                mealSetId: activeOrder.mealset_id,
                plan: activeOrder.plan,
                status: activeOrder.status,
                deliveryDate: activeOrder.delivery_date,
                orderDate: activeOrder.created_at,
                boxSize: activeOrder.box_size || 'M',
                sizeMultiplier: activeOrder.size_multiplier || 1.0,
                totalPrice: activeOrder.total_price,
                customerName: activeOrder.customer_name,
                address: activeOrder.address,
                phone: activeOrder.phone,
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

