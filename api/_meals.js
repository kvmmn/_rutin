/**
 * Shared meal plan + nudge timing (Europe/Berlin).
 * Weekday-rotated from the built-in weekly templates — Calendar busy blocks are later.
 */

const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

/** Template meals: [lunch, dinner] per weekday index (شنبه=0). */
const MEALS = [
  ['۲ تخم‌مرغ + نان سبوس‌دار + اسکیر + خیار', 'سینه مرغ ۲۲۰ گرم + سالاد بزرگ'],
  ['تن ماهی + برنج ۷۰ گرم خشک + گوجه', 'پنیر کم‌چرب ۲۰۰ گرم + سالاد + اسکیر'],
  ['۲ تخم‌مرغ + سیب‌زمینی پخته ۲۲۰ گرم + اسکیر', 'سینه مرغ ۲۲۰ گرم + سالاد'],
  ['سینه مرغ ۲۲۰ گرم + برنج ۷۰ گرم خشک + سبزیجات', 'پنیر کم‌چرب + خیار و گوجه + اسکیر'],
  ['۲ تخم‌مرغ + سیب‌زمینی پخته ۲۲۰ گرم + اسکیر', 'تن ماهی + سالاد بزرگ'],
  ['سینه مرغ ۲۲۰ گرم + برنج ۷۰ گرم خشک + سبزیجات', 'پنیر کم‌چرب + سالاد + اسکیر'],
  ['۲ تخم‌مرغ + سیب‌زمینی پخته ۲۲۰ گرم + اسکیر', 'تن ماهی + سالاد بزرگ']
];

/** Prep guides aligned with MEALS[day][slot]. timeFa is display; minutes is scheduling. */
const GUIDES = [
  [
    { timeFa: '۵ دقیقه', minutes: 5, steps: ['تخم‌مرغ‌ها را ۸ تا ۱۰ دقیقه در آب جوش بپز؛ یا با روغن بسیار کم نیمرو کن.', 'نان را کنار اسکیر ساده و خیار خردشده سرو کن.'] },
    { timeFa: '۱۵–۲۰ دقیقه', minutes: 20, steps: ['مرغ را به تکه‌های کوچک تقسیم کن و با کمی نمک، فلفل و روغن در تابه بپز.', 'تا پخت کامل ادامه بده؛ دمای داخلی مرغ باید به ۷۴ درجه سانتی‌گراد برسد.', 'سالاد را بشوی و با لیمو یا سرکه کنار مرغ سرو کن.'] }
  ],
  [
    { timeFa: '۱۵ دقیقه', minutes: 15, steps: ['برنج را طبق دستور بسته در آب بپز.', 'تن را آبکش کن؛ نوع کنسروی آماده مصرف است مگر برچسب خلاف آن را بگوید.', 'با گوجه خردشده و چاشنی دلخواه مخلوط کن.'] },
    { timeFa: '۵ دقیقه', minutes: 5, steps: ['سالاد را آماده کن و پنیر دلمه‌ای را به آن اضافه کن.', 'اسکیر ساده را جداگانه سرو کن.'] }
  ],
  [
    { timeFa: '۱۰ دقیقه', minutes: 10, steps: ['سیب‌زمینی آماده و پخته را از آب بسته خارج کن و آبکش کن.', 'در تابه با کمی آب یا روغن برای چند دقیقه گرم کن.', 'تخم‌مرغ‌ها را آب‌پز کن و با اسکیر سرو کن.'] },
    { timeFa: '۱۵–۲۰ دقیقه', minutes: 20, steps: ['مرغ را با ادویه دلخواه در تابه کاملاً بپز.', 'سبزیجات سالاد را بشوی، خرد کن و همراه مرغ سرو کن.'] }
  ],
  [
    { timeFa: '۲۰ دقیقه', minutes: 20, steps: ['برنج را طبق دستور بسته بپز.', 'مرغ را جداگانه در تابه تا پخت کامل آماده کن.', 'سبزیجات را بخارپز یا در تابه نرم کن و هر سه را با هم سرو کن.'] },
    { timeFa: '۵ دقیقه', minutes: 5, steps: ['خیار و گوجه را خرد کن.', 'پنیر کم‌چرب را کنار سبزیجات و اسکیر سرو کن.'] }
  ],
  [
    { timeFa: '۱۰ دقیقه', minutes: 10, steps: ['سیب‌زمینی ازپیش‌پخته را آبکش و در تابه گرم کن.', 'دو تخم‌مرغ را آب‌پز کن و همراه اسکیر بخور.'] },
    { timeFa: '۵ دقیقه', minutes: 5, steps: ['تن را آبکش کن.', 'برگ‌های سالاد را با خیار یا گوجه و چاشنی مخلوط کن.', 'تن را به سالاد اضافه کن.'] }
  ],
  [
    { timeFa: '۲۰ دقیقه', minutes: 20, steps: ['برنج را طبق دستور بسته بپز.', 'مرغ را تا دمای داخلی ۷۴ درجه بپز.', 'سبزیجات را بخارپز کن و کنار غذا قرار بده.'] },
    { timeFa: '۵ دقیقه', minutes: 5, steps: ['سبزیجات سالاد را آماده کن.', 'پنیر را روی سالاد بریز و اسکیر را کنار آن بخور.'] }
  ],
  [
    { timeFa: '۱۰ دقیقه', minutes: 10, steps: ['سیب‌زمینی پخته را از بسته خارج کن و در تابه گرم کن.', 'تخم‌مرغ‌ها را آب‌پز کن؛ همراه اسکیر سرو کن.'] },
    { timeFa: '۵ دقیقه', minutes: 5, steps: ['تن را آبکش کن و روی سالاد بریز.', 'با کمی آبلیمو و سبزی خشک مزه‌دار کن.'] }
  ]
];

