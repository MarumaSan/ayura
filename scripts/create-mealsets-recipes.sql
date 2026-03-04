-- Create 4 Meal Sets with Recipes
-- 1. Weight Control/Balance Set
-- 2. Weight Loss Set  
-- 3. Weight Gain Set
-- 4. Muscle Building Set

-- ============================================
-- MEAL SET 1: WEIGHT CONTROL / BALANCE (คุมน้ำหนักสมดุล)
-- ============================================
INSERT INTO mealsets (id, name, description, image, avg_nutrition, price_weekly, price_monthly, is_active)
VALUES (
  'weight-control',
  'เซ็ตคุมน้ำหนักสมดุล',
  'อาหารสมดุลสำหรับผู้ต้องการรักษาน้ำหนักและสุขภาพ โปรตีนพอเหมาะ คาร์บอิเดรตซับซ้อน ไขมันดี อิ่มท้องนาน พลังงาน 1,800-2,000 กิโลแคลอรี่/วัน',
  '🥗',
  '{"calories": 1900, "protein": 80, "carbs": 220, "fat": 60}'::jsonb,
  999,
  3699,
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  avg_nutrition = EXCLUDED.avg_nutrition,
  price_weekly = EXCLUDED.price_weekly,
  price_monthly = EXCLUDED.price_monthly;

-- Ingredients for Weight Control Set (portions per week)
INSERT INTO mealset_box_ingredients (mealset_id, ingredient_id, grams_per_week, note) VALUES
('weight-control', 'chicken-breast', 800, 'โปรตีนไขมันต่ำ'),
('weight-control', 'salmon', 400, 'โอเมก้า 3'),
('weight-control', 'broccoli', 700, 'ใยอาหารสูง'),
('weight-control', 'spinach', 500, 'วิตามินแร่ธาตุ'),
('weight-control', 'brown-rice', 1200, 'คาร์บซับซ้อน'),
('weight-control', 'quinoa', 400, 'โปรตีนพืช'),
('weight-control', 'avocado', 350, 'ไขมันดี'),
('weight-control', 'egg', 350, 'โปรตีนคุณภาพ'),
('weight-control', 'carrot', 400, 'เบต้าแคโรทีน'),
('weight-control', 'tomato', 500, 'ไลโคปีน')
ON CONFLICT DO NOTHING;

-- ============================================
-- MEAL SET 2: WEIGHT LOSS (ลดน้ำหนัก)
-- ============================================
INSERT INTO mealsets (id, name, description, image, avg_nutrition, price_weekly, price_monthly, is_active)
VALUES (
  'weight-loss',
  'เซ็ตลดน้ำหนัก',
  'อาหารลดน้ำหนักที่เน้นผักและโปรตีนไขมันต่ำ คาร์บน้อย อิ่มท้องนานด้วยใยอาหารสูง พลังงาน 1,400-1,600 กิโลแคลอรี่/วัน เหมาะสำหรับผู้ต้องการลดน้ำหนัก',
  '🥙',
  '{"calories": 1500, "protein": 90, "carbs": 120, "fat": 50}'::jsonb,
  899,
  3299,
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  avg_nutrition = EXCLUDED.avg_nutrition,
  price_weekly = EXCLUDED.price_weekly,
  price_monthly = EXCLUDED.price_monthly;

-- Ingredients for Weight Loss Set
INSERT INTO mealset_box_ingredients (mealset_id, ingredient_id, grams_per_week, note) VALUES
('weight-loss', 'chicken-breast', 1000, 'โปรตีนไขมันต่ำ'),
('weight-loss', 'shrimp', 400, 'โปรตีนต่ำแคลอรี่'),
('weight-loss', 'broccoli', 900, 'ใยอาหารสูงมาก'),
('weight-loss', 'spinach', 600, 'แคลอรี่ต่ำ'),
('weight-loss', 'cucumber', 700, 'ความชุ่มชื้นสูง'),
('weight-loss', 'cabbage', 600, 'ใยอาหารดี'),
('weight-loss', 'tomato', 500, 'วิตามินซี'),
('weight-loss', 'egg', 300, 'โปรตีนอิ่มนาน'),
('weight-loss', 'mushroom', 400, 'แคลอรี่ต่ำ'),
('weight-loss', 'papaya', 300, 'ย่อยง่าย')
ON CONFLICT DO NOTHING;

-- ============================================
-- MEAL SET 3: WEIGHT GAIN (เพิ่มน้ำหนัก)
-- ============================================
INSERT INTO mealsets (id, name, description, image, avg_nutrition, price_weekly, price_monthly, is_active)
VALUES (
  'weight-gain',
  'เซ็ตเพิ่มน้ำหนัก',
  'อาหารเพิ่มน้ำหนักที่เน้นคาร์บอิเดรตและไขมันดี โปรตีนสูง พลังงาน 2,800-3,200 กิโลแคลอรี่/วัน เหมาะสำหรับผู้ต้องการเพิ่มน้ำหนักและกล้ามเนื้อ',
  '🍱',
  '{"calories": 3000, "protein": 100, "carbs": 380, "fat": 100}'::jsonb,
  1199,
  4399,
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  avg_nutrition = EXCLUDED.avg_nutrition,
  price_weekly = EXCLUDED.price_weekly,
  price_monthly = EXCLUDED.price_monthly;

-- Ingredients for Weight Gain Set
INSERT INTO mealset_box_ingredients (mealset_id, ingredient_id, grams_per_week, note) VALUES
('weight-gain', 'pork-belly', 800, 'ไขมันและโปรตีน'),
('weight-gain', 'salmon', 500, 'โอเมก้า 3 ไขมันดี'),
('weight-gain', 'jasmine-rice', 2000, 'คาร์บพลังงานสูง'),
('weight-gain', 'egg', 700, 'โปรตีนและไขมัน'),
('weight-gain', 'avocado', 600, 'ไขมันไม่อิ่มตัว'),
('weight-gain', 'banana', 600, 'พลังงานธรรมชาติ'),
('weight-gain', 'pumpkin', 500, 'คาร์บซับซ้อน'),
('weight-gain', 'tofu', 600, 'โปรตีนพืช'),
('weight-gain', 'oyster-sauce', 200, 'รสชาติ'),
('weight-gain', 'minced-pork', 600, 'โปรตีนราคาประหยัด')
ON CONFLICT DO NOTHING;

-- ============================================
-- MEAL SET 4: MUSCLE BUILDING (เพิ่มกล้ามเนื้อ)
-- ============================================
INSERT INTO mealsets (id, name, description, image, avg_nutrition, price_weekly, price_monthly, is_active)
VALUES (
  'muscle-building',
  'เซ็ตเพิ่มกล้ามเนื้อ',
  'อาหารเพิ่มกล้ามเนื้อที่เน้นโปรตีนสูงมาก คาร์บพอเหมาะสำหรับซ่อมแซมกล้ามเนื้อ พลังงาน 2,400-2,800 กิโลแคลอรี่/วัน โปรตีน 150-180 กรัม/วัน',
  '💪',
  '{"calories": 2600, "protein": 165, "carbs": 280, "fat": 70}'::jsonb,
  1399,
  4999,
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  avg_nutrition = EXCLUDED.avg_nutrition,
  price_weekly = EXCLUDED.price_weekly,
  price_monthly = EXCLUDED.price_monthly;

-- Ingredients for Muscle Building Set
INSERT INTO mealset_box_ingredients (mealset_id, ingredient_id, grams_per_week, note) VALUES
('muscle-building', 'chicken-breast', 1500, 'โปรตีนหลัก'),
('muscle-building', 'egg', 1000, 'โปรตีนคุณภาพสูง'),
('muscle-building', 'salmon', 600, 'โปรตีน + โอเมก้า 3'),
('muscle-building', 'shrimp', 500, 'โปรตีนต่ำไขมัน'),
('muscle-building', 'brown-rice', 1200, 'พลังงานยั่งยืน'),
('muscle-building', 'broccoli', 600, 'สารต้านอนุภาค'),
('muscle-building', 'spinach', 400, 'เหล็กและวิตามิน'),
('muscle-building', 'quinoa', 500, 'โปรตีนครบถ้วน'),
('muscle-building', 'avocado', 400, 'ไขมันสำหรับฮอร์โมน'),
('muscle-building', 'eggplant', 400, 'สารต้านอนุภาค')
ON CONFLICT DO NOTHING;

-- ============================================
-- RECIPES FOR ALL MEAL SETS
-- ============================================

-- ============================================
-- BREAKFAST RECIPES
-- ============================================

-- Weight Control Breakfast: Oatmeal with Egg
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'โอ๊ตมีลกับไข่ต้ม (เซ็ตคุมน้ำหนัก)',
  'เช้า',
  '🥣',
  15,
  1,
  380,
  ARRAY[
    'ต้มน้ำให้เดือด ใส่ข้าวโอ๊ต 60 กรัม เติมน้ำ 200 มล.',
    'เขย่าเป็นครั้งคราว ต้ม 5-7 นาทีจนข้าวโอ๊ตนุ่ม',
    'ต้มไข่ 2 ฟองในน้ำเดือด 8-10 นาที',
    'เสิร์ฟข้าวโอ๊ตร้อนๆ พร้อมไข่ต้มและครึ่งลูกอะโวคาโด'
  ]
) RETURNING id;

-- Weight Loss Breakfast: Chicken Breast Salad
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'สลัดอกไก่ (เซ็ตลดน้ำหนัก)',
  'เช้า',
  '🥗',
  20,
  1,
  320,
  ARRAY[
    'นำอกไก่ 120 กรัม หมักด้วยเกลือและพริกไทย 10 นาที',
    'ย่างอกไก่บนกระทะร้อน 5-6 นาทีต่อด้าน',
    'หั่นผักบุ้ง 100 กรัม แครอท 50 กรัม แตงกวา 50 กรัม',
    'จัดเรียงผักในจาน หั่นอกไก่วางบนผัก เสิร์ฟพร้อมมะนาวบีบ'
  ]
) RETURNING id;

-- Weight Gain Breakfast: Pork Belly Rice
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'ข้าวหน้าหมูสามชั้น (เซ็ตเพิ่มน้ำหนัก)',
  'เช้า',
  '🍖',
  40,
  1,
  650,
  ARRAY[
    'หั่นหมูสามชั้น 150 กรัม เป็นชิ้นพอดีคำ',
    'ต้มหมูสามชั้นในน้ำซุบ 30 นาที ปรุงรสด้วยซีอิ๊วและน้ำตาล',
    'นึ่งข้าวหอมมะลิ 200 กรัม',
    'เสิร์ฟข้าวร้อนๆ ราดหมูสามชั้นและน้ำซุบ ทานคู่กับไข่ต้ม 1 ฟอง'
  ]
) RETURNING id;

-- Muscle Building Breakfast: High Protein Bowl
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'โบวล์โปรตีนสูง (เซ็ตเพิ่มกล้ามเนื้อ)',
  'เช้า',
  '🍳',
  25,
  1,
  550,
  ARRAY[
    'ย่างอกไก่ 150 กรัม ปรุงรสด้วยเกลือ พริกไทย กระเทียม',
    'ทอดไข่ 3 ฟอง แบบไข่ดาวหรือคน',
    'หุงข้าวกล้อง 150 กรัม',
  'จัดเรียงในชาม ข้าว อกไก่ ไข่ ผักโขมนึ่ง 50 กรัม'
  ]
) RETURNING id;

