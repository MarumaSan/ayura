import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET() {
    try {
        await connectToDatabase();
        const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        console.error('Failed to fetch users', error);
        return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
    }
}