const SLOT_LABEL = ['وعده اول · ظهر', 'وعده دوم · شام'];

function berlinParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short'
  }).formatToParts(date);
  return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}

/** شنبه=0 … جمعه=6 (matches in-app week order). */
function weekdayIndex(parts = berlinParts()) {
  const map = { Sat: 0, Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6 };
  return map[parts.weekday] ?? 0;
}

function todayIso(parts = berlinParts()) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function minsOf(hhmm) {
  const [h, m] = String(hhmm || '00:00').split(':').map(Number);
  return h * 60 + m;
}

function defaultSettings() {
  return { first: '14:00', second: '19:30', buy: '11:00', lead: 15, enabled: true };
}

/**
 * Build due nudges for "now" (Berlin clock).
 * kinds: prep | cook | buy
 */
function dueNudges(now = new Date(), settings = defaultSettings()) {
  const cfg = { ...defaultSettings(), ...settings };
  if (!cfg.enabled) return [];

  const parts = berlinParts(now);
  const date = todayIso(parts);
  const day = weekdayIndex(parts);
  const current = Number(parts.hour) * 60 + Number(parts.minute);
  const out = [];
  const mealTimes = [cfg.first, cfg.second];
  // Wide enough for */5 cron jitter; de-duped by sent-map so no spam.
  const WINDOW = 12;

  for (let slot = 0; slot < 2; slot++) {
    const title = MEALS[day][slot];
    const guide = GUIDES[day][slot];
    const mealAt = minsOf(mealTimes[slot]);
    const prepAt = Math.max(0, mealAt - guide.minutes - Number(cfg.lead || 0));
    const cookAt = mealAt;

    // Prep-earlier only when prep is meaningfully before cook (skip tiny meals where prep≈cook)
    if (guide.minutes >= 10 && current >= prepAt && current < prepAt + WINDOW) {
      out.push({
        id: `${date}:meal${slot}:prep`,
        kind: 'prep',
        date,
        slot,
        day,
        title: 'زودتر آماده شو',
        body: `${title} · حدود ${guide.timeFa}`,
        url: `/?cook=${date}&slot=${slot}`,
        action: 'شروع آماده‌سازی'
      });
    }

    if (current >= cookAt && current < cookAt + WINDOW) {
      out.push({
        id: `${date}:meal${slot}:cook`,
        kind: 'cook',
        date,
        slot,
        day,
        title: 'الان بپز',
        body: `${title} · حدود ${guide.timeFa}`,
        url: `/?cook=${date}&slot=${slot}`,
        action: 'باز کردن طرز تهیه'
      });
    }
  }

  // Grocery days: شنبه / دوشنبه / چهارشنبه
  if ([0, 2, 4].includes(day)) {
    const buyAt = minsOf(cfg.buy);
    if (current >= buyAt && current < buyAt + WINDOW) {
      out.push({
        id: `${date}:buy`,
        kind: 'buy',
        date,
        slot: null,
        day,
        title: 'امروز خرید مواد غذایی',
        body: `چک‌لیست خرید ${DAYS[day]} را باز کن.`,
        url: '/?tab=buy',
        action: 'لیست خرید'
      });
    }
  }

  return out;
}

function mealFor(dateIso, slot) {
  const slotN = Number(slot);
  if (![0, 1].includes(slotN)) return null;
  let day;
  if (dateIso && /^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    const [y, m, d] = dateIso.split('-').map(Number);
    // Noon UTC avoids DST edge for weekday of that calendar day in Berlin
    day = weekdayIndex(berlinParts(new Date(Date.UTC(y, m - 1, d, 12, 0))));
  } else {
    day = weekdayIndex();
  }
  return {
    date: dateIso || todayIso(),
    slot: slotN,
    day,
    dayName: DAYS[day],
    label: SLOT_LABEL[slotN],
    title: MEALS[day][slotN],
    guide: GUIDES[day][slotN]
  };
}

module.exports = {
  DAYS,
  MEALS,
  GUIDES,
  SLOT_LABEL,
  berlinParts,
  weekdayIndex,
  todayIso,
  minsOf,
  defaultSettings,
  dueNudges,
  mealFor
};
