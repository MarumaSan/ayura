import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email is already registered' },
                { status: 409 }
            );
        }

        // Create a new user with minimal data, setting isProfileComplete to false
        const newUser = new User({
            id: `usr-${Date.now()}`,
            name,
            email,
            password, // In production this would be hashed (e.g. bcrypt)
            isProfileComplete: false,
            points: 10, // Starter bonus
            streak: 0
        });

        await newUser.save();

        return NextResponse.json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                points: newUser.points,
                isProfileComplete: newUser.isProfileComplete,
                role: newUser.role || 'user'
            }
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Registration failed', details: error.message },
            { status: 500 }
        );
    }
}
