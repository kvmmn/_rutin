# Rūtin — روتین

Personal **meal-habit companion**: plan meals, grocery, and get **proactive food nudges** on your phone (Web Push) so a regular eating routine sticks — even with ADHD.

**Frontend:** Vercel (PWA)  
**Source:** GitHub (`main`)  
**Data:** private Google Sheets  
**Focus:** food only (Calendar busy-blocks are a later signal — not in this MVP)

## What the MVP ships

- **Web Push** while the app is closed: prep-earlier, cook-now, grocery-day
- Tap a nudge → **one-meal cook screen** (steps + انجام شد / ۲۰ دقیقه بعد)
- Server cron every 5 minutes (`/api/cron/meal-nudges`) using meal plan + clock (Europe/Berlin)
- Google Calendar: **not** in MVP

## Setup (Vercel)

1. Import `kvmmn/_rutin` into Vercel (Framework: Other, root `./`).
2. Set env vars from `.env.example` (OAuth, Sheets, **VAPID_***, **CRON_SECRET**).
3. Generate VAPID keys: `npx web-push generate-vapid-keys` → paste public/private + `VAPID_SUBJECT`.
4. In the Google Sheet, create a tab named exactly **`پوش`** (columns A–B are written by the API).
5. Deploy. Ensure the deployment URL matches `ORIGIN` in `api/_lib.js` (`https://rutin274.vercel.app`) or update that constant for previews.

### Cron note

`vercel.json` schedules `*/5 * * * *`. On some Vercel plans frequent crons require Pro; if cron does not run, ping externally every 5 minutes:

`GET https://rutin274.vercel.app/api/cron/meal-nudges?secret=YOUR_CRON_SECRET`

## Test on mobile (Kaveh)

1. Open the live site on **phone Chrome/Safari**, sign in with Google.
2. Add to Home Screen (standalone PWA helps iOS/Android keep the worker).
3. Open **تنظیم یادآورها** → **فعال‌سازی اعلان موبایل** → allow notifications.
4. Optional: temporarily set وعده اول to ~10 minutes from now, save, wait for cron (≤5–12 min) with the app **closed**.
5. Tap the notification → cook steps for that meal only (not the tabbed home).
6. Tap **انجام شد** so it will not nudge again for that meal.

## Security

Never commit service-account JSON, Google tokens, VAPID private keys, `CRON_SECRET`, personal photos, or `.env` files.
