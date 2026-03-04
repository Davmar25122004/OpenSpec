const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const VacationRequestsRepository = require('../../../packages/openspec-mariadb-adapter/db/VacationRequestsRepository');
const WorkersRepository = require('../../../packages/openspec-mariadb-adapter/db/WorkersRepository');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db');
const { checkCollision } = require('../services/vacationCollision');

const router = express.Router();

// Middleware auth
router.use(requireAuth);

// 2.3 Create GET endpoint for admins to fetch all pending requests
router.get('/pending', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  try {
    const requests = await VacationRequestsRepository.findAllPending();
    const companyWorkers = await WorkersRepository.findByCompany(req.user.companyId);
    const workerIds = companyWorkers.map(w => w.id);
    const filteredRequests = requests.filter(r => workerIds.includes(r.user_id));
    
    res.json(filteredRequests);
  } catch (err) {
    console.error('GET /vacation-requests/pending error:', err);
    res.status(500).json({ error: 'Error fetching pending requests' });
  }
});

// 2.2 Create GET endpoint to retrieve requests for a specific worker
router.get('/worker/:workerId', async (req, res) => {
  const { workerId } = req.params;
  
  if (req.user.role !== 'admin' && req.user.workerId !== workerId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const requests = await VacationRequestsRepository.findByWorker(workerId);
    res.json(requests);
  } catch (err) {
    console.error('GET /vacation-requests/worker error:', err);
    res.status(500).json({ error: 'Error fetching worker requests' });
  }
});

// 2.1 Create POST endpoint for workers to submit a vacation request
router.post('/worker/:workerId', async (req, res) => {
  const { workerId } = req.params;
  const { startDate, endDate } = req.body;

  if (req.user.role !== 'admin' && req.user.workerId !== workerId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate y endDate son obligatorios' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
  }
  if (start >= end) {
    return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la de fin' });
  }

  try {
    await VacationRequestsRepository.insert({ userId: workerId, startDate, endDate });
    res.status(201).json({ message: 'Solicitud de vacaciones enviada correctamente' });
  } catch (err) {
    console.error('[ERROR] POST /vacation-requests:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: 'Error interno del servidor. Por favor contacta con soporte.' });
  }
});

// 2.5 Create PUT endpoints for admins to approve/reject a request
// 2.6 Integrate approval logic to assign actual vacation days
router.put('/:id/status', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const request = await VacationRequestsRepository.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (status === 'approved') {
      // 2.6 Evaluate collisions and apply actual vacation
      const worker = await WorkersRepository.findById(request.user_id);
      if (!worker || worker.company_id !== req.user.companyId) {
        return res.status(404).json({ error: 'Trabajador no encontrado o de otra empresa' });
      }

      const companyWorkers = await WorkersRepository.findByCompany(req.user.companyId);
      const db = readDB();
      const dbForCollision = { 
        ...db, 
        workers: companyWorkers.map(w => ({ ...w, company: w.company_id })) 
      };

      // For checkCollision we need the string format YYYY-MM-DD
      const startStr = new Date(request.start_date).toISOString().split('T')[0];
      const endStr = new Date(request.end_date).toISOString().split('T')[0];

      const collision = checkCollision(dbForCollision, req.user.companyId, startStr, endStr, request.user_id);
      if (collision) {
        return res.status(409).json({ 
          error: 'Colisión de vacaciones detectada en la misma empresa. No se puede aprobar.',
          collision 
        });
      }

      // Add actual vacation
      db.vacations = db.vacations || {};
      db.vacations[request.user_id] = db.vacations[request.user_id] || [];

      const newVacation = { id: crypto.randomUUID(), startDate: startStr, endDate: endStr };
      db.vacations[request.user_id].push(newVacation);
      writeDB(db);
    }

    await VacationRequestsRepository.updateStatus(id, status);
    res.json({ message: `Request ${status} successfully` });
  } catch (err) {
    console.error(`PUT /vacation-requests/${req.params.id}/status error:`, err);
    res.status(500).json({ error: 'Error updating status' });
  }
});

module.exports = router;
