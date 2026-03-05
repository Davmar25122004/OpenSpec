const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env');
const examplePath = path.join(__dirname, '.env.example');

function generateSecret() {
    return crypto.randomBytes(32).toString('hex');
}

if (!fs.existsSync(envPath)) {
    console.log('📝 Creando archivo .env desde .env.example...');
    
    if (fs.existsSync(examplePath)) {
        let content = fs.readFileSync(examplePath, 'utf8');
        
        // Generar un JWT_SECRET aleatorio y seguro
        const newSecret = generateSecret();
        content = content.replace('your_jwt_secret_here', newSecret);
        
        fs.writeFileSync(envPath, content);
        console.log('✅ Archivo .env creado con un JWT_SECRET aleatorio y seguro.');
    } else {
        console.error('❌ Error: No se encontró el archivo .env.example');
    }
} else {
    console.log('ℹ️ El archivo .env ya existe. No se han realizado cambios.');
}
