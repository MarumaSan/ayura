import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Ingredient } from '@/models/Ingredient';
import { User } from '@/models/User';
import { Order } from '@/models/Order';
import { MealSet } from '@/models/MealSet';
import { Recipe } from '@/models/Recipe';

const sampleIngredients = [
    { id: 'i1', name: 'อกไก่ออร์แกนิก', nameEnglish: 'Organic Chicken Breast', category: 'โปรตีน', image: '🍗', community: 'สหกรณ์การเกษตรดอยคำ', inStock: 150, unit: 'ชิ้น', pricePerUnit: 189, gramPerUnit: 120, calories100g: 165, protein100g: 31, carbs100g: 0, fat100g: 3.6 },
    { id: 'i2', name: 'ผักเชียงดา', nameEnglish: 'Gymnema', category: 'ผัก', image: '🥬', community: 'ฟาร์มตัวอย่างหุบกะพง', inStock: 120, unit: 'กำ', pricePerUnit: 85, gramPerUnit: 80, calories100g: 25, protein100g: 3.5, carbs100g: 3.0, fat100g: 0.3 },
    { id: 'i3', name: 'ขิงสด', nameEnglish: 'Ginger', category: 'สมุนไพร', image: '🫚', community: 'ศูนย์ศิลปาชีพบางไทร', inStock: 200, unit: 'กิโลกรัม', pricePerUnit: 55, gramPerUnit: 1000, calories100g: 80, protein100g: 1.8, carbs100g: 18, fat100g: 0.8 },
    { id: 'i4', name: 'ใบเตย', nameEnglish: 'Pandan', category: 'สมุนไพร', image: '🍃', community: 'กลุ่มวิสาหกิจชุมชนแม่กลอง', inStock: 180, unit: 'กำ', pricePerUnit: 35, gramPerUnit: 50, calories100g: 35, protein100g: 1.2, carbs100g: 8, fat100g: 0.1 },
    { id: 'i5', name: 'ข้าวกล้อง', nameEnglish: 'Brown Rice', category: 'ธัญพืช', image: '🌾', community: 'ทุ่งกุลาร้องไห้', inStock: 300, unit: 'กก.', pricePerUnit: 145, gramPerUnit: 1000, calories100g: 111, protein100g: 2.6, carbs100g: 23, fat100g: 0.9 },
    { id: 'i6', name: 'ปลาทูโอเมก้า', nameEnglish: 'Omega Mackerel', category: 'โปรตีน', image: '🐟', community: 'ชุมชนประมงอ่าวไทย', inStock: 200, unit: 'ตัว', pricePerUnit: 120, gramPerUnit: 250, calories100g: 205, protein100g: 18.5, carbs100g: 0, fat100g: 13.8 },
    { id: 'i7', name: 'บรอกโคลีออร์แกนิก', nameEnglish: 'Organic Broccoli', category: 'ผัก', image: '🥦', community: 'ฟาร์มดอยอินทนนท์', inStock: 160, unit: 'หัว', pricePerUnit: 95, gramPerUnit: 400, calories100g: 34, protein100g: 2.8, carbs100g: 7, fat100g: 0.4 },
    { id: 'i8', name: 'มะนาวสด', nameEnglish: 'Fresh Lime', category: 'ผลไม้', image: '🍋', community: 'สวนสมุนไพรจันทบุรี', inStock: 500, unit: 'ลูก', pricePerUnit: 8, gramPerUnit: 60, calories100g: 30, protein100g: 0.7, carbs100g: 10.5, fat100g: 0.2 },
    { id: 'i9', name: 'ไข่ไก่บ้าน', nameEnglish: 'Free Range Eggs', category: 'โปรตีน', image: '🥚', community: 'ฟาร์มไก่ฟรีเรนจ์โคราช', inStock: 400, unit: 'ฟอง', pricePerUnit: 12, gramPerUnit: 55, calories100g: 155, protein100g: 13, carbs100g: 1.1, fat100g: 11 },
    { id: 'i10', name: 'กระเทียมสด', nameEnglish: 'Fresh Garlic', category: 'สมุนไพร', image: '🧄', community: 'ศูนย์ศิลปาชีพเชียงใหม่', inStock: 300, unit: 'หัว', pricePerUnit: 15, gramPerUnit: 50, calories100g: 149, protein100g: 6.4, carbs100g: 33, fat100g: 0.5 },
];

