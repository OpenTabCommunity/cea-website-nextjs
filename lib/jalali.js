// Jalali (Persian) calendar helpers. Dates are stored as naive Tehran wall-clock strings:
// "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" (Gregorian), so they sort correctly as plain text.

const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

export function toJalali(gy, gm, gd) {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

export function toGregorian(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const ml = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (; gm < 13 && gd > ml[gm]; gm++) gd -= ml[gm];
  return [gy, gm, gd];
}

export const fa = (v) => String(v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
export const toLatinDigits = (s) =>
  String(s ?? '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const pad = (n) => String(n).padStart(2, '0');

/** Split a stored value into Jalali parts, or null when empty/invalid. */
export function parts(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value || '');
  if (!m) return null;
  const [jy, jm, jd] = toJalali(+m[1], +m[2], +m[3]);
  const weekday = WEEKDAYS[new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay()];
  return { jy, jm, jd, hour: m[4], minute: m[5], month: MONTHS[jm - 1], weekday, hasTime: m[4] !== undefined };
}

/** "۲۵ آبان ۱۴۰۵" */
export function formatDate(value) {
  const p = parts(value);
  return p ? fa(`${p.jd} ${p.month} ${p.jy}`) : '';
}
/** "۲۵ آبان" */
export function formatDayMonth(value) {
  const p = parts(value);
  return p ? fa(`${p.jd} ${p.month}`) : '';
}
/** "دوشنبه ۲۵ آبان ۱۴۰۵، ساعت ۱۶:۳۰" */
export function formatDateTime(value) {
  const p = parts(value);
  if (!p) return '';
  const time = p.hasTime ? `، ساعت ${p.hour}:${p.minute}` : '';
  return fa(`${p.weekday} ${p.jd} ${p.month} ${p.jy}${time}`);
}

/** Build a stored value from Jalali form inputs. Returns '' when the date is incomplete or impossible. */
export function fromJalaliInput(y, m, d, hh, mm) {
  const jy = parseInt(toLatinDigits(y), 10);
  const jm = parseInt(toLatinDigits(m), 10);
  const jd = parseInt(toLatinDigits(d), 10);
  if (!jy || !jm || !jd || jm < 1 || jm > 12 || jd < 1 || jd > 31 || jy < 1300 || jy > 1500) return '';
  const [gy, gm, gd] = toGregorian(jy, jm, jd);
  const back = toJalali(gy, gm, gd);
  if (back[0] !== jy || back[1] !== jm || back[2] !== jd) return ''; // e.g. 31 Mehr does not exist
  const date = `${gy}-${pad(gm)}-${pad(gd)}`;
  if (hh === undefined) return date;
  const h = Math.min(23, Math.max(0, parseInt(toLatinDigits(hh), 10) || 0));
  const mi = Math.min(59, Math.max(0, parseInt(toLatinDigits(mm), 10) || 0));
  return `${date}T${pad(h)}:${pad(mi)}`;
}

/** Current Tehran wall-clock time (UTC+03:30, no daylight saving since 2022) as a stored-format string. */
export function nowTehran() {
  return new Date(Date.now() + 3.5 * 3600 * 1000).toISOString().slice(0, 16);
}

export const MONTH_NAMES = MONTHS;
