const validator = require('validator');
const { readDB } = require('../db');

function validateWorker(req, res, next) {
  let { id, name, company, department } = req.body;

  if (!id || !name || !company) {
    return res.status(422).json({ error: 'ID, name y company son obligatorios.' });
  }

  // SEC-02: Check duplicates in DB (only if POST)
  if (req.method === 'POST') {
    const db = readDB();
    if (db.workers.some(w => w.id === id)) {
      return res.status(400).json({ error: `El trabajador con ID ${id} ya existe.` });
    }
  }

  // SEC-01: Sanitize
  req.body.id = validator.escape(id.trim());
  req.body.name = validator.escape(name.trim());
  req.body.company = validator.escape(company.trim());
  if (department) {
    req.body.department = validator.escape(department.trim());
  }

  next();
}

function validateSchedule(req, res, next) {
  const schedule = req.body;
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const regex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;

  for (let key in schedule) {
    if (!days.includes(key)) {
      return res.status(422).json({ error: `Día inválido: ${key}` });
    }
    if (!regex.test(schedule[key])) {
      return res.status(422).json({ error: `Formato inválido para ${key}. Usa HH:MM-HH:MM` });
    }
    // No escaping needed: regex already guarantees only digits, colons and hyphens.
  }
  next();
}

module.exports = { validateWorker, validateSchedule };
