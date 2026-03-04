-- Add protein, carbs, fat columns to recipes table
ALTER TABLE recipes
    ADD COLUMN IF NOT EXISTS protein NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS carbs NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS fat NUMERIC DEFAULT 0;
