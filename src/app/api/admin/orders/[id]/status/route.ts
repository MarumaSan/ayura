import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updateData: any = { status };

        // When status changes to Delivered, record the exact delivery date
        if (status === 'จัดส่งสำเร็จ') {
            updateData.delivery_date = new Date().toISOString();
        }

        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single();

        if (error || !updatedOrder) {
            return NextResponse.json({ error: 'Order not found or update failed' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
        console.error('Update order status error:', error);
        return NextResponse.json(
            { error: 'Failed to update order status', details: error.message },
            { status: 500 }
        );
    }
}

