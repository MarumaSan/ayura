import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { TopupRequest } from '@/models/TopupRequest';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { userId, amount } = body;

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
        }

        const topupRequest = await TopupRequest.create({
            userId,
            amount: Number(amount),
            status: 'pending',
        });

        return NextResponse.json({ success: true, requestId: topupRequest._id });
    } catch (error: any) {
        console.error('Topup request error:', error);
        return NextResponse.json(
            { error: 'Failed to create topup request', details: error.message },
            { status: 500 }
        );
    }
}
