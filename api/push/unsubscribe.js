const { user, deny, ORIGIN } = require('../_lib');
const { clearSubscription } = require('../_push');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return deny(res, 405, 'Method not allowed');
  if (!user(req)) return deny(res, 401, 'Sign in with Google first');
  if (req.headers.origin && req.headers.origin !== ORIGIN) return deny(res, 403, 'Bad origin');
  try {
    await clearSubscription();
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('push unsubscribe:', e.message);
    return deny(res, 502, 'Could not clear push subscription');
  }
};
