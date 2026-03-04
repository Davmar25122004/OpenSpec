const WorkersRepository = require('./openspec-mariadb-adapter/db/WorkersRepository');

async function checkLope() {
  try {
    const worker = await WorkersRepository.findById('EP22');
    console.log('--- WORKER DATA ---');
    console.log(JSON.stringify(worker, null, 2));
    
    if (worker) {
      // Test the exact call from routes/workers.js
      const hash = null;
      const name = worker.name;
      const department = worker.department;
      const email = worker.email;
      const phone = worker.phone;

      console.log('--- TESTING UPDATE CALL ---');
      await WorkersRepository.update('EP22', {
        name: name || worker.name,
        department: department || worker.department,
        email: email || worker.email,
        phone: phone || worker.phone,
        passwordHash: hash || worker.password_hash
      });
      console.log('Update OK');
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit();
  }
}

checkLope();
