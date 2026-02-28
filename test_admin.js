const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb+srv://Admin:zxcvbnm1234@cluster0.xqg1dvo.mongodb.net/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    const db = mongoose.connection.db;
    const allUsers = await db.collection('users').find({}).toArray();
    console.log(allUsers.filter(u => u.email.includes('admin') || u.role === 'admin'));
    process.exit(0);
}

main().catch(console.error);
