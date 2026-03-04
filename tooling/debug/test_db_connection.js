const mariadb = require('mariadb');
require('dotenv').config({ path: 'c:/OpennSpec/openspec-mariadb-adapter/.env' });

async function test() {
  const pool = mariadb.createPool({
    host: process.env.MARIADB_HOST,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASS,
    database: process.env.MARIADB_DB,
    port: Number(process.env.MARIADB_PORT)
  });

  let conn;
  try {
    conn = await pool.getConnection();
    console.log('Connected to:', process.env.MARIADB_HOST);
    const rows = await conn.query('SHOW TABLES');
    console.log('Tables:', rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (conn) conn.end();
    pool.end();
  }
}

test();
