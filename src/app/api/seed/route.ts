import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Ingredient } from '@/models/Ingredient';
import { User } from '@/models/User';
import { Order } from '@/models/Order';

const sampleIngredients = [
    { id: 'i1', name: 'อกไก่ออร์แกนิก', nameEn: 'Organic Chicken Breast', category: 'โปรตีน', image: '🍗', community: 'สหกรณ์การเกษตรดอยคำ', inStock: 150, unit: 'ชิ้น', pricePerUnit: 189, calories: 165, protein: 31, carbs: 0, fat: 3.6, gramsPerUnit: 100 },
    { id: 'i2', name: 'ผักเชียงดา', nameEn: 'Gymnema', category: 'ผัก', image: '🥬', community: 'ฟาร์มตัวอย่างหุบกะพง', inStock: 120, unit: 'กำ', pricePerUnit: 85, calories: 25, protein: 3.5, carbs: 3.0, fat: 0.3, gramsPerUnit: 100 },
    { id: 'i3', name: 'ขิงสด', nameEn: 'Ginger', category: 'สมุนไพร', image: '🫚', community: 'ศูนย์ศิลปาชีพบางไทร', inStock: 200, unit: 'กิโลกรัม', pricePerUnit: 55, calories: 80, protein: 1.8, carbs: 18, fat: 0.8, gramsPerUnit: 100 },
    { id: 'i4', name: 'ใบเตย', nameEn: 'Pandan', category: 'สมุนไพร', image: '🍃', community: 'กลุ่มวิสาหกิจชุมชนแม่กลอง', inStock: 180, unit: 'กำ', pricePerUnit: 35, calories: 35, protein: 1.2, carbs: 8, fat: 0.1, gramsPerUnit: 100 },
    { id: 'i5', name: 'ข้าวกล้อง', nameEn: 'Brown Rice', category: 'ธัญพืช', image: '🌾', community: 'ทุ่งกุลาร้องไห้', inStock: 300, unit: 'กก.', pricePerUnit: 145, calories: 111, protein: 2.6, carbs: 23, fat: 0.9, gramsPerUnit: 100 },
];

const sampleOrders = [
    { id: 'ORD-001', customerName: 'คุณสมหญิง รักสุขภาพ', status: 'รอจัดส่ง', totalPrice: 890, plan: 'weekly', address: '123/45 ถ.สุขุมวิท', deliveryDate: '15/11/2023', box: { items: [{ ingredientId: 'i1', name: 'อกไก่ออร์แกนิก', image: '🍗' }, { ingredientId: 'i2', name: 'ผักเชียงดา', image: '🥬' }] } },
    { id: 'ORD-002', customerName: 'คุณสมชาย ใจดี', status: 'กำลังจัดเตรียม', totalPrice: 2400, plan: 'monthly', address: '99/9 ถ.พหลโยธิน', deliveryDate: '15/11/2023', box: { items: [{ ingredientId: 'i3', name: 'ขิงสด', image: '🫚' }, { ingredientId: 'i5', name: 'ข้าวกล้อง', image: '🌾' }] } },
];

const sampleUsers = [
    { id: 'user-001', name: 'คุณสมหญิง สุขภาพดี', email: 'somying@example.com', password: 'password123', age: 32, realAge: 32, bioAge: 28, gender: 'หญิง', weight: 55, height: 162, healthGoals: ['ลดไขมัน', 'เพิ่มภูมิคุ้มกัน'], points: 250, streak: 12 },
    { id: 'user-002', name: 'คุณสมชาย ใจแกร่ง', email: 'somchai@example.com', password: 'password123', age: 45, realAge: 45, bioAge: 42, gender: 'ชาย', weight: 75, height: 175, healthGoals: ['สร้างกล้ามเนื้อ', 'ลดภาวะอักเสบ'], points: 120, streak: 5 }
];

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Clear existing data
        await Ingredient.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});

        // 2. Insert Mock Data
        const insertedIngredients = await Ingredient.insertMany(sampleIngredients);
        const insertedUsers = await User.insertMany(sampleUsers);
        const insertedOrders = await Order.insertMany(sampleOrders);

        return NextResponse.json({
            message: 'Database Seeded Successfully! 🌱',
            data: {
                ingredients: insertedIngredients.length,
                users: insertedUsers.length,
                orders: insertedOrders.length
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to seed database', details: error.message },
            { status: 500 }
        );
    }
}
