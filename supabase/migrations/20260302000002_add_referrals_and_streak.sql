-- Migration: Add referral system and streak tracking
-- Created: 2026-03-02

-- Table for referrals/friend relationships
CREATE TABLE IF NOT EXISTS referrals (
    id BIGSERIAL PRIMARY KEY,
    referrer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    referred_phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'first_order', 'rewarded')),
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_phone ON referrals(referred_phone);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Trigger to auto-update timestamps
CREATE TRIGGER update_referrals_modtime 
    BEFORE UPDATE ON referrals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY referrals_select_policy ON referrals FOR SELECT USING (true);
CREATE POLICY referrals_insert_policy ON referrals FOR INSERT WITH CHECK (true);
CREATE POLICY referrals_update_policy ON referrals FOR UPDATE USING (true);
CREATE POLICY referrals_delete_policy ON referrals FOR DELETE USING (true);

-- Function to calculate streak (consecutive weeks with successful orders)
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    v_streak INTEGER := 0;
    v_last_order_date DATE;
    v_current_week_start DATE;
    v_order_record RECORD;
BEGIN
    -- Get current week's start (Monday)
    v_current_week_start := date_trunc('week', timezone('utc'::text, now()))::DATE;
    
    -- Loop through orders from most recent to oldest
    FOR v_order_record IN
        SELECT 
            date_trunc('week', created_at)::DATE as order_week,
            status
        FROM orders
        WHERE user_id = p_user_id
            AND status = 'จัดส่งสำเร็จ'
        ORDER BY created_at DESC
    LOOP
        -- Check if this order is in the expected week
        IF v_order_record.order_week = v_current_week_start - (v_streak * 7) THEN
            v_streak := v_streak + 1;
        ELSE
            -- Order is not in consecutive week, break the streak
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to award referral points when referred friend makes first order
CREATE OR REPLACE FUNCTION process_referral_points()
RETURNS TRIGGER AS $$
DECLARE
    v_referral RECORD;
    v_referrer RECORD;
BEGIN
    -- Check if this is the referred user's first order
    IF NEW.status = 'จัดส่งสำเร็จ' THEN
        -- Find pending referral for this user (by phone matching)
        SELECT r.*, u.phone as user_phone
        INTO v_referral
        FROM referrals r
        JOIN users u ON u.id = NEW.user_id
        WHERE r.referred_phone = u.phone
            AND r.status IN ('pending', 'registered')
        ORDER BY r.created_at DESC
        LIMIT 1;
        
        IF FOUND THEN
            -- Update referral status
            UPDATE referrals 
            SET status = 'rewarded',
                referred_id = NEW.user_id,
                points_awarded = 50,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_referral.id;
            
            -- Award 50 points to referrer
            UPDATE users 
            SET points = points + 50
            WHERE id = v_referral.referrer_id;
            
            -- Award 50 points to new user (welcome bonus)
            UPDATE users 
            SET points = points + 50
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to process referral points on order completion
DROP TRIGGER IF EXISTS process_referral_points_trigger ON orders;
CREATE TRIGGER process_referral_points_trigger
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'จัดส่งสำเร็จ')
    EXECUTE FUNCTION process_referral_points();

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
    -- Update streak when order is completed
    IF NEW.status = 'จัดส่งสำเร็จ' THEN
        UPDATE users 
        SET streak = calculate_user_streak(NEW.user_id),
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update streak on order completion
DROP TRIGGER IF EXISTS update_streak_trigger ON orders;
CREATE TRIGGER update_streak_trigger
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'จัดส่งสำเร็จ')
    EXECUTE FUNCTION update_user_streak();
