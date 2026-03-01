import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const body = await request.json();

        const updatePayload: any = {
            name: body.name,
            name_english: body.nameEnglish,
            category: body.category,
            image: body.image,
            community: body.community,
            in_stock: body.inStock,
            note: body.note,
            calories_100g: body.calories100g,
            protein_100g: body.protein100g,
            carbs_100g: body.carbs100g,
            fat_100g: body.fat100g,
            price_per_100g: body.pricePer100g
        };

        // Remove undefined keys so we don't accidentally overwrite fields with null
        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] === undefined) {
                delete updatePayload[key];
            }
        });

        const { data: updated, error } = await supabaseAdmin
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
            communityId: null,
            community: updated.community,
            inStock: updated.in_stock,
            unitType: 'grams',
            calories100g: updated.calories_100g,
            protein100g: updated.protein_100g,
            carbs100g: updated.carbs_100g,
            fat100g: updated.fat_100g,
            pricePer100g: updated.price_per_100g,
            gramsPerUnit: 100
        };

        return NextResponse.json({ success: true, data: compatIngredient });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;

        // Check if ingredient is used in recipes
        const { data: recipeUsage, error: recipeError } = await supabaseAdmin
            .from('recipe_ingredients')
            .select('recipe_id')
            .eq('ingredient_id', params.id)
            .limit(1);

        // Check if ingredient is used in mealset boxes
        const { data: mealsetUsage, error: mealsetError } = await supabaseAdmin
            .from('mealset_box_ingredients')
            .select('mealset_id')
            .eq('ingredient_id', params.id)
            .limit(1);

        if (recipeError || mealsetError) {
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to check ingredient usage' 
            }, { status: 500 });
        }

        // If ingredient is used, return detailed error
        if (recipeUsage && recipeUsage.length > 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'ไม่สามารถลบวัตถุดิบนี้ได้เนื่องจากถูกใช้ในสูตรอาหาร',
                details: 'กรุณาลบวัตถุดิบออกจากสูตรก่อน',
                type: 'foreign_key_constraint'
            }, { status: 400 });
        }

        if (mealsetUsage && mealsetUsage.length > 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'ไม่สามารถลบวัตถุดิบนี้ได้เนื่องจากถูกใช้ในเซ็ตอาหาร',
                details: 'กรุณาลบวัตถุดิบออกจากเซ็ตอาหารก่อน',
                type: 'foreign_key_constraint'
            }, { status: 400 });
        }

        // Safe to delete
        const { error } = await supabaseAdmin
            .from('ingredients')
            .delete()
            .eq('id', params.id);

        if (error) {
            return NextResponse.json({ 
                success: false, 
                error: 'Delete failed: ' + error.message 
            }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}

