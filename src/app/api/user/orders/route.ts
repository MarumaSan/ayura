import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getThaiDate, formatThaiIdDate } from '@/lib/dateUtils';

// Input validation functions
function validateUserId(userId: string): boolean {
    // Now userId is bigint (numeric string), not UUID
    return /^\d+$/.test(userId);
}

function sanitizeString(input: string, maxLength: number = 500): string {
    return input.trim().replace(/[<>\"'&]/g, '').substring(0, maxLength);
}

function validatePhone(phone: string): boolean {
    // Must be exactly 10 digits, numeric only
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const { userId, customerName, mealSetId, mealSetName, plan, boxSize, sizeMultiplier, address, phone, totalPrice, originalPrice, discountAmount, couponCode, paymentMethod, isPreOrder } = body;

        if (!userId || !mealSetId || !plan || !address || !customerName || !paymentMethod) {
            return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
        }

        // Validate userId format
        if (!validateUserId(userId)) {
            return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
        }

        // Validate payment method
        if (!['PROMPTPAY', 'WALLET'].includes(paymentMethod)) {
            return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
        }

        // Validate plan
        if (!['weekly', 'monthly'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
        }

        // Sanitize inputs
        const sanitizedAddress = sanitizeString(address, 1000);
        const sanitizedPhone = phone ? sanitizeString(phone, 20) : '';
        const sanitizedCustomerName = sanitizeString(customerName, 100);

        if (sanitizedPhone && !validatePhone(sanitizedPhone)) {
            return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 });
        }

        // Check pre-order conditions if isPreOrder is true
        let isPreorderFlag = false;
        let mainOrderDeliveryDate = null;
        let mainOrderPlan = null;

        if (isPreOrder === true) {
            // Find the most recent completed order for this user
            const { data: completedOrders } = await supabaseAdmin
                .from('orders')
                .select('*')
                .eq('user_id', parseInt(userId, 10))
                .eq('status', 'จัดส่งสำเร็จ')
                .order('created_at', { ascending: false })
                .limit(1);

            if (!completedOrders || completedOrders.length === 0) {
                return NextResponse.json({ 
                    error: 'Cannot create pre-order: No completed order found. You must have a delivered box before pre-ordering.' 
                }, { status: 400 });
            }

            const mainOrder = completedOrders[0];
            const now = getThaiDate();
            
            // Check if main order is still active (not expired)
            const dateToUse = mainOrder.delivery_date || mainOrder.target_delivery_date || mainOrder.created_at;
            const deliveryDate = new Date(dateToUse);
            const daysToAdd = mainOrder.plan === 'monthly' ? 30 : 7;
            const expiryDate = new Date(deliveryDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
            
            // Only allow pre-order if main order is still active
            if (expiryDate <= now) {
                return NextResponse.json({ 
                    error: 'Cannot create pre-order: Your current box has already expired. Please order a new main box instead.' 
                }, { status: 400 });
            }

            // Check if user already has a pending pre-order
            const { data: existingPreorders } = await supabaseAdmin
                .from('orders')
                .select('*')
                .eq('user_id', parseInt(userId, 10))
                .eq('is_preorder', true)
                .in('status', ['รอยืนยันการชำระเงิน', 'รออนุมัติ', 'รอจัดส่ง', 'กำลังขนส่ง']);

            if (existingPreorders && existingPreorders.length > 0) {
                return NextResponse.json({ 
                    error: 'You already have a pending pre-order. Please wait for it to be processed or contact admin.' 
                }, { status: 400 });
            }

            isPreorderFlag = true;
            mainOrderDeliveryDate = mainOrder.delivery_date;
            mainOrderPlan = mainOrder.plan;
        }

        // 1. Resolve mealSet
        const { data: ms, error: msError } = await supabaseAdmin
            .from('mealsets')
            .select('*')
            .eq('id', mealSetId)
            .single();

        if (msError || !ms) {
            return NextResponse.json({ error: 'MealSet not found' }, { status: 404 });
        }

        // Fetch box ingredients for this meal set
        const { data: boxItems } = await supabaseAdmin
            .from('mealset_box_ingredients')
            .select('*')
            .eq('mealset_id', ms.id);

        const boxIngredients = boxItems || [];

        // 2. Verify and deduct stock
        const planMultiplier = plan === 'monthly' ? 4 : 1;
        const requiredMultiplier = (sizeMultiplier || 1.0) * planMultiplier;

        // Verify all first
        const ingredientUpdates = [];
        for (const item of boxIngredients) {
            const requiredGrams = item.grams_per_week * requiredMultiplier;
            const { data: ingredient } = await supabaseAdmin
                .from('ingredients')
                .select('*')
                .eq('id', item.ingredient_id)
                .single();

            if (!ingredient) {
                return NextResponse.json({ error: 'STOCK_ERROR', message: `Ingredient ${item.ingredient_id} not found` }, { status: 400 });
            }
            if ((ingredient.in_stock || 0) < requiredGrams) {
                return NextResponse.json({ error: 'STOCK_ERROR', message: `Not enough stock for ${ingredient.name}` }, { status: 400 });
            }

            ingredientUpdates.push({
                id: item.ingredient_id,
                currentStock: ingredient.in_stock,
                deductAmount: requiredGrams
            });
        }

        // 3. Handle Wallet Payment - Use atomic function
        if (paymentMethod === 'WALLET') {
            const userIdInt = parseInt(userId, 10);
        const { data: success, error: deductError } = await supabaseAdmin.rpc('deduct_wallet_balance', {
                p_user_id: userIdInt,
                p_amount: totalPrice
            });

            if (deductError || !success) {
                return NextResponse.json({ 
                    error: 'Insufficient balance or wallet error',
                    details: deductError?.message || 'Balance may be insufficient'
                }, { status: 400 });
            }
        }

        const d = getThaiDate();
        const dateStr = formatThaiIdDate(d);
        const randomPart = crypto.randomUUID().split('-')[0].substring(0, 4).toUpperCase();
        const orderIdStr = `ORD-${dateStr}-${randomPart}`;

        const initialStatus = paymentMethod === 'PROMPTPAY' ? 'รอยืนยันการชำระเงิน' : 'รออนุมัติ';

        // 4. Target Delivery Date Logic
        let targetDeliveryDate = null;
        
        if (isPreorderFlag && mainOrderDeliveryDate) {
            // For pre-orders: Calculate from main order's delivery_date + plan days
            const deliveryDate = new Date(mainOrderDeliveryDate);
            const daysToAdd = mainOrderPlan === 'monthly' ? 30 : 7;
            targetDeliveryDate = new Date(deliveryDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
        } else {
            // Regular order logic: Find active completed orders
            const { data: activeOrdersList } = await supabaseAdmin
                .from('orders')
                .select('*')
                .eq('user_id', parseInt(userId, 10))
                .eq('status', 'จัดส่งสำเร็จ')
                .order('created_at', { ascending: false });

            const now = getThaiDate();
            if (activeOrdersList && activeOrdersList.length > 0) {
                // Find the most recent completed order with a delivery date
                for (const order of activeOrdersList) {
                    const dateToUse = order.delivery_date || order.target_delivery_date || order.created_at;
                    if (!dateToUse) continue;
                    
                    const dDate = new Date(dateToUse);
                    const days = order.plan === 'monthly' ? 30 : 7;
                    const expiryD = new Date(dDate.getTime() + days * 24 * 60 * 60 * 1000);
                    
                    if (expiryD > now) {
                        // This order's period is still active, next delivery starts after it expires
                        targetDeliveryDate = expiryD.toISOString();
                        break;
                    }
                }
            }
            
            // If no active completed order found, use current time as target delivery
            if (!targetDeliveryDate) {
                targetDeliveryDate = now.toISOString();
            }
        }

        // 5. Create Order
        const { data: newOrder, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                id: orderIdStr,
                customer_name: sanitizedCustomerName,
                user_id: parseInt(userId, 10),
                mealset_id: ms.id,
                mealset_name: mealSetName,
                plan,
                payment_method: paymentMethod,
                box_size: boxSize || 'M',
                size_multiplier: sizeMultiplier || 1.0,
                status: initialStatus,
                address: sanitizedAddress,
                phone: sanitizedPhone,
                total_price: totalPrice || 0,
                target_delivery_date: targetDeliveryDate,
                is_preorder: isPreorderFlag,
                // Coupon info
                coupon_code: couponCode || null,
                discount_amount: discountAmount || 0,
            })
            .select()
            .single();

        if (orderError || !newOrder) {
            // Rollback wallet if order creation failed
            if (paymentMethod === 'WALLET') {
                await supabaseAdmin.rpc('refund_wallet_balance', {
                    p_user_id: parseInt(userId, 10),
                    p_amount: totalPrice
                });
            }
            throw new Error(orderError?.message || 'Failed to create order record');
        }

        // 6. Deduct stock atomically using database function
        for (const update of ingredientUpdates) {
            const { data: deductSuccess, error: deductError } = await supabaseAdmin.rpc('deduct_ingredient_stock', {
                p_ingredient_id: update.id,
                p_amount: update.deductAmount
            });

            if (deductError || !deductSuccess) {
                // Silently log for manual intervention - don't fail the order
            }
        }

        // 7. Calculate and add points based on plan type
        const pointsToAdd = plan === 'monthly' ? 500 : 100;
        
        const { data: currentUserObj, error: userError } = await supabaseAdmin.from('users').select('points').eq('id', parseInt(userId, 10)).single();
        
        if (userError) {
            // Silent fail for points update
        }
        
        if (currentUserObj) {
            const newPoints = (currentUserObj.points || 0) + pointsToAdd;
            
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({
                    points: newPoints,
                    is_profile_complete: true
                })
                .eq('id', parseInt(userId, 10));
                
            if (updateError) {
                // Silent fail for points update
            }
        } else {
            // Silent fail for points update
        }

        return NextResponse.json({ success: true, orderId: newOrder.id });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to create order', details: error.message },
            { status: 500 }
        );
    }
}

