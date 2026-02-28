import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { MealSet } from '@/models/MealSet';
import { Ingredient } from '@/models/Ingredient';

export async function GET() {
    try {
        await connectToDatabase();
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

        // Gather unique mealSetIds
        const mealSetIds = [...new Set(orders.map((o: any) => o.mealSetId).filter(Boolean))];
        const mealSets = await MealSet.find({ id: { $in: mealSetIds } }).lean();
        const mealSetMap: Record<string, any> = {};
        mealSets.forEach((ms: any) => { mealSetMap[ms.id] = ms; });

        // Gather all ingredient IDs from mealSets
        const allIngredientIds = new Set<string>();
        mealSets.forEach((ms: any) => {
            ms.boxIngredients?.forEach((bi: any) => allIngredientIds.add(bi.ingredientId));
        });
        const ingredients = await Ingredient.find({ id: { $in: [...allIngredientIds] } }).lean();
        const ingredientMap: Record<string, any> = {};
        ingredients.forEach((ing: any) => { ingredientMap[ing.id] = ing; });

        // Enrich orders with mealSet name and box contents
        const enriched = orders.map((o: any) => {
            const ms = mealSetMap[o.mealSetId];
            const planMultiplier = o.plan === 'monthly' ? 4 : 1;
            const sizeMultiplier = o.sizeMultiplier || 1;
            const boxContents = ms?.boxIngredients?.map((bi: any) => {
                const ing = ingredientMap[bi.ingredientId];
                const totalGrams = (bi.gramsPerWeek || 0) * planMultiplier * sizeMultiplier;
                return {
                    ingredientId: bi.ingredientId,
                    name: ing?.name || bi.ingredientId,
                    image: ing?.image || '📦',
                    gramsPerWeek: bi.gramsPerWeek || 0,
                    totalGrams: Math.round(totalGrams),
                };
            }) || [];

            return {
                ...o,
                mealSetName: ms?.name || o.mealSetId,
                boxContents,
            };
        });

        return NextResponse.json({ success: true, data: enriched });
    } catch (error: any) {
        console.error('Failed to fetch admin orders', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: error.message },
            { status: 500 }
        );
    }
}
