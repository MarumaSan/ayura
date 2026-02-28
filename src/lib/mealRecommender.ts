// ──────────────────────────────────────────────────────────
// Meal-Set Recommendation Engine
// Scores each MealSet against a user's BMI, TDEE, macro
// targets, and health-goals from their bio.
// ──────────────────────────────────────────────────────────

import {
    calcBMI, getBmiCategory, calcBMR, calcTDEE,
    calcCalorieTarget, calcMacroTargets,
    type BmiCategory,
} from './bmiCalculator';

// ── Types ────────────────────────────────────────────────

export interface UserProfile {
    weight: number;   // kg
    height: number;   // cm
    age: number;
    gender: string;   // 'ชาย' | 'หญิง' | 'อื่นๆ'
    healthGoals: string[];
}

export interface AvgNutrition {
    calories: number; // kcal/day
    protein: number;  // g/day
    carbs: number;    // g/day
    fat: number;      // g/day
}

export interface MealSetInput {
    id: string;
    name: string;
    avgNutrition: AvgNutrition;
    [key: string]: unknown; // pass-through for other fields
}

export interface ScoreBreakdown {
    bmiMatch: number;        // 0-30
    calorieFit: number;      // 0-30
    macroBalance: number;    // 0-20
    goalAlignment: number;   // 0-20
}

export interface ScoredMealSet extends MealSetInput {
    score: number;           // 0-100
    breakdown: ScoreBreakdown;
    reasons: string[];       // human-readable Thai reasons
}

// ── Helpers ──────────────────────────────────────────────

/** Percentage deviation: 0 = perfect, 1 = 100% off */
function pctDev(actual: number, target: number): number {
    if (target <= 0) return 1;
    return Math.abs(actual - target) / target;
}

/** Clamp a value between min and max */
function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

// ── Scoring ──────────────────────────────────────────────

/**
 * BMI-based scoring: uses the set's calorie level vs the user's TDEE
 * to determine if the set is appropriate for the user's body type.
 * Low-cal sets suit overweight, high-cal suits underweight, etc.
 */
function scoreBmiMatch(setCal: number, targetCal: number, userBmiCat: BmiCategory): { score: number; reason: string } {
    const dev = pctDev(setCal, targetCal);
    // If calories are within 20% of target for their BMI category, great match
    if (dev <= 0.10) return { score: 30, reason: '✅ เซ็ตนี้เหมาะกับค่า BMI และความต้องการพลังงานของคุณ' };
    if (dev <= 0.20) return { score: 20, reason: '✅ เซ็ตนี้ใกล้เคียงกับความต้องการพลังงานตาม BMI ของคุณ' };
    if (dev <= 0.35) return { score: 10, reason: '⚠️ พลังงานของเซ็ตนี้ห่างจากเป้าหมายตาม BMI เล็กน้อย' };
    return { score: 0, reason: '❌ พลังงานของเซ็ตนี้ไม่ตรงกับค่า BMI ของคุณ' };
}

function scoreCalorieFit(setCal: number, targetCal: number): { score: number; reason: string } {
    const dev = pctDev(setCal, targetCal);
    let score: number;
    if (dev <= 0.05) score = 30;
    else if (dev <= 0.15) score = 20;
    else if (dev <= 0.30) score = 10;
    else score = 0;

    if (score >= 20) return { score, reason: `✅ แคลอรี่ ${setCal} kcal ใกล้เคียงเป้าหมาย ${targetCal} kcal` };
    if (score >= 10) return { score, reason: `⚠️ แคลอรี่ ${setCal} kcal ห่างจากเป้าหมาย ${targetCal} kcal ${Math.round(dev * 100)}%` };
    return { score, reason: `❌ แคลอรี่ ${setCal} kcal ไม่สอดคล้องกับเป้าหมาย ${targetCal} kcal` };
}

function scoreMacroBalance(
    setNut: AvgNutrition,
    targetProtein: number,
    targetCarbs: number,
    targetFat: number,
): { score: number; reason: string } {
    const devP = pctDev(setNut.protein, targetProtein);
    const devC = pctDev(setNut.carbs, targetCarbs);
    const devF = pctDev(setNut.fat, targetFat);
    const avgDev = (devP + devC + devF) / 3;

    let score: number;
    if (avgDev <= 0.10) score = 20;
    else if (avgDev <= 0.25) score = 15;
    else if (avgDev <= 0.40) score = 8;
    else score = 0;

    const parts: string[] = [];
    if (devP <= 0.15) parts.push('💪 โปรตีนตรงเป้า');
    if (devC <= 0.15) parts.push('🌾 คาร์บตรงเป้า');
    if (devF <= 0.15) parts.push('🥑 ไขมันตรงเป้า');

    const reason = parts.length > 0
        ? parts.join(' · ')
        : `⚠️ สัดส่วนสารอาหารห่างจากเป้าหมายเล็กน้อย`;

    return { score, reason };
}

