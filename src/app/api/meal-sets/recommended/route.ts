import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { scoreMealSets, computeUserTargets } from '@/lib/mealRecommender';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // 1. Fetch user
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Ensure profile is complete
        if (!user.weight || !user.height || !user.age) {
            return NextResponse.json({ error: 'User profile incomplete — cannot compute recommendations' }, { status: 400 });
        }

        // 3. Fetch active meal sets
        const { data: mealSets, error: msError } = await supabase
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
            pricePerGrams: ms.price_per_grams,
            deliveryFee: ms.delivery_fee,
            isActive: ms.is_active,
            avgNutrition: ms.avg_nutrition,
            createdAt: ms.created_at,
            updatedAt: ms.updated_at,
            boxIngredients: (ms.mealset_box_ingredients || []).map((bi: any) => ({
                ingredientId: bi.ingredient_id,
                gramsPerWeek: bi.grams_per_week
            }))
        }));

        // 4. Compute user targets
        const userProfile = {
            weight: user.weight,
            height: user.height,
            age: user.age,
            gender: user.gender || 'ชาย',
            healthGoals: user.health_goal ? user.health_goal.split(',') : [],
        };
        const targets = computeUserTargets(userProfile);

        // 5. Score and sort meal sets
        const scored = scoreMealSets(userProfile, compatMealSets as any[]);

        return NextResponse.json({
            data: scored,
            targets,
        });
    } catch (error: any) {
        console.error('Recommendation API error:', error);
        return NextResponse.json(
            { error: 'Failed to compute recommendations', details: error.message },
            { status: 500 }
        );
    }
}

