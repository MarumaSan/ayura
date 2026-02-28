const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb+srv://Admin:zxcvbnm1234@cluster0.xqg1dvo.mongodb.net/ayura', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    const db = mongoose.connection.db;
    
    // Add balance: 0 if missing
    await db.collection('users').updateMany(
        { balance: { $exists: false } },
        { $set: { balance: 0 } }
    );

    // Remove bioAge and realAge
    await db.collection('users').updateMany(
        {}, 
        { $unset: { bioAge: "", realAge: "" } }
    );

    console.log("Database updated successfully");
    process.exit(0);
}

main().catch(console.error);
