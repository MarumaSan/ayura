import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { MealSet } from '@/models/MealSet';
import { Ingredient } from '@/models/Ingredient';

// Helper: calculate avgNutrition from boxIngredients
async function calcNutrition(boxIngredients: { ingredientId: string; gramsPerWeek: number }[]) {
    const ids = boxIngredients.map((b) => b.ingredientId);
    const ingredients = await Ingredient.find({ id: { $in: ids } });

    let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

    for (const bi of boxIngredients) {
        const ing = ingredients.find((i: any) => i.id === bi.ingredientId);
        if (!ing) continue;
        const factor = bi.gramsPerWeek / 100;
        totalCal += ing.calories100g * factor;
        totalProtein += ing.protein100g * factor;
        totalCarbs += ing.carbs100g * factor;
        totalFat += ing.fat100g * factor;
    }

    // Divide by 7 for daily average
    return {
        calories: Math.round(totalCal / 7),
        protein: Math.round(totalProtein / 7),
        carbs: Math.round(totalCarbs / 7),
        fat: Math.round(totalFat / 7),
    };
}

export async function GET() {
    try {
        await connectToDatabase();
        const mealSets = await MealSet.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: mealSets });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json();

        // Validate required
        if (!body.id || !body.name) {
            return NextResponse.json({ success: false, error: 'id and name are required' }, { status: 400 });
        }

        // Auto-compute avgNutrition
        const avgNutrition = await calcNutrition(body.boxIngredients || []);

        const mealSet = new MealSet({
            ...body,
            avgNutrition,
        });

        await mealSet.save();
        return NextResponse.json({ success: true, data: mealSet }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ success: false, error: 'ID นี้มีอยู่แล้ว' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
