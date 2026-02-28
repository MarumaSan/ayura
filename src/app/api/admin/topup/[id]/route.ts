import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { TopupRequest } from '@/models/TopupRequest';
import { User } from '@/models/User';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { action } = body; // 'approve' | 'reject'
        const { id } = await context.params;

        const topupReq = await TopupRequest.findById(id);
        if (!topupReq) {
            return NextResponse.json({ error: 'Topup request not found' }, { status: 404 });
        }
        if (topupReq.status !== 'pending') {
            return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
        }

        if (action === 'approve') {
            const { userId, amount } = topupReq;
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

            topupReq.status = 'approved';
            await topupReq.save();

            return NextResponse.json({ success: true, newBalance: updatedUser.balance });
        } else if (action === 'reject') {
            topupReq.status = 'rejected';
            await topupReq.save();
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Topup approve/reject error:', error);
        return NextResponse.json({ error: 'Failed to process', details: error.message }, { status: 500 });
    }
}
