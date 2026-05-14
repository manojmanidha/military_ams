const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const log = require('../middleware/logger');

// GET /api/purchases  — All roles, filtered by base for commanders
router.get('/', auth, async (req, res) => {
  const { base_id, equipment_type_id, start_date, end_date } = req.query;

  // Base commanders only see their own base
  const effectiveBaseId = req.user.role === 'base_commander' ? req.user.base_id : base_id;

  let query = `
    SELECT p.*, b.name AS base_name, e.name AS equipment_name, e.category
    FROM purchases p
    JOIN bases b ON b.id = p.base_id
    JOIN equipment_types e ON e.id = p.equipment_type_id
    WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (effectiveBaseId)      { query += ` AND p.base_id = $${i++}`;            params.push(effectiveBaseId); }
  if (equipment_type_id)    { query += ` AND p.equipment_type_id = $${i++}`;  params.push(equipment_type_id); }
  if (start_date)           { query += ` AND p.purchase_date >= $${i++}`;     params.push(start_date); }
  if (end_date)             { query += ` AND p.purchase_date <= $${i++}`;     params.push(end_date); }

  query += ' ORDER BY p.purchase_date DESC';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/purchases  — Admin + Logistics only
router.post('/', auth, rbac(['admin', 'logistics_officer']), async (req, res) => {
  const { base_id, equipment_type_id, quantity, purchase_date, supplier, notes } = req.body;
  if (!base_id || !equipment_type_id || !quantity || !purchase_date)
    return res.status(400).json({ error: 'base_id, equipment_type_id, quantity, purchase_date required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, supplier, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [base_id, equipment_type_id, quantity, purchase_date, supplier, notes, req.user.id]
    );
    await log({ userId: req.user.id, action: 'CREATE_PURCHASE', entityType: 'purchase', entityId: rows[0].id, details: rows[0], ip: req.ip });
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;