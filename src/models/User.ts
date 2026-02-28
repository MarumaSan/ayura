import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isProfileComplete: { type: Boolean, default: false },
    age: { type: Number, default: 0 },
    gender: { type: String, enum: ['ชาย', 'หญิง', 'อื่นๆ'] },
    weight: { type: Number, default: 0 }, // kg
    height: { type: Number, default: 0 }, // cm
    healthGoals: [{ type: String }],
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }, // Wallet balance
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Clear the mongoose model cache to avoid hot reloading issues with new fields
if (mongoose.models.User) {
    delete mongoose.models.User;
}

export const User = mongoose.model('User', UserSchema);
