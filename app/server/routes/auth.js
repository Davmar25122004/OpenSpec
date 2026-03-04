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
    const user = await UsersRepository.findByUsername(username);
    if (!user || user.company_id !== companyId) {
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

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;

