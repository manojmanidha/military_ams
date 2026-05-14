const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { start_date = '2000-01-01', end_date = '2099-12-31', equipment_type_id } = req.query;
  const base_id = req.user.role === 'base_commander' ? req.user.base_id : req.query.base_id;

  const p = [start_date, end_date, base_id || null, equipment_type_id || null];

  const query = `
    WITH
    purchases_in AS (
      SELECT COALESCE(SUM(quantity),0)::int AS total FROM purchases
      WHERE purchase_date BETWEEN $1 AND $2
        AND ($3::int IS NULL OR base_id = $3)
        AND ($4::int IS NULL OR equipment_type_id = $4)
    ),
    transfer_in AS (
      SELECT COALESCE(SUM(quantity),0)::int AS total FROM transfers
      WHERE transfer_date BETWEEN $1 AND $2
        AND ($3::int IS NULL OR to_base_id = $3)
        AND ($4::int IS NULL OR equipment_type_id = $4)
    ),
    transfer_out AS (
      SELECT COALESCE(SUM(quantity),0)::int AS total FROM transfers
      WHERE transfer_date BETWEEN $1 AND $2
        AND ($3::int IS NULL OR from_base_id = $3)
        AND ($4::int IS NULL OR equipment_type_id = $4)
    ),
    opening AS (
      SELECT 
        COALESCE(SUM(p.quantity),0) + COALESCE(SUM(ti.quantity),0) - COALESCE(SUM(to_.quantity),0) AS opening_balance
      FROM (SELECT 1) dummy
      LEFT JOIN purchases p ON p.purchase_date < $1
        AND ($3::int IS NULL OR p.base_id = $3)
        AND ($4::int IS NULL OR p.equipment_type_id = $4)
      LEFT JOIN transfers ti ON ti.transfer_date < $1
        AND ($3::int IS NULL OR ti.to_base_id = $3)
        AND ($4::int IS NULL OR ti.equipment_type_id = $4)
      LEFT JOIN transfers to_ ON to_.transfer_date < $1
        AND ($3::int IS NULL OR to_.from_base_id = $3)
        AND ($4::int IS NULL OR to_.equipment_type_id = $4)
    ),
    assigned_total AS (
      SELECT COALESCE(SUM(quantity),0)::int AS total FROM assignments
      WHERE assignment_date BETWEEN $1 AND $2
        AND ($3::int IS NULL OR base_id = $3)
        AND ($4::int IS NULL OR equipment_type_id = $4)
    ),
    expended_total AS (
      SELECT COALESCE(SUM(quantity),0)::int AS total FROM assignments
      WHERE is_expended = TRUE AND expended_date BETWEEN $1 AND $2
        AND ($3::int IS NULL OR base_id = $3)
        AND ($4::int IS NULL OR equipment_type_id = $4)
    )
    SELECT
      o.opening_balance::int,
      pi.total AS purchases,
      ti.total AS transfer_in,
      to_.total AS transfer_out,
      (pi.total + ti.total - to_.total)::int AS net_movement,
      (o.opening_balance + pi.total + ti.total - to_.total)::int AS closing_balance,
      a.total AS assigned,
      e.total AS expended
    FROM opening o, purchases_in pi, transfer_in ti, transfer_out to_, assigned_total a, expended_total e
  `;

  try {
    const { rows } = await pool.query(query, p);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;