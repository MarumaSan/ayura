import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return NextResponse.json({
                user: { name: 'ผู้ใช้', points: 0, streak: 0 },
                recentActivity: []
            });
        }

        // Fetch recent orders for this user
        const { data: recentOrders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('user_id', parseInt(user.id, 10))
            .order('created_at', { ascending: false })
            .limit(10);

        const recentActivity = (recentOrders || []).map(order => {
            const pointsEarned = order.plan === 'weekly' ? 100 : 500;
            const actionText = `สั่งกล่องสุขภาพราย${order.plan === 'weekly' ? 'สัปดาห์' : 'เดือน'}`;

            // Format date to Thai format
            const dateObj = new Date(order.created_at || Date.now());
            const formattedDate = dateObj.toLocaleDateString('th-TH', {
                year: '2-digit',
                month: 'short',
                day: 'numeric'
            });

            return {
                id: order.id,
                date: formattedDate,
                action: actionText,
                points: pointsEarned
            };
        });

        return NextResponse.json({
            user: {
                name: user.name,
                points: user.points || 0,
                streak: user.streak || 0,
            },
            recentActivity
        });

    } catch (error: any) {
        console.error('Error fetching user points:', error);
        return NextResponse.json(
            { error: 'Failed to fetch points data', details: error.message },
            { status: 500 }
        );
    }
}

