/**
 * OpenSpec App Entry Point
 * 
 * Este archivo permite ejecutar la aplicación desde la raíz del proyecto
 * con el comando: node index.js
 */

const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '🚀 Iniciando OpenSpec App desde el punto de entrada raíz...');

// Redirigir la ejecución al servidor principal
try {
    require('./app/server/index.js');
} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error al iniciar el servidor:');
    console.error(error);
    process.exit(1);
}
