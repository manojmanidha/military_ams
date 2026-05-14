const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const log = require('../middleware/logger');

router.get('/', auth, async (req, res) => {
  const { base_id, equipment_type_id, start_date, end_date } = req.query;
  const effectiveBaseId = req.user.role === 'base_commander' ? req.user.base_id : base_id;

  let query = `
    SELECT t.*, 
      fb.name AS from_base_name, tb.name AS to_base_name,
      e.name AS equipment_name, e.category
    FROM transfers t
    JOIN bases fb ON fb.id = t.from_base_id
    JOIN bases tb ON tb.id = t.to_base_id
    JOIN equipment_types e ON e.id = t.equipment_type_id
    WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (effectiveBaseId)   { query += ` AND (t.from_base_id = $${i} OR t.to_base_id = $${i}) `; params.push(effectiveBaseId); i++; }
  if (equipment_type_id) { query += ` AND t.equipment_type_id = $${i++}`;  params.push(equipment_type_id); }
  if (start_date)        { query += ` AND t.transfer_date >= $${i++}`;     params.push(start_date); }
  if (end_date)          { query += ` AND t.transfer_date <= $${i++}`;     params.push(end_date); }

  query += ' ORDER BY t.transfer_date DESC';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, rbac(['admin', 'logistics_officer']), async (req, res) => {
  const { from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, notes } = req.body;
  if (!from_base_id || !to_base_id || !equipment_type_id || !quantity || !transfer_date)
    return res.status(400).json({ error: 'All fields required' });
  if (from_base_id === to_base_id)
    return res.status(400).json({ error: 'Source and destination base must differ' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, notes, req.user.id]
    );
    await log({ userId: req.user.id, action: 'TRANSFER', entityType: 'transfer', entityId: rows[0].id, details: rows[0], ip: req.ip });
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;