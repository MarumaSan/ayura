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

        // Fetch recent orders and referrals for this user
        const [recentOrdersResult, referralsResult] = await Promise.all([
            supabaseAdmin
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10),
            
            supabaseAdmin
                .from('referrals')
                .select('*')
                .eq('referrer_id', user.id)
                .eq('status', 'rewarded')
                .order('created_at', { ascending: false })
        ]);

        const recentOrders = recentOrdersResult.data || [];
        const referrals = referralsResult.data || [];

        // Combine orders and referrals into activity
        const recentActivity = [
            // Welcome bonus if user was referred
            ...(user.referred_by_code ? [{
                id: `welcome-${user.id}`,
                date: new Date(user.created_at).toLocaleDateString('th-TH', {
                    year: '2-digit',
                    month: 'short',
                    day: 'numeric'
                }),
                action: 'ได้รับคะแนนจากการเพื่อนเชิญเพื่อน',
                points: 50
            }] : []),
            
            // Map referral activities
            ...referrals.map(referral => ({
                id: `referral-${referral.id}`,
                date: new Date(referral.created_at).toLocaleDateString('th-TH', {
                    year: '2-digit',
                    month: 'short',
                    day: 'numeric'
                }),
                action: 'เพื่อนใช้รหัสอ้างอิงของคุณ',
                points: referral.points_awarded || 50
            })),
            
            // Map order activities
            ...recentOrders.map(order => {
                const pointsEarned = order.plan === 'monthly' ? 500 : 100;
                const actionText = `สั่งกล่องสุขภาพราย${order.plan === 'monthly' ? 'เดือน' : 'สัปดาห์'}`;

                return {
                    id: order.id,
                    date: new Date(order.created_at || Date.now()).toLocaleDateString('th-TH', {
                        year: '2-digit',
                        month: 'short',
                        day: 'numeric'
                    }),
                    action: actionText,
                    points: pointsEarned
                };
            })
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        // Calculate streak using database function
        const { data: streakResult, error: streakError } = await supabaseAdmin
            .rpc('calculate_user_streak', { p_user_id: user.id });
            
        if (streakError) {
            // Silent fail for streak calculation
        }
        
        const currentStreak = streakResult || 0;
        
        // Update user streak in database if different
        if (currentStreak !== (user.streak || 0)) {
            await supabaseAdmin
                .from('users')
                .update({ streak: currentStreak })
                .eq('id', user.id);
        }

        return NextResponse.json({
            user: {
                name: user.name,
                points: user.points || 0,
                streak: currentStreak,
            },
            recentActivity
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch points data', details: error.message },
            { status: 500 }
        );
    }
}

