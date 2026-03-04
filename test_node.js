const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.status, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  try {
     const r = await post('http://localhost:3000/api/auth/worker/register', {
       id: 'W-' + Date.now(),
       name: 'Juan Test',
       email: 'juan@test.com',
       password: 'password123',
       companyId: 'stark'
     });
     console.log('RESULT:', r);
  } catch (e) { console.error('FAIL:', e.message); }
}
test();
