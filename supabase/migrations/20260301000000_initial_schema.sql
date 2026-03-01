-- 1. Users Table (Using custom UUIDs or string IDs matching legacy "usr-*")
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    role TEXT DEFAULT 'user',
    is_profile_complete BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    health_goals TEXT[],
    age INTEGER,
    weight NUMERIC,
    height NUMERIC,
    gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Communities Table
CREATE TABLE communities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ingredients Table
CREATE TABLE ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_english TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ผัก', 'สมุนไพร', 'ผลไม้', 'โปรตีน', 'ธัญพืช')),
    image TEXT NOT NULL,
    community TEXT, -- Can be linked to communities(id) but stored as text for now
    price_per_100g NUMERIC NOT NULL,
    in_stock NUMERIC DEFAULT 0 NOT NULL,
    note TEXT,
    calories_100g NUMERIC NOT NULL,
    protein_100g NUMERIC NOT NULL,
    carbs_100g NUMERIC NOT NULL,
    fat_100g NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Recipes Table
CREATE TABLE recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT DEFAULT '🍽️',
    meal_type TEXT NOT NULL CHECK (meal_type IN ('เช้า', 'กลางวัน', 'เย็น', 'ว่าง')),
    cook_time INTEGER DEFAULT 20,
    servings INTEGER DEFAULT 1,
    calories NUMERIC DEFAULT 0,
    steps TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recipe Ingredients Mapping (One-to-Many)
CREATE TABLE recipe_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
    grams_used NUMERIC NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MealSets Table
CREATE TABLE mealsets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT DEFAULT '📦',
    price_weekly NUMERIC NOT NULL,
    price_monthly NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avg_calories NUMERIC DEFAULT 0,
    avg_protein NUMERIC DEFAULT 0,
    avg_carbs NUMERIC DEFAULT 0,
    avg_fat NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MealSet Box Ingredients Mapping (One-to-Many)
CREATE TABLE mealset_box_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mealset_id TEXT REFERENCES mealsets(id) ON DELETE CASCADE,
    ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
    grams_per_week NUMERIC NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Orders Table
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    mealset_id TEXT REFERENCES mealsets(id) ON DELETE SET NULL,
    mealset_name TEXT,
    payment_method TEXT CHECK (payment_method IN ('PROMPTPAY', 'WALLET')),
    status TEXT NOT NULL DEFAULT 'รออนุมัติ' CHECK (status IN ('รอยืนยันการชำระเงิน', 'รออนุมัติ', 'รอจัดส่ง', 'กำลังขนส่ง', 'จัดส่งสำเร็จ', 'สำเร็จ', 'ยกเลิก')),
    total_price NUMERIC NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('weekly', 'monthly')),
    box_size TEXT DEFAULT 'M' CHECK (box_size IN ('M', 'L', 'XL')),
    size_multiplier NUMERIC DEFAULT 1.0,
    address TEXT NOT NULL,
    phone TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    target_delivery_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TopupRequests Table
CREATE TABLE topup_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_communities_modtime BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_ingredients_modtime BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_recipes_modtime BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_mealsets_modtime BEFORE UPDATE ON mealsets FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_topup_requests_modtime BEFORE UPDATE ON topup_requests FOR EACH ROW EXECUTE FUNCTION update_modified_column();
