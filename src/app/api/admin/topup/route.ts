import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { TopupRequest } from '@/models/TopupRequest';
import { User } from '@/models/User';

export async function GET() {
    try {
        await connectToDatabase();
        const requests = await TopupRequest.find({}).sort({ createdAt: -1 }).lean();

        // Populate user names
        const userIds = [...new Set(requests.map((r: any) => r.userId))];

        // Find users by checking both 'id' and '_id', catching any casting errors for non-ObjectId strings
        const validObjectIds = userIds.filter(id => {
            try { return mongoose.Types.ObjectId.isValid(id); } catch { return false; }
        });

        const users = await User.find({
            $or: [
                { id: { $in: userIds } },
                ...(validObjectIds.length > 0 ? [{ _id: { $in: validObjectIds } }] : [])
            ]
        }).lean();

        const userMap: Record<string, string> = {};
        users.forEach((u: any) => {
            const uId = u.id?.toString() || '';
            const _idStr = u._id?.toString() || '';
            const nameToUse = u.name || u.email || u.id;
            if (uId) userMap[uId] = nameToUse;
            if (_idStr) userMap[_idStr] = nameToUse;
        });

        const enriched = requests.map((r: any) => ({
            ...r,
            userName: userMap[r.userId] || r.userId,
        }));

        return NextResponse.json({ success: true, data: enriched });
    } catch (error: any) {
        console.error('Failed to fetch topup requests', error);
        return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 });
    }
}
