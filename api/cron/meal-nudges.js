const { deny } = require('../_lib');
const { dueNudges, defaultSettings } = require('../_meals');
const {
  configured,
  getSubscription,
  getSettings,
  getSentMap,
  markSent,
  getAckMap,
  ackBlocks,
  sendPush,
  clearSubscription
} = require('../_push');

function authorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const q = req.query && req.query.secret;
  return bearer === secret || q === secret;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return deny(res, 405, 'Method not allowed');

  // Require CRON_SECRET via Bearer or ?secret= (Vercel Cron sends Bearer when CRON_SECRET is set).
  if (!authorized(req)) return deny(res, 401, 'Unauthorized cron');

  if (!configured()) return res.status(503).json({ error: 'VAPID not configured', sent: [] });

  try {
    const subscription = await getSubscription();
    if (!subscription || !subscription.endpoint) {
      return res.status(200).json({ ok: true, sent: [], reason: 'no_subscription' });
    }

    const settings = { ...defaultSettings(), ...(await getSettings()), enabled: true };
    const due = dueNudges(new Date(), settings);
    const sentMap = await getSentMap();
    const ackMap = await getAckMap();
    const results = [];

    for (const nudge of due) {
      if (sentMap[nudge.id]) {
        results.push({ id: nudge.id, skipped: 'already_sent' });
        continue;
      }
      if (ackBlocks(ackMap, nudge.id) || ackBlocks(ackMap, `${nudge.date}:meal${nudge.slot}:*`)) {
        results.push({ id: nudge.id, skipped: 'acked' });
        continue;
      }
      // Meal-level done blocks both prep and cook for that slot
      if (nudge.slot != null && ackBlocks(ackMap, `${nudge.date}:meal${nudge.slot}`)) {
        results.push({ id: nudge.id, skipped: 'meal_done' });
        continue;
      }

      const payload = {
        title: nudge.title,
        body: nudge.body,
        url: nudge.url,
        tag: nudge.id,
        kind: nudge.kind,
        date: nudge.date,
        slot: nudge.slot
      };

      const result = await sendPush(subscription, payload);
      if (result.gone) {
        await clearSubscription();
        results.push({ id: nudge.id, error: 'subscription_gone' });
        break;
      }
      if (result.ok) {
        await markSent(nudge.id);
        results.push({ id: nudge.id, ok: true });
      } else {
        results.push({ id: nudge.id, error: result.error });
      }
    }

    return res.status(200).json({ ok: true, checked: due.length, results });
  } catch (e) {
    console.error('meal-nudges cron:', e.message);
    return deny(res, 502, 'Cron failed: ' + e.message);
  }
};
