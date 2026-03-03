import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getThaiDate } from '@/lib/dateUtils';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updateData: any = { status };

        // When status changes to Delivered, record the timestamp
        if (status === 'จัดส่งสำเร็จ') {
            updateData.delivery_date = getThaiDate().toISOString();
        }

        // First check if order exists
        const { data: existingOrder, error: findError } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('id', params.id)
            .single();

        if (findError || !existingOrder) {
            return NextResponse.json({ error: 'Order not found', details: findError?.message }, { status: 404 });
        }

        const { data: updatedOrder, error } = await supabaseAdmin
            .from('orders')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to update order status', details: error.message },
            { status: 500 }
        );
    }
}

