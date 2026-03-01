import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, customerName, mealSetId, mealSetName, plan, boxSize, sizeMultiplier, address, phone, totalPrice, paymentMethod } = body;

        if (!userId || !mealSetId || !plan || !address || !customerName || !paymentMethod) {
            return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
        }

        // 1. Resolve mealSet
        const { data: ms, error: msError } = await supabase
            .from('mealsets')
            .select('*')
            .eq('id', mealSetId)
            .single();

        if (msError || !ms) {
            return NextResponse.json({ error: 'MealSet not found' }, { status: 404 });
        }

        // Fetch box ingredients for this meal set
        const { data: boxItems } = await supabase
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
            const { data: ingredient } = await supabase
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

        // 3. Handle Wallet Payment
        if (paymentMethod === 'WALLET') {
            const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            if ((user.balance || 0) < totalPrice) {
                return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
            }

            // Deduct balance
            await supabase
                .from('users')
                .update({ balance: user.balance - totalPrice })
                .eq('id', userId);
        }

        const d = new Date();
        const yy = d.getFullYear().toString().slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const randomPart = crypto.randomUUID().split('-')[0].substring(0, 4).toUpperCase();
        const orderIdStr = `ORD-${yy}${mm}${dd}-${randomPart}`;

        const initialStatus = paymentMethod === 'PROMPTPAY' ? 'รอยืนยันการชำระเงิน' : 'รออนุมัติ';

        // 4. Target Delivery Date Logic
        let targetDeliveryDate = null;
        const { data: activeOrdersList } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'จัดส่งสำเร็จ')
            .order('created_at', { ascending: false });

        const now = new Date();
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
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                id: orderIdStr,
                customer_name: customerName,
                user_id: userId,
                mealset_id: ms.id,
                mealset_name: mealSetName,
                plan,
                payment_method: paymentMethod,
                box_size: boxSize || 'M',
                size_multiplier: sizeMultiplier || 1.0,
                status: initialStatus,
                address: address,
                phone: phone || '',
                total_price: totalPrice || 0,
                target_delivery_date: targetDeliveryDate
            })
            .select()
            .single();

        if (orderError || !newOrder) {
            throw new Error(orderError?.message || 'Failed to create order record');
        }

        // 6. Actual stock deduction (without transactions this is risky, but works for mock)
        for (const update of ingredientUpdates) {
            await supabase
                .from('ingredients')
                .update({ in_stock: update.currentStock - update.deductAmount })
                .eq('id', update.id);
        }

        // 7. Ensure user is marked as having profile completed and points added (upsert simulation)
        const { data: currentUserObj } = await supabase.from('users').select('points').eq('id', userId).single();
        if (currentUserObj) {
            await supabase
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

