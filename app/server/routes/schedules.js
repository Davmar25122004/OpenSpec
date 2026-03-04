const express = require('express');
const { readDB, writeDB } = require('../db');
const { validateSchedule } = require('../middleware/validate');

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.schedules = db.schedules || {};
  
  const WorkersRepository = require('../../../packages/openspec-mariadb-adapter/db/WorkersRepository');
  const worker = await WorkersRepository.findById(id);
  
  if (!worker || worker.company_id !== req.user.companyId) {
    return res.status(404).json({ error: 'Trabajador no encontrado en tu empresa.' });
  }

  res.json(db.schedules[id] || {});
});

router.put('/', express.json(), validateSchedule, async (req, res) => {
  const { id } = req.params;
  const schedule = req.body;
  
  const WorkersRepository = require('../../../packages/openspec-mariadb-adapter/db/WorkersRepository');
  const worker = await WorkersRepository.findById(id);

  if (!worker || worker.company_id !== req.user.companyId) {
    return res.status(404).json({ error: 'Trabajador no encontrado en tu empresa.' });
  }

  const db = readDB();
  db.schedules = db.schedules || {};
  db.schedules[id] = schedule;
  writeDB(db);
  
  res.json({ message: 'Horario actualizado', schedule });
});

module.exports = router;
