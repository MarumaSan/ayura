const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb+srv://Admin:zxcvbnm1234@cluster0.xqg1dvo.mongodb.net/ayura', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    const db = mongoose.connection.db;
    const admin = await db.collection('users').findOne({ role: 'admin' });
    console.log(admin);
    process.exit(0);
}

main().catch(console.error);
