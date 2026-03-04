const mariadb = require('mariadb');
require('dotenv').config({ path: '../../openspec-mariadb-adapter/.env' });

async function test() {
  console.log('Env variables:', {
    host: process.env.MARIADB_HOST,
    user: process.env.MARIADB_USER,
    db: process.env.MARIADB_DB,
    port: process.env.MARIADB_PORT
  });

  const pool = mariadb.createPool({
    host: process.env.MARIADB_HOST || '127.0.0.1',
    user: process.env.MARIADB_USER || 'root',
    password: process.env.MARIADB_PASS || '1234',
    database: process.env.MARIADB_DB || 'openspec',
    port: Number(process.env.MARIADB_PORT) || 3306
  });

  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Successfully connected to:', process.env.MARIADB_DB);
    const rows = await conn.query('SHOW TABLES');
    console.log('Tables found:', rows.map(r => Object.values(r)[0]));
  } catch (err) {
    console.error('Connection Error Details:', err);
  } finally {
    if (conn) conn.end();
    pool.end();
  }
}

test();
