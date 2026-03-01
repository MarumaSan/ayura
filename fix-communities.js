import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key) env[key] = vals.join('=').trim().replace(/^"|"$/g, '');
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function fix() {
    const { data } = await supabase.from('communities').select('*').order('created_at', { ascending: true });
    if (!data) return;
    for (let i = 0; i < data.length; i++) {
        const com = data[i];
        const newId = `com-${String(i + 1).padStart(3, '0')}`;
        console.log(`Updating ${com.id} -> ${newId}`);
        await supabase.from('communities').update({ id: newId }).eq('id', com.id);
    }
    console.log('done!');
}
fix();
