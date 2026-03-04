const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const ClockingService = require('../services/ClockingService');

const router = express.Router();

router.use(requireAuth);

// Clock In (Entry)
router.post('/entry', async (req, res) => {
  const { device_id, location_coords } = req.body;
  const userId = req.user.workerId;

  if (!userId) {
    return res.status(401).json({ error: 'No se pudo identificar al trabajador en la sesión' });
  }

  if (!device_id || !location_coords || !location_coords.lat || !location_coords.lng) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (device_id, location_coords)' });
  }

  try {
    const result = await ClockingService.registerEntry(userId, {
      deviceId: device_id,
      locationLat: location_coords.lat,
      locationLng: location_coords.lng
    });
    res.status(201).json({ message: 'Entrada registrada correctamente', id: result.insertId });
  } catch (err) {
    console.error('[ERROR] POST /clocking/entry:', err);
    res.status(err.status || 500).json({ error: err.message || 'Error al registrar la entrada' });
  }
});

// Clock Out (Exit)
router.post('/exit', async (req, res) => {
  const { device_id, location_coords } = req.body;
  const userId = req.user.workerId;

  if (!userId) {
    return res.status(401).json({ error: 'No se pudo identificar al trabajador en la sesión' });
  }

  if (!device_id || !location_coords || !location_coords.lat || !location_coords.lng) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (device_id, location_coords)' });
  }

  try {
    const result = await ClockingService.registerExit(userId, {
      deviceId: device_id,
      locationLat: location_coords.lat,
      locationLng: location_coords.lng
    });
    res.status(201).json({ message: 'Salida registrada correctamente', id: result.insertId });
  } catch (err) {
    console.error('[ERROR] POST /clocking/exit:', err);
    res.status(err.status || 500).json({ error: err.message || 'Error al registrar la salida' });
  }
});

// Get Current Status
router.get('/status', async (req, res) => {
  const userId = req.user.workerId;
  console.log('[DEBUG] GET /clocking/status for workerId:', userId);

  if (!userId) {
    return res.status(401).json({ error: 'No se pudo identificar al trabajador' });
  }

  try {
    const events = await ClockingService.getLatestEvents(userId);
    res.json({
      lastEvent: events[0] || null,
      history: events
    });
  } catch (err) {
    console.error('[ERROR] GET /clocking/status:', err);
    res.status(500).json({ error: 'Error al obtener el estado', details: err.message });
  }
});

// Admin: Get history for a worker
router.get('/worker/:id/history', async (req, res) => {
  // Check if admin (this is usually handled by a different middleware but I'll check req.user)
  if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
     // Check if the user is asking for their own ID (optional, but let's stick to admin for now per request)
     if (req.user.workerId !== req.params.id) {
        return res.status(403).json({ error: 'No tienes permiso para ver este historial' });
     }
  }

  try {
    const events = await ClockingService.getLatestEvents(req.params.id, 50); // Increased limit for history
    res.json(events);
  } catch (err) {
    console.error('[ERROR] GET /clocking/worker/:id/history:', err);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
});

module.exports = router;
