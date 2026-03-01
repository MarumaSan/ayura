import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    console.log("TEST ROUTE HIT - Schema Check Psql");
    // Temporarily fix the usr-2 ID with a newline
    const { data: fetchUser, error: fetchErr } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', 'admin@ayura.com')
        .single();

    if (fetchUser && fetchUser.id.includes('\n')) {
        const cleanId = fetchUser.id.trim();
        const { data: updated, error: updateErr } = await supabaseAdmin
            .from('users')
            .update({ id: cleanId })
            .eq('id', fetchUser.id)
            .select();
        return NextResponse.json({ message: 'Fixed newline in ID', updated, error: updateErr });
    }

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(5);

    return NextResponse.json({ data, error });
}
