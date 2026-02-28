import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITopupRequest extends Document {
    userId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}

const TopupRequestSchema = new Schema<ITopupRequest>(
    {
        userId: { type: String, required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },
    { timestamps: true }
);

export const TopupRequest = models.TopupRequest || mongoose.model<ITopupRequest>('TopupRequest', TopupRequestSchema);
