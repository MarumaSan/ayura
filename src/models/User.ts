export interface UserRow {
    id: number; // bigint in database
    name: string;
    email: string;
    password?: string;
    is_profile_complete: boolean;
    age: number;
    gender?: 'ชาย' | 'หญิง' | 'อื่นๆ';
    weight: number;
    height: number;
    health_goals?: string[];
    points: number;
    streak: number;
    balance: number;
    role: 'user' | 'admin';
    referral_code?: string;
    referred_by_code?: string;
    created_at: string;
    updated_at: string;
}

