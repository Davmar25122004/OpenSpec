const express = require('express');
const router = express.Router();
const joi = require('joi');
const validate = require('../middleware/joiValidate');
const TasksRepository = require('../../../openspec-mariadb-adapter/db/TasksRepository');

const createTaskSchema = joi.object({
  change_id: joi.string().max(128).required(),
  title: joi.string().max(512).required(),
  description: joi.string().allow(null, '').optional(),
  order_index: joi.number().integer().min(0).optional()
});

const updateTaskSchema = joi.object({
  done: joi.boolean().optional(),
  skipped: joi.boolean().optional(),
  executor: joi.string().max(128).optional().allow(null, '')
});

router.post('/', validate(createTaskSchema), async (req, res) => {
  try {
    await TasksRepository.create(req.body);
    res.status(201).json({ message: 'Task created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', validate(updateTaskSchema), async (req, res) => {
  try {
    await TasksRepository.updateStatus(req.params.id, req.body);
    res.status(200).json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
