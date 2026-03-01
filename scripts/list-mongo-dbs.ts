import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const MONGO_URI = 'mongodb+srv://Admin:zxcvbnm1234@cluster0.xqg1dvo.mongodb.net/ayura';

async function listDbs() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const adminDb = client.db('admin').admin();
    const dbs = await adminDb.listDatabases();
    console.log(dbs.databases.map(db => db.name));

    const ayuraDb = client.db('ayura');
    const cols = await ayuraDb.listCollections().toArray();
    console.log('ayura collections:', cols.map(c => c.name));

    const testDb = client.db('test');
    const testCols = await testDb.listCollections().toArray();
    console.log('test collections:', testCols.map(c => c.name));

    await client.close();
}
listDbs().catch(console.error);
