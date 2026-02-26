import mongoose from 'mongoose';

const IngredientSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameEnglish: { type: String, required: true },
    category: { type: String, required: true, enum: ['ผัก', 'สมุนไพร', 'ผลไม้', 'โปรตีน', 'ธัญพืช'] },
    image: { type: String, required: true }, // Emoji or URL
    community: { type: String, required: true },

    // Pricing & Stock
    pricePerUnit: { type: Number, required: true },
    gramPerUnit: { type: Number, required: true }, // Weight of one unit in grams
    unit: { type: String, required: true },
    inStock: { type: Number, required: true, default: 0 },

    // Nutrition per 100g
    calories100g: { type: Number, required: true },
    protein100g: { type: Number, required: true },
    carbs100g: { type: Number, required: true },
    fat100g: { type: Number, required: true },
}, { timestamps: true });

export const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);
