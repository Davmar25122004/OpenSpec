const pool = require('./db/pool');

async function check() {
  try {
    const conn = await pool.getConnection();
    const changes = await conn.query('SELECT id, status FROM changes');
    console.log('--- CHANGES ---');
    console.table(changes);
    
    const tasks = await conn.query('SELECT title, done, order_index FROM tasks WHERE change_id="mariadb-persistence-migration" LIMIT 5');
    console.log('\n--- FIRST 5 TASKS OF mariadb-persistence-migration ---');
    console.table(tasks);
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
