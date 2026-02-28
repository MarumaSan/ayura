import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Compare hashed password — also allow plaintext match for legacy users
        let passwordMatch = false;
        try {
            passwordMatch = await bcrypt.compare(password, user.password);
        } catch {
            // If stored password isn't a bcrypt hash, fall back to direct comparison
            // This handles legacy users who registered before bcrypt was added
            passwordMatch = user.password === password;
        }

        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isComplete = user.isProfileComplete || (user.weight && user.weight > 0 && user.age && user.age > 0);

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id || user._id.toString(),
                name: user.name,
                email: user.email,
                points: user.points,
                isProfileComplete: isComplete,
                height: user.height,
                age: user.age,
                gender: user.gender,
                balance: user.balance || 0
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Login failed', details: error.message },
            { status: 500 }
        );
    }
}
