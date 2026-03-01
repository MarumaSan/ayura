export interface RecipeIngredientRow {
    id?: string;
    recipe_id: string;
    ingredient_id: string;
    grams_used: number;
    note?: string;
    created_at?: string;
}

export interface RecipeRow {
    id: string; // 'rcp-xxx'
    name: string;
    image: string;
    meal_type: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง';
    cook_time: number;
    servings: number;
    calories: number;
    steps: string[];
    created_at: string;
    updated_at: string;
}

