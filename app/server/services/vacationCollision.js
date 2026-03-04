/**
 * Verifica si hay colisión de vacaciones entre trabajadores de la misma empresa.
 * Esta validación es crítica para la regla de multitenancyv4 que prohíbe 
 * que dos personas de la misma compañía coincidan en vacaciones el mismo día.
 * 
 * @param {Object} db - Referencia a la base de datos (JSON)
 * @param {string} companyId - ID de la empresa del usuario que solicita
 * @param {string} newStart - Fecha de inicio solicitada (YYYY-MM-DD)
 * @param {string} newEnd - Fecha de fin solicitada (YYYY-MM-DD)
 * @param {string} excludeWorkerId - ID del trabajador que solicita (para no colisionar con sí mismo)
 * @returns {Object|null} Retorna un objeto con los detalles de la colisión si existe, o null si el periodo está libre.
 */
function checkCollision(db, companyId, newStart, newEnd, excludeWorkerId) {
  const startA = new Date(newStart).getTime();
  const endA = new Date(newEnd).getTime();

  for (const worker of db.workers) {
    if (worker.company !== companyId) continue;
    if (worker.id === excludeWorkerId) continue; // Puede solaparse consigo mismo (opcional)

    const vacts = db.vacations?.[worker.id] || [];
    for (const v of vacts) {
      const startB = new Date(v.startDate).getTime();
      const endB = new Date(v.endDate).getTime();

      // Formula: A_start <= B_end AND A_end >= B_start
      if (startA <= endB && endA >= startB) {
        return {
          workerId: worker.id,
          name: worker.name,
          startDate: v.startDate,
          endDate: v.endDate
        };
      }
    }
  }
  return null;
}

module.exports = { checkCollision };
