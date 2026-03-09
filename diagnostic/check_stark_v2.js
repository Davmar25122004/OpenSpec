const pool = require('../packages/openspec-mariadb-adapter/db/pool');
const fs = require('fs');

async function checkUser() {
    try {
        const rows = await pool.query('SELECT * FROM users WHERE username = "stark"');
        fs.writeFileSync('stark_data.json', JSON.stringify(rows[0], null, 2));
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('stark_data.json', JSON.stringify({ error: err.message }));
        process.exit(1);
    }
}

checkUser();
