import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryParam = searchParams.get('category');

        let query = supabase
            .from('ingredients')
            .select('*')
            .order('name', { ascending: true });

        if (categoryParam && categoryParam !== 'ทั้งหมด') {
            query = query.eq('category', categoryParam);
        }

        const { data: ingredients, error } = await query;

        if (error) throw error;

        const compatIngredients = (ingredients || []).map(ing => ({
            ...ing,
            _id: ing.id,
            communityId: ing.community_id,
            inStock: ing.in_stock,
            unitType: ing.unit_type,
            calories100g: ing.calories_100g,
            protein100g: ing.protein_100g,
            carbs100g: ing.carbs_100g,
            fat100g: ing.fat_100g,
            pricePer100g: ing.price_per_100g,
            gramsPerUnit: ing.grams_per_unit
        }));

        return NextResponse.json({ data: compatIngredients });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch ingredients', details: error.message },
            { status: 500 }
        );
    }
}

