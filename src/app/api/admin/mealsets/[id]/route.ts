import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function calcNutrition(boxIngredients: { ingredientId: string; gramsPerWeek: number }[]) {
    if (!boxIngredients || boxIngredients.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const ids = boxIngredients.map((b) => b.ingredientId);

    const { data: ingredients } = await supabase
        .from('ingredients')
        .select('*')
        .in('id', ids);

    let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

    const validIngredients = ingredients || [];

    for (const bi of boxIngredients) {
        const ing = validIngredients.find((i: any) => i.id === bi.ingredientId);
        if (!ing) continue;
        const factor = bi.gramsPerWeek / 100;
        totalCal += (ing.calories_100g || 0) * factor;
        totalProtein += (ing.protein_100g || 0) * factor;
        totalCarbs += (ing.carbs_100g || 0) * factor;
        totalFat += (ing.fat_100g || 0) * factor;
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
        const { id } = await params;
        const body = await req.json();

        const avgNutrition = await calcNutrition(body.boxIngredients || []);

        const updatePayload: any = {
            name: body.name,
            description: body.description,
            image: body.image,
            is_active: body.isActive,
            avg_nutrition: avgNutrition,
        };

        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] === undefined) {
                delete updatePayload[key];
            }
        });

        const { data: updated, error } = await supabase
            .from('mealsets')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error || !updated) {
            return NextResponse.json({ success: false, error: 'Not found or update failed' }, { status: 404 });
        }

        // Handle boxIngredients separately if provided
        if (body.boxIngredients) {
            // Delete existing
            await supabase
                .from('mealset_box_ingredients')
                .delete()
                .eq('mealset_id', id);

            // Insert new
            if (body.boxIngredients.length > 0) {
                const boxIngredientsPayload = body.boxIngredients.map((bi: any) => ({
                    mealset_id: id,
                    ingredient_id: bi.ingredientId,
                    grams_per_week: bi.gramsPerWeek,
                    note: bi.note || ''
                }));

                await supabase
                    .from('mealset_box_ingredients')
                    .insert(boxIngredientsPayload);
            }
        }

        const compatMealset = {
            ...updated,
            _id: updated.id,
            isActive: updated.is_active,
            avgNutrition: updated.avg_nutrition,
            boxIngredients: body.boxIngredients || []
        };

        return NextResponse.json({ success: true, data: compatMealset });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const hardDelete = url.searchParams.get('hard') === 'true';

        if (hardDelete) {
            const { error } = await supabase
                .from('mealsets')
                .delete()
                .eq('id', id);

            if (error) {
                return NextResponse.json({ success: false, error: 'Failed to hard delete: ' + error.message }, { status: 500 });
            }
        } else {
            const { data: updated, error } = await supabase
                .from('mealsets')
                .update({ is_active: false })
                .eq('id', id)
                .select()
                .single();

            if (error || !updated) {
                return NextResponse.json({ success: false, error: 'Not found or update failed' }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

