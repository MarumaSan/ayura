/**
 * Seed script: Ingredients + Recipes for Ayura (Supabase version)
 * Run: npx tsx scripts/seed-data.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL or Anon Key is missing from .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── INGREDIENTS ──
const ingredients = [
    // ── ผัก ──
    { id: 'kale', name: 'ผักเคล', name_english: 'Kale', category: 'ผัก', image: '🥬', community: 'สหกรณ์เกษตรอินทรีย์', price_per_100g: 12, calories_100g: 49, protein_100g: 4.3, carbs_100g: 8.8, fat_100g: 0.9, in_stock: 5000 },
    { id: 'spinach', name: 'ผักโขม', name_english: 'Spinach', category: 'ผัก', image: '🥬', community: 'สหกรณ์เกษตรอินทรีย์', price_per_100g: 10, calories_100g: 23, protein_100g: 2.9, carbs_100g: 3.6, fat_100g: 0.4, in_stock: 5000 },
    { id: 'morning-glory', name: 'ผักบุ้ง', name_english: 'Morning Glory', category: 'ผัก', image: '🥬', community: 'สหกรณ์เกษตรอินทรีย์', price_per_100g: 5, calories_100g: 19, protein_100g: 2.6, carbs_100g: 3.1, fat_100g: 0.2, in_stock: 5000 },
    { id: 'chinese-cabbage', name: 'ผักกาดขาว', name_english: 'Chinese Cabbage', category: 'ผัก', image: '🥬', community: 'ชุมชนเกษตรดอยสุเทพ', price_per_100g: 4, calories_100g: 13, protein_100g: 1.5, carbs_100g: 2.2, fat_100g: 0.2, in_stock: 5000 },
    { id: 'broccoli', name: 'บร็อคโคลี่', name_english: 'Broccoli', category: 'ผัก', image: '🥦', community: 'ชุมชนเกษตรดอยสุเทพ', price_per_100g: 15, calories_100g: 34, protein_100g: 2.8, carbs_100g: 6.6, fat_100g: 0.4, in_stock: 5000 },
    { id: 'carrot', name: 'แครอท', name_english: 'Carrot', category: 'ผัก', image: '🥕', community: 'ชุมชนเกษตรดอยสุเทพ', price_per_100g: 6, calories_100g: 41, protein_100g: 0.9, carbs_100g: 9.6, fat_100g: 0.2, in_stock: 5000 },
    { id: 'tomato', name: 'มะเขือเทศ', name_english: 'Tomato', category: 'ผัก', image: '🍅', community: 'สหกรณ์เกษตรอินทรีย์', price_per_100g: 8, calories_100g: 18, protein_100g: 0.9, carbs_100g: 3.9, fat_100g: 0.2, in_stock: 5000 },
    { id: 'cucumber', name: 'แตงกวา', name_english: 'Cucumber', category: 'ผัก', image: '🥒', community: 'สหกรณ์เกษตรอินทรีย์', price_per_100g: 4, calories_100g: 15, protein_100g: 0.7, carbs_100g: 3.6, fat_100g: 0.1, in_stock: 5000 },
    { id: 'pumpkin', name: 'ฟักทอง', name_english: 'Pumpkin', category: 'ผัก', image: '🎃', community: 'ชุมชนเกษตรดอยสุเทพ', price_per_100g: 5, calories_100g: 26, protein_100g: 1.0, carbs_100g: 6.5, fat_100g: 0.1, in_stock: 5000 },
    { id: 'corn', name: 'ข้าวโพด', name_english: 'Corn', category: 'ผัก', image: '🌽', community: 'ชุมชนเกษตรดอยสุเทพ', price_per_100g: 7, calories_100g: 86, protein_100g: 3.3, carbs_100g: 19.0, fat_100g: 1.4, in_stock: 5000 },
    { id: 'mushroom', name: 'เห็ดหอม', name_english: 'Shiitake Mushroom', category: 'ผัก', image: '🍄', community: 'สหกรณ์เกษตรอินทรีย์', price_per_100g: 20, calories_100g: 34, protein_100g: 2.2, carbs_100g: 6.8, fat_100g: 0.5, in_stock: 5000 },
    { id: 'eggplant', name: 'มะเขือยาว', name_english: 'Eggplant', category: 'ผัก', image: '🍆', community: 'สหกรณ์เกษตรอินทรีย์', price_per_100g: 6, calories_100g: 25, protein_100g: 1.0, carbs_100g: 5.9, fat_100g: 0.2, in_stock: 5000 },
    { id: 'cabbage', name: 'กะหล่ำปลี', name_english: 'Cabbage', category: 'ผัก', image: '🥬', community: 'ชุมชนเกษตรดอยสุเทพ', price_per_100g: 3, calories_100g: 25, protein_100g: 1.3, carbs_100g: 5.8, fat_100g: 0.1, in_stock: 5000 },
    { id: 'bell-pepper', name: 'พริกหวาน', name_english: 'Bell Pepper', category: 'ผัก', image: '🫑', community: 'ชุมชนเกษตรดอยสุเทพ', price_per_100g: 18, calories_100g: 31, protein_100g: 1.0, carbs_100g: 6.0, fat_100g: 0.3, in_stock: 5000 },
    { id: 'string-bean', name: 'ถั่วฝักยาว', name_english: 'String Bean', category: 'ผัก', image: '🫛', community: 'สหกรณ์เกษตรอินทรีย์', price_per_100g: 6, calories_100g: 31, protein_100g: 1.8, carbs_100g: 7.1, fat_100g: 0.1, in_stock: 5000 },
    // ── สมุนไพร ──
    { id: 'ginger', name: 'ขิง', name_english: 'Ginger', category: 'สมุนไพร', image: '🫚', community: 'วิสาหกิจชุมชนสมุนไพร', price_per_100g: 8, calories_100g: 80, protein_100g: 1.8, carbs_100g: 18.0, fat_100g: 0.8, in_stock: 5000 },
    { id: 'lemongrass', name: 'ตะไคร้', name_english: 'Lemongrass', category: 'สมุนไพร', image: '🌿', community: 'วิสาหกิจชุมชนสมุนไพร', price_per_100g: 5, calories_100g: 99, protein_100g: 1.8, carbs_100g: 25.3, fat_100g: 0.5, in_stock: 5000 },
    { id: 'galangal', name: 'ข่า', name_english: 'Galangal', category: 'สมุนไพร', image: '🌿', community: 'วิสาหกิจชุมชนสมุนไพร', price_per_100g: 6, calories_100g: 71, protein_100g: 1.5, carbs_100g: 15.0, fat_100g: 1.0, in_stock: 5000 },
    { id: 'basil', name: 'ใบกะเพรา', name_english: 'Holy Basil', category: 'สมุนไพร', image: '🌿', community: 'วิสาหกิจชุมชนสมุนไพร', price_per_100g: 10, calories_100g: 23, protein_100g: 3.2, carbs_100g: 2.7, fat_100g: 0.6, in_stock: 5000 },
    { id: 'garlic', name: 'กระเทียม', name_english: 'Garlic', category: 'สมุนไพร', image: '🧄', community: 'วิสาหกิจชุมชนสมุนไพร', price_per_100g: 12, calories_100g: 149, protein_100g: 6.4, carbs_100g: 33.1, fat_100g: 0.5, in_stock: 5000 },
    { id: 'chili', name: 'พริก', name_english: 'Chili', category: 'สมุนไพร', image: '🌶️', community: 'วิสาหกิจชุมชนสมุนไพร', price_per_100g: 15, calories_100g: 40, protein_100g: 2.0, carbs_100g: 8.8, fat_100g: 0.4, in_stock: 5000 },
    { id: 'coriander', name: 'ผักชี', name_english: 'Coriander', category: 'สมุนไพร', image: '🌿', community: 'วิสาหกิจชุมชนสมุนไพร', price_per_100g: 8, calories_100g: 23, protein_100g: 2.1, carbs_100g: 3.7, fat_100g: 0.5, in_stock: 5000 },
    // ── ผลไม้ ──
    { id: 'banana', name: 'กล้วยหอม', name_english: 'Banana', category: 'ผลไม้', image: '🍌', community: 'สหกรณ์ชาวสวน', price_per_100g: 4, calories_100g: 89, protein_100g: 1.1, carbs_100g: 22.8, fat_100g: 0.3, in_stock: 5000 },
    { id: 'mango', name: 'มะม่วง', name_english: 'Mango', category: 'ผลไม้', image: '🥭', community: 'สหกรณ์ชาวสวน', price_per_100g: 10, calories_100g: 60, protein_100g: 0.8, carbs_100g: 15.0, fat_100g: 0.4, in_stock: 5000 },
    { id: 'papaya', name: 'มะละกอ', name_english: 'Papaya', category: 'ผลไม้', image: '🍈', community: 'สหกรณ์ชาวสวน', price_per_100g: 5, calories_100g: 43, protein_100g: 0.5, carbs_100g: 11.0, fat_100g: 0.3, in_stock: 5000 },
    { id: 'lime', name: 'มะนาว', name_english: 'Lime', category: 'ผลไม้', image: '🍋', community: 'สหกรณ์ชาวสวน', price_per_100g: 6, calories_100g: 30, protein_100g: 0.7, carbs_100g: 10.5, fat_100g: 0.2, in_stock: 5000 },
    { id: 'avocado', name: 'อะโวคาโด', name_english: 'Avocado', category: 'ผลไม้', image: '🥑', community: 'สหกรณ์ชาวสวน', price_per_100g: 25, calories_100g: 160, protein_100g: 2.0, carbs_100g: 8.5, fat_100g: 14.7, in_stock: 5000 },
    // ── โปรตีน ──
    { id: 'chicken-breast', name: 'อกไก่', name_english: 'Chicken Breast', category: 'โปรตีน', image: '🍗', community: 'ฟาร์มไก่อินทรีย์', price_per_100g: 18, calories_100g: 165, protein_100g: 31.0, carbs_100g: 0.0, fat_100g: 3.6, in_stock: 5000 },
    { id: 'egg', name: 'ไข่ไก่', name_english: 'Egg', category: 'โปรตีน', image: '🥚', community: 'ฟาร์มไก่อินทรีย์', price_per_100g: 12, calories_100g: 155, protein_100g: 13.0, carbs_100g: 1.1, fat_100g: 11.0, in_stock: 5000 },
    { id: 'pork-loin', name: 'เนื้อหมูสันนอก', name_english: 'Pork Loin', category: 'โปรตีน', image: '🥩', community: 'ฟาร์มหมูอินทรีย์', price_per_100g: 16, calories_100g: 143, protein_100g: 26.3, carbs_100g: 0.0, fat_100g: 3.5, in_stock: 5000 },
    { id: 'pork-belly', name: 'หมูสามชั้น', name_english: 'Pork Belly', category: 'โปรตีน', image: '🥓', community: 'ฟาร์มหมูอินทรีย์', price_per_100g: 14, calories_100g: 518, protein_100g: 9.3, carbs_100g: 0.0, fat_100g: 53.0, in_stock: 5000 },
    { id: 'minced-pork', name: 'หมูสับ', name_english: 'Minced Pork', category: 'โปรตีน', image: '🥩', community: 'ฟาร์มหมูอินทรีย์', price_per_100g: 13, calories_100g: 263, protein_100g: 16.9, carbs_100g: 0.0, fat_100g: 21.2, in_stock: 5000 },
    { id: 'shrimp', name: 'กุ้งสด', name_english: 'Shrimp', category: 'โปรตีน', image: '🦐', community: 'ประมงพื้นบ้าน', price_per_100g: 30, calories_100g: 99, protein_100g: 24.0, carbs_100g: 0.2, fat_100g: 0.3, in_stock: 5000 },
    { id: 'tofu', name: 'เต้าหู้', name_english: 'Tofu', category: 'โปรตีน', image: '🧈', community: 'โรงงานเต้าหู้ชุมชน', price_per_100g: 5, calories_100g: 76, protein_100g: 8.0, carbs_100g: 1.9, fat_100g: 4.8, in_stock: 5000 },
    { id: 'salmon', name: 'ปลาแซลมอน', name_english: 'Salmon', category: 'โปรตีน', image: '🐟', community: 'ประมงพื้นบ้าน', price_per_100g: 45, calories_100g: 208, protein_100g: 20.4, carbs_100g: 0.0, fat_100g: 13.4, in_stock: 5000 },
    { id: 'fish-tilapia', name: 'ปลานิล', name_english: 'Tilapia', category: 'โปรตีน', image: '🐟', community: 'ประมงพื้นบ้าน', price_per_100g: 10, calories_100g: 96, protein_100g: 20.1, carbs_100g: 0.0, fat_100g: 1.7, in_stock: 5000 },
    // ── ธัญพืช ──
    { id: 'brown-rice', name: 'ข้าวกล้อง', name_english: 'Brown Rice', category: 'ธัญพืช', image: '🍚', community: 'สหกรณ์ข้าวอินทรีย์', price_per_100g: 3, calories_100g: 370, protein_100g: 7.9, carbs_100g: 77.2, fat_100g: 2.9, in_stock: 5000 },
    { id: 'jasmine-rice', name: 'ข้าวหอมมะลิ', name_english: 'Jasmine Rice', category: 'ธัญพืช', image: '🍚', community: 'สหกรณ์ข้าวอินทรีย์', price_per_100g: 4, calories_100g: 365, protein_100g: 7.1, carbs_100g: 80.0, fat_100g: 0.7, in_stock: 5000 },
    { id: 'oat', name: 'ข้าวโอ๊ต', name_english: 'Oat', category: 'ธัญพืช', image: '🥣', community: 'สหกรณ์ข้าวอินทรีย์', price_per_100g: 8, calories_100g: 389, protein_100g: 16.9, carbs_100g: 66.3, fat_100g: 6.9, in_stock: 5000 },
    { id: 'quinoa', name: 'ควินัว', name_english: 'Quinoa', category: 'ธัญพืช', image: '🌾', community: 'สหกรณ์ข้าวอินทรีย์', price_per_100g: 35, calories_100g: 368, protein_100g: 14.1, carbs_100g: 64.2, fat_100g: 6.1, in_stock: 5000 },
    { id: 'glass-noodle', name: 'วุ้นเส้น', name_english: 'Glass Noodle', category: 'ธัญพืช', image: '🍜', community: 'โรงงานเต้าหู้ชุมชน', price_per_100g: 5, calories_100g: 334, protein_100g: 0.1, carbs_100g: 82.4, fat_100g: 0.1, in_stock: 5000 },
];

// ── RECIPES ──
const recipes: any[] = [
    { name: 'ข้าวโอ๊ตกล้วยหอมอะโวคาโด', image: '🥣', meal_type: 'เช้า', cook_time: 10, calories: 420, ingredients: [{ ingredientId: 'oat', gramsUsed: 80 }, { ingredientId: 'banana', gramsUsed: 100 }, { ingredientId: 'avocado', gramsUsed: 50 }], steps: ['ต้มข้าวโอ๊ตกับน้ำ 200ml จนนุ่ม', 'หั่นกล้วยหอมและอะโวคาโดเป็นชิ้น', 'ตักข้าวโอ๊ตใส่ชาม วางผลไม้ด้านบน'] },
    { name: 'ไข่ดาวผักโขมบนขนมปังโฮลวีท', image: '🍳', meal_type: 'เช้า', cook_time: 15, calories: 350, ingredients: [{ ingredientId: 'egg', gramsUsed: 100 }, { ingredientId: 'spinach', gramsUsed: 80 }, { ingredientId: 'tomato', gramsUsed: 50 }], steps: ['ทอดไข่ดาวใส่น้ำมันน้อย', 'ผัดผักโขมกับมะเขือเทศสับ', 'จัดเสิร์ฟบนจาน'] },
    { name: 'สมูทตี้ผักเคลกล้วย', image: '🥤', meal_type: 'เช้า', cook_time: 5, calories: 280, ingredients: [{ ingredientId: 'kale', gramsUsed: 60 }, { ingredientId: 'banana', gramsUsed: 120 }, { ingredientId: 'oat', gramsUsed: 30 }], steps: ['ล้างผักเคลให้สะอาด', 'ปั่นผักเคล กล้วยหอม ข้าวโอ๊ต กับน้ำ 200ml', 'เทใส่แก้ว เสิร์ฟทันที'] },
    { name: 'ข้าวกล้องไข่คน', image: '🍚', meal_type: 'เช้า', cook_time: 15, calories: 380, ingredients: [{ ingredientId: 'brown-rice', gramsUsed: 80 }, { ingredientId: 'egg', gramsUsed: 100 }], steps: ['หุงข้าวกล้อง', 'ทำไข่คนนุ่มๆ ใส่เกลือเล็กน้อย', 'ตักข้าวใส่จาน วางไข่คนด้านบน โรยผักชี'] },
    { name: 'โจ๊กข้าวกล้องไก่', image: '🥣', meal_type: 'เช้า', cook_time: 25, calories: 310, ingredients: [{ ingredientId: 'brown-rice', gramsUsed: 60 }, { ingredientId: 'chicken-breast', gramsUsed: 80 }, { ingredientId: 'ginger', gramsUsed: 10 }], steps: ['ต้มข้าวกล้องกับน้ำมากๆ จนเปื่อย', 'หั่นอกไก่เป็นชิ้นบาง ใส่ลงต้มจนสุก', 'ปรุงรสด้วยซีอิ๊ว โรยขิงซอยและผักชี'] },
    { name: 'แพนเค้กข้าวโอ๊ตกล้วย', image: '🥞', meal_type: 'เช้า', cook_time: 20, calories: 360, ingredients: [{ ingredientId: 'oat', gramsUsed: 100 }, { ingredientId: 'banana', gramsUsed: 100 }, { ingredientId: 'egg', gramsUsed: 50 }], steps: ['บดกล้วยหอมให้ละเอียด', 'ผสมกับข้าวโอ๊ตและไข่ คนจนเข้ากัน', 'ทอดในกระทะไม่ติดจนเหลืองทั้งสองด้าน'] },
    { name: 'ข้าวกล้องผัดกะเพราไก่', image: '🍛', meal_type: 'กลางวัน', cook_time: 20, calories: 520, ingredients: [{ ingredientId: 'brown-rice', gramsUsed: 100 }, { ingredientId: 'chicken-breast', gramsUsed: 120 }, { ingredientId: 'basil', gramsUsed: 15 }, { ingredientId: 'chili', gramsUsed: 5 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'string-bean', gramsUsed: 40 }], steps: ['หุงข้าวกล้อง', 'สับกระเทียมและพริก ผัดในกระทะร้อน', 'ใส่อกไก่หั่นชิ้นผัดจนสุก', 'ใส่ถั่วฝักยาว ปรุงรสซีอิ๊ว น้ำมันหอย', 'ใส่ใบกะเพรา ผัดให้เข้ากัน ตักราดข้าว'] },
    { name: 'สลัดอกไก่ย่างกับควินัว', image: '🥗', meal_type: 'กลางวัน', cook_time: 25, calories: 450, ingredients: [{ ingredientId: 'chicken-breast', gramsUsed: 120 }, { ingredientId: 'quinoa', gramsUsed: 60 }, { ingredientId: 'tomato', gramsUsed: 80 }, { ingredientId: 'cucumber', gramsUsed: 60 }, { ingredientId: 'carrot', gramsUsed: 40 }, { ingredientId: 'lime', gramsUsed: 20 }], steps: ['ต้มควินัวจนสุก พักให้เย็น', 'ย่างอกไก่จนสุก หั่นเป็นชิ้น', 'หั่นผักทั้งหมดเป็นชิ้นพอดีคำ', 'ผสมน้ำสลัดจากมะนาว เกลือ พริกไทย', 'คลุกเคล้าทุกอย่างในชาม'] },
    { name: 'ผัดผักรวมเต้าหู้', image: '🍲', meal_type: 'กลางวัน', cook_time: 15, calories: 320, ingredients: [{ ingredientId: 'tofu', gramsUsed: 150 }, { ingredientId: 'broccoli', gramsUsed: 80 }, { ingredientId: 'carrot', gramsUsed: 50 }, { ingredientId: 'mushroom', gramsUsed: 40 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'brown-rice', gramsUsed: 80 }], steps: ['หั่นเต้าหู้เป็นลูกเต๋า ทอดจนเหลือง', 'ผัดกระเทียมจนหอม ใส่ผักทั้งหมด', 'ใส่ซอสถั่วเหลือง น้ำมันหอย ปรุงรส', 'เสิร์ฟกับข้าวกล้อง'] },
    { name: 'ข้าวผัดหมูสับ', image: '🍳', meal_type: 'กลางวัน', cook_time: 15, calories: 550, ingredients: [{ ingredientId: 'jasmine-rice', gramsUsed: 120 }, { ingredientId: 'minced-pork', gramsUsed: 100 }, { ingredientId: 'egg', gramsUsed: 50 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'tomato', gramsUsed: 40 }, { ingredientId: 'cucumber', gramsUsed: 30 }], steps: ['ผัดกระเทียมจนหอม ใส่หมูสับผัดจนสุก', 'ใส่ข้าวสวยลงผัด ปรุงรสด้วยซีอิ๊ว', 'ทอดไข่ดาว จัดจานพร้อมแตงกวาและมะเขือเทศ'] },
    { name: 'ต้มยำกุ้ง', image: '🍜', meal_type: 'กลางวัน', cook_time: 25, calories: 280, ingredients: [{ ingredientId: 'shrimp', gramsUsed: 120 }, { ingredientId: 'mushroom', gramsUsed: 50 }, { ingredientId: 'lemongrass', gramsUsed: 15 }, { ingredientId: 'galangal', gramsUsed: 10 }, { ingredientId: 'lime', gramsUsed: 15 }, { ingredientId: 'chili', gramsUsed: 5 }, { ingredientId: 'tomato', gramsUsed: 40 }], steps: ['ต้มน้ำ ใส่ตะไคร้ ข่า ทุบพอแตก', 'ใส่เห็ดหอม มะเขือเทศ ต้มจนนุ่ม', 'ใส่กุ้งสด รอจนสุก', 'ปรุงรสด้วยน้ำปลา มะนาว พริก'] },
    { name: 'ข้าวมันไก่สุขภาพ', image: '🍗', meal_type: 'กลางวัน', cook_time: 30, calories: 480, ingredients: [{ ingredientId: 'jasmine-rice', gramsUsed: 100 }, { ingredientId: 'chicken-breast', gramsUsed: 150 }, { ingredientId: 'ginger', gramsUsed: 15 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'cucumber', gramsUsed: 40 }], steps: ['ต้มอกไก่กับขิงจนสุก นำไก่ขึ้นหั่นชิ้น', 'นำน้ำต้มไก่มาหุงข้าวกับกระเทียมเจียว', 'จัดจาน ข้าว ไก่ แตงกวา โรยผักชี', 'เสิร์ฟพร้อมน้ำจิ้มขิง'] },
    { name: 'หมูสันนอกย่างสลัด', image: '🥗', meal_type: 'กลางวัน', cook_time: 25, calories: 410, ingredients: [{ ingredientId: 'pork-loin', gramsUsed: 120 }, { ingredientId: 'spinach', gramsUsed: 60 }, { ingredientId: 'bell-pepper', gramsUsed: 50 }, { ingredientId: 'carrot', gramsUsed: 40 }, { ingredientId: 'lime', gramsUsed: 15 }], steps: ['หมักหมูสันนอกด้วยซีอิ๊ว กระเทียม พริกไทย', 'ย่างหมูจนสุกได้ที่ พัก 5 นาที หั่นชิ้น', 'จัดผักสลัดในจาน วางหมูด้านบน', 'ราดน้ำสลัดมะนาว'] },
    { name: 'วุ้นเส้นผัดไข่', image: '🍜', meal_type: 'กลางวัน', cook_time: 15, calories: 380, ingredients: [{ ingredientId: 'glass-noodle', gramsUsed: 80 }, { ingredientId: 'egg', gramsUsed: 100 }, { ingredientId: 'cabbage', gramsUsed: 60 }, { ingredientId: 'carrot', gramsUsed: 30 }, { ingredientId: 'garlic', gramsUsed: 10 }], steps: ['แช่วุ้นเส้นในน้ำร้อนจนนุ่ม', 'ผัดกระเทียมจนหอม ใส่ไข่คนจนสุก', 'ใส่ผักกะหล่ำ แครอท ผัดจนนุ่ม', 'ใส่วุ้นเส้น ปรุงรสด้วยซีอิ๊ว'] },
    { name: 'แซลมอนย่างกับผักนึ่ง', image: '🐟', meal_type: 'เย็น', cook_time: 25, calories: 450, ingredients: [{ ingredientId: 'salmon', gramsUsed: 150 }, { ingredientId: 'broccoli', gramsUsed: 100 }, { ingredientId: 'carrot', gramsUsed: 60 }, { ingredientId: 'lime', gramsUsed: 10 }], steps: ['หมักแซลมอนด้วยเกลือ พริกไทย มะนาว', 'ย่างแซลมอนในเตาอบ 200°C 15 นาที', 'นึ่งบร็อคโคลี่และแครอทจนนุ่ม', 'จัดจาน บีบมะนาว'] },
    { name: 'สเต็กอกไก่พริกไทยดำ', image: '🍗', meal_type: 'เย็น', cook_time: 20, calories: 380, ingredients: [{ ingredientId: 'chicken-breast', gramsUsed: 180 }, { ingredientId: 'broccoli', gramsUsed: 80 }, { ingredientId: 'pumpkin', gramsUsed: 80 }, { ingredientId: 'garlic', gramsUsed: 10 }], steps: ['หมักอกไก่ด้วยเกลือ พริกไทยดำ กระเทียม', 'ทอดอกไก่ในกระทะร้อนจนเหลืองทั้งสองด้าน', 'นึ่งบร็อคโคลี่และฟักทองเป็นเครื่องเคียง', 'จัดจาน เสิร์ฟร้อนๆ'] },
    { name: 'แกงจืดเต้าหู้ผักรวม', image: '🍲', meal_type: 'เย็น', cook_time: 20, calories: 250, ingredients: [{ ingredientId: 'tofu', gramsUsed: 120 }, { ingredientId: 'chinese-cabbage', gramsUsed: 80 }, { ingredientId: 'carrot', gramsUsed: 40 }, { ingredientId: 'mushroom', gramsUsed: 30 }], steps: ['ต้มน้ำซุป ใส่แครอทก่อน', 'ใส่ผักกาดขาว เห็ดหอม เต้าหู้หั่นชิ้น', 'ปรุงรสด้วยน้ำปลา ซีอิ๊วขาว', 'โรยผักชี เสิร์ฟร้อนๆ'] },
    { name: 'ปลานิลนึ่งมะนาว', image: '🐟', meal_type: 'เย็น', cook_time: 25, calories: 280, ingredients: [{ ingredientId: 'fish-tilapia', gramsUsed: 200 }, { ingredientId: 'lime', gramsUsed: 30 }, { ingredientId: 'garlic', gramsUsed: 15 }, { ingredientId: 'chili', gramsUsed: 5 }], steps: ['ทำความสะอาดปลานิล วางบนจานนึ่ง', 'นึ่งปลาในหม้อนึ่ง 15-20 นาที', 'ตำน้ำจิ้มซีฟู้ด: กระเทียม พริก มะนาว น้ำปลา', 'ราดน้ำจิ้มบนปลา โรยผักชี'] },
    { name: 'หมูสามชั้นผัดกะหล่ำ', image: '🥓', meal_type: 'เย็น', cook_time: 20, calories: 580, ingredients: [{ ingredientId: 'pork-belly', gramsUsed: 100 }, { ingredientId: 'cabbage', gramsUsed: 120 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'chili', gramsUsed: 3 }, { ingredientId: 'jasmine-rice', gramsUsed: 80 }], steps: ['หั่นหมูสามชั้นเป็นชิ้นบาง', 'ผัดหมูจนเหลืองกรอบ ตักน้ำมันออก', 'ใส่กระเทียม พริก ผัดจนหอม ใส่กะหล่ำปลี', 'ปรุงรสด้วยน้ำปลา ซีอิ๊ว เสิร์ฟกับข้าว'] },
    { name: 'ผัดฟักทองไข่', image: '🎃', meal_type: 'เย็น', cook_time: 15, calories: 320, ingredients: [{ ingredientId: 'pumpkin', gramsUsed: 150 }, { ingredientId: 'egg', gramsUsed: 100 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'brown-rice', gramsUsed: 80 }], steps: ['หั่นฟักทองเป็นชิ้นบาง', 'ผัดกระเทียมจนหอม ใส่ฟักทอง ผัดจนนุ่ม', 'ตอกไข่ลงไป คนให้เข้ากัน', 'ปรุงรสด้วยซีอิ๊ว เสิร์ฟกับข้าวกล้อง'] },
];

async function main() {
    console.log('🚀 Starting seed process...');

    // 1. Ingredients
    console.log('📦 Seeding Ingredients...');
    for (const ing of ingredients) {
        const { error } = await supabase
            .from('ingredients')
            .upsert({
                id: ing.id,
                name: ing.name,
                name_english: ing.name_english,
                category: ing.category,
                image: ing.image,
                community: ing.community,
                price_per_100g: ing.price_per_100g,
                calories_100g: ing.calories_100g,
                protein_100g: ing.protein_100g,
                carbs_100g: ing.carbs_100g,
                fat_100g: ing.fat_100g,
                in_stock: ing.in_stock,
            }, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error upserting ingredient ${ing.id}:`, error.message);
            process.exit(1);
        }
    }
    console.log(`✅ Upserted ${ingredients.length} ingredients`);

    // 2. Recipes
    console.log('🍳 Seeding Recipes...');
    // Clear existing recipes if needed (relational tables first)
    await supabase.from('recipe_ingredients').delete().neq('recipe_id', 'none');
    await supabase.from('recipes').delete().neq('id', 'none');

    for (const r of recipes) {
        const recipeId = `rcp-${crypto.randomUUID().split('-')[0]}`;
        const { data: newRecipe, error: rError } = await supabase
            .from('recipes')
            .insert({
                id: recipeId,
                name: r.name,
                image: r.image,
                meal_type: r.meal_type,
                cook_time: r.cook_time,
                servings: r.servings || 1,
                calories: r.calories,
                steps: r.steps
            })
            .select()
            .single();

        if (rError || !newRecipe) {
            console.error(`❌ Error inserting recipe ${r.name}:`, rError?.message);
            process.exit(1);
        }

        // Insert ingredients for this recipe
        const recipeIngs = r.ingredients.map((ri: any) => ({
            recipe_id: recipeId,
            ingredient_id: ri.ingredientId
        }));

        const { error: riError } = await supabase
            .from('recipe_ingredients')
            .insert(recipeIngs);

        if (riError) {
            console.error(`❌ Error inserting ingredients for recipe ${r.name}:`, riError.message);
            process.exit(1);
        }
    }
    console.log(`✅ Inserted ${recipes.length} recipes`);

    console.log('🎉 Seed process complete!');
}


main().catch(err => {
    console.error('❌ Global seed error:', err);
    process.exit(1);
});
