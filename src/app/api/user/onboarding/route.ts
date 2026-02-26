import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const { userId, gender, age, weight, height, healthGoals } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Basic calculation for bioAge
        // In a real app this would use the real Health Algo
        const baseBioAge = age;
        const bmi = weight / ((height / 100) ** 2);

        // Simple mock calculation logic for bio age based on BMI
        let bioAgeModifier = 0;
        if (bmi > 25) bioAgeModifier += 3;
        if (bmi < 18.5) bioAgeModifier += 1;

        // Goals modifier
        if (healthGoals.includes('รักษาสุขภาพ')) bioAgeModifier -= 1;
        if (healthGoals.includes('ลดความเครียด')) bioAgeModifier -= 1;

        const calculatedBioAge = Math.max(18, baseBioAge + bioAgeModifier); // Don't go below 18 for demo limit

        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            {
                $set: {
                    gender,
                    age,
                    realAge: age,
                    weight,
                    height,
                    healthGoals,
                    bioAge: calculatedBioAge,
                    isProfileComplete: true
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                isProfileComplete: updatedUser.isProfileComplete,
                bioAge: updatedUser.bioAge
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to update profile', details: error.message },
            { status: 500 }
        );
    }
}
