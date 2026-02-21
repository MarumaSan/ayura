import { Ingredient, RecipeData, BoxItem } from './types';
import { ingredients } from './mockData';

/**
 * Model class for a single Recipe. 
 * Calculates nutritional values dynamically based on ingredient items.
 */
export class RecipeModel {
    public id: string;
    public name: string;
    public description: string;
    public image: string;
    public items: { ingredientId: string; amount: number }[]; // amount in base units
    public cookTime: string;
    public mealType: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง';
    public instructions: string[];

    constructor(data: RecipeData) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.image = data.image;
        this.items = data.items;
        this.cookTime = data.cookTime;
        this.mealType = data.mealType;
        this.instructions = data.instructions;
    }

    /**
     * Resolves the full Ingredient objects for this recipe
     */
    private getResolvedIngredients(): { ingredient: Ingredient; amount: number }[] {
        return this.items.map((item) => {
            const ing = ingredients.find((i) => i.id === item.ingredientId);
            if (!ing) throw new Error(`Ingredient ${item.ingredientId} not found`);
            return { ingredient: ing, amount: item.amount };
        });
    }

    public get calories(): number {
        return this.getResolvedIngredients().reduce(
            (sum, item) => sum + item.ingredient.calories * item.amount,
            0
        );
    }

    public get protein(): number {
        return this.getResolvedIngredients().reduce(
            (sum, item) => sum + item.ingredient.protein * item.amount,
            0
        );
    }

    public get carbs(): number {
        return this.getResolvedIngredients().reduce(
            (sum, item) => sum + item.ingredient.carbs * item.amount,
            0
        );
    }

    public get fat(): number {
        return this.getResolvedIngredients().reduce(
            (sum, item) => sum + item.ingredient.fat * item.amount,
            0
        );
    }
}

/**
 * Model class for a Weekly Box. 
 * Calculates total prices and sums macros based on quantities.
 */
export class WeeklyBoxModel {
    public id: string;
    public weekNumber: number;
    public items: BoxItem[]; // Includes { ingredient, quantity }
    public matchScore: number;

    constructor(id: string, weekNumber: number, items: BoxItem[], matchScore: number) {
        this.id = id;
        this.weekNumber = weekNumber;
        this.items = items;
        this.matchScore = matchScore;
    }

    public get totalPrice(): number {
        return this.items.reduce(
            (sum, item) => sum + item.ingredient.pricePerUnit * item.quantity,
            0
        );
    }

    public get totalCalories(): number {
        return this.items.reduce(
            (sum, item) => sum + item.ingredient.calories * item.quantity,
            0
        );
    }

    public get totalProtein(): number {
        return this.items.reduce(
            (sum, item) => sum + item.ingredient.protein * item.quantity,
            0
        );
    }

    public get totalCarbs(): number {
        return this.items.reduce(
            (sum, item) => sum + item.ingredient.carbs * item.quantity,
            0
        );
    }

    public get totalFat(): number {
        return this.items.reduce(
            (sum, item) => sum + item.ingredient.fat * item.quantity,
            0
        );
    }

    public get ingredients(): Ingredient[] {
        return this.items.map(i => i.ingredient);
    }
}
