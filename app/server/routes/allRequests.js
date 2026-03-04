const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const VacationRequestsRepository = require('../../../packages/openspec-mariadb-adapter/db/VacationRequestsRepository');
const HourRequestsRepository = require('../../../packages/openspec-mariadb-adapter/db/HourRequestsRepository');
const WorkersRepository = require('../../../packages/openspec-mariadb-adapter/db/WorkersRepository');

const router = express.Router();
router.use(requireAuth);

router.get('/pending', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const companyWorkers = await WorkersRepository.findByCompany(req.user.companyId);
    const workerIds = companyWorkers.map(w => w.id);

    const [vacations, hours] = await Promise.all([
      VacationRequestsRepository.findAllPending(),
      HourRequestsRepository.findAllPending()
    ]);

    // Tag and filter by company
    const filteredVacations = vacations
      .filter(r => workerIds.includes(r.user_id))
      .map(r => ({ ...r, type: 'vacation' }));

    const filteredHours = hours
      .filter(r => workerIds.includes(r.user_id))
      .map(r => ({ ...r, type: 'hour' }));

    // Combine and sort by date
    const all = [...filteredVacations, ...filteredHours].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    res.json(all);
  } catch (err) {
    console.error('GET /requests/pending error:', err);
    res.status(500).json({ error: 'Error al obtener peticiones pendientes' });
  }
});

module.exports = router;
