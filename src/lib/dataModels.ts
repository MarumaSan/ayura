import { Ingredient, RecipeData, BoxItem, BoxSet, ScaledBoxSet } from './types';
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
            (sum, item) => sum + (item.ingredient.calories * item.amountInGrams) / item.ingredient.gramsPerUnit,
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get protein(): number {
        const val = this.getResolvedIngredients().reduce(
            (sum, item) => sum + (item.ingredient.protein * item.amountInGrams) / item.ingredient.gramsPerUnit,
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get carbs(): number {
        const val = this.getResolvedIngredients().reduce(
            (sum, item) => sum + (item.ingredient.carbs * item.amountInGrams) / item.ingredient.gramsPerUnit,
            0
        );
        return Math.round(val * 10) / 10;
    }

    public get fat(): number {
        const val = this.getResolvedIngredients().reduce(
            (sum, item) => sum + (item.ingredient.fat * item.amountInGrams) / item.ingredient.gramsPerUnit,
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

/**
 * Model class for Admin-defined Box Sets.
 * Calculates base nutrition from ingredient data, then scales by TDEE multiplier.
 */
export class BoxSetModel {
    public data: BoxSet;

    constructor(data: BoxSet) {
        this.data = data;
    }

    /**
     * Resolves ingredient objects for each item in the set
     */
    private getResolvedItems(): { ingredient: Ingredient; amountInGrams: number; baseGrams: number; basePrice: number; baseCalories: number; baseProtein: number; baseCarbs: number; baseFat: number }[] {
        return this.data.items.map((item) => {
            const ing = ingredients.find((i) => i.id === item.ingredientId);
            if (!ing) throw new Error(`Ingredient ${item.ingredientId} not found in BoxSet ${this.data.id}`);

            const baseAmount = item.amountInGrams || 100; // Fallback if missing
            const ratio = baseAmount / ing.gramsPerUnit;
            return {
                ingredient: ing,
                amountInGrams: baseAmount,
                baseGrams: baseAmount,
                basePrice: ing.pricePerUnit * ratio,
                baseCalories: ing.calories * ratio,
                baseProtein: ing.protein * ratio,
                baseCarbs: ing.carbs * ratio,
                baseFat: ing.fat * ratio,
            };
        });
    }

    /** Base calories of the entire set (before TDEE scaling) */
    public get baseCalories(): number {
        return Math.round(this.getResolvedItems().reduce((sum, item) => sum + item.baseCalories, 0) * 10) / 10;
    }

    /** Base protein of the entire set */
    public get baseProtein(): number {
        return Math.round(this.getResolvedItems().reduce((sum, item) => sum + item.baseProtein, 0) * 10) / 10;
    }

    /** Base carbs of the entire set */
    public get baseCarbs(): number {
        return Math.round(this.getResolvedItems().reduce((sum, item) => sum + item.baseCarbs, 0) * 10) / 10;
    }

    /** Base fat of the entire set */
    public get baseFat(): number {
        return Math.round(this.getResolvedItems().reduce((sum, item) => sum + item.baseFat, 0) * 10) / 10;
    }

    /** Base price of the entire set (sum of basePrice) */
    public get basePrice(): number {
        return this.getResolvedItems().reduce((sum, item) => sum + item.basePrice, 0);
    }

    /**
     * Scale the set for a specific user's TDEE.
     * multiplier = userTDEE / baseCalories
     * All grams and prices are multiplied accordingly.
     */
    public scaleForUser(userTDEE: number): ScaledBoxSet {
        const baseCal = this.baseCalories;
        const multiplier = baseCal > 0 ? Math.round((userTDEE / baseCal) * 100) / 100 : 1;

        const resolved = this.getResolvedItems();

        const scaledItems = resolved.map((item) => ({
            ingredientId: item.ingredient.id,
            ingredientName: item.ingredient.name,
            baseGrams: Math.round(item.baseGrams),
            scaledGrams: Math.round(item.baseGrams * multiplier),
            basePrice: Math.round(item.basePrice),
            scaledPrice: Math.round(item.basePrice * multiplier * 10) / 10,
        }));

        return {
            boxSet: this.data,
            multiplier,
            scaledItems,
            totalPrice: Math.round(scaledItems.reduce((s, i) => s + i.scaledPrice, 0) * 10) / 10,
            totalCalories: Math.round(baseCal * multiplier * 10) / 10,
            totalProtein: Math.round(this.baseProtein * multiplier * 10) / 10,
            totalCarbs: Math.round(this.baseCarbs * multiplier * 10) / 10,
            totalFat: Math.round(this.baseFat * multiplier * 10) / 10,
        };
    }
}