function scoreGoalAlignment(healthGoals: string[], setNut: AvgNutrition, targetCal: number): { score: number; reason: string } {
    if (!healthGoals.length) return { score: 10, reason: 'ℹ️ ไม่ได้ระบุเป้าหมายสุขภาพ' };

    let points = 0;
    const reasons: string[] = [];

    for (const goal of healthGoals) {
        switch (goal) {
            case 'ลดน้ำหนัก':
                if (setNut.calories <= targetCal * 1.05) {
                    points += 7;
                    reasons.push('⬇️ แคลอรี่ต่ำช่วยลดน้ำหนัก');
                }
                break;
            case 'สร้างกล้ามเนื้อ':
                if (setNut.protein >= 80) {
                    points += 7;
                    reasons.push('💪 โปรตีนสูงช่วยสร้างกล้ามเนื้อ');
                }
                break;
            case 'รักษาสุขภาพ':
                points += 5;
                reasons.push('✨ เซ็ตสมดุลเหมาะกับการรักษาสุขภาพ');
                break;
            case 'เพิ่มภูมิคุ้มกัน':
                points += 5;
                reasons.push('🛡️ สารอาหารครบช่วยเสริมภูมิคุ้มกัน');
                break;
            case 'ลดความเครียด':
                points += 5;
                reasons.push('🧘 เซ็ตช่วยเติมพลังและลดความเครียด');
                break;
        }
    }

    const score = clamp(Math.round(points * (20 / (healthGoals.length * 7))), 0, 20);
    return { score, reason: reasons.join(' · ') || 'ℹ️ ยังไม่สามารถจับคู่เป้าหมายได้' };
}

// ── Public API ───────────────────────────────────────────

/**
 * Score and rank meal sets for a specific user.
 * Returns sorted array (highest score first) with breakdown + human-readable reasons.
 */
export function scoreMealSets(user: UserProfile, mealSets: MealSetInput[]): ScoredMealSet[] {
    const bmi = calcBMI(user.weight, user.height);
    const userBmiCat = getBmiCategory(bmi);
    const tdee = calcTDEE(user.weight, user.height, user.age, user.gender);
    const targetCal = calcCalorieTarget(tdee, user.healthGoals);
    const { protein: tP, carbs: tC, fat: tF } = calcMacroTargets(targetCal, user.healthGoals);

    return mealSets
        .map((set) => {
            const bmiResult = scoreBmiMatch(set.avgNutrition.calories, targetCal, userBmiCat);
            const calResult = scoreCalorieFit(set.avgNutrition.calories, targetCal);
            const macroResult = scoreMacroBalance(set.avgNutrition, tP, tC, tF);
            const goalResult = scoreGoalAlignment(user.healthGoals, set.avgNutrition, targetCal);

            const breakdown: ScoreBreakdown = {
                bmiMatch: bmiResult.score,
                calorieFit: calResult.score,
                macroBalance: macroResult.score,
                goalAlignment: goalResult.score,
            };

            const score = breakdown.bmiMatch + breakdown.calorieFit + breakdown.macroBalance + breakdown.goalAlignment;

            const reasons = [bmiResult.reason, calResult.reason, macroResult.reason, goalResult.reason]
                .filter(Boolean);

            return { ...set, score, breakdown, reasons } as ScoredMealSet;
        })
        .sort((a, b) => b.score - a.score);
}

/**
 * Compute all user-derived nutrition targets (used by both API and dashboard).
 */
export function computeUserTargets(user: UserProfile) {
    const bmi = calcBMI(user.weight, user.height);
    const bmiCategory = getBmiCategory(bmi);
    const bmr = Math.round(calcBMR(user.weight, user.height, user.age, user.gender));
    const tdee = calcTDEE(user.weight, user.height, user.age, user.gender);
    const targetCalories = calcCalorieTarget(tdee, user.healthGoals);
    const { protein: targetProtein, carbs: targetCarbs, fat: targetFat } = calcMacroTargets(targetCalories, user.healthGoals);

    return { bmi, bmiCategory, bmr, tdee, targetCalories, targetProtein, targetCarbs, targetFat };
}
