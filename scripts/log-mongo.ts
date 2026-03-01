import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const MONGO_URI = 'mongodb+srv://Admin:zxcvbnm1234@cluster0.xqg1dvo.mongodb.net/ayura';

async function logMongoUser() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('test');
    const u = await db.collection('users').findOne({});
    console.log('User:', u);
    const o = await db.collection('orders').findOne({});
    console.log('Order:', o);
    const t = await db.collection('topuprequests').findOne({});
    console.log('Topup:', t);
    await client.close();
}
logMongoUser().catch(console.error);
