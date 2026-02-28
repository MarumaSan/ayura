import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    userId: { type: String }, // Link to User
    mealSetId: { type: String }, // Link to purchased MealSet
    paymentMethod: { type: String, enum: ['PROMPTPAY', 'WALLET'] },
    status: {
        type: String,
        required: true,
        enum: ['รออนุมัติ', 'รอจัดส่ง', 'กำลังจัดเตรียม', 'จัดส่งแล้ว', 'จัดส่งสำเร็จ', 'สำเร็จ'],
        default: 'รออนุมัติ'
    },
    totalPrice: { type: Number, required: true },
    plan: { type: String, enum: ['weekly', 'monthly'], required: true },
    boxSize: { type: String, enum: ['M', 'L', 'XL'], default: 'M' },
    sizeMultiplier: { type: Number, default: 1.0 },
    address: { type: String, required: true },
    deliveryDate: { type: String, required: true }
}, { timestamps: true });

if (mongoose.models.Order) {
    delete mongoose.models.Order;
}

export const Order = mongoose.model('Order', OrderSchema);
