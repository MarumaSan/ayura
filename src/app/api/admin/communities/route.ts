import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { data: communities, error } = await supabase
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

        // Generate ID
        const { data: latestCommunity } = await supabase
            .from('communities')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        let nextNum = 1;
        if (latestCommunity && latestCommunity.id.startsWith('com-')) {
            const numStr = latestCommunity.id.replace('com-', '');
            const parsed = parseInt(numStr, 10);
            if (!isNaN(parsed)) {
                nextNum = parsed + 1;
            }
        }

        const newId = `com-${String(nextNum).padStart(3, '0')}`;

        const { data: newCommunity, error } = await supabase
            .from('communities')
            .insert({
                id: newId,
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

