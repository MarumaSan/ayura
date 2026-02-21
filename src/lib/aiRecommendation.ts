import { Ingredient, ThaiElement, HealthGoal, WeeklyBox, BMRResult, Recipe, DailyMealPlan } from './types';
import { ingredients, recipes } from './mockData';

/**
 * AI Recommendation Engine (Rule-based matching)
 * จับคู่วัตถุดิบตามธาตุเจ้าเรือนและเป้าหมายสุขภาพ
 */
export function getRecommendedIngredients(
    element: ThaiElement,
    goals: HealthGoal[],
    maxItems: number = 6
): Ingredient[] {
    // Score each ingredient based on element and goal matching
    const scored = ingredients.map((ingredient) => {
        let score = 0;

        // Element matching: +3 points
        if (ingredient.suitableElements.includes(element)) {
            score += 3;
        }

        // Goal matching: +2 points per matching goal
        goals.forEach((goal) => {
            if (ingredient.suitableGoals.includes(goal)) {
                score += 2;
            }
        });

        // In-stock bonus: +1 if > 50 units
        if (ingredient.inStock > 50) {
            score += 1;
        }

        return { ingredient, score };
    });

    // Sort by score descending and take top items
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxItems).map((s) => s.ingredient);
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

    return {
        id: `box-${weekNumber}`,
        weekNumber,
        ingredients: recommended,
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
 * คำนวณ BMR (Harris-Benedict Equation)
 * และ TDEE (Total Daily Energy Expenditure)
 */
export function calculateBMR(
    weight: number,
    height: number,
    age: number,
    gender: 'ชาย' | 'หญิง' | 'อื่นๆ',
    goals: HealthGoal[]
): BMRResult {
    // Harris-Benedict BMR Formula
    let bmr: number;
    if (gender === 'ชาย') {
        bmr = 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
    } else {
        // หญิง หรือ อื่นๆ ใช้สูตรหญิง
        bmr = 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age);
    }
    bmr = Math.round(bmr);

    // TDEE = BMR × Activity Factor (ใช้ระดับปานกลาง 1.55 เป็น default)
    const activityFactor = 1.55;
    const tdee = Math.round(bmr * activityFactor);

    // ปรับแคลอรี่ตามเป้าหมาย
    let targetCalories = tdee;
    if (goals.includes('ลดน้ำหนัก')) {
        targetCalories = Math.round(tdee * 0.8); // ลด 20%
    } else if (goals.includes('เพิ่มพลังงาน')) {
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
 * สร้างแผนอาหารรายวัน (2-3 มื้อ + ว่าง)
 * จับคู่สูตรอาหารจากวัตถุดิบที่แนะนำ
 */
export function generateDailyMealPlan(
    recommendedIngredients: Ingredient[],
    bmrResult: BMRResult
): DailyMealPlan {
    const ingredientIds = recommendedIngredients.map((i) => i.id);

    // หาสูตรอาหารที่ใช้วัตถุดิบจากกล่อง
    const matchingRecipes = recipes.map((recipe) => {
        const matchCount = recipe.ingredientIds.filter((id) => ingredientIds.includes(id)).length;
        const matchRatio = matchCount / recipe.ingredientIds.length;
        return { recipe, matchCount, matchRatio };
    }).filter((r) => r.matchCount > 0)
        .sort((a, b) => b.matchRatio - a.matchRatio || b.matchCount - a.matchCount);

    // เลือก 1 มื้อเช้า, 1 มื้อกลางวัน, 1 มื้อเย็น, 1 ว่าง
    const findBestMeal = (type: string) => {
        const meal = matchingRecipes.find((r) => r.recipe.mealType === type);
        return meal?.recipe || recipes.find((r) => r.mealType === type)!;
    };

    const breakfast = findBestMeal('เช้า');
    const lunch = findBestMeal('กลางวัน');
    const dinner = findBestMeal('เย็น');
    const snack = findBestMeal('ว่าง');

    // สร้างแผนมื้ออาหาร (2-3 มื้อหลัก + 1 ว่าง)
    const meals = [
        { type: 'เช้า' as const, recipe: breakfast },
        { type: 'กลางวัน' as const, recipe: lunch },
        { type: 'เย็น' as const, recipe: dinner },
        { type: 'ว่าง' as const, recipe: snack },
    ];

    const totalCalories = meals.reduce((sum, m) => sum + m.recipe.calories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.recipe.protein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.recipe.carbs, 0);
    const totalFat = meals.reduce((sum, m) => sum + m.recipe.fat, 0);

    return {
        meals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
    };
}

