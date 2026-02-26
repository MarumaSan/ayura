import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Ingredient } from '@/models/Ingredient';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query = {};
        if (category && category !== 'ทั้งหมด') {
            query = { category };
        }

        const ingredients = await Ingredient.find(query).sort({ name: 1 });

        return NextResponse.json({ data: ingredients });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch ingredients', details: error.message },
            { status: 500 }
        );
    }
}
