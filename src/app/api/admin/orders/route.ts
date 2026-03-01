import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        const allOrders = orders || [];

        // Gather unique mealSetIds
        const mealSetIds = [...new Set(allOrders.map((o: any) => o.mealset_id).filter(Boolean))];

        let mealSets = [];
        if (mealSetIds.length > 0) {
            const { data } = await supabase
                .from('mealsets')
                .select('*')
                .in('id', mealSetIds);
            mealSets = data || [];
        }

        const mealSetMap: Record<string, any> = {};
        mealSets.forEach((ms: any) => { mealSetMap[ms.id] = ms; });

        // Get box ingredients for those mealSets
        let allBoxIngredients = [];
        if (mealSetIds.length > 0) {
            const { data } = await supabase
                .from('mealset_box_ingredients')
                .select('*')
                .in('mealset_id', mealSetIds);
            allBoxIngredients = data || [];
        }

        // Gather all ingredient IDs
        const ingredientIds = [...new Set(allBoxIngredients.map(bi => bi.ingredient_id))];
        let originalIngredients = [];
        if (ingredientIds.length > 0) {
            const { data } = await supabase
                .from('ingredients')
                .select('*')
                .in('id', ingredientIds);
            originalIngredients = data || [];
        }

        const ingredientMap: Record<string, any> = {};
        originalIngredients.forEach((ing: any) => { ingredientMap[ing.id] = ing; });

        // Map box ingredients by mealset id for easy lookup
        const msBoxItemsMap: Record<string, any[]> = {};
        allBoxIngredients.forEach(bi => {
            if (!msBoxItemsMap[bi.mealset_id]) msBoxItemsMap[bi.mealset_id] = [];
            msBoxItemsMap[bi.mealset_id].push(bi);
        });

        // Enrich orders with mealSet name and box contents
        const enriched = allOrders.map((o: any) => {
            const ms = mealSetMap[o.mealset_id];
            const planMultiplier = o.plan === 'monthly' ? 4 : 1;
            const sizeMultiplier = o.size_multiplier || 1;

            const msBoxItems = msBoxItemsMap[o.mealset_id] || [];

            const boxContents = msBoxItems.map((bi: any) => {
                const ing = ingredientMap[bi.ingredient_id];
                const totalGrams = (bi.grams_per_week || 0) * planMultiplier * sizeMultiplier;
                return {
                    ingredientId: bi.ingredient_id,
                    name: ing?.name || bi.ingredient_id,
                    image: ing?.image || '📦',
                    gramsPerWeek: bi.grams_per_week || 0,
                    totalGrams: Math.round(totalGrams),
                };
            });

            return {
                ...o,
                _id: o.id, // For backward compatibility with admin table expecting _id
                id: o.id,
                userId: o.user_id,
                customerName: o.customer_name,
                mealSetId: o.mealset_id,
                mealSetName: ms?.name || o.mealset_name,
                boxSize: o.box_size,
                sizeMultiplier: o.size_multiplier,
                paymentMethod: o.payment_method,
                address: o.address,
                phone: o.phone,
                totalPrice: o.total_price,
                deliveryDate: o.delivery_date,
                targetDeliveryDate: o.target_delivery_date,
                createdAt: o.created_at,
                updatedAt: o.updated_at,
                boxContents,
            };
        });

        return NextResponse.json({ success: true, data: enriched });
    } catch (error: any) {
        console.error('Failed to fetch admin orders', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: error.message },
            { status: 500 }
        );
    }
}

