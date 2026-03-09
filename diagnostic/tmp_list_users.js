const pool = require('../packages/openspec-mariadb-adapter/db/pool');

async function listData() {
    try {
        console.log('--- USUARIOS (ADMINS) ---');
        const users = await pool.query('SELECT username, company_id FROM users');
        console.table(users);

        console.log('\n--- TRABAJADORES ---');
        const workers = await pool.query('SELECT id, name, email, company_id FROM workers');
        console.table(workers);

        process.exit(0);
    } catch (err) {
        console.error('Error listing data:', err);
        process.exit(1);
    }
}

listData();
