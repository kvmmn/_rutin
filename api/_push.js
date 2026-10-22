const webpush = require('web-push');
const { accessToken, request } = require('./_sheets');

const RANGE_SUB = "'پوش'!A2:B2";
const RANGE_SENT = "'پوش'!A3:B3";
const RANGE_ACK = "'پوش'!A4:B4";
const RANGE_SETTINGS = "'پوش'!A5:B5";

function configured() {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

function setup() {
  if (!configured()) throw Error('VAPID keys are not configured');
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function readCell(token, range) {
  const r = await request(token, range);
  const row = (r.values && r.values[0]) || [];
  const raw = row[1] || '';
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCell(token, range, key, value) {
  await request(token, range, 'PUT', [[key, JSON.stringify(value)]]);
}

async function getSubscription() {
  const token = await accessToken();
  return readCell(token, RANGE_SUB);
}

async function saveSubscription(subscription, settings) {
  const token = await accessToken();
  await writeCell(token, RANGE_SUB, 'subscription', subscription);
  if (settings) await writeCell(token, RANGE_SETTINGS, 'settings', settings);
  return { ok: true };
}

async function clearSubscription() {
  const token = await accessToken();
  await writeCell(token, RANGE_SUB, 'subscription', null);
  return { ok: true };
}

async function getSettings() {
  const token = await accessToken();
  return (await readCell(token, RANGE_SETTINGS)) || null;
}

async function getSentMap() {
  const token = await accessToken();
  return (await readCell(token, RANGE_SENT)) || {};
}

async function markSent(id) {
  const token = await accessToken();
  const map = (await readCell(token, RANGE_SENT)) || {};
  map[id] = new Date().toISOString();
  // Keep last ~60 keys
  const keys = Object.keys(map);
  if (keys.length > 60) {
    keys.sort((a, b) => String(map[a]).localeCompare(String(map[b])));
    for (const k of keys.slice(0, keys.length - 60)) delete map[k];
  }
  await writeCell(token, RANGE_SENT, 'sent', map);
}

async function getAckMap() {
  const token = await accessToken();
  return (await readCell(token, RANGE_ACK)) || {};
}

async function saveAck(id, kind, untilIso) {
  const token = await accessToken();
  const map = (await readCell(token, RANGE_ACK)) || {};
  map[id] = { kind, at: new Date().toISOString(), until: untilIso || null };
  await writeCell(token, RANGE_ACK, 'acks', map);
  return map[id];
}

function ackBlocks(ack, id, now = Date.now()) {
  const a = ack && ack[id];
  if (!a) return false;
  if (a.kind === 'done') return true;
  if (a.kind === 'snooze' && a.until && Date.parse(a.until) > now) return true;
  return false;
}

async function sendPush(subscription, payload) {
  setup();
  const body = JSON.stringify(payload);
  try {
    await webpush.sendNotification(subscription, body, {
      TTL: 60 * 30,
      urgency: payload.kind === 'cook' ? 'high' : 'normal'
    });
    return { ok: true };
  } catch (e) {
    const status = e.statusCode || e.status;
    if (status === 404 || status === 410) {
      return { ok: false, gone: true, error: String(e.message || e) };
    }
    return { ok: false, error: String(e.message || e) };
  }
}

module.exports = {
  configured,
  setup,
  getSubscription,
  saveSubscription,
  clearSubscription,
  getSettings,
  getSentMap,
  markSent,
  getAckMap,
  saveAck,
  ackBlocks,
  sendPush
};
