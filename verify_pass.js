const path = require('path');
const bcrypt = require(path.join(__dirname, 'app/server/node_modules/bcryptjs'));
const pool = require('./openspec-mariadb-adapter/db/pool');
const WorkersRepository = require('./openspec-mariadb-adapter/db/WorkersRepository');

async function verifyPassword() {
  try {
    const email = 'test@test.com';
    const passwordAttempt = 'acme123';
    const worker = await WorkersRepository.findByEmail(email);
    
    if (!worker) {
      console.log('Worker NOT found');
      process.exit(0);
    }

    console.log('Worker found:', worker.id);
    console.log('Stored Hash:', worker.password_hash);
    
    const isValid = bcrypt.compareSync(passwordAttempt, worker.password_hash);
    console.log('Password "acme123" is valid:', isValid ? 'YES' : 'NO');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

verifyPassword();
