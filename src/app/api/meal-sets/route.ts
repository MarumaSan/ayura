import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: mealSets, error } = await supabaseAdmin
            .from('mealsets')
            .select(`
                *,
                mealset_box_ingredients (
                    ingredient_id,
                    grams_per_week
                )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const compatMealSets = (mealSets || []).map((ms: any) => ({
            ...ms,
            _id: ms.id,
            priceWeekly: ms.price_weekly,
            priceMonthly: ms.price_monthly,
            isActive: ms.is_active,
            avgNutrition: ms.avg_nutrition,
            targetBmi: ms.target_bmi,
            tag: ms.tag,
            createdAt: ms.created_at,
            updatedAt: ms.updated_at,
            boxIngredients: (ms.mealset_box_ingredients || []).map((bi: any) => ({
                ingredientId: bi.ingredient_id,
                gramsPerWeek: bi.grams_per_week
            }))
        }));

        return NextResponse.json({ data: compatMealSets });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch meal sets', details: error.message },
            { status: 500 }
        );
    }
}

