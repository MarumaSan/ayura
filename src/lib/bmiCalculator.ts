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
