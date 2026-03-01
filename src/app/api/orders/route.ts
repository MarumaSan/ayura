import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get('status');

        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusParam && statusParam !== 'ทั้งหมด') {
            query = query.eq('status', statusParam);
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        const compatOrders = (orders || []).map(o => ({
            ...o,
            _id: o.id,
            userId: o.user_id,
            customerName: o.customer_name,
            mealSetId: o.mealset_id,
            mealSetName: o.mealset_name,
            boxSize: o.box_size,
            sizeMultiplier: o.size_multiplier,
            paymentMethod: o.payment_method,
            totalPrice: o.total_price,
            deliveryDate: o.delivery_date,
            targetDeliveryDate: o.target_delivery_date,
            createdAt: o.created_at,
            updatedAt: o.updated_at
        }));

        return NextResponse.json({ data: compatOrders });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: error.message },
            { status: 500 }
        );
    }
}

