import { BMRResult, HealthGoal, Recipe } from './types';

export class NutritionCalculator {
    private weight: number;
    private height: number;
    private age: number;
    private gender: 'ชาย' | 'หญิง' | 'อื่นๆ';
    private goals: HealthGoal[];

    constructor(
        weight: number,
        height: number,
        age: number,
        gender: 'ชาย' | 'หญิง' | 'อื่นๆ',
        goals: HealthGoal[]
    ) {
        this.weight = weight;
        this.height = height;
        this.age = age;
        this.gender = gender;
        this.goals = goals;
    }

    /**
     * Calculates Basal Metabolic Rate using the Harris-Benedict Equation.
     */
    public calculateBMR(): number {
        let bmr: number;
        if (this.gender === 'ชาย') {
            bmr = 66.47 + 13.75 * this.weight + 5.003 * this.height - 6.755 * this.age;
        } else {
            // หญิง หรือ อื่นๆ ใช้สูตรหญิง
            bmr = 655.1 + 9.563 * this.weight + 1.85 * this.height - 4.676 * this.age;
        }
        return Math.round(bmr);
    }

    /**
     * Calculates Total Daily Energy Expenditure (moderate activity assumed).
     */
    public calculateTDEE(): number {
        const activityFactor = 1.55;
        return Math.round(this.calculateBMR() * activityFactor);
    }

    /**
     * Returns the target nutrition profile including adjusted calories and targets for Protein, Carbs, Fat.
     */
    public getTargetNutrition(): BMRResult {
        const bmr = this.calculateBMR();
        const tdee = this.calculateTDEE();

        // ปรับแคลอรี่ตามเป้าหมาย
        let targetCalories = tdee;
        if (this.goals.includes('ลดน้ำหนัก')) {
            targetCalories = Math.round(tdee * 0.8); // ลด 20%
        } else if (this.goals.includes('เพิ่มพลังงาน')) {
            targetCalories = Math.round(tdee * 1.1); // เพิ่ม 10%
        }

        // คำนวณ Macros (based on target calories)
        // Protein: 30%, Carbs: 45%, Fat: 25%
        const targetProtein = Math.round((targetCalories * 0.3) / 4); // 4 kcal/g
        const targetCarbs = Math.round((targetCalories * 0.45) / 4); // 4 kcal/g
        const targetFat = Math.round((targetCalories * 0.25) / 9); // 9 kcal/g

        return {
            bmr,
            tdee,
            targetCalories,
            targetProtein,
            targetCarbs,
            targetFat,
        };
    }

    /**
     * Scales recipes to meet the target daily calories reasonably. 
     * Applies a multiplier to the nutritional properties of the meals.
     */
    public optimizeDailyMeals(meals: { type: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง'; recipe: Recipe }[]): {
        meals: { type: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง'; recipe: Recipe }[],
        totalCalories: number,
        totalProtein: number,
        totalCarbs: number,
        totalFat: number
    } {
        const targetCalories = this.getTargetNutrition().targetCalories;
        const baseTotalCalories = meals.reduce((sum, m) => sum + (m.recipe.calories || 0), 0);

        // Scale macro and calories to meet target TDEE
        const scaleFactor = targetCalories > 0 && baseTotalCalories > 0
            ? targetCalories / baseTotalCalories
            : 1;

        // Keep a reasonable max scale factor so it does not get absurd
        const safeScaleFactor = Math.min(Math.max(scaleFactor, 1), 5);

        if (safeScaleFactor > 1) {
            meals.forEach((meal) => {
                meal.recipe.calories = Math.round((meal.recipe.calories || 0) * safeScaleFactor);
                meal.recipe.protein = Math.round((meal.recipe.protein || 0) * safeScaleFactor * 10) / 10;
                meal.recipe.carbs = Math.round((meal.recipe.carbs || 0) * safeScaleFactor * 10) / 10;
                meal.recipe.fat = Math.round((meal.recipe.fat || 0) * safeScaleFactor * 10) / 10;

                // Limit to 1 decimal place for readability
                const formattedScale = (Math.round(safeScaleFactor * 10) / 10).toString();
                // Append scaling text only if it hasn't been appended before
                if (!meal.recipe.name.includes('(x')) {
                    meal.recipe.name = `${meal.recipe.name} (x${formattedScale} เสิร์ฟ)`;
                }
            });
        }

        const totalCalories = meals.reduce((sum, m) => sum + (m.recipe.calories || 0), 0);
        const totalProtein = meals.reduce((sum, m) => sum + (m.recipe.protein || 0), 0);
        const totalCarbs = meals.reduce((sum, m) => sum + (m.recipe.carbs || 0), 0);
        const totalFat = meals.reduce((sum, m) => sum + (m.recipe.fat || 0), 0);

        return {
            meals,
            totalCalories,
            totalProtein: Math.round(totalProtein * 10) / 10,
            totalCarbs: Math.round(totalCarbs * 10) / 10,
            totalFat: Math.round(totalFat * 10) / 10,
        };
    }
}