-- ============================================
-- LUNCH RECIPES
-- ============================================

-- Weight Control Lunch: Grilled Salmon with Quinoa
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'แซลมอนย่างกับควินัว (เซ็ตคุมน้ำหนัก)',
  'กลางวัน',
  '🐟',
  30,
  1,
  520,
  ARRAY[
    'หมักแซลมอน 150 กรัม ด้วยเกลือ พริกไทย มะนาว 15 นาที',
    'ย่างแซลมอนบนกระทะ 4-5 นาทีต่อด้าน',
    'ต้มควินัว 80 กรัม ในน้ำ 15 นาที',
    'นึ่งบร็อคโคลี่ 150 กรัม 5 นาที เสิร์ฟพร้อมกัน'
  ]
) RETURNING id;

-- Weight Loss Lunch: Shrimp Stir-fry
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'ผัดกะเพรากุ้ง (เซ็ตลดน้ำหนัก)',
  'กลางวัน',
  '🦐',
  15,
  1,
  280,
  ARRAY[
    'ล้างกุ้ง 150 กรัม ปอกเปลือก',
    'เจียวกระเทียมกับน้ำมัน 1 ช้อนชา',
    'ผัดกุ้งจนสุก ใส่ใบกะเพรา 50 กรัม',
    'ปรุงรสด้วยซีอิ๊วขาว ไม่ใส่น้ำตาล เสิร์ฟพร้อมผักสด'
  ]
) RETURNING id;

