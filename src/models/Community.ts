import mongoose from 'mongoose';

const CommunitySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, default: '' },
    note: { type: String, default: '' },
}, { timestamps: true });

export const Community = mongoose.models.Community || mongoose.model('Community', CommunitySchema);
