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
      CREATE TABLE IF NOT EXISTS hour_requests (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        date DATE NOT NULL,
        start_time VARCHAR(16) NOT NULL,
        end_time VARCHAR(16) NOT NULL,
        type VARCHAR(64) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_status (user_id, status),
        FOREIGN KEY (user_id) REFERENCES workers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table hour_requests created/verified in LOCAL DB (3306)');
  } catch (err) {
    console.error('Error creating table hour_requests:', err);
  } finally {
    conn.end();
  }
}
run();
