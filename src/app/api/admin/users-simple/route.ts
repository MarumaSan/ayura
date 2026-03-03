import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/adminAuth';

async function getUsersHandler() {
    try {
        // Get ALL users (not just admin) for wallet balance calculation
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, role, balance, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data for frontend compatibility
        const transformedUsers = (users || []).map(u => ({
            ...u,
            _id: u.id,
            userId: u.id,
            createdAt: u.created_at
        }));

        return NextResponse.json({ success: true, data: transformedUsers });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch users', details: error.message },
            { status: 500 }
        );
    }
}

export const GET = withAdminAuth(getUsersHandler);
