/**
 * reset-all-data.js
 * Borra TODOS los datos de todas las empresas de MariaDB y db.json.
 * ¡USO IRREVERSIBLE! Hacer backup antes si es necesario.
 */

const pool = require('../openspec-mariadb-adapter/db/pool');
const fs = require('fs');
const path = require('path');

async function resetAllData() {
  console.log('\n⚠️  Iniciando borrado completo de datos...\n');

  const conn = await pool.getConnection();
  try {
    // Desactivar foreign key checks para borrar en cualquier orden
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = ['hour_requests', 'vacation_requests', 'workers', 'users'];
    for (const table of tables) {
      const result = await conn.query(`DELETE FROM \`${table}\``);
      console.log(`✓ Tabla [${table}]: ${result.affectedRows} filas eliminadas`);
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    conn.release();
  }

  // Resetear db.json
  const dbPath = path.resolve(__dirname, '../app/server/data/db.json');
  if (fs.existsSync(dbPath)) {
    const emptyDb = { workers: [], vacations: {}, hours: {}, schedules: {} };
    fs.writeFileSync(dbPath, JSON.stringify(emptyDb, null, 2));
    console.log('✓ db.json reseteado');
  }

  console.log('\n✅ Todos los datos han sido eliminados correctamente.\n');
  process.exit(0);
}

resetAllData().catch(err => {
  console.error('❌ Error durante el reset:', err.message);
  process.exit(1);
});
