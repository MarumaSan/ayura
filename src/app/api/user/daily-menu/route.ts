import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { MealSet } from '@/models/MealSet';
import { Recipe } from '@/models/Recipe';

// Simple deterministic hash from a string to produce a number
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Deterministic pick from an array using a seed
function seededPick<T>(arr: T[], seed: number): T | null {
    if (arr.length === 0) return null;
    return arr[seed % arr.length];
}

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const mealSetId = searchParams.get('mealSetId');

        if (!mealSetId) {
            return NextResponse.json({ error: 'mealSetId is required' }, { status: 400 });
        }

        // 1. Get the mealset to find box ingredient IDs
        const mealSetQuery = mealSetId.length === 24
            ? { $or: [{ id: mealSetId }, { _id: mealSetId }] }
            : { id: mealSetId };
        const mealSet = await MealSet.findOne(mealSetQuery);

        if (!mealSet) {
            return NextResponse.json({ error: 'MealSet not found' }, { status: 404 });
        }

        const boxIngredientIds = new Set(
            mealSet.boxIngredients.map((bi: any) => bi.ingredientId)
        );

        // 2. Fetch ALL recipes
        const allRecipes = await Recipe.find({}).lean();

        // 3. Filter: keep recipes where ALL ingredientIds are in boxIngredientIds
        const matchingRecipes = allRecipes.filter((recipe: any) => {
            if (!recipe.ingredients || recipe.ingredients.length === 0) return false;
            return recipe.ingredients.every(
                (ing: any) => boxIngredientIds.has(ing.ingredientId)
            );
        });

        // 4. Group by mealType
        const byType: Record<string, any[]> = {
            'เช้า': [],
            'กลางวัน': [],
            'เย็น': [],
        };
        matchingRecipes.forEach((r: any) => {
            if (byType[r.mealType]) {
                byType[r.mealType].push(r);
            }
        });

        // 5. Date-based deterministic seed
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        const yesterdayDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = `${yesterdayDate.getFullYear()}-${yesterdayDate.getMonth()}-${yesterdayDate.getDate()}`;

        // 6. Get yesterday's picks to exclude
        const yesterdayPicks = new Set<string>();
        for (const mealType of Object.keys(byType)) {
            const pool = byType[mealType];
            const seed = hashCode(`${yesterdayStr}-${mealType}-${mealSetId}`);
            const pick = seededPick(pool, seed);
            if (pick) yesterdayPicks.add(pick._id.toString());
        }

        // 7. Pick today's menu: exclude yesterday, then seed-pick
        const todayMenu: Record<string, any> = {};
        for (const mealType of Object.keys(byType)) {
            let pool = byType[mealType].filter(
                (r: any) => !yesterdayPicks.has(r._id.toString())
            );
            // Fallback: if excluding yesterday leaves no options, use the full pool
            if (pool.length === 0) pool = byType[mealType];

            const seed = hashCode(`${todayStr}-${mealType}-${mealSetId}`);
            todayMenu[mealType] = seededPick(pool, seed) || null;
        }

        return NextResponse.json({
            success: true,
            menu: {
                breakfast: todayMenu['เช้า'],
                lunch: todayMenu['กลางวัน'],
                dinner: todayMenu['เย็น'],
            },
            date: todayStr,
        });
    } catch (error: any) {
        console.error('Daily menu error:', error);
        return NextResponse.json(
            { error: 'Failed to generate daily menu', details: error.message },
            { status: 500 }
        );
    }
}
