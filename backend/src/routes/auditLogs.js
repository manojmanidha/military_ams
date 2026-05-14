const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// GET /api/audit-logs — Admin only
router.get('/', auth, rbac(['admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT al.*, u.name AS user_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;