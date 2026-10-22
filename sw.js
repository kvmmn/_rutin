/* Rūtin service worker — Web Push + notification click → meal deep link */
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'Rūtin', body: 'وقت وعده است', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {
    try {
      data.body = event.data.text();
    } catch (_) {}
  }

  const tag = data.tag || data.url || 'rutin-meal';
  event.waitUntil(
    self.registration.showNotification(data.title || 'Rūtin', {
      body: data.body || '',
      lang: 'fa',
      dir: 'rtl',
      tag,
      renotify: true,
      data: { url: data.url || '/', id: tag, date: data.date, slot: data.slot },
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      actions: [
        { action: 'open', title: 'طرز تهیه' },
        { action: 'done', title: 'انجام شد' }
      ]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const url = data.url || '/';

  if (event.action === 'done' && data.id) {
    event.waitUntil(
      fetch('/api/push/ack', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.slot != null && data.date ? `${data.date}:meal${data.slot}` : data.id,
          kind: 'done'
        })
      }).catch(() => {}).then(() => openUrl(url))
    );
    return;
  }

  event.waitUntil(openUrl(url));
});

async function openUrl(url) {
  const abs = new URL(url, self.location.origin).href;
  const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of all) {
    if (client.url.startsWith(self.location.origin) && 'focus' in client) {
      await client.focus();
      if ('navigate' in client) {
        try {
          await client.navigate(abs);
          return;
        } catch (_) {}
      }
      client.postMessage({ type: 'rutin-open', url: abs });
      return;
    }
  }
  await self.clients.openWindow(abs);
}
