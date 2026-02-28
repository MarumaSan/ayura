import mongoose from 'mongoose';

// Ingredient in the box per week — "BoxSet" side (วัตถุดิบในกล่อง)
const BoxIngredientSchema = new mongoose.Schema({
    ingredientId: { type: String, required: true },
    gramsPerWeek: { type: Number, required: true }, // ×4 สำหรับรายเดือน
    note: { type: String, default: '' },
});

// Pre-calculated average daily nutrition for the whole set
const AvgNutritionSchema = new mongoose.Schema({
    calories: { type: Number, default: 0 },   // kcal/วัน
    protein: { type: Number, default: 0 },   // g/วัน
    carbs: { type: Number, default: 0 },   // g/วัน
    fat: { type: Number, default: 0 },   // g/วัน
});

// Top-level MealSet — admin creates these.
// Contains the BoxSet side (boxIngredients). Recipes are matched dynamically.
const MealSetSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },       // e.g. "เซ็ตลดน้ำหนัก"
    description: { type: String, default: '' },
    image: { type: String, default: '📦' },
    tag: { type: String, default: '' },          // e.g. "ยอดนิยม"
    targetBmi: { type: String, enum: ['underweight', 'normal', 'overweight'], default: 'normal' },
    priceWeekly: { type: Number, required: true },
    priceMonthly: { type: Number, required: true },
    avgNutrition: { type: AvgNutritionSchema, default: () => ({}) },  // สารอาหารเฉลี่ยต่อวัน
    boxIngredients: [BoxIngredientSchema],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Delete cached model to pick up schema changes during hot-reload / seed
if (mongoose.models.MealSet) {
    delete mongoose.models.MealSet;
}

export const MealSet = mongoose.model('MealSet', MealSetSchema);
