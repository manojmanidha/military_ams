// Usage: router.get('/path', auth, rbac(['admin','logistics_officer']), controller)
module.exports = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied: insufficient role' });
  }
  next();
};