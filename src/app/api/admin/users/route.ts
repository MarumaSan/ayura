import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, phone, age, weight, height, gender, activity_level, target_bmi, health_goals, food_allergies, balance, points, is_profile_complete, is_admin, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const compatUsers = (users || []).map(u => ({
            ...u,
            _id: u.id,
            activityLevel: u.activity_level,
            targetBmi: u.target_bmi,
            healthGoals: u.health_goals,
            foodAllergies: u.food_allergies,
            isProfileComplete: u.is_profile_complete,
            isAdmin: u.is_admin,
            createdAt: u.created_at,
            updatedAt: u.updated_at
        }));

        return NextResponse.json({ success: true, data: compatUsers });
    } catch (error: any) {
        console.error('Failed to fetch users', error);
        return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
    }
}

