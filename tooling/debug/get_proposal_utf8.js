const cp = require('child_process');
const fs = require('fs');

try {
  const result = cp.execSync('openspec instructions proposal --change pedida-vacaciones-trabajadores --json', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
  fs.writeFileSync('c:\\OpennSpec\\proposal_utf8.json', result, 'utf-8');
  console.log('Successfully wrote proposal.json');
} catch (e) {
  console.log('Error:', e.message);
  if (e.stdout) console.log('Stdout:', e.stdout);
}
