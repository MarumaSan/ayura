import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { MealSet } from '@/models/MealSet';

export async function GET() {
    try {
        await connectToDatabase();

        const mealSets = await MealSet.find({ isActive: true }).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ data: mealSets });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch meal sets', details: error.message },
            { status: 500 }
        );
    }
}
