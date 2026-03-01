import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper: calculate avgNutrition from boxIngredients
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

    // Divide by 7 for daily average
    return {
        calories: Math.round(totalCal / 7),
        protein: Math.round(totalProtein / 7),
        carbs: Math.round(totalCarbs / 7),
        fat: Math.round(totalFat / 7),
    };
}

export async function GET() {
    try {
        const { data: mealsets, error } = await supabase
            .from('mealsets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const allMealsets = mealsets || [];

        // Fetch box ingredients
        const { data: boxItems } = await supabase
            .from('mealset_box_ingredients')
            .select('*');

        const allBoxItems = boxItems || [];
        const boxItemsMap: Record<string, any[]> = {};
        allBoxItems.forEach(bi => {
            if (!boxItemsMap[bi.mealset_id]) boxItemsMap[bi.mealset_id] = [];
            boxItemsMap[bi.mealset_id].push({
                ingredientId: bi.ingredient_id,
                gramsPerWeek: bi.grams_per_week
            });
        });

        const compatMealsets = allMealsets.map(ms => ({
            ...ms,
            _id: ms.id,
            description: ms.description,
            pricePerGrams: ms.price_per_grams,
            deliveryFee: ms.delivery_fee,
            isActive: ms.is_active,
            avgNutrition: ms.avg_nutrition,
            boxIngredients: boxItemsMap[ms.id] || []
        }));

        return NextResponse.json({ success: true, data: compatMealsets });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate required
        if (!body.name) {
            return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 });
        }

        const newId = `set-${crypto.randomUUID().split('-')[0]}`;

        // Auto-compute avgNutrition
        const avgNutrition = await calcNutrition(body.boxIngredients || []);

        const mealsetPayload = {
            id: newId,
            name: body.name,
            description: body.description || '',
            image: body.image || '',
            price_per_grams: body.pricePerGrams || 0,
            delivery_fee: body.deliveryFee || 0,
            is_active: body.isActive !== undefined ? body.isActive : true,
            avg_nutrition: avgNutrition,
        };

        const { data: newMealset, error: insertError } = await supabase
            .from('mealsets')
            .insert(mealsetPayload)
            .select()
            .single();

        if (insertError || !newMealset) {
            throw new Error(insertError?.message || 'Failed to create mealset');
        }

        // Insert box ingredients
        if (body.boxIngredients && body.boxIngredients.length > 0) {
            const boxIngredientsPayload = body.boxIngredients.map((bi: any) => ({
                mealset_id: newId,
                ingredient_id: bi.ingredientId,
                grams_per_week: bi.gramsPerWeek
            }));

            const { error: boxError } = await supabase
                .from('mealset_box_ingredients')
                .insert(boxIngredientsPayload);

            if (boxError) {
                console.error("Failed to insert box ingredients:", boxError);
            }
        }

        const compatMealset = {
            ...newMealset,
            _id: newMealset.id,
            pricePerGrams: newMealset.price_per_grams,
            deliveryFee: newMealset.delivery_fee,
            isActive: newMealset.is_active,
            avgNutrition: newMealset.avg_nutrition,
            boxIngredients: body.boxIngredients || []
        };

        return NextResponse.json({ success: true, data: compatMealset }, { status: 201 });
    } catch (error: any) {
        if (error.code === '23505') { // Postgres unique violation code
            return NextResponse.json({ success: false, error: 'ID นี้มีอยู่แล้ว' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

