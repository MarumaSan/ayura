import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.trim().toLowerCase())
            .single();

        if (error || !user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Compare hashed password
        let passwordMatch = false;
        const cleanPassword = password.trim();
        try {
            if (user.password.startsWith('$')) {
                passwordMatch = await bcrypt.compare(cleanPassword, user.password);
            } else {
                // Legacy plaintext fallback
                passwordMatch = user.password === cleanPassword;
            }
        } catch (err) {
            console.error('Password comparison error:', err);
            passwordMatch = user.password === cleanPassword;
        }

        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isComplete = user.is_profile_complete || (user.weight && user.weight > 0 && user.age && user.age > 0);

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                points: user.points,
                isProfileComplete: isComplete,
                weight: user.weight,
                height: user.height,
                age: user.age,
                gender: user.gender,
                healthGoals: user.health_goal ? user.health_goal.split(',') : [],
                balance: user.balance || 0,
                role: user.role
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Login failed', details: error.message },
            { status: 500 }
        );
    }
}

