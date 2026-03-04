const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { readDB } = require('../db');
const { validateWorker } = require('../middleware/validate');
const WorkersRepository = require('../../../openspec-mariadb-adapter/db/WorkersRepository');

const scheduleRoutes = require('./schedules');
const vacationRoutes = require('./vacations');
const hoursRoutes = require('./hours');

const router = express.Router();

router.use(requireAuth);

router.use('/:id/schedule', scheduleRoutes);
router.use('/:id/vacations', vacationRoutes);
router.use('/:id/hours', hoursRoutes);

router.get('/company/vacations', (req, res) => {
  const db = readDB();
  const companyWorkers = db.workers.filter(w => w.company === req.user.companyId);
  const workerIds = companyWorkers.map(w => w.id);
  
  const allVacations = [];
  workerIds.forEach(id => {
    const vacts = db.vacations?.[id] || [];
    vacts.forEach(v => {
      allVacations.push({
        ...v,
        workerId: id,
        workerName: companyWorkers.find(w => w.id === id)?.name
      });
    });
  });
  
  res.json(allVacations);
});

router.get('/', async (req, res) => {
  try {
    const workers = await WorkersRepository.findByCompany(req.user.companyId);
    const db = readDB();

    const enriched = workers.map(worker => {
      const vacations = db.vacations?.[worker.id] || [];
      const hours = db.hours?.[worker.id] || [];

      let vacDays = 0;
      let onVacationNow = false;
      const today = new Date();
      today.setHours(0,0,0,0);

      vacations.forEach(v => {
        const s = new Date(v.startDate);
        s.setHours(0,0,0,0);
        const e = new Date(v.endDate);
        e.setHours(23,59,59,999);
        
        if (today >= s && today <= e) {
          onVacationNow = true;
        }
        
        vacDays += Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
      });

      let totalHrs = 0;
      hours.forEach(h => {
        const [h1, m1] = h.startTime.split(':').map(Number);
        const [h2, m2] = h.endTime.split(':').map(Number);
        totalHrs += ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
      });

      return {
        ...worker,
        company: worker.company_id,
        vacationDays: vacDays,
        overtimeHours: parseFloat(totalHrs.toFixed(1)),
        onVacationNow
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('GET /workers error:', err);
    res.status(500).json({ error: 'Error al obtener trabajadores' });
  }
});

router.post('/', validateWorker, async (req, res) => {
  const { id, name, company, department, email, phone, password, schedule } = req.body;
  
  if (company !== req.user.companyId) {
    return res.status(403).json({ error: 'Solo puedes crear trabajadores en tu propia empresa.' });
  }

  try {
    const existing = await WorkersRepository.findById(id);
    if (existing) {
      return res.status(400).json({ error: 'El ID ya existe.' });
    }

    let hash = null;
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(12);
      hash = bcrypt.hashSync(password, salt);
    }

    await WorkersRepository.create({ 
      id, 
      name, 
      companyId: company, 
      department, 
      email, 
      phone, 
      status: 'activo',
      passwordHash: hash
    });

    if (schedule && typeof schedule === 'object' && Object.keys(schedule).length > 0) {
      const { readDB, writeDB } = require('../db');
      const db = readDB();
      db.schedules = db.schedules || {};
      db.schedules[id] = schedule;
      writeDB(db);
    }

    res.status(201).json({ id, name, company, department, email, status: 'activo' });
  } catch (err) {
    console.error('POST /workers error:', err);
    res.status(500).json({ error: 'Error al crear trabajador' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, department, email, phone } = req.body;

  try {
    const worker = await WorkersRepository.findById(id);
    if (!worker || worker.company_id !== req.user.companyId) {
      return res.status(404).json({ error: 'Trabajador no encontrado en tu empresa.' });
    }

    await WorkersRepository.update(id, { name: name || worker.name, department, email, phone });
    const updated = await WorkersRepository.findById(id);
    res.json(updated);
  } catch (err) {
    console.error('PUT /workers/:id error:', err);
    res.status(500).json({ error: 'Error al actualizar trabajador' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await WorkersRepository.delete(id, req.user.companyId);
    if (!deleted) {
      return res.status(404).json({ error: 'Trabajador no encontrado en tu empresa.' });
    }

    // Limpiamos datos relacionados en db.json (vacaciones y horas)
    const { readDB, writeDB } = require('../db');
    const db = readDB();
    if (db.vacations && db.vacations[id]) delete db.vacations[id];
    if (db.hours && db.hours[id]) delete db.hours[id];
    writeDB(db);

    res.json({ message: 'Trabajador eliminado permanentemente' });
  } catch (err) {
    console.error('DELETE /workers/:id error:', err);
    res.status(500).json({ error: 'Error al eliminar trabajador' });
  }
});

router.get('/me', async (req, res) => {
  if (!req.user.isWorker) return res.status(403).json({ error: 'Acceso solo para trabajadores' });

  try {
    const worker = await WorkersRepository.findById(req.user.workerId);
    if (!worker) return res.status(404).json({ error: 'No se encontró tu perfil' });
    
    // Omitimos el hash de la contraseña por seguridad
    const { password_hash, ...profile } = worker;
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
});

router.put('/me', async (req, res) => {
  if (!req.user.isWorker) return res.status(403).json({ error: 'Acceso solo para trabajadores' });

  const { name, email, phone, password, department } = req.body;
  const workerId = req.user.workerId;

  try {
    const worker = await WorkersRepository.findById(workerId);
    if (!worker) return res.status(404).json({ error: 'Perfil no encontrado' });

    let hash = null;
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(12);
      hash = bcrypt.hashSync(password, salt);
    }

    await WorkersRepository.update(workerId, {
      name: name || worker.name,
      department: department || worker.department,
      email: email || worker.email,
      phone: phone || worker.phone,
      passwordHash: hash || worker.password_hash
    });

    res.json({ message: 'Perfil actualizado con éxito' });
  } catch (err) {
    console.error('Update me error:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

module.exports = router;

