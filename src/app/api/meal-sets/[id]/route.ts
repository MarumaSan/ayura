import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { MealSet } from '@/models/MealSet';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const mealSet = await MealSet.findOne({ id }).populate('recipes');


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
