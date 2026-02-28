import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { MealSet } from '@/models/MealSet';
import { Ingredient } from '@/models/Ingredient';

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

    return {
        calories: Math.round(totalCal / 7),
        protein: Math.round(totalProtein / 7),
        carbs: Math.round(totalCarbs / 7),
        fat: Math.round(totalFat / 7),
    };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await req.json();

        const avgNutrition = await calcNutrition(body.boxIngredients || []);

        const updated = await MealSet.findOneAndUpdate(
            { $or: [{ id }, { _id: id }] },
            { ...body, avgNutrition },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const updated = await MealSet.findOneAndUpdate(
            { $or: [{ id }, { _id: id }] },
            { isActive: false },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
