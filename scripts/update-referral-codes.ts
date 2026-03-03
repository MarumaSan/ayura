import { supabaseAdmin } from '../src/lib/supabase';
import { generateReferralCode } from '../src/lib/referralCodes';

async function updateReferralCodes() {
    try {
        console.log('Updating referral codes to random format...');
        
        // Get all users with simple referral codes (AYURA + number only)
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, referral_code')
            .like('referral_code', 'AYURA%')
            .or('referral_code.notlike.*[A-Z0-9]{3}');
        
        if (error) {
            console.error('Error fetching users:', error);
            return;
        }
        
        console.log(`Found ${users.length} users with simple referral codes`);
        
        for (const user of users) {
            // Check if it's a simple code (AYURA + numbers only)
            if (/^AYURA\d+$/.test(user.referral_code)) {
                const newCode = generateReferralCode(user.id);
                
                console.log(`Updating user ${user.id}: ${user.referral_code} -> ${newCode}`);
                
                const { error: updateError } = await supabaseAdmin
                    .from('users')
                    .update({ referral_code: newCode })
                    .eq('id', user.id);
                
                if (updateError) {
                    console.error(`Error updating user ${user.id}:`, updateError);
                } else {
                    console.log(`✅ Updated user ${user.id} successfully`);
                }
            }
        }
        
        console.log('✅ Referral codes update completed!');
        
    } catch (error) {
        console.error('Script error:', error);
    }
}

updateReferralCodes();
