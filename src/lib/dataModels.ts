import { Ingredient, RecipeData, BoxItem } from './types';
import { ingredients } from './data/ingredients';

/**
 * Model class for a single Recipe. 
 * Calculates nutritional values dynamically based on ingredient items.
 */
export class RecipeModel {
    public id: string;
    public name: string;
    public description: string;
    public image: string;
    public items: { ingredientId: string; amountInGrams: number }[]; // amount in base units
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
    private getResolvedIngredients(): { ingredient: Ingredient; amountInGrams: number }[] {
        return this.items.map((item) => {
            const ing = ingredients.find((i: any) => i.id === item.ingredientId);
            if (!ing) throw new Error(`Ingredient ${item.ingredientId} not found`);
            return { ingredient: ing, amountInGrams: item.amountInGrams };
        });
    }

    public get calories(): number {
        const val = this.getResolvedIngredients().reduce(
            (sum, item) => sum + (item.ingredient.calories * item.amountInGrams) / parseInt(item.ingredient.servingSize || '100'),
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get protein(): number {
        const val = this.getResolvedIngredients().reduce(
            (sum, item) => sum + (item.ingredient.protein * item.amountInGrams) / parseInt(item.ingredient.servingSize || '100'),
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get carbs(): number {
        const val = this.getResolvedIngredients().reduce(
            (sum, item) => sum + (item.ingredient.carbs * item.amountInGrams) / parseInt(item.ingredient.servingSize || '100'),
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get fat(): number {
        const val = this.getResolvedIngredients().reduce(
            (sum, item) => sum + (item.ingredient.fat * item.amountInGrams) / parseInt(item.ingredient.servingSize || '100'),
            0
        );
        return Math.round(val * 10) / 10;
    }

    public scale(factor: number): void {
        this.items.forEach(item => {
            item.amountInGrams *= factor;
        });

        // Update name
        const formattedScale = (Math.round(factor * 10) / 10).toString();
        if (!this.name.includes('(x')) {
            this.name = `${this.name} (x${formattedScale} เสิร์ฟ)`;
        }
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
        const val = this.items.reduce(
            (sum, item) => sum + item.ingredient.pricePerUnit * item.quantity,
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get totalCalories(): number {
        const val = this.items.reduce(
            (sum, item) => sum + item.ingredient.calories * item.quantity,
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get totalProtein(): number {
        const val = this.items.reduce(
            (sum, item) => sum + item.ingredient.protein * item.quantity,
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get totalCarbs(): number {
        const val = this.items.reduce(
            (sum, item) => sum + item.ingredient.carbs * item.quantity,
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get totalFat(): number {
        const val = this.items.reduce(
            (sum, item) => sum + item.ingredient.fat * item.quantity,
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get ingredients(): Ingredient[] {
        return this.items.map(i => i.ingredient);
    }
}
