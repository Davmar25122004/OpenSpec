const pool = require('../packages/openspec-mariadb-adapter/db/pool');

async function checkColumns() {
    try {
        const rows = await pool.query('DESCRIBE users');
        console.log('Columns in users:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkColumns();
