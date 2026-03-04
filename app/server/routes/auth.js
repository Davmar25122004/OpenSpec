const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const UsersRepository = require('../../../openspec-mariadb-adapter/db/UsersRepository');
const { JWT_SECRET } = require('../middleware/requireAuth');

const router = express.Router();

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  companyId: Joi.string().required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  companyId: Joi.string().required()
});

router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, password, companyId } = value;

  try {
    const existingUser = await UsersRepository.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Usuario ya registrado' });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password, salt);

    await UsersRepository.create({ username, hash, companyId });

    const token = jwt.sign({ username, companyId, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    res.status(201).json({ token, companyId, username, role: 'admin' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Error del servidor en el registro' });
  }
});

router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, password, companyId } = value;

  try {
    console.log('[DEBUG] Admin Login Attempt:', { username, companyId });
    const user = await UsersRepository.findByUsername(username);
    if (!user || user.company_id !== companyId) {
      console.log('[DEBUG] User not found or company mismatch:', user ? 'company mismatch' : 'not found');
      return res.status(401).json({ error: 'Credenciales inválidas o empresa incorrecta' });
    }

    const isValid = bcrypt.compareSync(password, user.hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ username: user.username, companyId: user.company_id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, companyId: user.company_id, username: user.username, role: 'admin' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor en el login' });
  }
});

// ── TRABAJADOR: Registro y Login ──────────────────────────────────────────

const workerAuthSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  companyId: Joi.string().required(),
  department: Joi.string().allow('', null)
});

router.post('/worker/register', async (req, res) => {
  const { error, value } = workerAuthSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { id, name, email, password, companyId, department } = value;
  const WorkersRepo = require('../../../openspec-mariadb-adapter/db/WorkersRepository');

  try {
    const existingById = await WorkersRepo.findById(id);
    const existingByEmail = await WorkersRepo.findByEmail(email);

    let workerToUpdate = null;

    if (existingById) {
      if (existingById.password_hash) {
        return res.status(400).json({ error: 'Trabajador ya registrado (ID duplicado).' });
      }
      if (existingById.company_id !== companyId) {
        return res.status(403).json({ error: 'El ID pertenece a otra empresa.' });
      }
      workerToUpdate = existingById;
    }

    if (existingByEmail) {
      if (existingByEmail.password_hash && (!workerToUpdate || workerToUpdate.id !== existingByEmail.id)) {
        return res.status(400).json({ error: 'Email ya registrado en otra cuenta.' });
      }
      if (!workerToUpdate) workerToUpdate = existingByEmail;
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password, salt);

    if (workerToUpdate) {
      // Actualizamos el trabajador existente con la nueva contraseña
      await WorkersRepo.update(workerToUpdate.id, { 
        name: name || workerToUpdate.name, 
        department: department || workerToUpdate.department, 
        email: email, 
        phone: workerToUpdate.phone, 
        passwordHash: hash 
      });
      const token = jwt.sign({ username: name || workerToUpdate.name, workerId: workerToUpdate.id, companyId, isWorker: true }, JWT_SECRET, { expiresIn: '12h' });
      res.status(200).json({ token, workerId: workerToUpdate.id, name: name || workerToUpdate.name, isWorker: true });
    } else {
      // Creamos uno nuevo
      await WorkersRepo.create({ id, name, companyId, email, department, passwordHash: hash });
      const token = jwt.sign({ username: name, workerId: id, companyId, isWorker: true }, JWT_SECRET, { expiresIn: '12h' });
      res.status(201).json({ token, workerId: id, name, isWorker: true });
    }

  } catch (err) {
    console.error('Worker registration error:', err);
    res.status(500).json({ error: 'Error al registrar trabajador.' });
  }
});

router.post('/worker/login', async (req, res) => {
  const { email, password, companyId } = req.body;
  if (!email || !password || !companyId) return res.status(400).json({ error: 'Datos incompletos' });

  const WorkersRepo = require('../../../openspec-mariadb-adapter/db/WorkersRepository');

  try {
    console.log('[DEBUG] Worker Login Attempt:', { email, companyId });
    const worker = await WorkersRepo.findByEmail(email);
    if (!worker || worker.company_id !== companyId) {
      console.log('[DEBUG] Worker not found or company mismatch:', worker ? 'company mismatch' : 'not found');
      return res.status(401).json({ error: 'Credenciales inválidas o empresa incorrecta' });
    }

    if (!worker.password_hash) {
      return res.status(403).json({ error: 'Este trabajador no tiene cuenta activada (debe registrarse).' });
    }

    const isValid = bcrypt.compareSync(password, worker.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ 
      username: worker.name, 
      workerId: worker.id, 
      companyId: worker.company_id, 
      isWorker: true 
    }, JWT_SECRET, { expiresIn: '12h' });

    res.json({ token, workerId: worker.id, name: worker.name, isWorker: true });

  } catch (err) {
    console.error('Worker login error:', err);
    res.status(500).json({ error: 'Error del servidor en login de trabajador.' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;

