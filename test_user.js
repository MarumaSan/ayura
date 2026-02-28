require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = mongoose.connection.db;
    const admin = await db.collection('users').findOne({ id: 'user-001' });
    console.log(admin);
    process.exit(0);
}

check().catch(console.error);
