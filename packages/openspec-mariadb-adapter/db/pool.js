const mariadb = require('mariadb');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = mariadb.createPool({
  host: process.env.MARIADB_HOST || '127.0.0.1',
  port: Number(process.env.MARIADB_PORT) || 3306,
  user: process.env.MARIADB_USER || 'openspec_app',
  password: process.env.MARIADB_PASS || 'openspec_pass',
  database: process.env.MARIADB_DB || 'openspec',
  connectionLimit: Number(process.env.MARIADB_POOL_SIZE) || 5,
  acquireTimeout: 10000,
  idleTimeout: 60000,
  connectTimeout: 5000,
  insertIdAsNumber: true,
  bigIntAsNumber: true
});

if (process.env.MARIADB_POOL_LOG === 'true') {
  pool.on('connection', () => console.log('[DB] Connection established'));
  pool.on('enqueue', () => console.log('[DB] Waiting for connection'));
}

module.exports = pool;
