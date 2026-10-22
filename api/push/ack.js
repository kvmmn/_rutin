const { user, deny, ORIGIN } = require('../_lib');
const { saveAck } = require('../_push');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return deny(res, 405, 'Method not allowed');
  if (!user(req)) return deny(res, 401, 'Sign in with Google first');
  if (req.headers.origin && req.headers.origin !== ORIGIN) return deny(res, 403, 'Bad origin');

  const { id, kind } = req.body || {};
  if (!id || typeof id !== 'string' || id.length > 80) return deny(res, 400, 'Invalid id');
  if (!['done', 'snooze'].includes(kind)) return deny(res, 400, 'Invalid kind');

  const until = kind === 'snooze' ? new Date(Date.now() + 20 * 60 * 1000).toISOString() : null;
  try {
    const ack = await saveAck(id, kind, until);
    return res.status(200).json({ ok: true, ack });
  } catch (e) {
    console.error('push ack:', e.message);
    return deny(res, 502, 'Could not save ack');
  }
};
