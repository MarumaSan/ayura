-- Migration: Convert text IDs to serial/bigint for users, communities, topup_requests, recipes
-- Created: 2026-03-02

-- ============================================
-- 1. RECIPES TABLE (Convert text id to bigint)
-- ============================================

-- Create new recipes table with bigint id
CREATE TABLE IF NOT EXISTS recipes_new (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT DEFAULT '🍽️',
    meal_type TEXT CHECK (meal_type = ANY (ARRAY['เช้า'::text, 'กลางวัน'::text, 'เย็น'::text, 'ว่าง'::text])),
    cook_time INTEGER,
    servings INTEGER DEFAULT 1,
    calories DOUBLE PRECISION,
    steps TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate data from old recipes
INSERT INTO recipes_new (name, image, meal_type, cook_time, servings, calories, steps, created_at)
SELECT name, image, meal_type, cook_time, servings, calories, steps, created_at
FROM recipes;

-- Create mapping table for old_id -> new_id
CREATE TABLE IF NOT EXISTS recipes_id_mapping AS
SELECT 
    old.id as old_id,
    new.id as new_id
FROM recipes old
JOIN recipes_new new ON old.name = new.name AND old.created_at = new.created_at;

-- Update recipe_ingredients to use new recipe_ids
ALTER TABLE recipe_ingredients DROP CONSTRAINT IF EXISTS recipe_ingredients_recipe_id_fkey;

-- Add temporary column for bigint recipe_id
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS recipe_id_new BIGINT;

UPDATE recipe_ingredients ri
SET recipe_id_new = rim.new_id
FROM recipes_id_mapping rim
WHERE ri.recipe_id = rim.old_id;

-- Drop old column and rename new
ALTER TABLE recipe_ingredients DROP COLUMN recipe_id;
ALTER TABLE recipe_ingredients RENAME COLUMN recipe_id_new TO recipe_id;

-- Add foreign key constraint
ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_recipe_id_fkey 
    FOREIGN KEY (recipe_id) REFERENCES recipes_new(id) ON DELETE CASCADE;

-- Drop old table and rename new
DROP TABLE IF EXISTS recipes CASCADE;
ALTER TABLE recipes_new RENAME TO recipes;

-- ============================================
-- 2. COMMUNITIES TABLE (Convert text id to bigint)
-- ============================================

CREATE TABLE IF NOT EXISTS communities_new (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate data
INSERT INTO communities_new (name, address, notes, is_active, created_at)
SELECT name, address, notes, is_active, created_at
FROM communities;

-- Create mapping
CREATE TABLE IF NOT EXISTS communities_id_mapping AS
SELECT 
    old.id as old_id,
    new.id as new_id
FROM communities old
JOIN communities_new new ON old.name = new.name AND old.created_at = new.created_at;

-- Update ingredients to use new community_ids
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS community_new BIGINT;

UPDATE ingredients i
SET community_new = cim.new_id
FROM communities_id_mapping cim
WHERE i.community = cim.old_id;

-- For communities that don't match, keep as null or set default
UPDATE ingredients SET community_new = NULL WHERE community_new IS NULL AND community IS NOT NULL;

-- Note: ingredients.community is text referring to community name, not id
-- So we keep it as text for now or rename the column properly

-- Actually, ingredients.community stores the community name, not ID
-- So no need to update ingredients, just drop and rename

DROP TABLE IF EXISTS communities CASCADE;
ALTER TABLE communities_new RENAME TO communities;

-- Drop temporary column
ALTER TABLE ingredients DROP COLUMN IF EXISTS community_new;

-- ============================================
-- 3. TOPUP_REQUESTS TABLE (Convert text id to bigint)
-- ============================================

CREATE TABLE IF NOT EXISTS topup_requests_new (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,  -- Will be updated after users migration
    amount INTEGER NOT NULL,
    slip_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: Need to migrate users first before migrating topup_requests data
-- This will be done in a separate step after users migration

-- ============================================
-- 4. USERS TABLE (Convert text id to bigint)
-- ============================================

-- First, drop foreign key constraints that reference users.id
ALTER TABLE topup_requests DROP CONSTRAINT IF EXISTS topup_requests_user_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Create new users table with bigint id
CREATE TABLE IF NOT EXISTS users_new (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_profile_complete BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    role TEXT DEFAULT 'user',
    bio TEXT,
    gender TEXT,
    age INTEGER,
    weight DOUBLE PRECISION,
    height DOUBLE PRECISION,
    activity_level TEXT,
    health_goal TEXT,
    balance INTEGER DEFAULT 0,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Migrate users data
INSERT INTO users_new (name, email, password, is_profile_complete, points, streak, role, bio, gender, age, weight, height, activity_level, health_goal, balance, phone, created_at, updated_at)
SELECT name, email, password, is_profile_complete, points, streak, role, bio, gender, age, weight, height, activity_level, health_goal, balance, phone, created_at, updated_at
FROM users;

-- Create users mapping
CREATE TABLE IF NOT EXISTS users_id_mapping AS
SELECT 
    old.id as old_id,
    new.id as new_id
FROM users old
JOIN users_new new ON old.email = new.email;

-- ============================================
-- 5. UPDATE FOREIGN KEYS FOR USERS
-- ============================================

-- Add temporary columns
ALTER TABLE topup_requests ADD COLUMN IF NOT EXISTS user_id_new BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id_new BIGINT;

-- Update topup_requests
UPDATE topup_requests tr
SET user_id_new = um.new_id
FROM users_id_mapping um
WHERE tr.user_id = um.old_id;

-- Update orders  
UPDATE orders o
SET user_id_new = um.new_id
FROM users_id_mapping um
WHERE o.user_id = um.old_id;

-- ============================================
-- 6. DROP OLD TABLES AND RENAME NEW ONES
-- ============================================

-- Drop old users
DROP TABLE IF EXISTS users CASCADE;
ALTER TABLE users_new RENAME TO users;

-- Update topup_requests - drop old user_id, rename new
ALTER TABLE topup_requests DROP COLUMN user_id;
ALTER TABLE topup_requests RENAME COLUMN user_id_new TO user_id;

-- Update orders - drop old user_id, rename new
ALTER TABLE orders DROP COLUMN user_id;
ALTER TABLE orders RENAME COLUMN user_id_new TO user_id;

-- Add foreign key constraints back
ALTER TABLE topup_requests ADD CONSTRAINT topup_requests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- 7. NOW MIGRATE TOPUP_REQUESTS DATA
-- ============================================

INSERT INTO topup_requests_new (user_id, amount, slip_url, status, created_at)
SELECT user_id, amount, slip_url, status, created_at
FROM topup_requests;

DROP TABLE IF EXISTS topup_requests CASCADE;
ALTER TABLE topup_requests_new RENAME TO topup_requests;

-- Add foreign key
ALTER TABLE topup_requests ADD CONSTRAINT topup_requests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- 8. CLEAN UP MAPPING TABLES
-- ============================================

DROP TABLE IF EXISTS recipes_id_mapping;
DROP TABLE IF EXISTS communities_id_mapping;
DROP TABLE IF EXISTS users_id_mapping;

-- ============================================
-- 9. UPDATE RLS POLICIES
-- ============================================

-- Re-enable RLS on new tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE topup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies for bigint IDs
CREATE POLICY users_select_policy ON users FOR SELECT USING (true);
CREATE POLICY users_insert_policy ON users FOR INSERT WITH CHECK (true);
CREATE POLICY users_update_policy ON users FOR UPDATE USING (true);
CREATE POLICY users_delete_policy ON users FOR DELETE USING (true);

CREATE POLICY communities_select_policy ON communities FOR SELECT USING (true);
CREATE POLICY communities_insert_policy ON communities FOR INSERT WITH CHECK (true);
CREATE POLICY communities_update_policy ON communities FOR UPDATE USING (true);
CREATE POLICY communities_delete_policy ON communities FOR DELETE USING (true);

CREATE POLICY topup_requests_select_policy ON topup_requests FOR SELECT USING (true);
CREATE POLICY topup_requests_insert_policy ON topup_requests FOR INSERT WITH CHECK (true);
CREATE POLICY topup_requests_update_policy ON topup_requests FOR UPDATE USING (true);
CREATE POLICY topup_requests_delete_policy ON topup_requests FOR DELETE USING (true);

CREATE POLICY recipes_select_policy ON recipes FOR SELECT USING (true);
CREATE POLICY recipes_insert_policy ON recipes FOR INSERT WITH CHECK (true);
CREATE POLICY recipes_update_policy ON recipes FOR UPDATE USING (true);
CREATE POLICY recipes_delete_policy ON recipes FOR DELETE USING (true);

-- ============================================
-- 10. DONE - IDs are now sequential bigints
-- ============================================
