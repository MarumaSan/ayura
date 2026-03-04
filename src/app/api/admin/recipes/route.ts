import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: recipes, error: rError } = await supabaseAdmin
            .from('recipes')
            .select('*')
            .order('created_at', { ascending: false });

        if (rError) {
            return NextResponse.json({ success: false, error: rError.message }, { status: 500 });
        }

        const { data: allIngsItems, error: rbiError } = await supabaseAdmin
            .from('recipe_ingredients')
            .select('*');

        if (rbiError) {
            return NextResponse.json({ success: false, error: rbiError.message }, { status: 500 });
        }

        const ingsMap: Record<string, any[]> = {};
        (allIngsItems || []).forEach(ri => {
            if (!ingsMap[ri.recipe_id]) ingsMap[ri.recipe_id] = [];
            ingsMap[ri.recipe_id].push({
                ingredientId: ri.ingredient_id,
                gramsUsed: ri.grams_used,
                note: ri.note || ''
            });
        });

        // Get all ingredient IDs used in recipes
        const allIngredientIds = [...new Set((allIngsItems || []).map(ri => ri.ingredient_id))];
        
        // Fetch all ingredients data for nutrition calculation
        const { data: allIngredients } = await supabaseAdmin
            .from('ingredients')
            .select('*')
            .in('id', allIngredientIds.length > 0 ? allIngredientIds : ['']);

        const ingDataMap: Record<string, any> = {};
        (allIngredients || []).forEach(ing => {
            ingDataMap[ing.id] = ing;
        });

        // Calculate nutrition for each recipe
        const formatted = await Promise.all(recipes.map(async (r) => {
            const recipeIngs = ingsMap[r.id] || [];
            
            // Calculate nutrition
            let calories = 0, protein = 0, carbs = 0, fat = 0;
            for (const ri of recipeIngs) {
                const ing = ingDataMap[ri.ingredientId];
                if (ing) {
                    const factor = ri.gramsUsed / 100;
                    calories += (ing.calories_100g || 0) * factor;
                    protein += (ing.protein_100g || 0) * factor;
                    carbs += (ing.carbs_100g || 0) * factor;
                    fat += (ing.fat_100g || 0) * factor;
                }
            }

            return {
                ...r,
                _id: r.id,
                mealType: r.meal_type,
                cookTime: r.cook_time,
                recipeIngredients: recipeIngs,
                calories: Math.round(calories),
                protein: Math.round(protein),
                carbs: Math.round(carbs),
                fat: Math.round(fat)
            };
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function calcNutrition(recipeIngredients: { ingredientId: string; gramsUsed: number }[]) {
    if (!recipeIngredients || recipeIngredients.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const ids = recipeIngredients.map((r) => r.ingredientId);
    const { data: ingredients } = await supabaseAdmin
        .from('ingredients')
        .select('*')
        .in('id', ids);

    let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    const validIngredients = ingredients || [];

    for (const ri of recipeIngredients) {
        const ing = validIngredients.find((i: any) => i.id === ri.ingredientId);
        if (!ing) continue;
        const factor = ri.gramsUsed / 100;
        totalCal += (ing.calories_100g || 0) * factor;
        totalProtein += (ing.protein_100g || 0) * factor;
        totalCarbs += (ing.carbs_100g || 0) * factor;
        totalFat += (ing.fat_100g || 0) * factor;
    }

    return {
        calories: Math.round(totalCal), // not divided by 7 because it's per recipe/serving
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
    };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const avgNutrition = await calcNutrition(body.recipeIngredients || []);

        const { data: newRecipe, error: insertError } = await supabaseAdmin
            .from('recipes')
            .insert({
                name: body.name,
                image: body.image || '🍽️',
                meal_type: body.mealType || 'เช้า',
                cook_time: body.cookTime || 20,
                servings: body.servings || 1,
                calories: avgNutrition.calories,
                protein: avgNutrition.protein,
                carbs: avgNutrition.carbs,
                fat: avgNutrition.fat,
                steps: body.steps || []
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
        }

        if (body.recipeIngredients && body.recipeIngredients.length > 0) {
            const rxPayload = body.recipeIngredients.map((ri: any) => ({
                recipe_id: newRecipe.id,
                ingredient_id: ri.ingredientId,
                grams_used: ri.gramsUsed,
                note: ri.note || ''
            }));

            const { error: rxError } = await supabaseAdmin
                .from('recipe_ingredients')
                .insert(rxPayload);

            if (rxError) {
                return NextResponse.json({ success: false, error: 'Recipe created but ingredients failed: ' + rxError.message }, { status: 500 });
            }
        }

        const compatRecipe = {
            ...newRecipe,
            _id: newRecipe.id,
            mealType: newRecipe.meal_type,
            cookTime: newRecipe.cook_time,
            recipeIngredients: body.recipeIngredients || [],
            calories: avgNutrition.calories,
            protein: avgNutrition.protein,
            carbs: avgNutrition.carbs,
            fat: avgNutrition.fat
        };

        return NextResponse.json({ success: true, data: compatRecipe }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
