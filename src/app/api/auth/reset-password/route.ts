import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, phone, newPassword } = await request.json();

        if (!email || !phone || !newPassword) {
            return NextResponse.json(
                { error: 'Email, phone, and new password are required' },
                { status: 400 }
            );
        }

        // 1. Verify user exists with matching email and phone
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.trim().toLowerCase())
            .eq('phone', phone.trim())
            .single();

        if (fetchError || !user) {
            return NextResponse.json(
                { error: 'ข้อมูลไม่ถูกต้อง (อีเมลหรือเบอร์โทรศัพท์ไม่ตรงกัน)' },
                { status: 401 }
            );
        }

        // 2. Hash the new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

        // 3. Update the password in database
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', user.id);

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json(
                { error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Password reset successful'
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Reset password failed', details: error.message },
            { status: 500 }
        );
    }
}
