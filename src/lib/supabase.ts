import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase URL or Anon Key is missing from environment variables.');
}

// Ensure the singleton instance is maintained across hot reloads in development
const globalForSupabase = global as unknown as { supabase: SupabaseClient };

export const supabase =
    globalForSupabase.supabase || createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder'
    );

if (process.env.NODE_ENV !== 'production') {
    globalForSupabase.supabase = supabase;
}

// Server-side client with service role key (bypasses RLS)
// This should ONLY be used in API routes, never in client-side code
export const supabaseAdmin = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

