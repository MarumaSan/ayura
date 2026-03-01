import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: mealSet, error } = await supabase
            .from('mealsets')
            .select(`
                *,
                mealset_box_ingredients (
                    ingredient_id,
                    grams_per_week
                )
            `)
            .eq('id', id)
            .single();

        if (error || !mealSet) {
            return NextResponse.json({ error: 'MealSet not found' }, { status: 404 });
        }

        const compatMealSet = {
            ...mealSet,
            _id: mealSet.id,
            isActive: mealSet.is_active,
            avgNutrition: mealSet.avg_nutrition,
            createdAt: mealSet.created_at,
            updatedAt: mealSet.updated_at,
            boxIngredients: (mealSet.mealset_box_ingredients || []).map((bi: any) => ({
                ingredientId: bi.ingredient_id,
                gramsPerWeek: bi.grams_per_week
            }))
        };

        return NextResponse.json({ data: compatMealSet });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch meal set', details: error.message },
            { status: 500 }
        );
    }
}

