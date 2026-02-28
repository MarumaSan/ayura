import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Community } from '@/models/Community';

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const communities = await Community.find().sort({ name: 1 });
        return NextResponse.json({ success: true, data: communities });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch communities' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        if (!body.id) {
            const cnt = await Community.countDocuments();
            body.id = `C${String(cnt + 1).padStart(3, '0')}-${Date.now()}`;
        }

        const newCommunity = await Community.create(body);
        return NextResponse.json({ success: true, data: newCommunity }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
