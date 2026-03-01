import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function calcNutrition(recipeIngredients: { ingredientId: string; gramsUsed: number }[]) {
    if (!recipeIngredients || recipeIngredients.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const ids = recipeIngredients.map((r) => r.ingredientId);
    const { data: ingredients } = await supabase
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
        calories: Math.round(totalCal), // per recipe
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
    };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const avgNutrition = await calcNutrition(body.recipeIngredients || []);

        const updatePayload: any = {
            name: body.name,
            image: body.image,
            meal_type: body.mealType,
            cook_time: body.cookTime,
            servings: body.servings,
            calories: avgNutrition.calories,
            steps: body.steps
        };

        // remove undefined
        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] === undefined) {
                delete updatePayload[key];
            }
        });

        const { data: updated, error } = await supabase
            .from('recipes')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error || !updated) {
            return NextResponse.json({ success: false, error: 'Not found or update failed: ' + error?.message }, { status: 404 });
        }

        // Handle recipeIngredients correctly
        if (body.recipeIngredients) {
            // Delete old mappings
            await supabase
                .from('recipe_ingredients')
                .delete()
                .eq('recipe_id', id);

            // Insert new mappings
            if (body.recipeIngredients.length > 0) {
                const rxPayload = body.recipeIngredients.map((ri: any) => ({
                    recipe_id: id,
                    ingredient_id: ri.ingredientId,
                    grams_used: ri.gramsUsed,
                    note: ri.note || ''
                }));

                const { error: rxError } = await supabase
                    .from('recipe_ingredients')
                    .insert(rxPayload);

                if (rxError) {
                    return NextResponse.json({ success: false, error: 'Recipe updated but ingredients failed: ' + rxError.message }, { status: 500 });
                }
            }
        }

        const compatRecipe = {
            ...updated,
            _id: updated.id,
            mealType: updated.meal_type,
            cookTime: updated.cook_time,
            recipeIngredients: body.recipeIngredients || []
        };

        return NextResponse.json({ success: true, data: compatRecipe });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        // hardDelete only used if we decide to implement physical wipe.
        // We will just physically wipe them since recipes don't strictly have 'is_active'.
        // Wait, the recipes table doesn't have `is_active`. We will always hard delete.

        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ success: false, error: 'Failed to delete: ' + error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
