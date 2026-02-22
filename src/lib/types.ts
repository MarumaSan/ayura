// ธาตุเจ้าเรือน (Thai Elements)
export type ThaiElement = 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';

// เป้าหมายสุขภาพ
export type HealthGoal =
    | 'ลดน้ำหนัก'
    | 'เพิ่มภูมิคุ้มกัน'
    | 'ผิวพรรณสดใส'
    | 'นอนหลับดี'
    | 'เพิ่มพลังงาน'
    | 'ลดความเครียด';

// ข้อมูลผู้ใช้
export interface UserProfile {
    id: string;
    name: string;
    age: number;
    gender: 'ชาย' | 'หญิง' | 'อื่นๆ';
    weight: number; // kg
    height: number; // cm
    element: ThaiElement;
    healthGoals: HealthGoal[];
    bioAge: number;
    realAge: number;
    points: number;
    streak: number; // weeks
}

// วัตถุดิบ / สมุนไพร
export interface Ingredient {
    id: string;
    name: string;
    nameEn: string;
    category: 'ผัก' | 'สมุนไพร' | 'ผลไม้' | 'โปรตีน' | 'ธัญพืช';
    image: string;
    benefits: string;
    suitableGoals: HealthGoal[];
    community: string;
    pricePerUnit: number;
    unit: string;
    inStock: number;
    // Nutrition per unit
    calories: number; // kcal per unit
    protein: number; // grams per unit
    carbs: number; // grams per unit
    fat: number; // grams per unit
    gramsPerUnit: number; // Nutrition base amount and pricing base (e.g. 100g)
}

// ชุมชนผู้ผลิต
export interface Community {
    id: string;
    name: string;
    province: string;
    description: string;
    products: string[];
}

export interface BoxItem {
    ingredient: Ingredient;
    quantity: number; // e.g., 1 (pack/bag)
    amountInGrams?: number; // For explicit absolute calculation overrides
}

// กล่องสุขภาพรายสัปดาห์
export interface WeeklyBox {
    id: string;
    weekNumber: number;
    items: BoxItem[];
    totalPrice: number;
    matchScore: number; // 0-100
}

// ========================================
// Box Set System (Admin-defined)
// ========================================

// วัตถุดิบในเซ็ต (base ก่อนคูณ TDEE)
export interface BoxSetItem {
    ingredientId: string;
    amountInGrams: number; // Base amount included in this specific box set
}

// เซ็ตกล่องที่ Admin กำหนดเอง
export interface BoxSet {
    id: string;
    name: string;           // e.g. "เซ็ตลดน้ำหนัก"
    description: string;
    image: string;
    items: BoxSetItem[];
}

// เซ็ตที่ถูก scale ตาม TDEE แล้ว (สำหรับผู้ใช้รายคน)
export interface ScaledBoxSet {
    boxSet: BoxSet;
    multiplier: number;     // TDEE ÷ base calories
    scaledItems: {
        ingredientId: string;
        ingredientName: string;
        baseGrams: number;
        scaledGrams: number;    // base × multiplier
        basePrice: number;
        scaledPrice: number;    // base × multiplier
    }[];
    totalPrice: number;         // ราคารวมหลัง scale (ต่อสัปดาห์)
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

// Subscription tier
export type SubscriptionTier = 'weekly' | 'monthly';

// คำสั่งซื้อ
export interface Order {
    id: string;
    userId: string;
    customerName: string;
    box: WeeklyBox;
    plan: 'weekly' | 'monthly';
    status: 'รอจัดส่ง' | 'กำลังจัดเตรียม' | 'จัดส่งแล้ว' | 'สำเร็จ';
    deliveryDate: string;
    address: string;
    totalPrice: number;
}

// คำถามธาตุเจ้าเรือน
export interface ElementQuestion {
    id: number;
    question: string;
    options: {
        text: string;
        element: ThaiElement;
    }[];
}

// Reward สำหรับแลกแต้ม
export interface Reward {
    id: string;
    name: string;
    description: string;
    pointsRequired: number;
    image: string;
}

// Bio-Age History
export interface BioAgeHistory {
    week: string;
    bioAge: number;
    realAge: number;
}

// สรุปสต็อก
export interface InventoryItem {
    ingredient: Ingredient;
    status: 'พร้อมส่ง' | 'ใกล้หมด' | 'หมด';
}

// BMR Result
export interface BMRResult {
    bmr: number; // kcal/day (Basal Metabolic Rate)
    tdee: number; // kcal/day (Total Daily Energy Expenditure)
    targetCalories: number; // kcal/day adjusted for goal
    targetProtein: number; // grams/day
    targetCarbs: number; // grams/day
    targetFat: number; // grams/day
}

export interface RecipeData {
    id: string;
    name: string;
    description: string;
    image: string;
    items: { ingredientId: string; amountInGrams: number }[]; // Explicitly how many grams the user designates it
    cookTime: string; // e.g. "15 นาที"
    mealType: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง';
    instructions: string[];
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    image: string;
    items: { ingredientId: string; amountInGrams: number }[]; // User explicit amounts in grams
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    cookTime: string; // e.g. "15 นาที"
    mealType: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง';
    instructions: string[];
}

// มื้ออาหาร (Meal in a day)
export interface Meal {
    type: 'เช้า' | 'กลางวัน' | 'เย็น' | 'ว่าง';
    recipe: Recipe;
}

// แผนอาหารรายวัน
export interface DailyMealPlan {
    dayLabel: string; // e.g. "วันจันทร์", "วันที่ 1"
    meals: Meal[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

// แผนอาหารรายสัปดาห์ (7 วัน)
export interface WeeklyMealPlan {
    weekNumber: number;
    days: DailyMealPlan[];
    avgCaloriesPerDay: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

// แผนอาหารตาม subscription
export interface MealPlanSubscription {
    tier: SubscriptionTier;
    mealsPerDay: 2 | 3;
    weeks: WeeklyMealPlan[];
    startDate: string;
}
