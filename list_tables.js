const pool = require('./packages/openspec-mariadb-adapter/db/pool');

async function listTables() {
    try {
        const rows = await pool.query('SHOW TABLES');
        rows.forEach(row => console.log('Table:', Object.values(row)[0]));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listTables();
