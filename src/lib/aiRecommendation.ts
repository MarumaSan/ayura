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
import { ingredients as allIngredients, recipes } from './mockData';
import { NutritionCalculator } from './nutritionCalculator';
import { RecipeModel } from './dataModels';

/**
 * AI Recommendation Engine (Rule-based matching)
 * จับคู่วัตถุดิบตามธาตุเจ้าเรือนและเป้าหมายสุขภาพ
 */
export function getRecommendedIngredients(
    element: ThaiElement,
    goals: HealthGoal[],
    maxItems: number = 6
): Ingredient[] {
    // Score each ingredient    // 1. กรองวัตถุดิบและให้คะแนนตามความเหมาะสม
    const scoredIngredients = allIngredients.map((ingredient: Ingredient) => {
        let score = 0;
        if (ingredient.suitableElements.includes(element)) score += 3;
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
    element: ThaiElement,
    goals: HealthGoal[],
    weekNumber: number = 1
): WeeklyBox {
    const recommended = getRecommendedIngredients(element, goals);
    const totalPrice = recommended.reduce((sum, item) => sum + item.pricePerUnit, 0);

    // Calculate match score based on how well ingredients match
    const matchScore = Math.min(
        100,
        Math.round(
            (recommended.filter(
                (i) =>
                    i.suitableElements.includes(element) &&
                    i.suitableGoals.some((g) => goals.includes(g))
            ).length /
                recommended.length) *
            100
        )
    );

    const boxItems: BoxItem[] = recommended.map(ing => ({ ingredient: ing, quantity: 1 }));

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
 * สร้างแผนอาหารรายวัน (2-3 มื้อ + ว่าง)
 * จับคู่สูตรอาหารจากวัตถุดิบที่แนะนำ
 * @param recommendedIngredients - วัตถุดิบที่แนะนำ
 * @param calculator - Instance ของ NutritionCalculator
 * @param dayLabel - ชื่อวัน เช่น "วันจันทร์"
 * @param mealsPerDay - จำนวนมื้อหลัก (2 หรือ 3)
 * @param excludeRecipeIds - recipe IDs ที่ไม่ต้องการให้ซ้ำ
 */
export function generateDailyMealPlan(
    recommendedIngredients: Ingredient[],
    calculator: NutritionCalculator,
    dayLabel: string = 'วันนี้',
    mealsPerDay: 2 | 3 = 3,
    excludeRecipeIds: string[] = []
): DailyMealPlan {
    const ingredientIds = recommendedIngredients.map((i) => i.id);

    // หาสูตรอาหารที่ใช้วัตถุดิบจากกล่อง
    const matchingRecipes = recipes.map((recipeData) => {
        const recipe = new RecipeModel(recipeData); // Upgrade to OOP Model
        const matchCount = recipe.items.filter((item) => ingredientIds.includes(item.ingredientId)).length;
        const matchRatio = recipe.items.length > 0 ? matchCount / recipe.items.length : 0;
        return { recipe: recipe as unknown as Recipe, matchCount, matchRatio };
    }).filter((r) => r.matchCount > 0)
        .sort((a, b) => b.matchRatio - a.matchRatio || b.matchCount - a.matchCount);

    // เลือก meal โดยพยายามหลีกเลี่ยง recipe ที่ซ้ำจากวันก่อน
    const usedIds: string[] = [];
    const findBestMeal = (type: string) => {
        // ลองหา recipe ที่ไม่ซ้ำกับ excludeRecipeIds ก่อน
        const nonExcluded = matchingRecipes.find(
            (r) => r.recipe.mealType === type && !excludeRecipeIds.includes(r.recipe.id) && !usedIds.includes(r.recipe.id)
        );
        if (nonExcluded) {
            usedIds.push(nonExcluded.recipe.id);
            return nonExcluded.recipe;
        }
        // fallback: หา recipe ที่ยังไม่ใช้ในวันนี้
        const notUsedToday = matchingRecipes.find(
            (r) => r.recipe.mealType === type && !usedIds.includes(r.recipe.id)
        );
        if (notUsedToday) {
            usedIds.push(notUsedToday.recipe.id);
            return notUsedToday.recipe;
        }
        // fallback สุดท้าย
        const fallbackData = recipes.find((r) => r.mealType === type)!;
        const fallback = new RecipeModel(fallbackData) as unknown as Recipe;
        usedIds.push(fallback.id);
        return fallback;
    };

    const meals: { type: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง'; recipe: Recipe }[] = [];

    if (mealsPerDay >= 2) {
        meals.push({ type: 'เช้า', recipe: { ...findBestMeal('เช้า') } });
        meals.push({ type: 'กลางวัน', recipe: { ...findBestMeal('กลางวัน') } });
    }
    if (mealsPerDay >= 3) {
        meals.push({ type: 'เย็น', recipe: { ...findBestMeal('เย็น') } });
    }
    // ว่างเสมอ
    meals.push({ type: 'ว่าง', recipe: { ...findBestMeal('ว่าง') } });

    // Delegate scaling to NutritionCalculator (OOP)
    const optimized = calculator.optimizeDailyMeals(meals);

    return {
        dayLabel,
        meals: optimized.meals,
        totalCalories: optimized.totalCalories,
        totalProtein: optimized.totalProtein,
        totalCarbs: optimized.totalCarbs,
        totalFat: optimized.totalFat,
    };
}

const DAY_LABELS = ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'];

/**
 * สร้างแผนอาหารรายสัปดาห์ (7 วัน)
 * ใช้ rotation เพื่อไม่ให้เมนูซ้ำวันติดกัน
 */
export function generateWeeklyMealPlan(
    recommendedIngredients: Ingredient[],
    calculator: NutritionCalculator,
    weekNumber: number = 1,
    mealsPerDay: 2 | 3 = 3
): WeeklyMealPlan {
    const days: DailyMealPlan[] = [];
    let prevDayRecipeIds: string[] = [];

    for (let d = 0; d < 7; d++) {
        const dayPlan = generateDailyMealPlan(
            recommendedIngredients,
            calculator,
            DAY_LABELS[d],
            mealsPerDay,
            prevDayRecipeIds
        );
        days.push(dayPlan);
        // เก็บ recipe IDs ของวันนี้เพื่อใช้ exclude ในวันถัดไป
        prevDayRecipeIds = dayPlan.meals.map((m) => m.recipe.id);
    }

    const totalProtein = days.reduce((sum, d) => sum + d.totalProtein, 0);
    const totalCarbs = days.reduce((sum, d) => sum + d.totalCarbs, 0);
    const totalFat = days.reduce((sum, d) => sum + d.totalFat, 0);
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
    element: ThaiElement,
    goals: HealthGoal[],
    tier: SubscriptionTier,
    weight: number,
    height: number,
    age: number,
    gender: 'ชาย' | 'หญิง' | 'อื่นๆ'
): MealPlanSubscription {
    const recommended = getRecommendedIngredients(element, goals);
    const calculator = new NutritionCalculator(weight, height, age, gender, goals);
    const mealsPerDay: 2 | 3 = 3;
    const weekCount = tier === 'monthly' ? 4 : 1;

    const weeks: WeeklyMealPlan[] = [];
    for (let w = 0; w < weekCount; w++) {
        weeks.push(generateWeeklyMealPlan(recommended, calculator, w + 1, mealsPerDay));
    }

    return {
        tier,
        mealsPerDay,
        weeks,
        startDate: new Date().toISOString().split('T')[0],
    };
}


