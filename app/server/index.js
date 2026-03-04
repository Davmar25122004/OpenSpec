require('dotenv').config({ path: require('path').resolve(__dirname, '../../packages/openspec-mariadb-adapter/.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

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
