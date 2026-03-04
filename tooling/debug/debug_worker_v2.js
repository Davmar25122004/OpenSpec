const WorkersRepository = require('./openspec-mariadb-adapter/db/WorkersRepository');
const fs = require('fs');

async function checkLope() {
  try {
    const worker = await WorkersRepository.findById('EP22');
    fs.writeFileSync('worker_data.json', JSON.stringify(worker, null, 2));
    console.log('Worker data written to worker_data.json');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit();
  }
}

checkLope();
