-- Add delivery_date column to orders table for tracking actual delivery completion date
-- Run this in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE;
