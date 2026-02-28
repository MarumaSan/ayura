import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function PATCH(request: Request) {
    try {
        await connectToDatabase();

        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const query = orderId.length === 24
            ? { $or: [{ id: orderId }, { _id: orderId }] }
            : { id: orderId };

        const updatedOrder = await Order.findOneAndUpdate(
            query,
            { $set: { status: 'ยกเลิก' } },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
        console.error('Cancel order error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel order', details: error.message },
            { status: 500 }
        );
    }
}
