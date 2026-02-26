import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    category: { type: String, required: true, enum: ['ผัก', 'สมุนไพร', 'ผลไม้', 'โปรตีน', 'ธัญพืช'] },
    image: { type: String, required: true }, // Emoji or URL
    community: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    unit: { type: String, required: true },
    inStock: { type: Number, required: true, default: 0 },

    // Nutrition Data
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    gramsPerUnit: { type: Number, required: true }
}, { timestamps: true });

export const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);