const sampleMealSets = [
    {
        id: 'ms-health',
        name: 'เซ็ตดูแลสุขภาพ',
        description: 'สมดุลทั้งโปรตีน คาร์บ และไขมันที่ดี เหมาะสำหรับคนที่ต้องการดูแลสุขภาพทั่วไป',
        image: '🥗',
        tag: 'แนะนำ',
        targetBmi: 'normal',
        priceWeekly: 790,
        priceMonthly: 2800,
        isActive: true,
        avgNutrition: { calories: 1850, protein: 95, carbs: 220, fat: 52 },
        boxIngredients: [
            { ingredientId: 'i1', gramsPerWeek: 480 },
            { ingredientId: 'i2', gramsPerWeek: 320 },
            { ingredientId: 'i5', gramsPerWeek: 700 },
            { ingredientId: 'i8', gramsPerWeek: 180 },
            { ingredientId: 'i10', gramsPerWeek: 100 },
        ],
        recipes: [
            {
                name: 'ข้าวกล้องอกไก่ย่างสมุนไพร',
                image: '🍗',
                mealType: 'กลางวัน',
                cookTime: 25,
                servings: 1,
                calories: 520,
                ingredients: [
                    { ingredientId: 'i1', gramsUsed: 150, note: 'หมักด้วยเครื่องเทศ 10 นาที' },
                    { ingredientId: 'i5', gramsUsed: 150, note: 'หุงสุก' },
                    { ingredientId: 'i8', gramsUsed: 30, note: 'คั้นน้ำ' },
                    { ingredientId: 'i10', gramsUsed: 10, note: 'สับหยาบ' },
                ],
                steps: [
                    'หมักอกไก่ด้วยกระเทียมสับ น้ำมะนาว เกลือ พริกไทย 10 นาที',
                    'ย่างอกไก่บนกระทะร้อนข้างละ 6–8 นาที จนสุกทั่ว',
                    'หุงข้าวกล้องด้วยข้าว 1 ส่วน น้ำ 2 ส่วน',
                    'จัดจาน: ข้าวกล้อง อกไก่ย่าง บีบมะนาวเพิ่มรสชาติ',
                ]
            },
            {
                name: 'ผัดผักเชียงดาไข่ไก่บ้าน',
                image: '🥬',
                mealType: 'เย็น',
                cookTime: 15,
                servings: 1,
                calories: 280,
                ingredients: [
                    { ingredientId: 'i2', gramsUsed: 80, note: 'เด็ดใบ ล้างสะอาด' },
                    { ingredientId: 'i9', gramsUsed: 110, note: '2 ฟอง' },
                    { ingredientId: 'i10', gramsUsed: 15, note: 'สับ' },
                ],
                steps: [
                    'ตั้งกระทะใส่น้ำมัน ผัดกระเทียมให้หอม',
                    'ใส่ผักเชียงดา ผัดให้เข้ากัน',
                    'เพิ่มไข่ไก่ คนให้เข้ากัน ปรุงรสด้วยซีอิ๊วและเกลือ',
                    'ผัดต่อจนสุก ยกลง',
                ]
            },
            {
                name: 'น้ำขิงใบเตยอุ่น',
                image: '☕',
                mealType: 'ว่าง',
                cookTime: 10,
                servings: 2,
                calories: 45,
                ingredients: [
                    { ingredientId: 'i3', gramsUsed: 30, note: 'หั่นแว่น' },
                    { ingredientId: 'i4', gramsUsed: 20, note: 'มัดรวม' },
                ],
                steps: [
                    'ต้มน้ำ 500ml กับขิงและใบเตย',
                    'เคี่ยวด้วยไฟอ่อนนาน 8–10 นาที',
                    'กรองเอาเฉพาะน้ำ ดื่มอุ่นๆ',
                ]
            },
            {
                name: 'ปลาทูนึ่งผักเชียงดาแกล้มมะนาว',
                image: '🐟',
                mealType: 'กลางวัน',
                cookTime: 18,
                servings: 1,
                calories: 340,
                ingredients: [
                    { ingredientId: 'i6', gramsUsed: 125, note: 'ครึ่งตัว' },
                    { ingredientId: 'i2', gramsUsed: 50, note: 'ลวกสุก' },
                    { ingredientId: 'i8', gramsUsed: 20, note: 'น้ำจิ้ม' },
                    { ingredientId: 'i5', gramsUsed: 100, note: 'หุงสุก' },
                ],
                steps: [
                    'นึ่งปลาทูโอเมก้า 10-12 นาทีจนสุก',
                    'ลวกผักเชียงดาในน้ำเดือด 1 นาทีแล้วน็อคน้ำเย็น',
                    'ทำน้ำจิ้มซีฟู้ดมะนาวสด กระเทียม สับละเอียด',
                    'เสิร์ฟพร้อมข้าวกล้องอุ่นๆ',
                ]
            },
        ]
    },
    {
        id: 'ms-weightloss',
        name: 'เซ็ตลดน้ำหนัก',
        description: 'โปรตีนสูง คาร์บต่ำ ไขมันดี ช่วยเผาผลาญและอิ่มนาน เหมาะสำหรับคนต้องการลดน้ำหนัก',
        image: '🔥',
        tag: 'ยอดนิยม',
        targetBmi: 'overweight',
        priceWeekly: 890,
        priceMonthly: 3200,
        isActive: true,
        avgNutrition: { calories: 1550, protein: 140, carbs: 120, fat: 45 },
        boxIngredients: [
            { ingredientId: 'i1', gramsPerWeek: 700 },
            { ingredientId: 'i7', gramsPerWeek: 800 },
            { ingredientId: 'i9', gramsPerWeek: 330 },
            { ingredientId: 'i8', gramsPerWeek: 240 },
            { ingredientId: 'i3', gramsPerWeek: 150 },
            { ingredientId: 'i10', gramsPerWeek: 100 },
        ],
        recipes: [
            {
                name: 'ไข่ออมเล็ตบรอกโคลี',
                image: '🥚',
                mealType: 'เช้า',
                cookTime: 10,
                servings: 1,
                calories: 310,
                ingredients: [
                    { ingredientId: 'i9', gramsUsed: 165, note: '3 ฟอง ตีให้เข้ากัน' },
                    { ingredientId: 'i7', gramsUsed: 100, note: 'ต้มสุก หั่นเป็นชิ้นเล็ก' },
                    { ingredientId: 'i10', gramsUsed: 10, note: 'สับ' },
                ],
                steps: [
                    'ตีไข่ 3 ฟอง เติมเกลือและพริกไทย',
                    'ผัดกระเทียมในกระทะทาน้ำมันน้อย',
                    'เทไข่ลง รอให้ด้านล่างสุก ใส่บรอกโคลีตรงกลาง',
                    'พับครึ่ง ทอดต่อ 2–3 นาที พลิกด้าน',
                ]
            },
            {
                name: 'อกไก่ย่างสลัดบรอกโคลี',
                image: '🥗',
                mealType: 'กลางวัน',
                cookTime: 20,
                servings: 1,
                calories: 380,
                ingredients: [
                    { ingredientId: 'i1', gramsUsed: 200, note: 'ย่างให้สุก' },
                    { ingredientId: 'i7', gramsUsed: 150, note: 'ลวกสุก' },
                    { ingredientId: 'i8', gramsUsed: 40, note: 'น้ำมะนาวสำหรับน้ำสลัด' },
                    { ingredientId: 'i10', gramsUsed: 10, note: 'กระเทียมเจียวราด' },
                ],
                steps: [
                    'ย่างอกไก่บนกระทะข้างละ 8 นาที',
                    'ลวกบรอกโคลีในน้ำเดือด 3 นาที',
                    'ทำน้ำสลัด: น้ำมะนาว + กระเทียม + เกลือ + พริกไทย',
                    'จัดจาน ราดน้ำสลัด',
                ]
            },
            {
                name: 'ขิงต้มมะนาวเผาผลาญ',
                image: '🫚',
                mealType: 'ว่าง',
                cookTime: 8,
                servings: 1,
                calories: 25,
                ingredients: [
                    { ingredientId: 'i3', gramsUsed: 40, note: 'หั่นแว่นบาง' },
                    { ingredientId: 'i8', gramsUsed: 30, note: 'คั้นน้ำ' },
                ],
                steps: [
                    'ต้มขิงในน้ำ 300ml นาน 5 นาที',
                    'ยกลง เพิ่มน้ำมะนาว',
                    'ดื่มอุ่นๆ หรือแช่แข็งดื่มเย็น',
                ]
            },
            {
                name: 'อกไก่ผัดพริกไทยดำบรอกโคลี',
                image: '🍗',
                mealType: 'กลางวัน',
                cookTime: 15,
                servings: 1,
                calories: 320,
                ingredients: [
                    { ingredientId: 'i1', gramsUsed: 150, note: 'หั่นชิ้นพอดีคำ' },
                    { ingredientId: 'i7', gramsUsed: 120, note: 'หั่นชิ้นเล็ก' },
                    { ingredientId: 'i10', gramsUsed: 10, note: 'บุบพอแตก' },
                ],
                steps: [
                    'ตั้งกระทะใส่น้ำมันมะกอกเล็กน้อย ผัดกระเทียมจนหอม',
                    'ใส่อกไก่ลงไปผัดจนเริ่มสุก',
                    'ใส่บรอกโคลีและพริกไทยดำ ปรุงรสด้วยซีอิ๊วขาวโซเดียมต่ำ',
                    'ผัดเร็วๆ ด้วยไฟแรงจนสุกทั่ว จัดเสิร์ฟ',
                ]
            },
        ]
    },
    {
        id: 'ms-muscle',
        name: 'เซ็ตสร้างกล้ามเนื้อ',
        description: 'โปรตีนสูงมาก คาร์บไม่กลั้ว เพื่อสร้างกล้ามเนื้อและฟื้นฟูร่างกายหลังออกกำลังกาย',
        image: '💪',
        tag: '',
        targetBmi: 'underweight',
        priceWeekly: 990,
        priceMonthly: 3600,
        isActive: true,
        avgNutrition: { calories: 2400, protein: 180, carbs: 230, fat: 65 },
        boxIngredients: [
            { ingredientId: 'i1', gramsPerWeek: 1000 },
            { ingredientId: 'i6', gramsPerWeek: 750 },
            { ingredientId: 'i9', gramsPerWeek: 550 },
            { ingredientId: 'i5', gramsPerWeek: 700 },
            { ingredientId: 'i7', gramsPerWeek: 400 },
            { ingredientId: 'i10', gramsPerWeek: 100 },
        ],
        recipes: [
            {
                name: 'ข้าวกล้องไข่กวน',
                image: '🥚',
                mealType: 'เช้า',
                cookTime: 15,
                servings: 1,
                calories: 490,
                ingredients: [
                    { ingredientId: 'i9', gramsUsed: 220, note: '4 ฟอง' },
                    { ingredientId: 'i5', gramsUsed: 150, note: 'หุงสุก' },
                    { ingredientId: 'i10', gramsUsed: 10, note: 'สับ' },
                ],
                steps: [
                    'หุงข้าวกล้อง',
                    'ตีไข่ 4 ฟองใส่เกลือ',
                    'กวนไข่ในกระทะจนสุกแต่ยังนุ่ม',
                    'เสิร์ฟบนข้าวกล้อง ราดซีอิ๊วขาวเล็กน้อย',
                ]
            },
            {
                name: 'ปลาทูนึ่งมะนาว + ข้าวกล้อง',
                image: '🐟',
                mealType: 'กลางวัน',
                cookTime: 20,
                servings: 1,
                calories: 520,
                ingredients: [
                    { ingredientId: 'i6', gramsUsed: 250, note: '1 ตัว ล้างสะอาด' },
                    { ingredientId: 'i8', gramsUsed: 60, note: '2 ลูก' },
                    { ingredientId: 'i3', gramsUsed: 20, note: 'หั่นแว่น' },
                    { ingredientId: 'i5', gramsUsed: 150, note: 'หุงสุก' },
                    { ingredientId: 'i10', gramsUsed: 15, note: 'สับ' },
                ],
                steps: [
                    'ล้างปลาทู ผ่าหลังเล็กน้อยเพื่อซึมรส',
                    'วางขิงในหม้อนึ่ง ใส่ปลาทูลงไป',
                    'นึ่งนาน 12–15 นาที',
                    'ทำน้ำจิ้ม: น้ำมะนาว กระเทียม พริก เกลือ',
                    'เสิร์ฟกับข้าวกล้อง',
                ]
            },
            {
                name: 'อกไก่ย่างบรอกโคลีก่อนนอน',
                image: '🍗',
                mealType: 'เย็น',
                cookTime: 20,
                servings: 1,
                calories: 410,
                ingredients: [
                    { ingredientId: 'i1', gramsUsed: 200, note: 'ย่างไม่ผ่านน้ำมัน' },
                    { ingredientId: 'i7', gramsUsed: 200, note: 'ลวกสุก' },
                    { ingredientId: 'i8', gramsUsed: 30, note: 'บีบราด' },
                ],
                steps: [
                    'ย่างอกไก่บนกระทะ non-stick ข้างละ 7–8 นาที',
                    'ลวกบรอกโคลีในน้ำเดือด 3 นาที',
                    'จัดจาน บีบมะนาวราด',
                ]
            },
            {
                name: 'ไข่เจียวสมุนไพรอกไก่สับ',
                image: '🍳',
                mealType: 'เช้า',
                cookTime: 12,
                servings: 1,
                calories: 450,
                ingredients: [
                    { ingredientId: 'i9', gramsUsed: 165, note: '3 ฟอง' },
                    { ingredientId: 'i1', gramsUsed: 100, note: 'สับละเอียด' },
                    { ingredientId: 'i10', gramsUsed: 5, note: 'สับ' },
                    { ingredientId: 'i3', gramsUsed: 5, note: 'ซอยละเอียด' },
                ],
                steps: [
                    'ตีไข่ไก่บ้าน 3 ฟอง ผสมกับอกไก่สับและสมุนไพรซอย',
                    'ปรุงรสด้วยเกลือและพริกไทย',
                    'ตั้งกระทะไฟกลาง ค่อยๆ เทไข่ลงไป',
                    'ทอดจนสุกเหลืองทั้งสองด้าน เสิร์ฟร้อนๆ',
                ]
            }
        ]
    }
];

