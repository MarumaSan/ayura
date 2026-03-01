import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
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

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.trim().toLowerCase())
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email is already registered' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                name: name.trim(),
                email: email.trim().toLowerCase(),
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

