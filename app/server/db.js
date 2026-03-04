const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const TMP_PATH = path.join(__dirname, 'data', 'db.json.tmp');

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { workers: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db:', err);
    return { workers: [] };
  }
}

function writeDB(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    // Atomic write (SEC-05)
    fs.writeFileSync(TMP_PATH, json, 'utf8');
    fs.renameSync(TMP_PATH, DB_PATH);
  } catch (err) {
    console.error('Error writing db atomically:', err);
    throw err;
  }
}

module.exports = { readDB, writeDB };
