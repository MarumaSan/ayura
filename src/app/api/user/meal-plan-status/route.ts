import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getThaiDate } from '@/lib/dateUtils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Find all non-cancelled orders for this user, sorted newest first
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('user_id', parseInt(userId, 10))
            .neq('status', 'ยกเลิก')
            .order('created_at', { ascending: false });

        if (error) throw error;
        const validOrders = orders || [];

        // Separate main orders and pre-orders
        const now = getThaiDate();
        let activeMainOrder = null;
        let activePreOrder = null;
        let mostRecentPendingOrder = null;
        let expiredMainOrder = null;

        for (const order of validOrders) {
            if (['รอยืนยันการชำระเงิน', 'รออนุมัติ', 'รอจัดส่ง', 'กำลังขนส่ง'].includes(order.status)) {
                if (order.is_preorder) {
                    // This is a pending pre-order
                    if (!activePreOrder) {
                        activePreOrder = order;
                    }
                } else if (!mostRecentPendingOrder) {
                    mostRecentPendingOrder = order;
                }
            } else if (order.status === 'จัดส่งสำเร็จ') {
                // Use delivery_date (when admin marked as delivered) as the starting point
                const dateToUse = order.delivery_date || order.created_at;
                if (!dateToUse) continue;
                const deliveryDate = new Date(dateToUse);
                const daysToAdd = order.plan === 'monthly' ? 30 : 7;
                const expiryDate = new Date(deliveryDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

                const msRemaining = expiryDate.getTime() - now.getTime();
                const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

                if (daysRemaining > 0) {
                    // We found an active delivered order. Prioritize this over pre-orders.
                    if (!activeMainOrder) {
                        activeMainOrder = order;
                        activeMainOrder.remainingDays = daysRemaining;
                    }
                } else {
                    // This main order has expired - mark it for potential pre-order promotion
                    if (!expiredMainOrder) {
                        expiredMainOrder = order;
                    }
                }
            }
        }

        // Logic: Determine which order to show as "active"
        let activeOrder = null;
        let isPreOrderActive = false;

        if (activeMainOrder) {
            // Case 1: We have an active main order - show it as primary
            activeOrder = activeMainOrder;
            isPreOrderActive = false;
        } else if (expiredMainOrder && activePreOrder) {
            // Case 2: Main order expired and we have a pre-order - promote pre-order to main
            // In a real system, you might want to update the database to mark this as not a pre-order anymore
            // But for now, we'll just display it as the active order
            activeOrder = activePreOrder;
            isPreOrderActive = true;
            // Remove it from pre-order list since it's now "promoted"
            activePreOrder = null;
        } else if (activePreOrder) {
            // Case 3: No main order but have pre-order (waiting for main to expire)
            activeOrder = activePreOrder;
            isPreOrderActive = true;
            activePreOrder = null;
        } else if (mostRecentPendingOrder) {
            // Case 4: No active main or pre-order, but have pending regular order
            activeOrder = mostRecentPendingOrder;
            isPreOrderActive = false;
            mostRecentPendingOrder = null;
        }

        if (activeOrder) {
            const isApproved = !['รอยืนยันการชำระเงิน', 'รออนุมัติ'].includes(activeOrder.status);

            // Calculate remaining days for the response
            let remainingDays = null;
            if (['จัดส่งสำเร็จ'].includes(activeOrder.status)) {
                // Use delivery_date (when admin marked as delivered) as the starting point
                const dateToUse = activeOrder.delivery_date || activeOrder.created_at;
                if (dateToUse) {
                    const deliveryDate = new Date(dateToUse);
                    const daysToAdd = activeOrder.plan === 'monthly' ? 30 : 7;
                    const expiryDate = new Date(deliveryDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

                    // Allow it to be negative so the UI can know it expired
                    const msRemaining = expiryDate.getTime() - now.getTime();
                    remainingDays = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
                }
            }

            // Check if there is a separate pre-order (only if we're showing main order)
            let preOrderData = null;
            if (!isPreOrderActive && activePreOrder) {
                preOrderData = {
                    orderId: activePreOrder.id,
                    mealSetId: activePreOrder.mealset_id,
                    mealSetName: activePreOrder.mealset_name,
                    plan: activePreOrder.plan,
                    status: activePreOrder.status,
                    boxSize: activePreOrder.box_size || 'M',
                    totalPrice: activePreOrder.total_price,
                    targetDeliveryDate: activePreOrder.target_delivery_date,
                    isPreOrder: true
                };
            }

            // Check if user can create a pre-order
            // Conditions:
            // 1. Current order is not a pre-order itself (isPreOrderActive = false)
            // 2. No pending pre-order exists (activePreOrder = null)
            // 3. Current order status is 'จัดส่งสำเร็จ' (must be delivered to pre-order)
            const canPreorder = !isPreOrderActive && !activePreOrder && 
                activeOrder.status === 'จัดส่งสำเร็จ';

            return NextResponse.json({
                hasMealPlan: true,
                isApproved,
                orderId: activeOrder.id,
                mealSetId: activeOrder.mealset_id,
                plan: activeOrder.plan,
                status: activeOrder.status,
                deliveryDate: activeOrder.delivery_date || activeOrder.created_at,
                orderDate: activeOrder.created_at,
                boxSize: activeOrder.box_size || 'M',
                sizeMultiplier: activeOrder.size_multiplier || 1.0,
                totalPrice: activeOrder.total_price,
                customerName: activeOrder.customer_name,
                address: activeOrder.address,
                phone: activeOrder.phone,
                remainingDays,
                isPreOrder: isPreOrderActive,
                canPreorder,
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

