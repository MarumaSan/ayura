import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: requests, error } = await supabaseAdmin
            .from('topup_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        const allRequests = requests || [];

        // Populate user names
        const userIds = [...new Set(allRequests.map((r: any) => r.user_id).filter(Boolean))];

        let users = [];
        if (userIds.length > 0) {
            const { data } = await supabaseAdmin
                .from('users')
                .select('*')
                .in('id', userIds);
            users = data || [];
        }

        const userMap: Record<string, string> = {};
        users.forEach((u: any) => {
            const nameToUse = u.name || u.email || u.id;
            userMap[u.id] = nameToUse;
        });

        const enriched = allRequests.map((r: any) => ({
            ...r,
            _id: r.id, // for compat
            id: r.id,
            userId: r.user_id,
            amount: r.amount,
            status: r.status,
            slipImage: r.slip_image,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            userName: userMap[r.user_id] || r.user_id,
        }));

        return NextResponse.json({ success: true, data: enriched });
    } catch (error: any) {
        console.error('Failed to fetch topup requests', error);
        return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 });
    }
}

