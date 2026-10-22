const { user, deny } = require('../_lib');
const { configured } = require('../_push');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return deny(res, 405, 'Method not allowed');
  if (!user(req)) return deny(res, 401, 'Sign in with Google first');
  if (!configured()) return deny(res, 503, 'Web Push is not configured (VAPID keys missing)');
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};
