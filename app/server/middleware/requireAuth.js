const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecreto-enproducciondebeserdistinto'; // Simple for demo

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { username, companyId }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión expirada o token inválido.' });
  }
}

module.exports = { requireAuth, JWT_SECRET };
