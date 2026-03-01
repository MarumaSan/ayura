import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { withRateLimit } from '@/lib/rateLimit';

// Input validation functions
function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
}

function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>\"'&]/g, '');
}

async function registerHandler(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Validate inputs
        if (!validateName(name)) {
            return NextResponse.json(
                { error: 'Name must be between 2 and 100 characters' },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Basic validation
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = email.trim().toLowerCase();

        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', sanitizedEmail)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email is already registered' },
                { status: 409 }
            );
        }

        // Hash password with bcrypt (cost factor 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        const { data: newUser, error } = await supabaseAdmin
            .from('users')
            .insert({
                name: sanitizedName,
                email: sanitizedEmail,
                password: hashedPassword,
                is_profile_complete: false,
                points: 10,
                streak: 0,
                role: 'user'
            })
            .select()
            .single();

        if (error || !newUser) {
            throw new Error(error?.message || 'Failed to insert user');
        }

        return NextResponse.json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                points: newUser.points,
                isProfileComplete: newUser.is_profile_complete,
                role: newUser.role
            }
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Registration failed', details: error.message },
            { status: 500 }
        );
    }
}

export const POST = withRateLimit(registerHandler, true);

