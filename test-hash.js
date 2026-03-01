const bcrypt = require('bcryptjs');

const hash = '$2b$12$btsC.EXPIcibDQ1Z2UmZHeOkyBWPl9aioA2oWfYx3bADSilaGnKiO';

async function test() {
    const passwords = ['password', 'password123', 'admin', 'admin123', '123456', 'ayura123'];
    for (const p of passwords) {
        const match = await bcrypt.compare(p, hash);
        console.log(`${p}: ${match}`);
    }
}
test();
