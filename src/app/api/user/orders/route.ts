import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { User } from '@/models/User';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { userId, customerName, mealSetId, plan, boxSize, sizeMultiplier, address, totalPrice, paymentMethod } = body;

        if (!userId || !mealSetId || !plan || !address || !customerName || !paymentMethod) {
            return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
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

        // Calculate delivery date (Next Monday)
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
        // Use an ISO string for consistent parsing and storage
        const formattedDeliveryDate = deliveryDate.toISOString();

        // Generate a random order ID like the existing mock data
        const orderIdStr = `ORD-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        const newOrder = await Order.create({
            id: orderIdStr,
            customerName,
            userId,
            mealSetId,
            plan,
            paymentMethod,
            boxSize: boxSize || 'M',
            sizeMultiplier: sizeMultiplier || 1.0,
            status: 'รออนุมัติ',
            deliveryDate: formattedDeliveryDate,
            address,
            totalPrice: totalPrice || 0
        });

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
