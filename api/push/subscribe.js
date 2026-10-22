const { user, deny, ORIGIN } = require('../_lib');
const { configured, saveSubscription } = require('../_push');
const { defaultSettings } = require('../_meals');

function validSub(s) {
  return s && typeof s.endpoint === 'string' && s.endpoint.startsWith('https://') && s.keys && s.keys.p256dh && s.keys.auth;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return deny(res, 405, 'Method not allowed');
  if (!user(req)) return deny(res, 401, 'Sign in with Google first');
  if (req.headers.origin && req.headers.origin !== ORIGIN) return deny(res, 403, 'Bad origin');
  if (!configured()) return deny(res, 503, 'Web Push is not configured (VAPID keys missing)');

  const body = req.body || {};
  if (!validSub(body.subscription)) return deny(res, 400, 'Invalid push subscription');

  const settings = { ...defaultSettings(), ...(body.settings || {}), enabled: true };
  settings.lead = Math.max(0, Math.min(120, Number(settings.lead) || 15));

  try {
    await saveSubscription(body.subscription, settings);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('push subscribe:', e.message);
    return deny(res, 502, 'Could not save push subscription — ensure sheet tab پوش exists');
  }
};
