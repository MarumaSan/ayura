import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Community } from '@/models/Community';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const params = await context.params;
        const body = await request.json();

        const updated = await Community.findOneAndUpdate({ id: params.id }, body, { new: true });
        if (!updated) {
            const updatedById = await Community.findByIdAndUpdate(params.id, body, { new: true });
            if (!updatedById) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
            return NextResponse.json({ success: true, data: updatedById });
        }
        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const params = await context.params;
        const deleted = await Community.findOneAndDelete({ id: params.id });
        if (!deleted) {
            const deletedById = await Community.findByIdAndDelete(params.id);
            if (!deletedById) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
