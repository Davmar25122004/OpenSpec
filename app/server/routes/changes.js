const express = require('express');
const router = express.Router();
const joi = require('joi');
const validate = require('../middleware/joiValidate');
const ChangesRepository = require('../../../openspec-mariadb-adapter/db/ChangesRepository');

// Validation schemas
const createChangeSchema = joi.object({
  id: joi.string().max(128).required(),
  name: joi.string().max(255).required(),
  schema_name: joi.string().max(64).default('spec-driven'),
  schema_version: joi.string().max(64).default('1.0'),
  created_by: joi.string().max(128).optional()
});

const updateStatusSchema = joi.object({
  status: joi.string().valid('open', 'applying', 'done', 'archived').required()
});

router.post('/', validate(createChangeSchema), async (req, res) => {
  try {
    await ChangesRepository.create(req.body);
    res.status(201).json({ message: 'Change created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', validate(updateStatusSchema), async (req, res) => {
  try {
    await ChangesRepository.updateStatus(req.params.id, req.body.status);
    res.status(200).json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
