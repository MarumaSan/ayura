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
    suitableElements: ThaiElement[];
    suitableGoals: HealthGoal[];
    community: string;
    pricePerUnit: number;
    unit: string;
    inStock: number;
    // Nutrition per serving
    calories: number; // kcal per serving
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    servingSize: string; // e.g. "100g", "1 ชิ้น"
}

// ชุมชนผู้ผลิต
export interface Community {
    id: string;
    name: string;
    province: string;
    description: string;
    products: string[];
}

// กล่องสุขภาพรายสัปดาห์
export interface WeeklyBox {
    id: string;
    weekNumber: number;
    ingredients: Ingredient[];
    totalPrice: number;
    matchScore: number; // 0-100
}

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

// สูตรอาหาร (Recipe)
export interface Recipe {
    id: string;
    name: string;
    description: string;
    image: string;
    ingredientIds: string[]; // ingredient IDs used
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
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
    meals: Meal[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}
