const pool = require('../packages/openspec-mariadb-adapter/db/pool');
const fs = require('fs');

async function checkColumns() {
    try {
        const rows = await pool.query('DESCRIBE users');
        let out = rows.map(r => `Field: ${r.Field}, Type: ${r.Type}`).join('\n');
        fs.writeFileSync('db_info_columns.txt', out);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_info_columns.txt', 'Error: ' + err.message);
        process.exit(1);
    }
}

checkColumns();
