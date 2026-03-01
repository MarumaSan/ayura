import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { userId, gender, age, weight, height, phone, activityLevel, bio, healthGoals } = await request.json();

        if (!userId || !phone) {
            return NextResponse.json({ error: 'User ID and Phone are required' }, { status: 400 });
        }

        const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update({
                gender,
                age,
                weight,
                height,
                phone,
                activity_level: activityLevel,
                bio,
                health_goal: healthGoals.join(','),
                is_profile_complete: true
            })
            .eq('id', userId)
            .select()
            .single();

        if (error || !updatedUser) {
            return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                isProfileComplete: updatedUser.is_profile_complete
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    }
}

