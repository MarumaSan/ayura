import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const user = await User.findOne({ id: userId });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return safe profile info (excluding password, etc.)
        return NextResponse.json({
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                realAge: user.realAge,
                bioAge: user.bioAge,
                weight: user.weight,
                height: user.height,
                healthGoals: user.healthGoals,
                points: user.points,
                streak: user.streak,
                isProfileComplete: user.isProfileComplete
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch user profile', details: error.message },
            { status: 500 }
        );
    }
}