-- Weight Gain Lunch: Pork Fried Rice
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'ข้าวผัดหมู (เซ็ตเพิ่มน้ำหนัก)',
  'กลางวัน',
  '🍚',
  20,
  1,
  750,
  ARRAY[
    'หมักหมูสับ 120 กรัม ด้วยซีอิ๊วและน้ำมัน',
    'เจียวกระเทียม ใส่หมูสับผัดจนสุก',
    'ใส่ข้าวสวย 300 กรัม ไข่ 2 ฟอง ผัดให้เข้ากัน',
    'ปรุงรส ใส่แครอท ถั่วฝักยาว ผัดจนสุก เสิร์ฟร้อน'
  ]
) RETURNING id;

-- Muscle Building Lunch: Chicken Steak with Sweet Potato
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'สเต็กอกไก่กับฟักทอง (เซ็ตเพิ่มกล้ามเนื้อ)',
  'กลางวัน',
  '🥩',
  35,
  1,
  620,
  ARRAY[
    'หมักอกไก่ 200 กรัม ด้วยโปรตีนซอส กระเทียม 30 นาที',
    'ย่างอกไก่บนกระทะ 6-7 นาทีต่อด้าน',
    'นึ่งฟักทอง 200 กรัม 15 นาที',
    'เสิร์ฟอกไก่หั่นชิ้น พร้อมฟักทองและผักโขม 50 กรัม'
  ]
) RETURNING id;

