import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGO_URI = 'mongodb+srv://Admin:zxcvbnm1234@cluster0.xqg1dvo.mongodb.net/ayura'; // Hardcoded as per plan
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function main() {
    console.log('Connecting to MongoDB...');
    const mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = mongoClient.db('test');
    console.log('Connected to MongoDB');

    // 1. Migrate Users
    console.log('Migrating users...');
    const usersCol = db.collection('users');
    const mongoUsers = await usersCol.find({}).toArray();

    for (const mu of mongoUsers) {
        const idStr = mu.id || mu._id.toString();

        const suUser = {
            id: idStr,
            name: mu.name || '',
            email: mu.email || '',
            password: mu.password || '', // Hash
            is_profile_complete: mu.isProfileComplete || false,
            points: mu.points || 0,
            streak: mu.streak || 0,
            role: mu.role || 'user',
            bio: mu.bio || null,
            gender: mu.gender || null,
            age: mu.age || null,
            weight: mu.weight || null,
            height: mu.height || null,
            activity_level: mu.activityLevel || null,
            health_goal: Array.isArray(mu.healthGoals) ? mu.healthGoals.join(',') : (mu.healthGoals || null),
            balance: mu.balance || 0,
            phone: mu.phone || null,
            created_at: mu.createdAt ? new Date(mu.createdAt).toISOString() : new Date().toISOString(),
            updated_at: mu.updatedAt ? new Date(mu.updatedAt).toISOString() : new Date().toISOString()
        };

        const { error } = await supabase.from('users').upsert(suUser, { onConflict: 'id' });
        if (error && error.code !== '23505') { // Ignore unique email constraint for now
            console.error(`Error upserting user ${idStr}:`, error);
        }
    }
    console.log(`Migrated ${mongoUsers.length} users.`);

    // 2. Migrate Orders
    console.log('Migrating orders...');
    const ordersCol = db.collection('orders');
    const mongoOrders = await ordersCol.find({}).toArray();

    for (const mo of mongoOrders) {
        const oId = mo._id.toString().trim();
        const userId = mo.userId ? mo.userId.toString().trim() : null;

        const suOrder = {
            id: oId,
            user_id: userId,
            mealset_id: mo.mealSetId || null,
            mealset_name: mo.mealSetName || mo.mealSetId || '',
            plan: mo.plan || 'weekly',
            total_price: mo.totalPrice || 0,
            status: mo.status || 'รอยืนยันการชำระเงิน',
            target_delivery_date: mo.targetDeliveryDate ? new Date(mo.targetDeliveryDate).toISOString() : null,
            box_ingredients: [], // Ignore old recipes array
            created_at: mo.createdAt ? new Date(mo.createdAt).toISOString() : new Date().toISOString(),
            customer_name: mo.customerName || '',
            payment_method: mo.paymentMethod || 'PROMPTPAY',
            address: mo.address || '',
            phone: mo.phone || '',
            box_size: mo.boxSize || 'M',
            size_multiplier: mo.sizeMultiplier || 1.0,
            delivery_date: mo.deliveryDate ? new Date(mo.deliveryDate).toISOString() : null,
        };

        const { error } = await supabase.from('orders').upsert(suOrder, { onConflict: 'id' });
        if (error) {
            console.error(`Error upserting order ${oId}:`, error);
        }
    }
    console.log(`Migrated ${mongoOrders.length} orders.`);

    // 3. Migrate Topups
    console.log('Migrating topups...');
    const topupsCol = db.collection('topuprequests');
    const mongoTopups = await topupsCol.find({}).toArray();

    for (const mt of mongoTopups) {
        const tId = mt._id.toString().trim();
        const userId = mt.userId ? mt.userId.toString().trim() : null;

        const suTopup = {
            id: tId,
            user_id: userId,
            amount: mt.amount || 0,
            slip_url: mt.slipUrl || '',
            status: mt.status || 'pending',
            created_at: mt.createdAt ? new Date(mt.createdAt).toISOString() : new Date().toISOString()
        };
        const { error } = await supabase.from('topup_requests').upsert(suTopup, { onConflict: 'id' });
        if (error) {
            console.error(`Error upserting topup ${tId}:`, error);
        }
    }
    console.log(`Migrated ${mongoTopups.length} topup requests.`);

    console.log('Migration completed successfully!');
    await mongoClient.close();
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
