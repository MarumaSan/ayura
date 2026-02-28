import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();

        const params = await context.params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const query = params.id.length === 24
            ? { $or: [{ id: params.id }, { _id: params.id }] }
            : { id: params.id };

        const updatedOrder = await Order.findOneAndUpdate(
            query,
            { $set: { status } },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
        console.error('Update order status error:', error);
        return NextResponse.json(
            { error: 'Failed to update order status', details: error.message },
            { status: 500 }
        );
    }
}
