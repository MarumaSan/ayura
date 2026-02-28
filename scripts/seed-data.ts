/**
 * Seed script: Ingredients + Recipes for Ayura
 * Run: npx tsx scripts/seed-data.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayura';

// ── Ingredient Schema (inline to avoid Next.js import issues) ──
const IngredientSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: String, nameEnglish: String,
    category: { type: String, enum: ['ผัก', 'สมุนไพร', 'ผลไม้', 'โปรตีน', 'ธัญพืช'] },
    image: String, community: String,
    pricePer100g: Number, inStock: { type: Number, default: 5000 }, note: String,
    calories100g: Number, protein100g: Number, carbs100g: Number, fat100g: Number,
}, { timestamps: true });

const RecipeIngSchema = new mongoose.Schema({
    ingredientId: String, gramsUsed: Number, note: { type: String, default: '' },
});
const RecipeSchema = new mongoose.Schema({
    name: String, image: { type: String, default: '🍽️' },
    mealType: { type: String, enum: ['เช้า', 'กลางวัน', 'เย็น', 'ว่าง'] },
    cookTime: Number, servings: { type: Number, default: 1 }, calories: Number,
    ingredients: [RecipeIngSchema], steps: [String],
}, { timestamps: true });

const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema);
const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);

// ── INGREDIENTS ──
const ingredients = [
    // ── ผัก ──
    { id: 'kale', name: 'ผักเคล', nameEnglish: 'Kale', category: 'ผัก', image: '🥬', community: 'สหกรณ์เกษตรอินทรีย์', pricePer100g: 12, calories100g: 49, protein100g: 4.3, carbs100g: 8.8, fat100g: 0.9 },
    { id: 'spinach', name: 'ผักโขม', nameEnglish: 'Spinach', category: 'ผัก', image: '🥬', community: 'สหกรณ์เกษตรอินทรีย์', pricePer100g: 10, calories100g: 23, protein100g: 2.9, carbs100g: 3.6, fat100g: 0.4 },
    { id: 'morning-glory', name: 'ผักบุ้ง', nameEnglish: 'Morning Glory', category: 'ผัก', image: '🥬', community: 'สหกรณ์เกษตรอินทรีย์', pricePer100g: 5, calories100g: 19, protein100g: 2.6, carbs100g: 3.1, fat100g: 0.2 },
    { id: 'chinese-cabbage', name: 'ผักกาดขาว', nameEnglish: 'Chinese Cabbage', category: 'ผัก', image: '🥬', community: 'ชุมชนเกษตรดอยสุเทพ', pricePer100g: 4, calories100g: 13, protein100g: 1.5, carbs100g: 2.2, fat100g: 0.2 },
    { id: 'broccoli', name: 'บร็อคโคลี่', nameEnglish: 'Broccoli', category: 'ผัก', image: '🥦', community: 'ชุมชนเกษตรดอยสุเทพ', pricePer100g: 15, calories100g: 34, protein100g: 2.8, carbs100g: 6.6, fat100g: 0.4 },
    { id: 'carrot', name: 'แครอท', nameEnglish: 'Carrot', category: 'ผัก', image: '🥕', community: 'ชุมชนเกษตรดอยสุเทพ', pricePer100g: 6, calories100g: 41, protein100g: 0.9, carbs100g: 9.6, fat100g: 0.2 },
    { id: 'tomato', name: 'มะเขือเทศ', nameEnglish: 'Tomato', category: 'ผัก', image: '🍅', community: 'สหกรณ์เกษตรอินทรีย์', pricePer100g: 8, calories100g: 18, protein100g: 0.9, carbs100g: 3.9, fat100g: 0.2 },
    { id: 'cucumber', name: 'แตงกวา', nameEnglish: 'Cucumber', category: 'ผัก', image: '🥒', community: 'สหกรณ์เกษตรอินทรีย์', pricePer100g: 4, calories100g: 15, protein100g: 0.7, carbs100g: 3.6, fat100g: 0.1 },
    { id: 'pumpkin', name: 'ฟักทอง', nameEnglish: 'Pumpkin', category: 'ผัก', image: '🎃', community: 'ชุมชนเกษตรดอยสุเทพ', pricePer100g: 5, calories100g: 26, protein100g: 1.0, carbs100g: 6.5, fat100g: 0.1 },
    { id: 'corn', name: 'ข้าวโพด', nameEnglish: 'Corn', category: 'ผัก', image: '🌽', community: 'ชุมชนเกษตรดอยสุเทพ', pricePer100g: 7, calories100g: 86, protein100g: 3.3, carbs100g: 19.0, fat100g: 1.4 },
    { id: 'mushroom', name: 'เห็ดหอม', nameEnglish: 'Shiitake Mushroom', category: 'ผัก', image: '🍄', community: 'สหกรณ์เกษตรอินทรีย์', pricePer100g: 20, calories100g: 34, protein100g: 2.2, carbs100g: 6.8, fat100g: 0.5 },
    { id: 'eggplant', name: 'มะเขือยาว', nameEnglish: 'Eggplant', category: 'ผัก', image: '🍆', community: 'สหกรณ์เกษตรอินทรีย์', pricePer100g: 6, calories100g: 25, protein100g: 1.0, carbs100g: 5.9, fat100g: 0.2 },
    { id: 'cabbage', name: 'กะหล่ำปลี', nameEnglish: 'Cabbage', category: 'ผัก', image: '🥬', community: 'ชุมชนเกษตรดอยสุเทพ', pricePer100g: 3, calories100g: 25, protein100g: 1.3, carbs100g: 5.8, fat100g: 0.1 },
    { id: 'bell-pepper', name: 'พริกหวาน', nameEnglish: 'Bell Pepper', category: 'ผัก', image: '🫑', community: 'ชุมชนเกษตรดอยสุเทพ', pricePer100g: 18, calories100g: 31, protein100g: 1.0, carbs100g: 6.0, fat100g: 0.3 },
    { id: 'string-bean', name: 'ถั่วฝักยาว', nameEnglish: 'String Bean', category: 'ผัก', image: '🫛', community: 'สหกรณ์เกษตรอินทรีย์', pricePer100g: 6, calories100g: 31, protein100g: 1.8, carbs100g: 7.1, fat100g: 0.1 },
    // ── สมุนไพร ──
    { id: 'ginger', name: 'ขิง', nameEnglish: 'Ginger', category: 'สมุนไพร', image: '🫚', community: 'วิสาหกิจชุมชนสมุนไพร', pricePer100g: 8, calories100g: 80, protein100g: 1.8, carbs100g: 18.0, fat100g: 0.8 },
    { id: 'lemongrass', name: 'ตะไคร้', nameEnglish: 'Lemongrass', category: 'สมุนไพร', image: '🌿', community: 'วิสาหกิจชุมชนสมุนไพร', pricePer100g: 5, calories100g: 99, protein100g: 1.8, carbs100g: 25.3, fat100g: 0.5 },
    { id: 'galangal', name: 'ข่า', nameEnglish: 'Galangal', category: 'สมุนไพร', image: '🌿', community: 'วิสาหกิจชุมชนสมุนไพร', pricePer100g: 6, calories100g: 71, protein100g: 1.5, carbs100g: 15.0, fat100g: 1.0 },
    { id: 'basil', name: 'ใบกะเพรา', nameEnglish: 'Holy Basil', category: 'สมุนไพร', image: '🌿', community: 'วิสาหกิจชุมชนสมุนไพร', pricePer100g: 10, calories100g: 23, protein100g: 3.2, carbs100g: 2.7, fat100g: 0.6 },
    { id: 'garlic', name: 'กระเทียม', nameEnglish: 'Garlic', category: 'สมุนไพร', image: '🧄', community: 'วิสาหกิจชุมชนสมุนไพร', pricePer100g: 12, calories100g: 149, protein100g: 6.4, carbs100g: 33.1, fat100g: 0.5 },
    { id: 'chili', name: 'พริก', nameEnglish: 'Chili', category: 'สมุนไพร', image: '🌶️', community: 'วิสาหกิจชุมชนสมุนไพร', pricePer100g: 15, calories100g: 40, protein100g: 2.0, carbs100g: 8.8, fat100g: 0.4 },
    { id: 'coriander', name: 'ผักชี', nameEnglish: 'Coriander', category: 'สมุนไพร', image: '🌿', community: 'วิสาหกิจชุมชนสมุนไพร', pricePer100g: 8, calories100g: 23, protein100g: 2.1, carbs100g: 3.7, fat100g: 0.5 },
    // ── ผลไม้ ──
    { id: 'banana', name: 'กล้วยหอม', nameEnglish: 'Banana', category: 'ผลไม้', image: '🍌', community: 'สหกรณ์ชาวสวน', pricePer100g: 4, calories100g: 89, protein100g: 1.1, carbs100g: 22.8, fat100g: 0.3 },
    { id: 'mango', name: 'มะม่วง', nameEnglish: 'Mango', category: 'ผลไม้', image: '🥭', community: 'สหกรณ์ชาวสวน', pricePer100g: 10, calories100g: 60, protein100g: 0.8, carbs100g: 15.0, fat100g: 0.4 },
    { id: 'papaya', name: 'มะละกอ', nameEnglish: 'Papaya', category: 'ผลไม้', image: '🍈', community: 'สหกรณ์ชาวสวน', pricePer100g: 5, calories100g: 43, protein100g: 0.5, carbs100g: 11.0, fat100g: 0.3 },
    { id: 'lime', name: 'มะนาว', nameEnglish: 'Lime', category: 'ผลไม้', image: '🍋', community: 'สหกรณ์ชาวสวน', pricePer100g: 6, calories100g: 30, protein100g: 0.7, carbs100g: 10.5, fat100g: 0.2 },
    { id: 'avocado', name: 'อะโวคาโด', nameEnglish: 'Avocado', category: 'ผลไม้', image: '🥑', community: 'สหกรณ์ชาวสวน', pricePer100g: 25, calories100g: 160, protein100g: 2.0, carbs100g: 8.5, fat100g: 14.7 },
    // ── โปรตีน ──
    { id: 'chicken-breast', name: 'อกไก่', nameEnglish: 'Chicken Breast', category: 'โปรตีน', image: '🍗', community: 'ฟาร์มไก่อินทรีย์', pricePer100g: 18, calories100g: 165, protein100g: 31.0, carbs100g: 0.0, fat100g: 3.6 },
    { id: 'egg', name: 'ไข่ไก่', nameEnglish: 'Egg', category: 'โปรตีน', image: '🥚', community: 'ฟาร์มไก่อินทรีย์', pricePer100g: 12, calories100g: 155, protein100g: 13.0, carbs100g: 1.1, fat100g: 11.0 },
    { id: 'pork-loin', name: 'เนื้อหมูสันนอก', nameEnglish: 'Pork Loin', category: 'โปรตีน', image: '🥩', community: 'ฟาร์มหมูอินทรีย์', pricePer100g: 16, calories100g: 143, protein100g: 26.3, carbs100g: 0.0, fat100g: 3.5 },
    { id: 'pork-belly', name: 'หมูสามชั้น', nameEnglish: 'Pork Belly', category: 'โปรตีน', image: '🥓', community: 'ฟาร์มหมูอินทรีย์', pricePer100g: 14, calories100g: 518, protein100g: 9.3, carbs100g: 0.0, fat100g: 53.0 },
    { id: 'minced-pork', name: 'หมูสับ', nameEnglish: 'Minced Pork', category: 'โปรตีน', image: '🥩', community: 'ฟาร์มหมูอินทรีย์', pricePer100g: 13, calories100g: 263, protein100g: 16.9, carbs100g: 0.0, fat100g: 21.2 },
    { id: 'shrimp', name: 'กุ้งสด', nameEnglish: 'Shrimp', category: 'โปรตีน', image: '🦐', community: 'ประมงพื้นบ้าน', pricePer100g: 30, calories100g: 99, protein100g: 24.0, carbs100g: 0.2, fat100g: 0.3 },
    { id: 'tofu', name: 'เต้าหู้', nameEnglish: 'Tofu', category: 'โปรตีน', image: '🧈', community: 'โรงงานเต้าหู้ชุมชน', pricePer100g: 5, calories100g: 76, protein100g: 8.0, carbs100g: 1.9, fat100g: 4.8 },
    { id: 'salmon', name: 'ปลาแซลมอน', nameEnglish: 'Salmon', category: 'โปรตีน', image: '🐟', community: 'ประมงพื้นบ้าน', pricePer100g: 45, calories100g: 208, protein100g: 20.4, carbs100g: 0.0, fat100g: 13.4 },
    { id: 'fish-tilapia', name: 'ปลานิล', nameEnglish: 'Tilapia', category: 'โปรตีน', image: '🐟', community: 'ประมงพื้นบ้าน', pricePer100g: 10, calories100g: 96, protein100g: 20.1, carbs100g: 0.0, fat100g: 1.7 },
    // ── ธัญพืช ──
    { id: 'brown-rice', name: 'ข้าวกล้อง', nameEnglish: 'Brown Rice', category: 'ธัญพืช', image: '🍚', community: 'สหกรณ์ข้าวอินทรีย์', pricePer100g: 3, calories100g: 370, protein100g: 7.9, carbs100g: 77.2, fat100g: 2.9 },
    { id: 'jasmine-rice', name: 'ข้าวหอมมะลิ', nameEnglish: 'Jasmine Rice', category: 'ธัญพืช', image: '🍚', community: 'สหกรณ์ข้าวอินทรีย์', pricePer100g: 4, calories100g: 365, protein100g: 7.1, carbs100g: 80.0, fat100g: 0.7 },
    { id: 'oat', name: 'ข้าวโอ๊ต', nameEnglish: 'Oat', category: 'ธัญพืช', image: '🥣', community: 'สหกรณ์ข้าวอินทรีย์', pricePer100g: 8, calories100g: 389, protein100g: 16.9, carbs100g: 66.3, fat100g: 6.9 },
    { id: 'quinoa', name: 'ควินัว', nameEnglish: 'Quinoa', category: 'ธัญพืช', image: '🌾', community: 'สหกรณ์ข้าวอินทรีย์', pricePer100g: 35, calories100g: 368, protein100g: 14.1, carbs100g: 64.2, fat100g: 6.1 },
    { id: 'glass-noodle', name: 'วุ้นเส้น', nameEnglish: 'Glass Noodle', category: 'ธัญพืช', image: '🍜', community: 'โรงงานเต้าหู้ชุมชน', pricePer100g: 5, calories100g: 334, protein100g: 0.1, carbs100g: 82.4, fat100g: 0.1 },
];

// ── RECIPES (30+) ──
const recipes = [
    // ═══ เช้า ═══
    {
        name: 'ข้าวโอ๊ตกล้วยหอมอะโวคาโด', image: '🥣', mealType: 'เช้า', cookTime: 10, calories: 420, ingredients: [
            { ingredientId: 'oat', gramsUsed: 80 }, { ingredientId: 'banana', gramsUsed: 100 }, { ingredientId: 'avocado', gramsUsed: 50 }],
        steps: ['ต้มข้าวโอ๊ตกับน้ำ 200ml จนนุ่ม', 'หั่นกล้วยหอมและอะโวคาโดเป็นชิ้น', 'ตักข้าวโอ๊ตใส่ชาม วางผลไม้ด้านบน']
    },
    {
        name: 'ไข่ดาวผักโขมบนขนมปังโฮลวีท', image: '🍳', mealType: 'เช้า', cookTime: 15, calories: 350, ingredients: [
            { ingredientId: 'egg', gramsUsed: 100 }, { ingredientId: 'spinach', gramsUsed: 80 }, { ingredientId: 'tomato', gramsUsed: 50 }],
        steps: ['ทอดไข่ดาวใส่น้ำมันน้อย', 'ผัดผักโขมกับมะเขือเทศสับ', 'จัดเสิร์ฟบนจาน']
    },
    {
        name: 'สมูทตี้ผักเคลกล้วย', image: '🥤', mealType: 'เช้า', cookTime: 5, calories: 280, ingredients: [
            { ingredientId: 'kale', gramsUsed: 60 }, { ingredientId: 'banana', gramsUsed: 120 }, { ingredientId: 'oat', gramsUsed: 30 }],
        steps: ['ล้างผักเคลให้สะอาด', 'ปั่นผักเคล กล้วยหอม ข้าวโอ๊ต กับน้ำ 200ml', 'เทใส่แก้ว เสิร์ฟทันที']
    },
    {
        name: 'ข้าวกล้องไข่คน', image: '🍚', mealType: 'เช้า', cookTime: 15, calories: 380, ingredients: [
            { ingredientId: 'brown-rice', gramsUsed: 80 }, { ingredientId: 'egg', gramsUsed: 100 }, { ingredientId: 'coriander', gramsUsed: 5 }],
        steps: ['หุงข้าวกล้อง', 'ทำไข่คนนุ่มๆ ใส่เกลือเล็กน้อย', 'ตักข้าวใส่จาน วางไข่คนด้านบน โรยผักชี']
    },
    {
        name: 'โจ๊กข้าวกล้องไก่', image: '🥣', mealType: 'เช้า', cookTime: 25, calories: 310, ingredients: [
            { ingredientId: 'brown-rice', gramsUsed: 60 }, { ingredientId: 'chicken-breast', gramsUsed: 80 }, { ingredientId: 'ginger', gramsUsed: 10 }, { ingredientId: 'coriander', gramsUsed: 5 }],
        steps: ['ต้มข้าวกล้องกับน้ำมากๆ จนเปื่อย', 'หั่นอกไก่เป็นชิ้นบาง ใส่ลงต้มจนสุก', 'ปรุงรสด้วยซีอิ๊ว โรยขิงซอยและผักชี']
    },
    {
        name: 'แพนเค้กข้าวโอ๊ตกล้วย', image: '🥞', mealType: 'เช้า', cookTime: 20, calories: 360, ingredients: [
            { ingredientId: 'oat', gramsUsed: 100 }, { ingredientId: 'banana', gramsUsed: 100 }, { ingredientId: 'egg', gramsUsed: 50 }],
        steps: ['บดกล้วยหอมให้ละเอียด', 'ผสมกับข้าวโอ๊ตและไข่ คนจนเข้ากัน', 'ทอดในกระทะไม่ติดจนเหลืองทั้งสองด้าน']
    },

    // ═══ กลางวัน ═══
    {
        name: 'ข้าวกล้องผัดกะเพราไก่', image: '🍛', mealType: 'กลางวัน', cookTime: 20, calories: 520, ingredients: [
            { ingredientId: 'brown-rice', gramsUsed: 100 }, { ingredientId: 'chicken-breast', gramsUsed: 120 }, { ingredientId: 'basil', gramsUsed: 15 }, { ingredientId: 'chili', gramsUsed: 5 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'string-bean', gramsUsed: 40 }],
        steps: ['หุงข้าวกล้อง', 'สับกระเทียมและพริก ผัดในกระทะร้อน', 'ใส่อกไก่หั่นชิ้นผัดจนสุก', 'ใส่ถั่วฝักยาว ปรุงรสซีอิ๊ว น้ำมันหอย', 'ใส่ใบกะเพรา ผัดให้เข้ากัน ตักราดข้าว']
    },
    {
        name: 'สลัดอกไก่ย่างกับควินัว', image: '🥗', mealType: 'กลางวัน', cookTime: 25, calories: 450, ingredients: [
            { ingredientId: 'chicken-breast', gramsUsed: 120 }, { ingredientId: 'quinoa', gramsUsed: 60 }, { ingredientId: 'tomato', gramsUsed: 80 }, { ingredientId: 'cucumber', gramsUsed: 60 }, { ingredientId: 'carrot', gramsUsed: 40 }, { ingredientId: 'lime', gramsUsed: 20 }],
        steps: ['ต้มควินัวจนสุก พักให้เย็น', 'ย่างอกไก่จนสุก หั่นเป็นชิ้น', 'หั่นผักทั้งหมดเป็นชิ้นพอดีคำ', 'ผสมน้ำสลัดจากมะนาว เกลือ พริกไทย', 'คลุกเคล้าทุกอย่างในชาม']
    },
    {
        name: 'ผัดผักรวมเต้าหู้', image: '🍲', mealType: 'กลางวัน', cookTime: 15, calories: 320, ingredients: [
            { ingredientId: 'tofu', gramsUsed: 150 }, { ingredientId: 'broccoli', gramsUsed: 80 }, { ingredientId: 'carrot', gramsUsed: 50 }, { ingredientId: 'mushroom', gramsUsed: 40 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'brown-rice', gramsUsed: 80 }],
        steps: ['หั่นเต้าหู้เป็นลูกเต๋า ทอดจนเหลือง', 'ผัดกระเทียมจนหอม ใส่ผักทั้งหมด', 'ใส่ซอสถั่วเหลือง น้ำมันหอย ปรุงรส', 'เสิร์ฟกับข้าวกล้อง']
    },
    {
        name: 'ข้าวผัดหมูสับ', image: '🍳', mealType: 'กลางวัน', cookTime: 15, calories: 550, ingredients: [
            { ingredientId: 'jasmine-rice', gramsUsed: 120 }, { ingredientId: 'minced-pork', gramsUsed: 100 }, { ingredientId: 'egg', gramsUsed: 50 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'tomato', gramsUsed: 40 }, { ingredientId: 'cucumber', gramsUsed: 30 }],
        steps: ['ผัดกระเทียมจนหอม ใส่หมูสับผัดจนสุก', 'ใส่ข้าวสวยลงผัด ปรุงรสด้วยซีอิ๊ว', 'ทอดไข่ดาว จัดจานพร้อมแตงกวาและมะเขือเทศ']
    },
    {
        name: 'ต้มยำกุ้ง', image: '🍜', mealType: 'กลางวัน', cookTime: 25, calories: 280, ingredients: [
            { ingredientId: 'shrimp', gramsUsed: 120 }, { ingredientId: 'mushroom', gramsUsed: 50 }, { ingredientId: 'lemongrass', gramsUsed: 15 }, { ingredientId: 'galangal', gramsUsed: 10 }, { ingredientId: 'lime', gramsUsed: 15 }, { ingredientId: 'chili', gramsUsed: 5 }, { ingredientId: 'tomato', gramsUsed: 40 }],
        steps: ['ต้มน้ำ ใส่ตะไคร้ ข่า ทุบพอแตก', 'ใส่เห็ดหอม มะเขือเทศ ต้มจนนุ่ม', 'ใส่กุ้งสด รอจนสุก', 'ปรุงรสด้วยน้ำปลา มะนาว พริก']
    },
    {
        name: 'ข้าวมันไก่สุขภาพ', image: '🍗', mealType: 'กลางวัน', cookTime: 30, calories: 480, ingredients: [
            { ingredientId: 'jasmine-rice', gramsUsed: 100 }, { ingredientId: 'chicken-breast', gramsUsed: 150 }, { ingredientId: 'ginger', gramsUsed: 15 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'cucumber', gramsUsed: 40 }, { ingredientId: 'coriander', gramsUsed: 5 }],
        steps: ['ต้มอกไก่กับขิงจนสุก นำไก่ขึ้นหั่นชิ้น', 'นำน้ำต้มไก่มาหุงข้าวกับกระเทียมเจียว', 'จัดจาน ข้าว ไก่ แตงกวา โรยผักชี', 'เสิร์ฟพร้อมน้ำจิ้มขิง']
    },
    {
        name: 'หมูสันนอกย่างสลัด', image: '🥗', mealType: 'กลางวัน', cookTime: 25, calories: 410, ingredients: [
            { ingredientId: 'pork-loin', gramsUsed: 120 }, { ingredientId: 'spinach', gramsUsed: 60 }, { ingredientId: 'bell-pepper', gramsUsed: 50 }, { ingredientId: 'carrot', gramsUsed: 40 }, { ingredientId: 'lime', gramsUsed: 15 }],
        steps: ['หมักหมูสันนอกด้วยซีอิ๊ว กระเทียม พริกไทย', 'ย่างหมูจนสุกได้ที่ พัก 5 นาที หั่นชิ้น', 'จัดผักสลัดในจาน วางหมูด้านบน', 'ราดน้ำสลัดมะนาว']
    },
    {
        name: 'วุ้นเส้นผัดไข่', image: '🍜', mealType: 'กลางวัน', cookTime: 15, calories: 380, ingredients: [
            { ingredientId: 'glass-noodle', gramsUsed: 80 }, { ingredientId: 'egg', gramsUsed: 100 }, { ingredientId: 'cabbage', gramsUsed: 60 }, { ingredientId: 'carrot', gramsUsed: 30 }, { ingredientId: 'garlic', gramsUsed: 10 }],
        steps: ['แช่วุ้นเส้นในน้ำร้อนจนนุ่ม', 'ผัดกระเทียมจนหอม ใส่ไข่คนจนสุก', 'ใส่ผักกะหล่ำ แครอท ผัดจนนุ่ม', 'ใส่วุ้นเส้น ปรุงรสด้วยซีอิ๊ว']
    },

    // ═══ เย็น ═══
    {
        name: 'แซลมอนย่างกับผักนึ่ง', image: '🐟', mealType: 'เย็น', cookTime: 25, calories: 450, ingredients: [
            { ingredientId: 'salmon', gramsUsed: 150 }, { ingredientId: 'broccoli', gramsUsed: 100 }, { ingredientId: 'carrot', gramsUsed: 60 }, { ingredientId: 'lime', gramsUsed: 10 }],
        steps: ['หมักแซลมอนด้วยเกลือ พริกไทย มะนาว', 'ย่างแซลมอนในเตาอบ 200°C 15 นาที', 'นึ่งบร็อคโคลี่และแครอทจนนุ่ม', 'จัดจาน บีบมะนาว']
    },
    {
        name: 'สเต็กอกไก่พริกไทยดำ', image: '🍗', mealType: 'เย็น', cookTime: 20, calories: 380, ingredients: [
            { ingredientId: 'chicken-breast', gramsUsed: 180 }, { ingredientId: 'broccoli', gramsUsed: 80 }, { ingredientId: 'pumpkin', gramsUsed: 80 }, { ingredientId: 'garlic', gramsUsed: 10 }],
        steps: ['หมักอกไก่ด้วยเกลือ พริกไทยดำ กระเทียม', 'ทอดอกไก่ในกระทะร้อนจนเหลืองทั้งสองด้าน', 'นึ่งบร็อคโคลี่และฟักทองเป็นเครื่องเคียง', 'จัดจาน เสิร์ฟร้อนๆ']
    },
    {
        name: 'แกงจืดเต้าหู้ผักรวม', image: '🍲', mealType: 'เย็น', cookTime: 20, calories: 250, ingredients: [
            { ingredientId: 'tofu', gramsUsed: 120 }, { ingredientId: 'chinese-cabbage', gramsUsed: 80 }, { ingredientId: 'carrot', gramsUsed: 40 }, { ingredientId: 'mushroom', gramsUsed: 30 }, { ingredientId: 'coriander', gramsUsed: 5 }],
        steps: ['ต้มน้ำซุป ใส่แครอทก่อน', 'ใส่ผักกาดขาว เห็ดหอม เต้าหู้หั่นชิ้น', 'ปรุงรสด้วยน้ำปลา ซีอิ๊วขาว', 'โรยผักชี เสิร์ฟร้อนๆ']
    },
    {
        name: 'ปลานิลนึ่งมะนาว', image: '🐟', mealType: 'เย็น', cookTime: 25, calories: 280, ingredients: [
            { ingredientId: 'fish-tilapia', gramsUsed: 200 }, { ingredientId: 'lime', gramsUsed: 30 }, { ingredientId: 'garlic', gramsUsed: 15 }, { ingredientId: 'chili', gramsUsed: 5 }, { ingredientId: 'coriander', gramsUsed: 5 }],
        steps: ['ทำความสะอาดปลานิล วางบนจานนึ่ง', 'นึ่งปลาในหม้อนึ่ง 15-20 นาที', 'ตำน้ำจิ้มซีฟู้ด: กระเทียม พริก มะนาว น้ำปลา', 'ราดน้ำจิ้มบนปลา โรยผักชี']
    },
    {
        name: 'หมูสามชั้นผัดกะหล่ำ', image: '🥓', mealType: 'เย็น', cookTime: 20, calories: 580, ingredients: [
            { ingredientId: 'pork-belly', gramsUsed: 100 }, { ingredientId: 'cabbage', gramsUsed: 120 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'chili', gramsUsed: 3 }, { ingredientId: 'jasmine-rice', gramsUsed: 80 }],
        steps: ['หั่นหมูสามชั้นเป็นชิ้นบาง', 'ผัดหมูจนเหลืองกรอบ ตักน้ำมันออก', 'ใส่กระเทียม พริก ผัดจนหอม ใส่กะหล่ำปลี', 'ปรุงรสด้วยน้ำปลา ซีอิ๊ว เสิร์ฟกับข้าว']
    },
    {
        name: 'ผัดฟักทองไข่', image: '🎃', mealType: 'เย็น', cookTime: 15, calories: 320, ingredients: [
            { ingredientId: 'pumpkin', gramsUsed: 150 }, { ingredientId: 'egg', gramsUsed: 100 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'brown-rice', gramsUsed: 80 }],
        steps: ['หั่นฟักทองเป็นชิ้นบาง', 'ผัดกระเทียมจนหอม ใส่ฟักทอง ผัดจนนุ่ม', 'ตอกไข่ลงไป คนให้เข้ากัน', 'ปรุงรสด้วยซีอิ๊ว เสิร์ฟกับข้าวกล้อง']
    },
    {
        name: 'ผัดผักบุ้งไฟแดง', image: '🥬', mealType: 'เย็น', cookTime: 10, calories: 180, ingredients: [
            { ingredientId: 'morning-glory', gramsUsed: 200 }, { ingredientId: 'garlic', gramsUsed: 15 }, { ingredientId: 'chili', gramsUsed: 5 }, { ingredientId: 'jasmine-rice', gramsUsed: 100 }],
        steps: ['ตั้งกระทะให้ร้อนจัด ใส่น้ำมัน', 'ผัดกระเทียมและพริกจนหอม', 'ใส่ผักบุ้ง ผัดไฟแรงอย่างรวดเร็ว', 'ปรุงรสด้วยซีอิ๊ว เต้าเจี้ยว เสิร์ฟกับข้าว']
    },
    {
        name: 'กุ้งผัดพริกหวาน', image: '🦐', mealType: 'เย็น', cookTime: 15, calories: 350, ingredients: [
            { ingredientId: 'shrimp', gramsUsed: 150 }, { ingredientId: 'bell-pepper', gramsUsed: 80 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'corn', gramsUsed: 50 }, { ingredientId: 'brown-rice', gramsUsed: 80 }],
        steps: ['ปอกเปลือกกุ้ง ล้างสะอาด', 'ผัดกระเทียมจนหอม ใส่กุ้งผัดจนเปลี่ยนสี', 'ใส่พริกหวานหั่นชิ้น ข้าวโพด ผัดจนสุก', 'ปรุงรสด้วยซอสหอยนางรม เสิร์ฟกับข้าวกล้อง']
    },
    {
        name: 'ข้าวผัดไข่เต้าหู้', image: '🍳', mealType: 'เย็น', cookTime: 15, calories: 420, ingredients: [
            { ingredientId: 'jasmine-rice', gramsUsed: 120 }, { ingredientId: 'egg', gramsUsed: 100 }, { ingredientId: 'tofu', gramsUsed: 80 }, { ingredientId: 'carrot', gramsUsed: 30 }, { ingredientId: 'string-bean', gramsUsed: 40 }],
        steps: ['ผัดเต้าหู้หั่นเต๋าจนเหลือง', 'ตอกไข่ลงผัด จากนั้นใส่ข้าว', 'ใส่แครอท ถั่วฝักยาว ผัดจนสุก', 'ปรุงรสด้วยซีอิ๊ว พริกไทย']
    },
    {
        name: 'แกงเขียวหวานไก่', image: '🍛', mealType: 'เย็น', cookTime: 30, calories: 480, ingredients: [
            { ingredientId: 'chicken-breast', gramsUsed: 120 }, { ingredientId: 'eggplant', gramsUsed: 80 }, { ingredientId: 'basil', gramsUsed: 10 }, { ingredientId: 'bell-pepper', gramsUsed: 40 }, { ingredientId: 'jasmine-rice', gramsUsed: 100 }],
        steps: ['ผัดพริกแกงเขียวหวานจนหอม', 'ใส่อกไก่หั่นชิ้น ผัดจนสุก', 'เติมกะทิ ใส่มะเขือยาว พริกหวาน', 'ปรุงรส ใส่ใบกะเพรา เสิร์ฟกับข้าว']
    },
    {
        name: 'ซุปฟักทองเพื่อสุขภาพ', image: '🎃', mealType: 'เย็น', cookTime: 30, calories: 220, ingredients: [
            { ingredientId: 'pumpkin', gramsUsed: 250 }, { ingredientId: 'carrot', gramsUsed: 60 }, { ingredientId: 'ginger', gramsUsed: 10 }, { ingredientId: 'garlic', gramsUsed: 10 }],
        steps: ['นึ่งฟักทองและแครอทจนนุ่ม', 'ปั่นรวมกับน้ำซุป ขิง กระเทียม', 'ต้มอีกครั้งจนร้อน ปรุงรส', 'เสิร์ฟร้อนๆ โรยพริกไทย']
    },
    {
        name: 'ข้าวกล้องผัดกุ้ง', image: '🦐', mealType: 'กลางวัน', cookTime: 20, calories: 430, ingredients: [
            { ingredientId: 'brown-rice', gramsUsed: 100 }, { ingredientId: 'shrimp', gramsUsed: 100 }, { ingredientId: 'egg', gramsUsed: 50 }, { ingredientId: 'corn', gramsUsed: 40 }, { ingredientId: 'garlic', gramsUsed: 10 }, { ingredientId: 'lime', gramsUsed: 10 }],
        steps: ['ผัดกระเทียมจนหอม ใส่กุ้งผัดจนสุก', 'ตอกไข่ลง ผัดจนแห้ง', 'ใส่ข้าวกล้อง ข้าวโพด ผัดจนเข้ากัน', 'บีบมะนาว ปรุงรส เสิร์ฟร้อนๆ']
    },
    {
        name: 'ยำมะม่วงกุ้งสด', image: '🥭', mealType: 'กลางวัน', cookTime: 15, calories: 250, ingredients: [
            { ingredientId: 'mango', gramsUsed: 150 }, { ingredientId: 'shrimp', gramsUsed: 80 }, { ingredientId: 'chili', gramsUsed: 5 }, { ingredientId: 'lime', gramsUsed: 20 }, { ingredientId: 'coriander', gramsUsed: 5 }],
        steps: ['สับมะม่วงดิบเป็นเส้น', 'ต้มกุ้งจนสุก แกะเปลือก', 'ทำน้ำยำ: มะนาว น้ำปลา พริก น้ำตาล', 'คลุกเคล้าทุกอย่าง โรยผักชี']
    },
];

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Upsert ingredients
    for (const ing of ingredients) {
        await Ingredient.updateOne({ id: ing.id }, { $set: { ...ing, inStock: 5000 } }, { upsert: true });
    }
    console.log(`✅ Upserted ${ingredients.length} ingredients`);

    // Clear and re-insert recipes
    await Recipe.deleteMany({});
    await Recipe.insertMany(recipes);
    console.log(`✅ Inserted ${recipes.length} recipes`);

    await mongoose.disconnect();
    console.log('🎉 Seed complete!');
}

main().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
