// BMI & TDEE Calculator — used for meal set and box size recommendations

export type BmiCategory = 'underweight' | 'normal' | 'overweight';
export type BoxSize = 'M' | 'L' | 'XL';

// ────────────────────────────────────────
// BMI
// ────────────────────────────────────────
export function calcBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    if (heightM <= 0) return 0;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBmiCategory(bmi: number): BmiCategory {
    if (bmi < 18.5) return 'underweight';
    if (bmi >= 25) return 'overweight';
    return 'normal';
}

// ────────────────────────────────────────
// TDEE  (Harris-Benedict × Activity Factor)
// ────────────────────────────────────────
export function calcBMR(weightKg: number, heightCm: number, age: number, gender: string): number {
    if (gender === 'หญิง') {
        // Women: 655.1 + 9.563w + 1.850h − 4.676a
        return 655.1 + 9.563 * weightKg + 1.850 * heightCm - 4.676 * age;
    }
    // Men (default): 66.5 + 13.75w + 5.003h − 6.755a
    return 66.5 + 13.75 * weightKg + 5.003 * heightCm - 6.755 * age;
}

export function calcTDEE(weightKg: number, heightCm: number, age: number, gender: string): number {
    const activityFactor = 1.55; // ปานกลาง (moderate)
    return Math.round(calcBMR(weightKg, heightCm, age, gender) * activityFactor);
}

// ────────────────────────────────────────
// Box Size Recommendation
// ────────────────────────────────────────
export const SIZE_MULTIPLIERS: Record<BoxSize, number> = {
    M: 1.0,
    L: 1.3,
    XL: 1.6,
};

export const SIZE_LABELS: Record<BoxSize, { thai: string; desc: string }> = {
    M: { thai: 'ปกติ', desc: 'เหมาะสำหรับคนทานปริมาณปกติ' },
    L: { thai: 'ใหญ่', desc: 'เหมาะสำหรับคนทานเยอะ หรือต้องการสารอาหารมากขึ้น' },
    XL: { thai: 'พิเศษ', desc: 'เหมาะสำหรับนักกีฬา หรือคนทานเยอะมาก' },
};

export function recommendSize(tdee: number): BoxSize {
    if (tdee <= 1800) return 'M';
    if (tdee <= 2200) return 'L';
    return 'XL';
}

/** Returns recommended size + human-readable Thai reason */
export function recommendSizeWithReason(tdee: number): { size: BoxSize; reason: string; allReasons: Record<BoxSize, string> } {
    const size = recommendSize(tdee);
    const allReasons: Record<BoxSize, string> = {
        M: tdee <= 1800
            ? `✅ TDEE ${tdee} kcal — เหมาะกับคนทานน้อยหรือร่างกายเล็ก`
            : `⚠️ ปริมาณอาจน้อยกว่าที่ร่างกายต้องการ (TDEE ${tdee} kcal)`,
        L: tdee > 1800 && tdee <= 2200
            ? `✅ TDEE ${tdee} kcal — เหมาะกับคนทานปริมาณปานกลาง`
            : tdee <= 1800
                ? `⚠️ ปริมาณอาจมากเกินไปสำหรับ TDEE ${tdee} kcal`
                : `⚠️ ปริมาณอาจน้อยกว่าที่ร่างกายต้องการ (TDEE ${tdee} kcal)`,
        XL: tdee > 2200
            ? `✅ TDEE ${tdee} kcal — เหมาะสำหรับนักกีฬาหรือคนทานเยอะ`
            : `⚠️ ปริมาณอาจมากเกินไปสำหรับ TDEE ${tdee} kcal`,
    };
    return { size, reason: allReasons[size], allReasons };
}


// ────────────────────────────────────────
// Calorie & Macro Targets (based on health goals)
// ────────────────────────────────────────

/** Determine a TDEE multiplier based on the user's primary health goals. */
function goalMultiplier(healthGoals: string[]): number {
    if (healthGoals.includes('ลดน้ำหนัก')) return 0.80;          // 20% deficit
    if (healthGoals.includes('สร้างกล้ามเนื้อ')) return 1.10;   // 10% surplus
    return 1.0;                                                  // maintain
}

/** Macro split as percentage of calories → { proteinPct, carbsPct, fatPct } */
function goalMacroSplit(healthGoals: string[]): { proteinPct: number; carbsPct: number; fatPct: number } {
    if (healthGoals.includes('สร้างกล้ามเนื้อ')) return { proteinPct: 0.35, carbsPct: 0.45, fatPct: 0.20 };
    if (healthGoals.includes('ลดน้ำหนัก')) return { proteinPct: 0.30, carbsPct: 0.40, fatPct: 0.30 };
    return { proteinPct: 0.25, carbsPct: 0.50, fatPct: 0.25 };  // balanced
}

/**
 * Calculate daily calorie target = TDEE × goal multiplier.
 * @returns kcal/day (rounded)
 */
export function calcCalorieTarget(tdee: number, healthGoals: string[]): number {
    return Math.round(tdee * goalMultiplier(healthGoals));
}

/**
 * Calculate daily macro targets in grams.
 * protein = 4 kcal/g, carbs = 4 kcal/g, fat = 9 kcal/g
 */
export function calcMacroTargets(calorieTarget: number, healthGoals: string[]): { protein: number; carbs: number; fat: number } {
    const { proteinPct, carbsPct, fatPct } = goalMacroSplit(healthGoals);
    return {
        protein: Math.round((calorieTarget * proteinPct) / 4),
        carbs: Math.round((calorieTarget * carbsPct) / 4),
        fat: Math.round((calorieTarget * fatPct) / 9),
    };
}
