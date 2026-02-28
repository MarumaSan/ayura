import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { MealSet } from '@/models/MealSet';
import mongoose from 'mongoose';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { userId, customerName, mealSetId, mealSetName, plan, boxSize, sizeMultiplier, address, phone, totalPrice, paymentMethod } = body;

        if (!userId || !mealSetId || !plan || !address || !customerName || !paymentMethod) {
            return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
        }

        // Resolve mealSetId and check stock
        let resolvedMealSetId = mealSetId;
        const msQuery = mongoose.isValidObjectId(mealSetId) ? { _id: mealSetId } : { id: mealSetId };
        const ms = await MealSet.findOne(msQuery);

        if (!ms) {
            return NextResponse.json({ error: 'MealSet not found' }, { status: 404 });
        }
        resolvedMealSetId = ms.id;

        // Verify and deduct stock
        const { Ingredient } = await import('@/models/Ingredient');
        const planMultiplier = plan === 'monthly' ? 4 : 1;
        const requiredMultiplier = (sizeMultiplier || 1.0) * planMultiplier;

        // Verify all first
        const ingredientUpdates = [];
        for (const item of ms.boxIngredients) {
            const requiredGrams = item.gramsPerWeek * requiredMultiplier;
            const ingredient = await Ingredient.findOne({ id: item.ingredientId });

            if (!ingredient) {
                return NextResponse.json({ error: 'STOCK_ERROR', message: `Ingredient ${item.ingredientId} not found` }, { status: 400 });
            }
            if ((ingredient.inStock || 0) < requiredGrams) {
                return NextResponse.json({ error: 'STOCK_ERROR', message: `Not enough stock for ${ingredient.name}` }, { status: 400 });
            }

            ingredientUpdates.push({
                id: item.ingredientId,
                deductAmount: requiredGrams
            });
        }

        if (paymentMethod === 'WALLET') {
            const query = userId.length === 24
                ? { $or: [{ id: userId }, { _id: userId }] }
                : { id: userId };

            const user = await User.findOne(query);
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            if ((user.balance || 0) < totalPrice) {
                return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
            }
            // Deduct balance
            await User.findOneAndUpdate(
                query,
                { $inc: { balance: -totalPrice } }
            );
        }

        const ts = Date.now().toString(36).toUpperCase();
        const rnd = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const orderIdStr = `ORD-${new Date().getFullYear().toString().slice(-2)}-${ts}${rnd}`;

        // PromptPay orders require admin payment confirmation first
        const initialStatus = paymentMethod === 'PROMPTPAY' ? 'รอยืนยันการชำระเงิน' : 'รออนุมัติ';

        // Find if user already has an active delivered order to calculate targetDeliveryDate
        let targetDeliveryDate = undefined;
        const activeOrdersList = await Order.find({ userId, status: 'จัดส่งสำเร็จ' }).sort({ createdAt: -1 });
        const now = new Date();
        for (const order of activeOrdersList) {
            if (order.deliveryDate) {
                const dDate = new Date(order.deliveryDate);
                const days = order.plan === 'monthly' ? 30 : 7;
                const expiryD = new Date(dDate.getTime() + days * 24 * 60 * 60 * 1000);
                if (expiryD > now) {
                    // This is the currently active plan. Set targetDeliveryDate to its exact expiry date.
                    targetDeliveryDate = expiryD;
                    break;
                }
            }
        }

        const newOrder = await Order.create({
            id: orderIdStr,
            customerName,
            userId,
            mealSetId: resolvedMealSetId,
            mealSetName,
            plan,
            paymentMethod,
            boxSize: boxSize || 'M',
            sizeMultiplier: sizeMultiplier || 1.0,
            status: initialStatus,
            address,
            phone: phone || '',
            totalPrice: totalPrice || 0,
            targetDeliveryDate: targetDeliveryDate
        });

        // Actual deduction
        for (const update of ingredientUpdates) {
            await Ingredient.findOneAndUpdate(
                { id: update.id },
                { $inc: { inStock: -update.deductAmount } }
            );
        }

        // Ensure user is marked as having profile completed and points added
        const profileQuery = userId.length === 24
            ? { $or: [{ id: userId }, { _id: userId }] }
            : { id: userId };

        await User.findOneAndUpdate(
            profileQuery,
            {
                $inc: { points: 100 },
                $set: { isProfileComplete: true }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, orderId: newOrder._id });

    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create order', details: error.message },
            { status: 500 }
        );
    }
}
