const express = require('express');
const { readDB, writeDB } = require('../db');
const { validateSchedule } = require('../middleware/validate');

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.schedules = db.schedules || {};
  
  const worker = db.workers.find(w => w.id === id && w.company === req.user.companyId);
  if (!worker) return res.status(404).json({ error: 'Trabajador no encontrado' });

  res.json(db.schedules[id] || {});
});

router.put('/', express.json(), validateSchedule, (req, res) => {
  const { id } = req.params;
  const schedule = req.body;
  
  const db = readDB();
  const worker = db.workers.find(w => w.id === id && w.company === req.user.companyId);
  if (!worker) return res.status(404).json({ error: 'Trabajador no encontrado' });

  db.schedules = db.schedules || {};
  db.schedules[id] = schedule;
  writeDB(db);
  
  res.json({ message: 'Horario actualizado', schedule });
});

module.exports = router;
