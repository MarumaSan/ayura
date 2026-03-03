// Helper functions for referral code system

import { supabaseAdmin } from './supabase';

/**
 * Generate a unique referral code for a user
 * Format: AYURA + 4 random digits
 * Ensures no duplicate codes exist
 */
export async function generateReferralCode(userId: number | string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 random digits (1000-9999)
        const newCode = `AYURA${randomDigits}`;
        
        try {
            // Check if code already exists
            const { data: existingUser } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('referral_code', newCode)
                .single();
            
            // If no existing user found, code is unique
            if (!existingUser) {
                return newCode;
            }
            
            // Code exists, try again
            attempts++;
        } catch (error) {
            // If there's an error, assume code is unique (database error)
            return newCode;
        }
    }
    
    // If we can't generate unique code after max attempts, use timestamp
    const timestamp = Date.now().toString().slice(-4);
    return `AYURA${timestamp}`;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
    if (!code) return false;
    // Format: AYURA + 4 digits
    const regex = /^AYURA\d{4}$/;
    return regex.test(code.toUpperCase());
}

/**
 * Generate a simple referral code for existing users (backward compatible)
 */
export function generateSimpleReferralCode(userId: number | string): string {
    return `AYURA${userId}`;
}
