const pool = require('./packages/openspec-mariadb-adapter/db/pool');

async function checkTables() {
    try {
        const rows = await pool.query('SHOW TABLES');
        console.log('Tables in DB:', JSON.stringify(rows));
        process.exit(0);
    } catch (err) {
        console.error('Error checking tables:', err);
        process.exit(1);
    }
}

checkTables();
