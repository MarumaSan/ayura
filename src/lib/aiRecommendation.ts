import {
    Ingredient,
    WeeklyBox,
    DailyMealPlan,
    UserProfile,
    ThaiElement,
    HealthGoal,
    Recipe,
    WeeklyMealPlan,
    BoxItem,
    SubscriptionTier,
    MealPlanSubscription
} from './types';
import { ingredients as allIngredients } from './data/ingredients';
import { recipes } from './data/recipes';
import { NutritionCalculator } from './nutritionCalculator';
import { RecipeModel } from './dataModels';

/**
 * AI Recommendation Engine
 * จับคู่วัตถุดิบตามเป้าหมายสุขภาพ
 */
export function getRecommendedIngredients(
    goals: HealthGoal[],
    maxItems: number = 6
): Ingredient[] {
    // Score each ingredient    // 1. กรองวัตถุดิบและให้คะแนนตามความเหมาะสม
    const scoredIngredients = allIngredients.map((ingredient: Ingredient) => {
        let score = 0;
        ingredient.suitableGoals.forEach((g: string) => {
            if (goals.includes(g as HealthGoal)) score += 2;
        });
        return { ingredient, score };
    });

    // 2. จัดเรียงตามคะแนน
    const sorted = scoredIngredients
        .filter((s: { ingredient: Ingredient; score: number }) => s.score > 0)
        .sort((a: { ingredient: Ingredient; score: number }, b: { ingredient: Ingredient; score: number }) => b.score - a.score);

    // 3. เลือก 4-6 อย่างสำหรับ 1 สัปดาห์
    const recommended = sorted.slice(0, 5).map((s: { ingredient: Ingredient; score: number }) => s.ingredient);
    return recommended;
}

/**
 * สร้างกล่องสุขภาพรายสัปดาห์
 */
export function generateWeeklyBox(
    goals: HealthGoal[],
    weekNumber: number = 1
): WeeklyBox {
    const recommended = getRecommendedIngredients(goals);
    const totalPrice = recommended.reduce((sum, item) => sum + item.pricePerUnit, 0);

    // Calculate match score based on how well ingredients match
    const matchScore = Math.min(
        100,
        Math.round(
            (recommended.filter(
                (i: Ingredient) => i.suitableGoals.some((g) => goals.includes(g as HealthGoal))
            ).length /
                recommended.length) *
            100
        )
    );

    const boxItems: BoxItem[] = recommended.map(ing => ({ ingredient: ing, quantity: 1, amountInGrams: 500 }));

    return {
        id: `box-${weekNumber}`,
        weekNumber,
        items: boxItems,
        totalPrice,
        matchScore,
    };
}

/**
 * คำนวณธาตุเจ้าเรือนจากคำตอบ
 */
export function calculateElement(answers: ThaiElement[]): ThaiElement {
    const counts: Record<ThaiElement, number> = {
        'ดิน': 0,
        'น้ำ': 0,
        'ลม': 0,
        'ไฟ': 0,
    };

    answers.forEach((answer) => {
        counts[answer]++;
    });

    // Return the element with highest count
    let maxElement: ThaiElement = 'ดิน';
    let maxCount = 0;

    (Object.entries(counts) as [ThaiElement, number][]).forEach(([element, count]) => {
        if (count > maxCount) {
            maxCount = count;
            maxElement = element;
        }
    });

    return maxElement;
}

/**
 * คำนวณ BMI
 */
export function calculateBMI(weight: number, height: number): { bmi: number; label: string } {
    const heightM = height / 100;
    const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;

    let label = '';
    if (bmi < 18.5) label = 'น้ำหนักต่ำกว่าเกณฑ์';
    else if (bmi < 23) label = 'น้ำหนักปกติ';
    else if (bmi < 25) label = 'น้ำหนักเกิน';
    else label = 'โรคอ้วน';

    return { bmi, label };
}

/**
 * คำนวณ Bio-Age Score
 */
export function calculateBioAge(realAge: number, streak: number, goalsCount: number): number {
    // Simple formula: reduce age based on healthy habits
    const reduction = streak * 0.5 + goalsCount * 0.3;
    return Math.max(realAge - 10, Math.round((realAge - reduction) * 10) / 10);
}

/**
 * Removed calculateBMR - Use NutritionCalculator instead.
 */
/**
 * สร้างแผนอาหารรายวัน (3 มื้อ + ว่าง)
 * Algorithm: เลือกเมนูที่แคลเข้าใกล้ target ÷ meals_left มากที่สุด
 * ห้ามซ้ำกับ excludeRecipeIds (เมนูที่ใช้ไปแล้วในสัปดาห์)
 */
