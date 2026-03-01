-- Migration: Create reward_redemptions table for tracking points redemptions
-- Created: 2026-03-02

-- Table to store reward redemption records
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id TEXT NOT NULL,
    reward_name TEXT NOT NULL,
    points_used INTEGER NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    order_id TEXT,
    notes TEXT
);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);

-- Trigger to auto-update timestamps
CREATE TRIGGER update_reward_redemptions_modtime 
    BEFORE UPDATE ON reward_redemptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY reward_redemptions_select_policy ON reward_redemptions FOR SELECT USING (true);
CREATE POLICY reward_redemptions_insert_policy ON reward_redemptions FOR INSERT WITH CHECK (true);
CREATE POLICY reward_redemptions_update_policy ON reward_redemptions FOR UPDATE USING (true);
CREATE POLICY reward_redemptions_delete_policy ON reward_redemptions FOR DELETE USING (true);

-- Database function to redeem reward with atomic points deduction
CREATE OR REPLACE FUNCTION redeem_reward(
    p_user_id BIGINT,
    p_reward_id TEXT,
    p_reward_name TEXT,
    p_points_required INTEGER
) RETURNS TABLE(success BOOLEAN, message TEXT, redemption_id BIGINT) AS $$
DECLARE
    v_current_points INTEGER;
    v_redemption_id BIGINT;
BEGIN
    -- Lock user row and get current points
    SELECT points INTO v_current_points
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF v_current_points IS NULL THEN
        RETURN QUERY SELECT FALSE, 'User not found', NULL::BIGINT;
        RETURN;
    END IF;
    
    -- Check if user has enough points
    IF v_current_points < p_points_required THEN
        RETURN QUERY SELECT FALSE, 'Insufficient points', NULL::BIGINT;
        RETURN;
    END IF;
    
    -- Deduct points
    UPDATE users 
    SET points = points - p_points_required
    WHERE id = p_user_id;
    
    -- Create redemption record
    INSERT INTO reward_redemptions (user_id, reward_id, reward_name, points_used, status, expires_at)
    VALUES (p_user_id, p_reward_id, p_reward_name, p_points_required, 'active', timezone('utc'::text, now()) + INTERVAL '90 days')
    RETURNING id INTO v_redemption_id;
    
    RETURN QUERY SELECT TRUE, 'Reward redeemed successfully', v_redemption_id;
END;
$$ LANGUAGE plpgsql;
