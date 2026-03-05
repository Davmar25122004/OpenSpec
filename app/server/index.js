const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno locales (app/server/.env)
dotenv.config({ path: path.join(__dirname, '.env') });
// Cargar variables de entorno del adaptador MariaDB como fallback
dotenv.config({ path: path.resolve(__dirname, '../../packages/openspec-mariadb-adapter/.env'), override: false });

const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const app = express();

// Rate Limiting Configuration
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Por seguridad, su IP ha sido limitada temporalmente.' }
});

app.use(globalLimiter);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Specific limiter for Auth
app.use('/api/auth', authLimiter);

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const changesRoutes = require('./routes/changes');
const tasksRoutes = require('./routes/tasks');
const vacationRequestsRoutes = require('./routes/vacationRequests');
const hourRequestsRoutes = require('./routes/hourRequests');
const allRequestsRoutes = require('./routes/allRequests');
const clockingRoutes = require('./routes/clocking');

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/changes', changesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/vacation-requests', vacationRequestsRoutes);
app.use('/api/hour-requests', hourRequestsRoutes);
app.use('/api/requests', allRequestsRoutes);
app.use('/api/clocking', clockingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
