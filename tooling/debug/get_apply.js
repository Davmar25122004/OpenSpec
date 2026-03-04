const cp = require('child_process');
const fs = require('fs');

try {
  const result = cp.execSync('openspec instructions apply --change pedida-vacaciones-trabajadores --json', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
  fs.writeFileSync('c:\\OpennSpec\\apply_utf8.json', result, 'utf-8');
  console.log('Successfully wrote apply_utf8.json');
} catch (e) {
  console.log('Error:', e.message);
  if (e.stdout) console.log('Stdout:', e.stdout);
}
