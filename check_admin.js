const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb+srv://admin:ayuraDB123@ayura.nnsg1.mongodb.net/ayura_app?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    // Check users
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({ role: 'admin' }).toArray();
    console.log(users);
    
    process.exit(0);
}

main().catch(console.error);
