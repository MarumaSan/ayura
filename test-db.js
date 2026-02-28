const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ayura_db').then(async () => {
    const orders = await mongoose.connection.db.collection('orders').find().toArray();
    console.log(JSON.stringify(orders, null, 2));
    process.exit(0);
}).catch(console.error);
