-- Add target_delivery_date column to orders table
-- Run this in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS target_delivery_date TIMESTAMP WITH TIME ZONE;
