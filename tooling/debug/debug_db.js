const pool = require('./openspec-mariadb-adapter/db/pool');
const { readDB } = require('./app/server/db');
const fs = require('fs');

async function debug() {
  let output = '';
  try {
    output += '--- MariaDB Workers ---\n';
    const workers = await pool.query('SELECT id, name, company_id FROM workers');
    output += JSON.stringify(workers, null, 2) + '\n';

    output += '\n--- JSON Schedules ---\n';
    const db = readDB();
    output += JSON.stringify(db.schedules || {}, null, 2) + '\n';

    output += '\n--- Recent Clocking Events ---\n';
    const events = await pool.query('SELECT * FROM clock_events ORDER BY timestamp DESC LIMIT 5');
    output += JSON.stringify(events, null, 2) + '\n';

    fs.writeFileSync('db_debug.log', output);
    console.log('Debug written to db_debug.log');

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

debug();
