export interface OrderRow {
    id: string; // 'ord-xxx'
    customer_name: string;
    user_id?: string;
    mealset_id?: string;
    mealset_name?: string;
    payment_method?: 'PROMPTPAY' | 'WALLET';
    status: 'รอยืนยันการชำระเงิน' | 'รออนุมัติ' | 'รอจัดส่ง' | 'กำลังขนส่ง' | 'จัดส่งสำเร็จ' | 'สำเร็จ' | 'ยกเลิก';
    total_price: number;
    plan: 'weekly' | 'monthly';
    box_size?: 'M' | 'L' | 'XL';
    size_multiplier?: number;
    address: string;
    phone?: string;
    delivery_date?: string;
    target_delivery_date?: string;
    coupon_code?: string;
    discount_amount?: number;
    is_preorder?: boolean;
    created_at: string;
    updated_at: string;
}

