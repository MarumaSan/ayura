import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    ingredientId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
});

const BoxSchema = new mongoose.Schema({
    items: [OrderItemSchema]
});

const OrderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    userId: { type: String }, // Optional link to User
    status: {
        type: String,
        required: true,
        enum: ['รอจัดส่ง', 'กำลังจัดเตรียม', 'จัดส่งแล้ว', 'สำเร็จ'],
        default: 'รอจัดส่ง'
    },
    totalPrice: { type: Number, required: true },
    plan: { type: String, enum: ['weekly', 'monthly'], required: true },
    address: { type: String, required: true },
    deliveryDate: { type: String, required: true }, // or Date
    box: { type: BoxSchema, required: true }
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
