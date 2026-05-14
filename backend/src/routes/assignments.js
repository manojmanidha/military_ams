const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const log = require('../middleware/logger');

router.get('/', auth, async (req, res) => {
  const { base_id, equipment_type_id, is_expended } = req.query;
  const effectiveBaseId = req.user.role === 'base_commander' ? req.user.base_id : base_id;

  let query = `
    SELECT a.*, b.name AS base_name, e.name AS equipment_name
    FROM assignments a
    JOIN bases b ON b.id = a.base_id
    JOIN equipment_types e ON e.id = a.equipment_type_id
    WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (effectiveBaseId)    { query += ` AND a.base_id = $${i++}`;            params.push(effectiveBaseId); }
  if (equipment_type_id)  { query += ` AND a.equipment_type_id = $${i++}`;  params.push(equipment_type_id); }
  if (is_expended !== undefined) { query += ` AND a.is_expended = $${i++}`; params.push(is_expended === 'true'); }

  query += ' ORDER BY a.assignment_date DESC';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, rbac(['admin', 'base_commander']), async (req, res) => {
  const { base_id, equipment_type_id, assigned_to, quantity, assignment_date, notes } = req.body;
  if (!base_id || !equipment_type_id || !assigned_to || !quantity || !assignment_date)
    return res.status(400).json({ error: 'All fields required' });

  // Base commanders can only assign within their base
  if (req.user.role === 'base_commander' && Number(base_id) !== req.user.base_id)
    return res.status(403).json({ error: 'You can only assign assets to your own base' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO assignments (base_id, equipment_type_id, assigned_to, quantity, assignment_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [base_id, equipment_type_id, assigned_to, quantity, assignment_date, notes, req.user.id]
    );
    await log({ userId: req.user.id, action: 'ASSIGN', entityType: 'assignment', entityId: rows[0].id, details: rows[0], ip: req.ip });
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/assignments/:id/expend
router.patch('/:id/expend', auth, rbac(['admin', 'base_commander']), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE assignments SET is_expended = TRUE, expended_date = CURRENT_DATE
       WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Assignment not found' });
    await log({ userId: req.user.id, action: 'EXPEND', entityType: 'assignment', entityId: Number(id), details: rows[0], ip: req.ip });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;