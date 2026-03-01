import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return safe profile info (excluding password, etc.)
        return NextResponse.json({
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                weight: user.weight,
                height: user.height,
                healthGoals: user.health_goal ? user.health_goal.split(',') : [],
                points: user.points,
                streak: user.streak,
                balance: user.balance || 0,
                isProfileComplete: user.is_profile_complete,
                role: user.role || 'user'
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch user profile', details: error.message },
            { status: 500 }
        );
    }
}

