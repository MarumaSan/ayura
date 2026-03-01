export interface TopupRequestRow {
    id: string; // 'top-xxx'
    user_id: string; // references users(id)
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

