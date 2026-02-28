import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Ingredient } from '@/models/Ingredient';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const params = await context.params;
        const body = await request.json();

        // User can now define their own unit
        // if (body.unit) {
        //     body.unit = 'กรัม';
        // }

        const updated = await Ingredient.findOneAndUpdate({ id: params.id }, body, { new: true });
        if (!updated) {
            // fallback trying with _id
            const updatedById = await Ingredient.findByIdAndUpdate(params.id, body, { new: true });
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
        const deleted = await Ingredient.findOneAndDelete({ id: params.id });
        if (!deleted) {
            const deletedById = await Ingredient.findByIdAndDelete(params.id);
            if (!deletedById) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
