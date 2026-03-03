import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scoreMealSets, computeUserTargets } from '@/lib/mealRecommender';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const profile = body.profile;

        if (!profile || !profile.weight || !profile.height) {
            return NextResponse.json({ error: 'User profile incomplete — cannot compute recommendations' }, { status: 400 });
        }

        // Fetch active meal sets
        const { data: mealSets, error: msError } = await supabaseAdmin
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

        if (msError) throw msError;

        // Map mealsets to camelCase for the recommender
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

        // Compute user targets using the parsed profile
        const userProfile = {
            weight: profile.weight,
            height: profile.height,
            age: profile.age || 30, // Use default 30 if age is not provided
            gender: profile.gender || 'ชาย',
            healthGoals: Array.isArray(profile.healthGoals) ? profile.healthGoals : [],
        };
        const targets = computeUserTargets(userProfile);

        // Score and sort meal sets
        const scored = scoreMealSets(userProfile, compatMealSets as any[]);

        return NextResponse.json({
            data: scored,
            targets,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to compute recommendations', details: error.message },
            { status: 500 }
        );
    }
}

