const fetch = require('node-fetch');

async function testWorkerFlow() {
  const companyId = 'acme';
  const workerData = {
    id: 'TEST-WORKER-' + Date.now(),
    name: 'Test Worker',
    email: 'test' + Date.now() + '@acme.com',
    password: 'password123',
    companyId: companyId
  };

  console.log('--- TEST: WORKER REGISTRATION ---');
  const regRes = await fetch('http://localhost:3000/api/auth/worker/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workerData)
  });
  const regResult = await regRes.json();
  console.log('Register status:', regRes.status, regResult);

  if (regRes.ok) {
    const token = regResult.token;
    console.log('--- TEST: WORKER GET ME ---');
    const meRes = await fetch('http://localhost:3000/api/workers/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Get Me status:', meRes.status, await meRes.json());
    
    console.log('--- TEST: WORKER UPDATE PROFILE ---');
    const updateRes = await fetch('http://localhost:3000/api/workers/me', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Updated Worker Name', phone: '123456789' })
    });
    console.log('Update status:', updateRes.status, await updateRes.json());
  }
}

testWorkerFlow();
