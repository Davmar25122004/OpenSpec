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
    console.log('Creating clock_events table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS clock_events (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        event_type ENUM('ENTRY', 'EXIT') NOT NULL,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        device_id VARCHAR(255) NOT NULL,
        location_lat DECIMAL(10, 8) NOT NULL,
        location_lng DECIMAL(11, 8) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_timestamp (user_id, timestamp),
        FOREIGN KEY (user_id) REFERENCES workers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
    console.log('Table clock_events created/verified in MariaDB.');
  } catch (err) {
    console.error('Error creating table clock_events:', err);
  } finally {
    conn.end();
  }
}

run();
