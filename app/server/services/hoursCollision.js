/**
 * Verifica si ya hay horas extra registradas para una empresa en una fecha específica.
 * Según la regla de 'quota única', solo un empleado por empresa puede registrar
 * horas extra en un día determinado.
 * 
 * @param {Object} db - Instancia de la base de datos
 * @param {string} companyId - ID de la compañía
 * @param {string} date - Fecha a comprobar (YYYY-MM-DD)
 * @param {string} excludeWorkerId - ID del trabajador actual para permitirle editar sus propias horas si fuera necesario
 * @returns {Object|null} El registro de horas que causa la colisión o null
 */
function checkHoursCollision(db, companyId, date, excludeWorkerId) {
  const companyWorkers = db.workers.filter(w => w.company === companyId);
  
  for (const worker of companyWorkers) {
    if (worker.id === excludeWorkerId) continue;
    
    const workerHours = db.hours?.[worker.id] || [];
    const collision = workerHours.find(h => h.date === date);
    
    if (collision) {
      return {
        workerId: worker.id,
        workerName: worker.name,
        date: collision.date,
        type: collision.type
      };
    }
  }
  
  return null;
}

module.exports = { checkHoursCollision };
