export interface TopupRequestRow {
    id: number; // BIGSERIAL
    user_id: number; // references users(id) - bigint
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

