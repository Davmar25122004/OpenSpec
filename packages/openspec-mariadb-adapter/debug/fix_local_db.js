const mariadb = require('mariadb');
async function run() {
  const conn = await mariadb.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '1234',
    database: 'openspec'
  });
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS vacation_requests (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_status (user_id, status)
      ) ENGINE=InnoDB;
    `);
    console.log('Table vacation_requests created/verified in LOCAL DB (3306)');
  } catch (err) {
    console.error('Error creating table in local DB:', err);
  } finally {
    conn.end();
  }
}
run();
