import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { MealSet } from '@/models/MealSet';
import { scoreMealSets, computeUserTargets } from '@/lib/mealRecommender';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // 1. Fetch user
        const query = userId.length === 24
            ? { $or: [{ id: userId }, { _id: userId }] }
            : { id: userId };

        const user = await User.findOne(query);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Ensure profile is complete
        if (!user.weight || !user.height || !user.age) {
            return NextResponse.json({ error: 'User profile incomplete — cannot compute recommendations' }, { status: 400 });
        }

        // 3. Fetch active meal sets
        const mealSets = await MealSet.find({ isActive: true }).sort({ createdAt: -1 }).lean();

        // 4. Compute user targets
        const userProfile = {
            weight: user.weight,
            height: user.height,
            age: user.age,
            gender: user.gender || 'ชาย',
            healthGoals: user.healthGoals || [],
        };
        const targets = computeUserTargets(userProfile);

        // 5. Score and sort meal sets
        const scored = scoreMealSets(userProfile, mealSets as any[]);

        return NextResponse.json({
            data: scored,
            targets,
        });
    } catch (error: any) {
        console.error('Recommendation API error:', error);
        return NextResponse.json(
            { error: 'Failed to compute recommendations', details: error.message },
            { status: 500 }
        );
    }
}
