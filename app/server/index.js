require('dotenv').config({ path: require('path').resolve(__dirname, '../../openspec-mariadb-adapter/.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Routes
const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/workers');
const changesRoutes = require('./routes/changes');
const tasksRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/changes', changesRoutes);
app.use('/api/tasks', tasksRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
