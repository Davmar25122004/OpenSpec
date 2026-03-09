module.paths.push('c:/OpennSpec/app/server/node_modules');
module.paths.push('c:/OpennSpec/packages/openspec-mariadb-adapter/node_modules');

const bcrypt = require('bcryptjs');
const UsersRepository = require('../packages/openspec-mariadb-adapter/db/UsersRepository');

async function createInternalUser() {
    try {
        const username = 'testadmin';
        const password = 'password123';
        const companyId = 'testcompany';
        
        const salt = bcrypt.genSaltSync(12);
        const hash = bcrypt.hashSync(password, salt);
        
        await UsersRepository.create({ username, hash, companyId });
        console.log('User testadmin created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createInternalUser();
