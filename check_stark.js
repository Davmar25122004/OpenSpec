const pool = require('./packages/openspec-mariadb-adapter/db/pool');

async function checkUserHash() {
    try {
        const rows = await pool.query('SELECT * FROM users WHERE username = "stark"');
        console.log('User stark:', JSON.stringify(rows[0], null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUserHash();
