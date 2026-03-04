import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Admin authentication middleware
export async function verifyAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
    try {
        // Get authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return { isAdmin: false, error: 'Authorization header required' };
        }

        // Extract token (Bearer token)
        const token = authHeader.replace('Bearer ', '').trim();
        if (!token) {
            return { isAdmin: false, error: 'Invalid authorization format' };
        }

        // Verify user and check admin role using supabaseAdmin to bypass RLS
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, role')
            .eq('id', token)
            .single();

        if (error || !user) {
            return { isAdmin: false, error: 'User not found' };
        }

        if (user.role !== 'admin') {
            return { isAdmin: false, error: 'Admin access required' };
        }

        return { isAdmin: true, userId: user.id };
    } catch (error) {
        return { isAdmin: false, error: 'Authentication failed' };
    }
}

// Higher-order function to wrap admin handlers
export function withAdminAuth(
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const { isAdmin, error } = await verifyAdmin(request);

        if (!isAdmin) {
            return NextResponse.json(
                { error: error || 'Unauthorized' },
                { status: 403 }
            );
        }

        return handler(request);
    };
}
