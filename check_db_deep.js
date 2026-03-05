const pool = require('./packages/openspec-mariadb-adapter/db/pool');

async function checkUsers() {
    try {
        console.log('Checking database...');
        const tables = await pool.query('SHOW TABLES');
        console.log('Tables found:', tables.map(t => Object.values(t)[0]));
        
        const hasUsers = tables.some(t => Object.values(t)[0] === 'users');
        if (hasUsers) {
            const users = await pool.query('SELECT username, company_id FROM users');
            console.log('Users found:', users);
        } else {
            console.log('CRITICAL: Table "users" does NOT exist!');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error during check:', err);
        process.exit(1);
    }
}

checkUsers();
