import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { userId, amount } = body;

        if (!userId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure backwards compatibility with manual raw mongo inserts
        const query = userId.length === 24
            ? { $or: [{ id: userId }, { _id: userId }] }
            : { id: userId };

        const updatedUser = await User.findOneAndUpdate(
            query,
            { $inc: { balance: amount } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, balance: updatedUser.balance });
    } catch (error: any) {
        console.error('Topup error:', error);
        return NextResponse.json(
            { error: 'Failed to top up', details: error.message },
            { status: 500 }
        );
    }
}
