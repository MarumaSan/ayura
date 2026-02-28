import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { MealSet } from '@/models/MealSet';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        // Try short string id first, then MongoDB _id
        let mealSet = await MealSet.findOne({ id });

        if (!mealSet && mongoose.isValidObjectId(id)) {
            mealSet = await MealSet.findById(id);
        }

        if (!mealSet) {
            return NextResponse.json({ error: 'MealSet not found' }, { status: 404 });
        }

        return NextResponse.json({ data: mealSet });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch meal set', details: error.message },
            { status: 500 }
        );
    }
}
