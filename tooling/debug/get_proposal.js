const cp = require('child_process');
const result = cp.spawnSync('npx.cmd', ['openspec', 'instructions', 'proposal', '--change', 'pedida-vacaciones-trabajadores', '--json'], { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf-8' });
console.log(result.stdout);