export function generateDailyMealPlan(
    calculator: NutritionCalculator,
    dayLabel: string = 'วันนี้',
    mealsPerDay: 2 | 3 = 3,
    excludeRecipeIds: string[] = []
): DailyMealPlan {
    const target = calculator.getTargetNutrition();
    const targetCal = target.targetCalories;

    // สร้าง RecipeModel objects ทั้งหมด
    const allRecipeModels = recipes.map((r) => new RecipeModel(r));

    const mealTypes: ('เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง')[] =
        mealsPerDay >= 3
            ? ['เช้า', 'กลางวัน', 'เย็น', 'ว่าง']
            : ['เช้า', 'กลางวัน', 'ว่าง'];

    const meals: { type: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง'; recipe: Recipe }[] = [];
    const usedIdsToday: string[] = [];
    let consumedCal = 0;

    for (let mi = 0; mi < mealTypes.length; mi++) {
        const mealType = mealTypes[mi];
        const mealsLeft = mealTypes.length - mi;
        const remainingCal = targetCal - consumedCal;
        const idealCalForThisMeal = remainingCal / mealsLeft;

        // หาเมนูที่ตรง mealType + ไม่ซ้ำในสัปดาห์ + ไม่ซ้ำวันนี้
        let candidates = allRecipeModels.filter(
            (r) => r.mealType === mealType
                && !excludeRecipeIds.includes(r.id)
                && !usedIdsToday.includes(r.id)
        );

        // fallback: ถ้าหมด → อนุญาตซ้ำข้ามวัน (แต่ไม่ซ้ำในวันเดียวกัน)
        if (candidates.length === 0) {
            candidates = allRecipeModels.filter(
                (r) => r.mealType === mealType && !usedIdsToday.includes(r.id)
            );
        }

        // fallback สุดท้าย: ใช้อะไรก็ได้ที่ตรง mealType
        if (candidates.length === 0) {
            candidates = allRecipeModels.filter((r) => r.mealType === mealType);
        }

        // เลือกเมนูที่ calories ใกล้เคียง idealCalForThisMeal ที่สุด
        const sorted = [...candidates].sort(
            (a, b) => Math.abs(a.calories - idealCalForThisMeal) - Math.abs(b.calories - idealCalForThisMeal)
        );

        const chosen = sorted[0];
        usedIdsToday.push(chosen.id);
        consumedCal += chosen.calories;

        meals.push({
            type: mealType,
            recipe: chosen as unknown as Recipe,
        });
    }

    return {
        dayLabel,
        meals,
        totalCalories: Math.round(consumedCal * 10) / 10,
        totalProtein: Math.round(meals.reduce((s, m) => s + (m.recipe.protein || 0), 0) * 10) / 10,
        totalCarbs: Math.round(meals.reduce((s, m) => s + (m.recipe.carbs || 0), 0) * 10) / 10,
        totalFat: Math.round(meals.reduce((s, m) => s + (m.recipe.fat || 0), 0) * 10) / 10,
    };
}

const DAY_LABELS = ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'];

/**
 * สร้างแผนอาหารรายสัปดาห์ (7 วัน)
 * เมนูไม่ซ้ำกันภายในสัปดาห์เดียว (accumulated exclude list)
 * 1 เดือน = 4 สัปดาห์ (exclude list reset ทุกสัปดาห์)
 */
export function generateWeeklyMealPlan(
    calculator: NutritionCalculator,
    weekNumber: number = 1,
    mealsPerDay: 2 | 3 = 3
): WeeklyMealPlan {
    const days: DailyMealPlan[] = [];
    const weekExcludeIds: string[] = []; // สะสมทั้งสัปดาห์

    for (let d = 0; d < 7; d++) {
        const dayPlan = generateDailyMealPlan(
            calculator,
            DAY_LABELS[d],
            mealsPerDay,
            [...weekExcludeIds] // ส่ง copy เข้าไป
        );
        days.push(dayPlan);

        // สะสม recipe IDs ที่ใช้ไปแล้วในสัปดาห์นี้
        dayPlan.meals.forEach((m) => {
            if (!weekExcludeIds.includes(m.recipe.id)) {
                weekExcludeIds.push(m.recipe.id);
            }
        });
    }

    const totalProtein = Math.round(days.reduce((sum, d) => sum + d.totalProtein, 0) * 10) / 10;
    const totalCarbs = Math.round(days.reduce((sum, d) => sum + d.totalCarbs, 0) * 10) / 10;
    const totalFat = Math.round(days.reduce((sum, d) => sum + d.totalFat, 0) * 10) / 10;
    const avgCaloriesPerDay = Math.round(days.reduce((sum, d) => sum + d.totalCalories, 0) / 7);

    return {
        weekNumber,
        days,
        avgCaloriesPerDay,
        totalProtein,
        totalCarbs,
        totalFat,
    };
}

/**
 * สร้างแผนอาหารตาม Subscription tier
 * weekly → 1 สัปดาห์, 3 มื้อ + ว่าง
 * monthly → 4 สัปดาห์, 3 มื้อ + ว่าง
 */
export function generateMealPlanSubscription(
    goals: HealthGoal[],
    tier: SubscriptionTier,
    weight: number,
    height: number,
    age: number,
    gender: 'ชาย' | 'หญิง' | 'อื่นๆ'
): MealPlanSubscription {
    const calculator = new NutritionCalculator(weight, height, age, gender, goals);
    const mealsPerDay: 2 | 3 = 3;
    const weekCount = tier === 'monthly' ? 4 : 1;

    const weeks: WeeklyMealPlan[] = [];
    for (let w = 0; w < weekCount; w++) {
        weeks.push(generateWeeklyMealPlan(calculator, w + 1, mealsPerDay));
    }

    return {
        tier,
        mealsPerDay,
        weeks,
        startDate: new Date().toISOString().split('T')[0],
    };
}

