import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL or Anon Key is missing from .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mealSets = [
    {
        id: 'set-standard',
        name: 'Ayura Standard Box',
        description: 'เซ็ตมาตรฐานสำหรับครอบครัว รวมผักและโปรตีนพื้นฐานครบถ้วน',
        image: '📦',
        price_weekly: 1290,
        price_monthly: 4900,
        is_active: true,
        avg_calories: 450,
        avg_protein: 25,
        avg_carbs: 40,
        avg_fat: 15,
        ingredients: [
            { id: 'chicken-breast', grams: 500 },
            { id: 'egg', grams: 300 },
            { id: 'jasmine-rice', grams: 1000 },
            { id: 'kale', grams: 200 },
            { id: 'broccoli', grams: 200 },
            { id: 'carrot', grams: 300 }
        ]
    },
    {
        id: 'set-premium',
        name: 'Ayura Premium Box',
        description: 'เซ็ตพรีเมียม รวมวัตถุดิบนำเข้าและอาหารทะเลสดใหม่',
        image: '✨',
        price_weekly: 1890,
        price_monthly: 7200,
        is_active: true,
        avg_calories: 500,
        avg_protein: 35,
        avg_carbs: 30,
        avg_fat: 20,
        ingredients: [
            { id: 'salmon', grams: 400 },
            { id: 'shrimp', grams: 300 },
            { id: 'pork-loin', grams: 400 },
            { id: 'avocado', grams: 200 },
            { id: 'quinoa', grams: 500 },
            { id: 'kale', grams: 300 }
        ]
    },
    {
        id: 'set-keto',
        name: 'Ayura Keto Box',
        description: 'เซ็ตสำหรับคนรักคีโต เน้นโปรตีนและไขมันดี ลดคาร์โบไฮเดรต',
        image: '🥑',
        price_weekly: 1590,
        price_monthly: 5900,
        is_active: true,
        avg_calories: 600,
        avg_protein: 40,
        avg_carbs: 10,
        avg_fat: 45,
        ingredients: [
            { id: 'pork-belly', grams: 500 },
            { id: 'chicken-breast', grams: 400 },
            { id: 'egg', grams: 400 },
            { id: 'avocado', grams: 400 },
            { id: 'spinach', grams: 300 },
            { id: 'broccoli', grams: 200 }
        ]
    }
];

async function seed() {
    console.log('🚀 Seeding Meal Sets...');

    // Clear existing
    await supabase.from('mealset_box_ingredients').delete().neq('mealset_id', 'none');
    await supabase.from('mealsets').delete().neq('id', 'none');

    for (const ms of mealSets) {
        const { error: msError } = await supabase
            .from('mealsets')
            .insert({
                id: ms.id,
                name: ms.name,
                description: ms.description,
                image: ms.image,
                price_weekly: ms.price_weekly,
                price_monthly: ms.price_monthly,
                is_active: ms.is_active,
                avg_nutrition: {
                    calories: ms.avg_calories,
                    protein: ms.avg_protein,
                    carbs: ms.avg_carbs,
                    fat: ms.avg_fat
                }
            });

        if (msError) {
            console.error(`❌ Error inserting meal set ${ms.name}:`, msError.message);
            continue;
        }

        const boxIngs = ms.ingredients.map(ing => ({
            mealset_id: ms.id,
            ingredient_id: ing.id,
            grams_per_week: ing.grams
        }));

        const { error: biError } = await supabase
            .from('mealset_box_ingredients')
            .insert(boxIngs);

        if (biError) {
            console.error(`❌ Error inserting box ingredients for ${ms.name}:`, biError.message);
        }
    }

    console.log('🎉 Done seeding meal sets!');
}

seed().catch(console.error);
