import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { withRateLimit } from '@/lib/rateLimit';

// Input validation
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}

async function loginHandler(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        const sanitizedPassword = password.trim();

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, password, points, is_profile_complete, weight, height, age, gender, health_goal, balance, role')
            .eq('email', sanitizedEmail)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Compare hashed password - DO NOT expose password in response
        let passwordMatch = false;
        try {
            if (user.password && user.password.startsWith('$2')) {
                passwordMatch = await bcrypt.compare(sanitizedPassword, user.password);
            } else {
                // Legacy plaintext fallback - reject for security
                return NextResponse.json(
                    { error: 'Account requires password reset. Please use forgot password.' },
                    { status: 401 }
                );
            }
        } catch (err) {
            console.error('Password comparison error:', err);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
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

export const POST = withRateLimit(loginHandler, true);

