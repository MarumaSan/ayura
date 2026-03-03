-- Add coupon columns to orders table
-- Run this in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
