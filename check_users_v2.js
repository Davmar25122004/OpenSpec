const pool = require('./packages/openspec-mariadb-adapter/db/pool');

async function checkColumns() {
    try {
        const rows = await pool.query('DESCRIBE users');
        rows.forEach(r => console.log(`Field: ${r.Field}, Type: ${r.Type}`));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkColumns();
