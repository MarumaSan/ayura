import mongoose from 'mongoose';

const RecipeIngredientSchema = new mongoose.Schema({
    ingredientId: { type: String, required: true },
    gramsUsed: { type: Number, required: true },
    note: { type: String, default: '' },
});

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
}, { timestamps: true });

// Delete cached model to pick up schema changes during hot-reload
if (mongoose.models.Recipe) {
    delete mongoose.models.Recipe;
}

export const Recipe = mongoose.model('Recipe', RecipeSchema);
