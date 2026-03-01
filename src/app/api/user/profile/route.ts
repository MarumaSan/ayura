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

        const isComplete = user.is_profile_complete || (user.weight && user.weight > 0 && user.age && user.age > 0);

        // Return safe profile info (excluding password, etc.)
        return NextResponse.json({
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                age: user.age,
                gender: user.gender || '',
                weight: user.weight,
                height: user.height,
                activityLevel: user.activity_level || '',
                bio: user.bio || '',
                healthGoals: user.health_goal ? user.health_goal.split(',') : [],
                points: user.points,
                streak: user.streak,
                balance: user.balance || 0,
                isProfileComplete: isComplete,
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

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const {
            userId,
            name,
            phone,
            age,
            gender,
            weight,
            height,
            activityLevel,
            bio,
            healthGoals
        } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const healthGoalString = Array.isArray(healthGoals) ? healthGoals.join(',') : healthGoals;

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({
                name,
                phone,
                age,
                gender,
                weight,
                height,
                activity_level: activityLevel,
                bio,
                health_goal: healthGoalString,
                is_profile_complete: true // Mark as complete since they updated it
            })
            .eq('id', userId)
            .select()
            .single();

        if (error || !updatedUser) {
            console.error('Update Profile Error:', error);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            profile: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone || '',
                age: updatedUser.age,
                gender: updatedUser.gender || '',
                weight: updatedUser.weight,
                height: updatedUser.height,
                activityLevel: updatedUser.activity_level || '',
                bio: updatedUser.bio || '',
                healthGoals: updatedUser.health_goal ? updatedUser.health_goal.split(',') : [],
                points: updatedUser.points,
                streak: updatedUser.streak,
                balance: updatedUser.balance || 0,
                isProfileComplete: updatedUser.is_profile_complete,
                role: updatedUser.role || 'user'
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    }
}

