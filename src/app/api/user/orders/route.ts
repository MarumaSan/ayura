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
    const phoneRegex = /^[0-9\-]{9,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, customerName, mealSetId, mealSetName, plan, boxSize, sizeMultiplier, address, phone, totalPrice, paymentMethod } = body;

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
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
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
            const { data: success, error: deductError } = await supabaseAdmin.rpc('deduct_wallet_balance', {
                p_user_id: userId,
                p_amount: totalPrice
            });

            if (deductError || !success) {
                return NextResponse.json({ 
                    error: 'Insufficient balance or wallet error' 
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
        const { data: activeOrdersList } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'จัดส่งสำเร็จ')
            .order('created_at', { ascending: false });

        const now = getThaiDate();
        if (activeOrdersList) {
            for (const order of activeOrdersList) {
                if (order.delivery_date) {
                    const dDate = new Date(order.delivery_date);
                    const days = order.plan === 'monthly' ? 30 : 7;
                    const expiryD = new Date(dDate.getTime() + days * 24 * 60 * 60 * 1000);
                    if (expiryD > now) {
                        targetDeliveryDate = expiryD.toISOString();
                        break;
                    }
                }
            }
        }

        // 5. Create Order
        const { data: newOrder, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                id: orderIdStr,
                customer_name: sanitizedCustomerName,
                user_id: userId,
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
                target_delivery_date: targetDeliveryDate
            })
            .select()
            .single();

        if (orderError || !newOrder) {
            // Rollback wallet if order creation failed
            if (paymentMethod === 'WALLET') {
                await supabaseAdmin.rpc('refund_wallet_balance', {
                    p_user_id: userId,
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
                console.error(`Failed to deduct stock for ingredient ${update.id}`);
                // Log for manual intervention - don't fail the order
            }
        }

        // 7. Ensure user is marked as having profile completed and points added (upsert simulation)
        const { data: currentUserObj } = await supabaseAdmin.from('users').select('points').eq('id', userId).single();
        if (currentUserObj) {
            await supabaseAdmin
                .from('users')
                .update({
                    points: (currentUserObj.points || 0) + 100,
                    is_profile_complete: true
                })
                .eq('id', userId);
        }

        return NextResponse.json({ success: true, orderId: newOrder.id });

    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create order', details: error.message },
            { status: 500 }
        );
    }
}

