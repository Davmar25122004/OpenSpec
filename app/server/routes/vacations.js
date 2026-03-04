const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../db');
const { checkCollision } = require('../services/vacationCollision');
const WorkersRepository = require('../../../openspec-mariadb-adapter/db/WorkersRepository');

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.vacations = db.vacations || {};
  res.json(db.vacations[id] || []);
});

router.post('/', async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.body;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate y endDate son obligatorios' });
  }

  try {
    const worker = await WorkersRepository.findById(id);
    if (!worker || worker.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Trabajador no encontrado en tu empresa' });
    }

    const companyWorkers = await WorkersRepository.findByCompany(req.user.companyId);
    const db = readDB();
    
    // Adaptamos db para que checkCollision use los workers de MariaDB
    const dbForCollision = { 
      ...db, 
      workers: companyWorkers.map(w => ({ ...w, company: w.company_id })) 
    };

    const collision = checkCollision(dbForCollision, req.user.companyId, startDate, endDate, id);
    if (collision) {
      return res.status(409).json({ 
        error: 'Colisión de vacaciones detectada en la misma empresa.',
        collision 
      });
    }

    db.vacations = db.vacations || {};
    db.vacations[id] = db.vacations[id] || [];

    const newVacation = { id: crypto.randomUUID(), startDate, endDate };
    db.vacations[id].push(newVacation);
    writeDB(db);
    
    res.status(201).json(newVacation);
  } catch (err) {
    console.error('POST /vacations error:', err);
    res.status(500).json({ error: 'Error al procesar vacaciones' });
  }
});

router.delete('/:vacId', (req, res) => {
  const { id, vacId } = req.params;
  const db = readDB();
  
  if (!db.vacations || !db.vacations[id]) {
    return res.status(404).json({ error: 'No hay vacaciones' });
  }
  
  const index = db.vacations[id].findIndex(v => v.id === vacId);
  if (index === -1) {
    return res.status(404).json({ error: 'Vacaciones no encontradas' });
  }

  db.vacations[id].splice(index, 1);
  writeDB(db);
  res.json({ message: 'Eliminado' });
});

module.exports = router;
