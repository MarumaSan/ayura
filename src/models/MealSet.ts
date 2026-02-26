import mongoose from 'mongoose';

// Ingredient portion used in a recipe
const RecipeIngredientSchema = new mongoose.Schema({
    ingredientId: { type: String, required: true },
    gramsUsed: { type: Number, required: true },
    note: { type: String, default: '' },
});

// A full recipe / recommended menu — "MealSet" side (สูตรอาหาร)
const RecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, default: '🍽️' },
    mealType: {
        type: String,
        required: true,
        enum: ['เช้า', 'กลางวัน', 'เย็น', 'ว่าง'],
    },
    cookTime: { type: Number, default: 20 },      // นาที
    servings: { type: Number, default: 1 },
    calories: { type: Number, default: 0 },
    ingredients: [RecipeIngredientSchema],
    steps: [{ type: String }],
});

// Ingredient in the box per week — "BoxSet" side (วัตถุดิบในกล่อง)
const BoxIngredientSchema = new mongoose.Schema({
    ingredientId: { type: String, required: true },
    gramsPerWeek: { type: Number, required: true }, // ×4 สำหรับรายเดือน
});

// Pre-calculated average daily nutrition for the whole set
const AvgNutritionSchema = new mongoose.Schema({
    calories: { type: Number, default: 0 },   // kcal/วัน
    protein: { type: Number, default: 0 },   // g/วัน
    carbs: { type: Number, default: 0 },   // g/วัน
    fat: { type: Number, default: 0 },   // g/วัน
});

// Top-level MealSet — admin creates these.
// Contains both the MealSet side (recipes) and the BoxSet side (boxIngredients).
const MealSetSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },       // e.g. "เซ็ตลดน้ำหนัก"
    description: { type: String, default: '' },
    image: { type: String, default: '📦' },
    tag: { type: String, default: '' },          // e.g. "ยอดนิยม"
    priceWeekly: { type: Number, required: true },
    priceMonthly: { type: Number, required: true },
    avgNutrition: { type: AvgNutritionSchema, default: () => ({}) },  // สารอาหารเฉลี่ยต่อวัน
    boxIngredients: [BoxIngredientSchema],
    recipes: [RecipeSchema],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Delete cached model to pick up schema changes during hot-reload / seed
if (mongoose.models.MealSet) {
    delete mongoose.models.MealSet;
}

export const MealSet = mongoose.model('MealSet', MealSetSchema);
