import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidReferralCode } from '@/lib/referralCodes';

// Validate referral code
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code || !isValidReferralCode(code)) {
            return NextResponse.json(
                { valid: false, error: 'Invalid referral code format' },
                { status: 400 }
            );
        }

        // Find user by referral code
        const { data: referrer, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, referral_code')
            .eq('referral_code', code.toUpperCase())
            .single();

        if (error || !referrer) {
            return NextResponse.json(
                { valid: false, error: 'Referral code not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            valid: true,
            referrer: {
                id: referrer.id,
                name: referrer.name,
                referralCode: referrer.referral_code
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { valid: false, error: 'Failed to validate referral code' },
            { status: 500 }
        );
    }
}
