import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getThaiDate, formatThaiDate } from '@/lib/dateUtils';

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
        const { searchParams } = new URL(request.url);
        const mealSetId = searchParams.get('mealSetId');

        if (!mealSetId) {
            return NextResponse.json({ error: 'mealSetId is required' }, { status: 400 });
        }

        // 1. Get box ingredients for this meal set
        const { data: boxItems } = await supabase
            .from('mealset_box_ingredients')
            .select('ingredient_id')
            .eq('mealset_id', mealSetId);

        if (!boxItems || boxItems.length === 0) {
            return NextResponse.json({ error: 'MealSet or box ingredients not found' }, { status: 404 });
        }

        const boxIngredientIds = new Set(boxItems.map((bi: any) => bi.ingredient_id));

        // 2. Fetch ALL recipes along with their ingredients
        const { data: allRecipesObj } = await supabase
            .from('recipes')
            .select(`
                *,
                recipe_ingredients (
                    ingredient_id
                )
            `);

        const allRecipes = allRecipesObj || [];

        // 3. Filter: keep recipes where ALL ingredientIds are in boxIngredientIds
        const matchingRecipes = allRecipes.filter((recipe: any) => {
            const rIngs = recipe.recipe_ingredients || [];
            if (rIngs.length === 0) return false;
            return rIngs.every((ing: any) => boxIngredientIds.has(ing.ingredient_id));
        });

        // 4. Group by mealType
        const byType: Record<string, any[]> = {
            'เช้า': [],
            'กลางวัน': [],
            'เย็น': [],
        };

        matchingRecipes.forEach((r: any) => {
            if (byType[r.meal_type]) {
                byType[r.meal_type].push(r);
            }
        });

        // 5. Date-based deterministic seed (Thai Time)
        const today = getThaiDate();
        const todayStr = formatThaiDate(today);
        const yesterdayDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const yesterdayStr = formatThaiDate(yesterdayDate);

        // 6. Get yesterday's picks to exclude
        const yesterdayPicks = new Set<string>();
        for (const mealType of Object.keys(byType)) {
            const pool = byType[mealType];
            const seed = hashCode(`${yesterdayStr}-${mealType}-${mealSetId}`);
            const pick = seededPick(pool, seed);
            if (pick) yesterdayPicks.add(pick.id);
        }

        // 7. Pick today's menu: exclude yesterday, then seed-pick
        const todayMenu: Record<string, any> = {};
        for (const mealType of Object.keys(byType)) {
            let pool = byType[mealType].filter(
                (r: any) => !yesterdayPicks.has(r.id)
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

