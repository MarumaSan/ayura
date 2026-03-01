const bcrypt = require('bcryptjs');

async function run() {
    const password = "password123";
    const hash = await bcrypt.hash(password, 12);
    console.log("hash:", hash);
    const match = await bcrypt.compare(password, hash);
    console.log("match:", match);
}
run();
