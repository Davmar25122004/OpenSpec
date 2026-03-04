const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config({ path: './app/server/.env' });
const JWT_SECRET = 'IIHpF3Z7XaWiwzgM9kEIN4EkSQOsWNYRRq3X09g==+0sVpNJfQzYxB8eLrDmTkuAhCwGbFiE3Z7XaWiwz';

async function testStatus() {
  const token = jwt.sign({ 
    username: 'stars', 
    workerId: 'emp2222', 
    companyId: 'stark', 
    isWorker: true 
  }, JWT_SECRET, { expiresIn: '12h' });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/clocking/status',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Status Response:', body);
    });
  });

  req.on('error', (err) => {
    console.error('Test Failed:', err.message);
  });

  req.end();
}

testStatus();
