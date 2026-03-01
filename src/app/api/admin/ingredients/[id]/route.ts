import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const body = await request.json();

        const updatePayload: any = {
            name: body.name,
            name_english: body.nameEnglish,
            image: body.image,
            community_id: body.communityId,
            in_stock: body.inStock,
            unit_type: body.unitType,
            calories_100g: body.calories100g,
            protein_100g: body.protein100g,
            carbs_100g: body.carbs100g,
            fat_100g: body.fat100g,
            price_per_100g: body.pricePer100g,
            grams_per_unit: body.gramsPerUnit,
            category: body.category
        };

        // Remove undefined keys so we don't accidentally overwrite fields with null
        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] === undefined) {
                delete updatePayload[key];
            }
        });

        const { data: updated, error } = await supabase
            .from('ingredients')
            .update(updatePayload)
            .eq('id', params.id)
            .select()
            .single();

        if (error || !updated) {
            return NextResponse.json({ success: false, error: 'Not found or update failed' }, { status: 404 });
        }

        const compatIngredient = {
            ...updated,
            nameEnglish: updated.name_english,
            _id: updated.id,
            communityId: updated.community_id,
            inStock: updated.in_stock,
            unitType: updated.unit_type,
            calories100g: updated.calories_100g,
            protein100g: updated.protein_100g,
            carbs100g: updated.carbs_100g,
            fat100g: updated.fat_100g,
            pricePer100g: updated.price_per_100g,
            gramsPerUnit: updated.grams_per_unit
        };

        return NextResponse.json({ success: true, data: compatIngredient });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;

        const { error } = await supabase
            .from('ingredients')
            .delete()
            .eq('id', params.id);

        if (error) {
            return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

