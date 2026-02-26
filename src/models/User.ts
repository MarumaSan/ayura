import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isProfileComplete: { type: Boolean, default: false },
    age: { type: Number, default: 0 },
    realAge: { type: Number, default: 0 },
    bioAge: { type: Number, default: 0 },
    gender: { type: String, enum: ['ชาย', 'หญิง', 'อื่นๆ'] },
    weight: { type: Number, default: 0 }, // kg
    height: { type: Number, default: 0 }, // cm
    healthGoals: [{ type: String }],
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
