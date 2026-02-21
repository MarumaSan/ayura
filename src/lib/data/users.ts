import { UserProfile, BioAgeHistory } from '../types';

// ========================================
// Mock User
// ========================================
export const mockUser: UserProfile = {
    id: 'u1',
    name: 'สมชาย ใจดี',
    age: 32,
    gender: 'ชาย',
    weight: 75,
    height: 175,
    element: 'ไฟ', // Will be ignored 
    healthGoals: ['ลดน้ำหนัก', 'ลดความเครียด'],
    bioAge: 28,
    realAge: 32,
    points: 1250,
    streak: 6,
};

// ========================================
// Bio-Age History
// ========================================
export const bioAgeHistory: BioAgeHistory[] = [
    { week: 'สัปดาห์ 1', bioAge: 33, realAge: 32 },
    { week: 'สัปดาห์ 2', bioAge: 32.5, realAge: 32 },
    { week: 'สัปดาห์ 3', bioAge: 31.8, realAge: 32 },
    { week: 'สัปดาห์ 4', bioAge: 30.5, realAge: 32 },
    { week: 'สัปดาห์ 5', bioAge: 29.8, realAge: 32 },
    { week: 'สัปดาห์ 6', bioAge: 28, realAge: 32 },
];
