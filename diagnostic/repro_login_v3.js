// Point to the app/server node_modules
module.paths.push('c:/OpennSpec/app/server/node_modules');
module.paths.push('c:/OpennSpec/packages/openspec-mariadb-adapter/node_modules');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsersRepository = require('../packages/openspec-mariadb-adapter/db/UsersRepository');

// Mock JWT_SECRET or load it
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'app/server/.env') });
const JWT_SECRET = process.env.JWT_SECRET;

async function testLogin(username, password, companyId) {
    try {
        console.log('Testing login for:', { username, companyId });
        console.log('JWT_SECRET present:', !!JWT_SECRET);
        
        const user = await UsersRepository.findByUsername(username);
        if (!user) {
            console.log('User not found');
            return;
        }
        
        const isValid = bcrypt.compareSync(password, user.hash);
        console.log('Password valid:', isValid);
        
        const token = jwt.sign({ username: user.username, companyId: user.company_id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
        console.log('Token generated successfully');
        
        process.exit(0);
    } catch (err) {
        console.error('CRASHED:', err);
        process.exit(1);
    }
}

testLogin('stark', '123456', 'stark');
