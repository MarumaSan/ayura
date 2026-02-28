require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function updateDB() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = mongoose.connection.db;
    
    const updateBalance = await db.collection('users').updateMany(
        { balance: { $exists: false } },
        { $set: { balance: 0 } }
    );
    console.log("Balance updates:", updateBalance.modifiedCount);

    const updateAges = await db.collection('users').updateMany(
        {}, 
        { $unset: { bioAge: "", realAge: "" } }
    );
    console.log("Age unsets:", updateAges.modifiedCount);
    
    process.exit(0);
}

updateDB().catch(console.error);
