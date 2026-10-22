const { user, deny, authDisabled } = require('../_lib');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return deny(res, 405, 'Method not allowed');
  if (authDisabled()) {
    return res.status(200).json({
      user: { email: 'preview@rutin.local', name: 'Preview', authDisabled: true },
      authDisabled: true
    });
  }
  const u = user(req);
  if (!u) return deny(res, 401, 'Not signed in');
  res.status(200).json({ user: u, authDisabled: false });
};
