import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { data: ingredients, error } = await supabaseAdmin
            .from('ingredients')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        // Map back to camelCase for frontend compatibility, as we haven't updated the frontend admin panels yet
        const compatIngredients = (ingredients || []).map(ing => ({
            ...ing,
            nameEnglish: ing.name_english,
            _id: ing.id,
            communityId: null, // Legacy field
            community: ing.community,
            inStock: ing.in_stock,
            unitType: 'grams', // Legacy field
            calories100g: ing.calories_100g,
            protein100g: ing.protein_100g,
            carbs100g: ing.carbs_100g,
            fat100g: ing.fat_100g,
            pricePer100g: ing.price_per_100g,
            gramsPerUnit: 100 // Legacy field
        }));

        // Debug: Log stock values
        console.log('Ingredients with stock:', compatIngredients.map(i => ({ name: i.name, stock: i.inStock })));

        return NextResponse.json({ success: true, data: compatIngredients });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Generate ID from English name: lowercase with hyphens
        const generateIdFromName = (name: string): string => {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                .trim();
        };

        const newId = generateIdFromName(body.nameEnglish || body.name || 'ingredient');

        const { data: newIngredient, error } = await supabaseAdmin
            .from('ingredients')
            .insert({
                id: newId,
                name: body.name,
                name_english: body.nameEnglish || '',
                category: body.category || 'ผัก',
                image: body.image || '🥚',
                community: body.community || 'ทั่วไป',
                in_stock: body.inStock || 0,
                note: body.note || '',
                calories_100g: body.calories100g || 0,
                protein_100g: body.protein100g || 0,
                carbs_100g: body.carbs100g || 0,
                fat_100g: body.fat100g || 0,
                price_per_100g: body.pricePer100g || 0
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
            communityId: null,
            community: newIngredient.community,
            inStock: newIngredient.in_stock,
            unitType: 'grams',
            calories100g: newIngredient.calories_100g,
            protein100g: newIngredient.protein_100g,
            carbs100g: newIngredient.carbs_100g,
            fat100g: newIngredient.fat_100g,
            pricePer100g: newIngredient.price_per_100g,
            gramsPerUnit: 100
        };

        return NextResponse.json({ success: true, data: compatIngredient }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

