// Point to the app/server node_modules
module.paths.push('c:/OpennSpec/app/server/node_modules');
module.paths.push('c:/OpennSpec/packages/openspec-mariadb-adapter/node_modules');

const bcrypt = require('bcryptjs');
const UsersRepository = require('./packages/openspec-mariadb-adapter/db/UsersRepository');

async function testLogin(username, password, companyId) {
    try {
        console.log('Testing login for:', { username, companyId });
        const user = await UsersRepository.findByUsername(username);
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log('User in DB:', { username: user.username, company_id: user.company_id });
        
        if (user.company_id !== companyId) {
            console.log('Company mismatch:', user.company_id, 'vs', companyId);
            return;
        }
        
        const isValid = bcrypt.compareSync(password, user.hash);
        console.log('Password valid:', isValid);
        process.exit(0);
    } catch (err) {
        console.error('CRASHED:', err);
        process.exit(1);
    }
}

// Mimic the failing login from screenshot
testLogin('stark', '123456', 'Stark Industries');
