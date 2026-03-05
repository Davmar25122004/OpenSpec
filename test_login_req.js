const http = require('http');

const data = JSON.stringify({
    username: 'stark',
    password: '123456',
    companyId: 'Stark Industries'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/worker/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', body);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e);
    process.exit(1);
});

req.write(data);
req.end();
