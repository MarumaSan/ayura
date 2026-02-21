import { Order } from '../types';
import { ingredients } from './ingredients';

// ========================================
// Mock Orders
// ========================================
export const mockOrders: Order[] = [
    {
        id: 'ORD-2024-001',
        userId: 'u1',
        customerName: 'สมชาย ใจดี',
        box: {
            id: 'b1',
            weekNumber: 8,
            items: [
                { ingredient: ingredients[2], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[5], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[8], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[6], quantity: 1, amountInGrams: 1 * 50 }
            ],
            totalPrice: 559,
            matchScore: 92,
        },
        plan: 'weekly',
        status: 'จัดส่งแล้ว',
        deliveryDate: '2024-02-24',
        address: '123 ถ.สุขุมวิท แขวงคลองเตย กทม. 10110',
        totalPrice: 559,
    },
    {
        id: 'ORD-2024-002',
        userId: 'u2',
        customerName: 'สมหญิง รักษ์โลก',
        box: {
            id: 'b2',
            weekNumber: 8,
            items: [
                { ingredient: ingredients[3], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[4], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[9], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[10], quantity: 1, amountInGrams: 1 * 50 }
            ],
            totalPrice: 480,
            matchScore: 88,
        },
        plan: 'monthly',
        status: 'กำลังจัดเตรียม',
        deliveryDate: '2024-02-25',
        address: '456 ถ.พระราม4 แขวงสีลม กทม. 10500',
        totalPrice: 480,
    },
    {
        id: 'ORD-2024-003',
        userId: 'u3',
        customerName: 'วิทยา สุขสม',
        box: {
            id: 'b3',
            weekNumber: 8,
            items: [
                { ingredient: ingredients[2], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[11], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[4], quantity: 1, amountInGrams: 1 * 50 }
            ],
            totalPrice: 200,
            matchScore: 85,
        },
        plan: 'weekly',
        status: 'รอจัดส่ง',
        deliveryDate: '2024-02-26',
        address: '789 ถ.รัชดาภิเษก แขวงดินแดง กทม. 10400',
        totalPrice: 200,
    },
    {
        id: 'ORD-2024-004',
        userId: 'u4',
        customerName: 'นภา แสงดาว',
        box: {
            id: 'b4',
            weekNumber: 8,
            items: [
                { ingredient: ingredients[1], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[9], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[3], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[7], quantity: 1, amountInGrams: 1 * 50 }
            ],
            totalPrice: 400,
            matchScore: 95,
        },
        plan: 'monthly',
        status: 'สำเร็จ',
        deliveryDate: '2024-02-22',
        address: '321 ถ.ลาดพร้าว แขวงจอมพล กทม. 10900',
        totalPrice: 400,
    },
    {
        id: 'ORD-2024-005',
        userId: 'u5',
        customerName: 'อรุณ ชาวนา',
        box: {
            id: 'b5',
            weekNumber: 8,
            items: [
                { ingredient: ingredients[8], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[10], quantity: 1, amountInGrams: 1 * 50 },
                { ingredient: ingredients[6], quantity: 1, amountInGrams: 1 * 50 }
            ],
            totalPrice: 484,
            matchScore: 90,
        },
        plan: 'weekly',
        status: 'กำลังจัดเตรียม',
        deliveryDate: '2024-02-25',
        address: '654 ถ.เพชรบุรี แขวงราชเทวี กทม. 10400',
        totalPrice: 484,
    },
];
