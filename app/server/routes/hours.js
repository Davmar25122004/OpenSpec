const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db');
const { checkHoursCollision } = require('../services/hoursCollision');
const WorkersRepository = require('../../../openspec-mariadb-adapter/db/WorkersRepository');

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.hours = db.hours || {};
  res.json(db.hours[id] || []);
});

router.post('/', async (req, res) => {
  const { id } = req.params;
  const { date, startTime, endTime, type } = req.body;
  
  if (!date || !startTime || !endTime || !type) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const worker = await WorkersRepository.findById(id);
    if (!worker || worker.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Trabajador no encontrado en tu empresa' });
    }

    const companyWorkers = await WorkersRepository.findByCompany(req.user.companyId);
    const db = readDB();
    
    // Adaptamos db para que checkHoursCollision use los trabajadores de MariaDB
    const dbForCollision = { 
      ...db, 
      workers: companyWorkers.map(w => ({ ...w, company: w.company_id })) 
    };

    const collision = checkHoursCollision(dbForCollision, req.user.companyId, date, id);
    if (collision) {
      return res.status(409).json({
        error: 'Cupo de horas extra agotado para este día en la empresa.',
        details: `${collision.workerName} ya tiene horas registradas para esta fecha.`
      });
    }
    
    db.hours = db.hours || {};
    db.hours[id] = db.hours[id] || [];
    
    const newHour = { id: crypto.randomUUID(), date, startTime, endTime, type };
    db.hours[id].push(newHour);
    writeDB(db);
    
    res.status(201).json(newHour);
  } catch (err) {
    console.error('POST /hours error:', err);
    res.status(500).json({ error: 'Error al procesar horas extra' });
  }
});

router.delete('/:hrId', (req, res) => {
  const { id, hrId } = req.params;
  const db = readDB();
  
  if (!db.hours || !db.hours[id]) {
    return res.status(404).json({ error: 'No hay horas' });
  }
  
  const index = db.hours[id].findIndex(h => h.id === hrId);
  if (index === -1) {
    return res.status(404).json({ error: 'Horas no encontradas' });
  }
  
  db.hours[id].splice(index, 1);
  writeDB(db);
  res.json({ message: 'Eliminado' });
});

module.exports = router;
