import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        const { data: updatedOrder, error } = await supabaseAdmin
            .from('orders')
            .update({ status: 'ยกเลิก' })
            .eq('id', orderId)
            .select()
            .single();

        if (error || !updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
        console.error('Cancel order error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel order', details: error.message },
            { status: 500 }
        );
    }
}

