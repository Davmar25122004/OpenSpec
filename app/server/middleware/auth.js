'use strict';
/**
 * auth.js — Middleware de verificación JWT
 * Retorna 401 si no hay token o es inválido/expirado.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../routes/auth'); // O variable de entorno

/**
 * Middleware requireAuth
 * Extrae el Bearer token, lo verifica y permite o deniega la petición.
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next()
 * @returns {void|Response} Llama a next() si aprueba, o envía respuesta 401
 * @example
 * router.post('/', requireAuth, validateWorker, (req, res) => { ... })
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado: falta Bearer token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Si la firma o tiempo es inválido, lanzará excepción
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adjuntamos data del token por si se necesita
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado. Por favor, vuelva a iniciar sesión.' });
  }
}

module.exports = { requireAuth };