-- ============================================
-- DINNER RECIPES
-- ============================================

-- Weight Control Dinner: Steamed Fish with Vegetables
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'ปลานึ่งผัก (เซ็ตคุมน้ำหนัก)',
  'เย็น',
  '🐠',
  25,
  1,
  350,
  ARRAY[
    'ล้างปลานิล 150 กรัม ปาดครีบ ขูดเกล็ด',
    'วางปลาบนจาน เติมขิง ตะไคร้ มะนาว',
    'นึ่งในลังถึง 15-20 นาที',
    'เสิร์ฟพร้อมผักโขมลวก 100 กรัม มะเขือเทศ 2 ลูก'
  ]
) RETURNING id;

-- Weight Loss Dinner: Clear Soup with Tofu
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'ซุบใสเต้าหู้ (เซ็ตลดน้ำหนัก)',
  'เย็น',
  '🍲',
  20,
  1,
  180,
  ARRAY[
    'ต้มน้ำซุบ 300 มล. ใส่กระเทียม ตะไคร้',
    'ใส่เต้าหู้ขาว 150 กรัม หั่นลูกเต๋า',
  'เติมผักกาดขาว 150 กรัม เห็ดหอม 50 กรัม',
    'ปรุงรสด้วยซีอิ๊วขาว ไม่ใส่น้ำมัน โรยผักชี'
  ]
) RETURNING id;

-- Weight Gain Dinner: Braised Pork with Egg
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'พะโล้ไข่ (เซ็ตเพิ่มน้ำหนัก)',
  'เย็น',
  '🥘',
  45,
  1,
  680,
  ARRAY[
    'ต้มไข่ 3 ฟอง ปอกเปลือก',
    'เจียวหมูสามชั้น 150 กรัม กับขิง กระเทียม',
    'เติมซีอิ๊ว น้ำตาล น้ำซุบ ต้ม 30 นาที',
    'ใส่ไข่ต้มลงไป ต้มต่อ 10 นาที เสิร์ฟกับข้าว 200 กรัม'
  ]
) RETURNING id;

-- Muscle Building Dinner: Beef Stir-fry (using pork as substitute)
INSERT INTO recipes (name, meal_type, image, cook_time, servings, calories, steps)
VALUES (
  'ผัดพริกกระเทียมหมู (เซ็ตเพิ่มกล้ามเนื้อ)',
  'เย็น',
  '🌶️',
  15,
  1,
  580,
  ARRAY[
    'หั่นหมูสันนอก 180 กรัม เป็นชิ้นบาง',
    'เจียวกระเทียมกับน้ำมัน 2 ช้อนชา',
    'ผัดหมูจนสุก ใส่พริก ใบกะเพรา 50 กรัม',
    'ปรุงรส ผัดให้เข้ากัน เสิร์ฟกับข้าวกล้อง 200 กรัม'
  ]
) RETURNING id;
