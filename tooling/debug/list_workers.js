const pool = require('./openspec-mariadb-adapter/db/pool');

async function listAllTestWorkers() {
  try {
    const rows = await pool.query('SELECT id, email, company_id FROM workers WHERE email = ?', ['test@test.com']);
    console.log('Workers found for test@test.com:', rows.length);
    rows.forEach(r => {
      console.log(`- ID: ${r.id}, Company: ${r.company_id}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listAllTestWorkers();
