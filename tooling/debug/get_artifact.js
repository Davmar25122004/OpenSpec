const cp = require('child_process');
const fs = require('fs');
const artifact = process.argv[2];

try {
  const result = cp.execSync(`openspec instructions ${artifact} --change pedida-vacaciones-trabajadores --json`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
  fs.writeFileSync(`c:\\OpennSpec\\${artifact}_utf8.json`, result, 'utf-8');
  console.log(`Successfully wrote ${artifact}_utf8.json`);
} catch (e) {
  console.log('Error:', e.message);
  if (e.stdout) console.log('Stdout:', e.stdout);
}
