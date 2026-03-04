const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const HourRequestsRepository = require('../../../packages/openspec-mariadb-adapter/db/HourRequestsRepository');
const WorkersRepository = require('../../../packages/openspec-mariadb-adapter/db/WorkersRepository');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db');
const { checkHoursCollision } = require('../services/hoursCollision');

const router = express.Router();

router.use(requireAuth);

// Submit request (Worker)
router.post('/worker/:workerId', async (req, res) => {
  const { workerId } = req.params;
  const { date, startTime, endTime, type } = req.body;

  console.log('[DEBUG] Incoming Hour Request:', { workerId, date, startTime, endTime, type });

  if (req.user.role !== 'admin' && req.user.workerId !== workerId) {
    console.log('[DEBUG] Access Denied:', { user: req.user, target: workerId });
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const VALID_TYPES = ['Extra', 'Nocturna', 'Festiva'];
  const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!date || !startTime || !endTime || !type) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
    return res.status(400).json({ error: 'Formato de hora inválido. Use HH:MM' });
  }
  if (startTime >= endTime) {
    return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la de fin' });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `Tipo inválido. Valores permitidos: ${VALID_TYPES.join(', ')}` });
  }

  try {
    await HourRequestsRepository.insert({ userId: workerId, date, startTime, endTime, type });
    res.status(201).json({ message: 'Petición de horas enviada' });
  } catch (err) {
    console.error('[ERROR] POST /hour-requests:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: 'Error interno del servidor. Por favor contacta con soporte.' });
  }
});

// Get worker requests
router.get('/worker/:workerId', async (req, res) => {
  const { workerId } = req.params;
  
  if (req.user.role !== 'admin' && req.user.workerId !== workerId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const requests = await HourRequestsRepository.findByWorker(workerId);
    res.json(requests);
  } catch (err) {
    console.error('GET /hour-requests/worker error:', err);
    res.status(500).json({ error: 'Error al obtener peticiones' });
  }
});

// Approve/Reject (Admin)
router.put('/:id/status', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const request = await HourRequestsRepository.findById(id);
    if (!request) return res.status(404).json({ error: 'Petición no encontrada' });

    if (status === 'approved') {
      const worker = await WorkersRepository.findById(request.user_id);
      if (!worker || worker.company_id !== req.user.companyId) {
        return res.status(404).json({ error: 'Trabajador no válido' });
      }

      const companyWorkers = await WorkersRepository.findByCompany(req.user.companyId);
      const db = readDB();
      const dbForCollision = { 
        ...db, 
        workers: companyWorkers.map(w => ({ ...w, company: w.company_id })) 
      };

      const collision = checkHoursCollision(dbForCollision, req.user.companyId, request.date, request.user_id);
      if (collision) {
        return res.status(409).json({ 
          error: 'Colisión de horas o cupo agotado.',
          details: `${collision.workerName} ya tiene horas registradas.`
        });
      }

      // Add to actual hours
      db.hours = db.hours || {};
      db.hours[request.user_id] = db.hours[request.user_id] || [];
      db.hours[request.user_id].push({
        id: crypto.randomUUID(),
        date: request.date,
        startTime: request.start_time,
        endTime: request.end_time,
        type: request.type
      });
      writeDB(db);
    }

    await HourRequestsRepository.updateStatus(id, status);
    res.json({ message: `Petición ${status} correctamente` });
  } catch (err) {
    console.error('PUT /hour-requests error:', err);
    res.status(500).json({ error: 'Error al actualizar petición' });
  }
});

module.exports = router;
