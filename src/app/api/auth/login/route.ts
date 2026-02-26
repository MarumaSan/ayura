import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';

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

        // Basic query (In production this would compare hashed passwords)
        const user = await User.findOne({ email, password });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Determine if profile is complete (fallback for legacy or seeded users)
        const isComplete = user.isProfileComplete || (user.weight && user.weight > 0 && user.age && user.age > 0);

        // Success (In production this would generate a JWT session)
        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                points: user.points,
                isProfileComplete: isComplete,
                role: user.role || 'user'
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Login failed', details: error.message },
            { status: 500 }
        );
    }
}
