import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { data: ingredients, error } = await supabase
            .from('ingredients')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        // Map back to camelCase for frontend compatibility, as we haven't updated the frontend admin panels yet
        const compatIngredients = (ingredients || []).map(ing => ({
            ...ing,
            nameEnglish: ing.name_english,
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

        return NextResponse.json({ success: true, data: compatIngredients });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newId = `ing-${crypto.randomUUID().split('-')[0]}`;

        const { data: newIngredient, error } = await supabase
            .from('ingredients')
            .insert({
                id: newId,
                name: body.name,
                name_english: body.nameEnglish || '',
                image: body.image || '🥚',
                community_id: body.communityId || null,
                in_stock: body.inStock || 0,
                unit_type: body.unitType || 'grams',
                calories_100g: body.calories100g || 0,
                protein_100g: body.protein100g || 0,
                carbs_100g: body.carbs100g || 0,
                fat_100g: body.fat100g || 0,
                price_per_100g: body.pricePer100g || 0,
                grams_per_unit: body.gramsPerUnit || 100
            })
            .select()
            .single();

        if (error || !newIngredient) {
            throw new Error(error?.message || 'Failed to create ingredient');
        }

        const compatIngredient = {
            ...newIngredient,
            nameEnglish: newIngredient.name_english,
            _id: newIngredient.id,
            communityId: newIngredient.community_id,
            inStock: newIngredient.in_stock,
            unitType: newIngredient.unit_type,
            calories100g: newIngredient.calories_100g,
            protein100g: newIngredient.protein_100g,
            carbs100g: newIngredient.carbs_100g,
            fat100g: newIngredient.fat_100g,
            pricePer100g: newIngredient.price_per_100g,
            gramsPerUnit: newIngredient.grams_per_unit
        };

        return NextResponse.json({ success: true, data: compatIngredient }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