const sampleUsers = [
    { id: 'user-001', name: 'Admin (สมหญิง)', email: 'somying@example.com', password: 'password123', age: 32, realAge: 32, bioAge: 28, gender: 'หญิง', weight: 55, height: 162, healthGoals: ['ลดไขมัน', 'เพิ่มภูมิคุ้มกัน'], points: 600, streak: 5, isProfileComplete: true, role: 'admin' },
    { id: 'user-002', name: 'คุณสมชาย ใจแกร่ง', email: 'somchai@example.com', password: 'password123', age: 45, realAge: 45, bioAge: 42, gender: 'ชาย', weight: 75, height: 175, healthGoals: ['สร้างกล้ามเนื้อ', 'ลดภาวะอักเสบ'], points: 120, streak: 5, isProfileComplete: true, role: 'user' },
];

const sampleOrders = [
    {
        id: 'ORD-001', customerName: 'Admin (สมหญิง)',
        userId: 'user-001', mealSetId: 'ms-weightloss',
        status: 'รอจัดส่ง', totalPrice: 890, plan: 'weekly',
        address: '123/45 ถ.สุขุมวิท', deliveryDate: '26/02/2026',
        boxSize: 'M', sizeMultiplier: 1.0,
        createdAt: new Date('2026-02-26T00:00:00Z'),
        box: { items: [{ ingredientId: 'i1', name: 'อกไก่ออร์แกนิก', image: '🍗' }, { ingredientId: 'i7', name: 'บรอกโคลีออร์แกนิก', image: '🥦' }] }
    },
    {
        id: 'ORD-002', customerName: 'Admin (สมหญิง)',
        userId: 'user-001', mealSetId: 'ms-health',
        status: 'สำเร็จ', totalPrice: 2800, plan: 'monthly',
        address: '123/45 ถ.สุขุมวิท', deliveryDate: '15/01/2026',
        boxSize: 'L', sizeMultiplier: 1.3,
        createdAt: new Date('2026-01-15T00:00:00Z'),
        box: { items: [{ ingredientId: 'i5', name: 'ข้าวกล้อง', image: '🌾' }, { ingredientId: 'i8', name: 'มะนาวสด', image: '🍋' }] }
    },
];

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Clear Old Data
        await Ingredient.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});
        await MealSet.deleteMany({});
        await Recipe.deleteMany({});

        // 2. Seed Ingredients
        const insertedIngredients = await Ingredient.insertMany(sampleIngredients);

        // 3. Seed Recipes & Prepare MealSets
        // We iterate through sampleMealSets, save their recipes, 
        // and replace the embedded recipes with their new ObjectIds.
        const mealSetsToSave = [];
        let totalRecipes = 0;

        for (const set of sampleMealSets) {
            const recipeIds = [];
            for (const recipeData of set.recipes) {
                const newRecipe = new Recipe(recipeData);
                const savedRecipe = await newRecipe.save();
                recipeIds.push(savedRecipe._id);
                totalRecipes++;
            }

            mealSetsToSave.push({
                ...set,
                recipes: recipeIds
            });
        }

        // 4. Seed MealSets with references
        const insertedMealSets = await MealSet.insertMany(mealSetsToSave);

        // 5. Seed Users & Orders
        const insertedUsers = await User.insertMany(sampleUsers);
        const insertedOrders = await Order.insertMany(sampleOrders);

        return NextResponse.json({
            message: 'Database Seeded Successfully! 🌱',
            data: {
                ingredients: insertedIngredients.length,
                recipes: totalRecipes,
                mealSets: insertedMealSets.length,
                users: insertedUsers.length,
                orders: insertedOrders.length,
            }
        });

    } catch (error: any) {
        console.error('Seed Error:', error);
        return NextResponse.json(
            { error: 'Failed to seed database', details: error.message },
            { status: 500 }
        );
    }
}
