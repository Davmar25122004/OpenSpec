const pool = require('./openspec-mariadb-adapter/db/pool');
const WorkersRepository = require('./openspec-mariadb-adapter/db/WorkersRepository');

async function checkWorker() {
  try {
    const email = 'test@test.com';
    const worker = await WorkersRepository.findByEmail(email);
    console.log('Worker found:', worker ? 'Yes' : 'No');
    if (worker) {
      console.log('ID:', worker.id);
      console.log('Company ID:', worker.company_id);
      console.log('Has Password Hash:', worker.password_hash ? 'Yes' : 'No');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkWorker();
