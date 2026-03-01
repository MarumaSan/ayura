import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const body = await request.json();

        const updatePayload: any = {
            name: body.name,
            address: body.address,
            notes: body.notes
        };

        // Remove undefined keys
        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key] === undefined) {
                delete updatePayload[key];
            }
        });

        const { data: updated, error } = await supabase
            .from('communities')
            .update(updatePayload)
            .eq('id', params.id)
            .select()
            .single();

        if (error || !updated) {
            return NextResponse.json({ success: false, error: 'Not found or update failed' }, { status: 404 });
        }

        const compatCommunity = {
            ...updated,
            _id: updated.id
        };

        return NextResponse.json({ success: true, data: compatCommunity });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;

        const { error } = await supabase
            .from('communities')
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

