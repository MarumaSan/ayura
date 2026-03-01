export interface AvgNutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface BoxIngredientRow {
    id?: string;
    mealset_id: string;
    ingredient_id: string;
    grams_per_week: number;
    note?: string;
    created_at?: string;
}

export interface MealSetRow {
    id: string; // 'set-xxx'
    name: string;
    description?: string;
    image: string;
    price_weekly: number;
    price_monthly: number;
    is_active: boolean;
    avg_calories: number;
    avg_protein: number;
    avg_carbs: number;
    avg_fat: number;
    created_at: string;
    updated_at: string;
}

