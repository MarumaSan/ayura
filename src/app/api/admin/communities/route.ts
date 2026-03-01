import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { data: communities, error } = await supabaseAdmin
            .from('communities')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ success: true, data: communities });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch communities' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { data: newCommunity, error } = await supabaseAdmin
            .from('communities')
            .insert({
                name: body.name,
                address: body.address,
                notes: body.notes
            })
            .select()
            .single();

        if (error || !newCommunity) {
            throw new Error(error?.message || 'Failed to create community');
        }

        // Add _id for backward compatibility with frontend if it relies on _id
        const compatCommunity = { ...newCommunity, _id: newCommunity.id };

        return NextResponse.json({ success: true, data: compatCommunity }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

