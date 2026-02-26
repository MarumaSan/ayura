import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = {};
        if (status && status !== 'ทั้งหมด') {
            query = { status };
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ data: orders });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: error.message },
            { status: 500 }
        );
    }
}
