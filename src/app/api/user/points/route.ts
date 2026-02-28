import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { Order } from '@/models/Order';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({
                user: { name: 'ผู้ใช้', points: 0, streak: 0 },
                recentActivity: []
            });
        }

        // Fetch recent orders for this user
        const orderQueryUserId = user.id ? user.id : user._id.toString();
        const recentOrders = await Order.find({ userId: orderQueryUserId })
            .sort({ createdAt: -1 })
            .limit(10); // get last 10 activities

        const recentActivity = recentOrders.map(order => {
            const pointsEarned = order.plan === 'weekly' ? 100 : 500;
            const actionText = `สั่งกล่องสุขภาพราย${order.plan === 'weekly' ? 'สัปดาห์' : 'เดือน'}`;

            // Format date to Thai format
            const dateObj = new Date(order.createdAt || Date.now());
            const formattedDate = dateObj.toLocaleDateString('th-TH', {
                year: '2-digit',
                month: 'short',
                day: 'numeric'
            });

            return {
                id: order._id.toString(),
                date: formattedDate,
                action: actionText,
                points: pointsEarned
            };
        });

        return NextResponse.json({
            user: {
                name: user.name,
                points: user.points || 0,
                streak: user.streak || 0,
            },
            recentActivity
        });

    } catch (error: any) {
        console.error('Error fetching user points:', error);
        return NextResponse.json(
            { error: 'Failed to fetch points data', details: error.message },
            { status: 500 }
        );
    }
}
