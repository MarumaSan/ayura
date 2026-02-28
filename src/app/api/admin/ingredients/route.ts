import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Ingredient } from '@/models/Ingredient';

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        const ingredients = await Ingredient.find().sort({ name: 1 });
        return NextResponse.json({ success: true, data: ingredients });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        // Ensure id is generated if missing
        if (!body.id) {
            const cnt = await Ingredient.countDocuments();
            body.id = `I${String(cnt + 1).padStart(3, '0')}-${Date.now()}`;
        }

        // For new items, set default required nutrition values if missing
        body.calories100g = body.calories100g || 0;
        body.protein100g = body.protein100g || 0;
        body.carbs100g = body.carbs100g || 0;
        body.fat100g = body.fat100g || 0;
        body.pricePer100g = body.pricePer100g || 0;

        const newIngredient = await Ingredient.create(body);
        return NextResponse.json({ success: true, data: newIngredient }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
