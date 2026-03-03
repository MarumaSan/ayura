-- Migration: Add updated_at column to reward_redemptions table
-- Created: 2026-03-03
-- Issue: Trigger update_reward_redemptions_modtime references updated_at column that doesn't exist

-- Add the missing updated_at column
ALTER TABLE reward_redemptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Update existing rows to have updated_at value
UPDATE reward_redemptions SET updated_at = redeemed_at WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after setting defaults
ALTER TABLE reward_redemptions ALTER COLUMN updated_at SET NOT NULL;

-- The trigger update_reward_redemptions_modtime should now work correctly
-- It was created in migration 20260302000001_create_reward_redemptions.sql
