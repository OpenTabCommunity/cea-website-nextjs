import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { resources, settingsFields } from './resources.js';
import { hashPassword } from './password.js';

export const DATA_DIR = path.resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || './data');
export const UPLOAD_DIR = path.join(/* turbopackIgnore: true */ DATA_DIR, 'uploads');

const INT_TYPES = new Set(['number', 'bool', 'relation']);
const columnType = (f) => (INT_TYPES.has(f.type) ? 'INTEGER' : 'TEXT');

function migrate(db) {
  for (const [table, res] of Object.entries(resources)) {
    db.exec(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT)`);
    const existing = new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name));
    for (const f of res.fields) {
      if (!existing.has(f.name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${f.name} ${columnType(f)}`);
    }
  }
  db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL)`);
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS users_username ON users(username)`);
}

function insert(db, table, row) {
  const keys = Object.keys(row);
  db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`).run(...keys.map((k) => row[k]));
}

const dayFromNow = (days, time) => {
  const d = new Date(Date.now() + 3.5 * 3600e3 + days * 86400e3).toISOString().slice(0, 10);
  return time ? `${d}T${time}` : d;
};

function seedAdmin(db) {
  if (db.prepare('SELECT COUNT(*) n FROM users').get().n > 0) return;
  const username = process.env.ADMIN_USERNAME || 'admin';
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = crypto.randomBytes(9).toString('base64url');
    const note = path.join(/* turbopackIgnore: true */ DATA_DIR, 'admin-initial-password.txt');
    fs.writeFileSync(note, `username: ${username}\npassword: ${password}\n\nChange it after the first login, then delete this file.\n`, { mode: 0o600 });
    console.log(`\n[admin] First admin created. username: ${username}  password: ${password}\n[admin] Also saved to ${note}\n`);
  }
  insert(db, 'users', { username, name: 'مدیر سایت', password: hashPassword(password) });
}

// Sample content so the site is not empty on first run. Everything here is editable or deletable in the admin panel.
function seedContent(db) {
  if (db.prepare('SELECT COUNT(*) n FROM settings').get().n > 0) return;
  for (const f of settingsFields) db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(f.name, f.default ?? '');

  insert(db, 'teams', {
    name: 'اوپن‌تب', name_en: 'OpenTab', slug: 'opentab', color: 'firoozeh', status: 'active', sort: 1,
    tagline: 'تیم فنی و متن‌باز انجمن. ابزار می‌سازیم و کدش را آزاد منتشر می‌کنیم؛ هر کسی می‌تواند مشارکت کند.',
    body: 'OpenTab تیم فنی انجمن است. پروژه‌های ما متن‌باز هستند و از هر دانشجویی که بخواهد مشارکت کند استقبال می‌کنیم؛ فرقی نمی‌کند تازه‌کار باشد یا باتجربه.\n\n## چه کار می‌کنیم\n\n- ابزارهای مورد نیاز دانشکده و دانشجوها را می‌سازیم\n- جلسه‌های هفتگی مرور کد داریم\n- به تازه‌واردها کمک می‌کنیم اولین مشارکت متن‌بازشان را ثبت کنند',
  });
  insert(db, 'teams', {
    name: 'تب‌لاگ', name_en: 'TabLog', slug: 'tablog', color: 'cream', status: 'soon', sort: 2,
    tagline: 'نشریه و وبلاگ انجمن؛ مقاله، آموزش و گزارش رویدادها.',
    body: 'TabLog جایی است برای نوشتن: مقاله‌های فنی، آموزش‌ها، گزارش رویدادها و گفت‌وگو با استادها و فارغ‌التحصیل‌ها. این تیم به‌زودی کارش را شروع می‌کند.',
  });

  const people = [
    ['سارا محمدی', 'دبیر انجمن', 1, null, '۱۴۰۲'],
    ['علی رضایی', 'نایب‌دبیر', 1, null, '۱۴۰۲'],
    ['مریم حسینی', 'مسئول آموزش', 1, null, '۱۴۰۳'],
    ['امیر کریمی', 'مسئول روابط عمومی', 1, null, '۱۴۰۳'],
    ['نگار احمدی', 'مسئول تیم OpenTab', 1, 1, '۱۴۰۲'],
    ['رضا نوری', 'توسعه‌دهنده', 0, 1, '۱۴۰۳'],
    ['زهرا صادقی', 'توسعه‌دهنده', 0, 1, '۱۴۰۴'],
    ['حسین جعفری', 'سردبیر TabLog', 0, 2, '۱۴۰۳'],
  ];
  people.forEach(([name, role, is_board, team_id, year], i) => insert(db, 'members', { name, role, is_board, team_id, year, sort: i, active: 1 }));

  insert(db, 'events', {
    title: 'کارگاه گیت و گیت‌هاب', slug: 'git-workshop', kind: 'workshop', starts_at: dayFromNow(9, '16:00'), location: 'سالن ۲ دانشکده', published: 1, team_id: 1,
    summary: 'از اولین کامیت تا کار تیمی روی یک مخزن مشترک، در یک بعدازظهر.',
    body: 'این کارگاه برای کسانی است که تا حالا با گیت کار نکرده‌اند یا فقط چند دستور ساده بلدند.\n\n## سرفصل‌ها\n\n- گیت چیست و چرا لازمش داریم\n- کامیت، شاخه و ادغام\n- کار با گیت‌هاب و درخواست ادغام\n\nلپ‌تاپ همراه داشته باشید.',
  });
  insert(db, 'events', {
    title: 'مسابقهٔ برنامه‌نویسی پاییز', slug: 'autumn-contest', kind: 'contest', starts_at: dayFromNow(16, '09:00'), location: 'سایت دانشکده', published: 1,
    summary: 'مسابقهٔ تیمی به سبک ICPC برای تیم‌های سه‌نفره.',
    body: 'مسابقه پنج ساعت طول می‌کشد و سؤال‌ها از ساده تا دشوار چیده شده‌اند. شرکت برای همهٔ دانشجوهای دانشکده آزاد است.',
  });
  insert(db, 'events', {
    title: 'شب متن‌باز با OpenTab', slug: 'open-source-night', kind: 'meetup', starts_at: dayFromNow(23, '18:00'), location: 'آزمایشگاه شبکه', published: 1, team_id: 1,
    summary: 'یک شب دور هم روی پروژه‌های متن‌باز کار می‌کنیم.',
    body: 'اگر تا حالا در پروژهٔ متن‌بازی مشارکت نکرده‌اید، این شب فرصت خوبی برای شروع است. اعضای تیم کنار شما هستند.',
  });

  insert(db, 'posts', {
    kind: 'news', title: 'عضوگیری تیم‌های انجمن شروع شد', slug: 'join-teams', published_at: dayFromNow(-3), published: 1, author: 'روابط عمومی انجمن',
    excerpt: 'تیم‌های انجمن برای سال تحصیلی جدید عضو می‌گیرند.',
    body: 'برای عضویت لازم نیست تجربهٔ قبلی داشته باشید. کافی است فرم عضویت را پر کنید تا با شما تماس بگیریم.',
  });
  insert(db, 'posts', {
    kind: 'news', title: 'برنامهٔ کارگاه‌های این نیم‌سال منتشر شد', slug: 'workshops-schedule', published_at: dayFromNow(-10), published: 1, author: 'واحد آموزش',
    excerpt: 'شش کارگاه در این نیم‌سال برگزار می‌شود؛ از گیت تا یادگیری ماشین.',
    body: 'فهرست کامل کارگاه‌ها و زمان هر کدام در صفحهٔ رویدادها آمده است.',
  });
  insert(db, 'posts', {
    kind: 'article', title: 'چطور اولین مشارکت متن‌بازمان را ثبت کنیم؟', slug: 'first-contribution', published_at: dayFromNow(-18), published: 1, author: 'تیم OpenTab', team_id: 1,
    excerpt: 'راهنمای قدم‌به‌قدم برای کسانی که می‌خواهند وارد دنیای متن‌باز شوند.',
    body: '## از کجا شروع کنیم\n\nیک پروژهٔ کوچک پیدا کنید که خودتان از آن استفاده می‌کنید. مستندات مشارکت را بخوانید و با یک تغییر کوچک شروع کنید؛ مثلاً اصلاح یک غلط در مستندات.\n\n## قدم‌ها\n\n1. مخزن را فورک کنید\n2. یک شاخهٔ تازه بسازید\n3. تغییرتان را کامیت کنید\n4. درخواست ادغام بفرستید',
  });

  insert(db, 'achievements', { title: 'مقام اول مسابقهٔ برنامه‌نویسی منطقهٔ شمال غرب', year: '۱۴۰۴', description: 'تیم سه‌نفرهٔ انجمن در مسابقهٔ منطقه‌ای اول شد.', sort: 1 });
  insert(db, 'achievements', { title: 'انجمن علمی برتر دانشگاه', year: '۱۴۰۳', description: 'انتخاب به‌عنوان انجمن علمی برتر در جشنوارهٔ حرکت دانشگاه.', sort: 2 });
  insert(db, 'achievements', { title: 'برگزاری نخستین هکاتون دانشکده', year: '۱۴۰۳', description: 'بیست‌وچهار ساعت، دوازده تیم و هشت پروژهٔ کامل.', sort: 3 });

  insert(db, 'plans', { title: 'راه‌اندازی وبلاگ TabLog', description: 'انتشار منظم مقاله و آموزش به قلم دانشجوها.', status: 'doing', target: 'زمستان ۱۴۰۵', sort: 1 });
  insert(db, 'plans', { title: 'دورهٔ مقدماتی یادگیری ماشین', description: 'هشت جلسه، همراه با پروژهٔ پایانی.', status: 'planned', target: 'بهار ۱۴۰۶', sort: 2 });
  insert(db, 'plans', { title: 'هکاتون سالانهٔ دانشکده', description: 'دومین دورهٔ هکاتون با حضور شرکت‌های فناوری تبریز.', status: 'planned', target: 'اردیبهشت ۱۴۰۶', sort: 3 });
  insert(db, 'plans', { title: 'سایت تازهٔ انجمن', description: 'طراحی و ساخت همین سایت.', status: 'done', target: 'پاییز ۱۴۰۵', sort: 4 });

  [['عضو فعال', 120], ['رویداد در سال گذشته', 34], ['پروژهٔ متن‌باز', 18], ['شمارهٔ نشریه', 7]].forEach(([label, value], i) => insert(db, 'stats', { label, value, sort: i }));
}

export function getDb() {
  if (globalThis.__ceDb) return globalThis.__ceDb;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(/* turbopackIgnore: true */ DATA_DIR, 'site.db'));
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  migrate(db);
  seedContent(db);
  seedAdmin(db);
  globalThis.__ceDb = db;
  return db;
}

// node:sqlite returns rows without a prototype; spread them into plain objects so React can pass them to client components.
export const all = (sql, ...params) => getDb().prepare(sql).all(...params).map((row) => ({ ...row }));
export const get = (sql, ...params) => {
  const row = getDb().prepare(sql).get(...params);
  return row ? { ...row } : undefined;
};
export const run = (sql, ...params) => getDb().prepare(sql).run(...params);

export function getSettings() {
  const out = {};
  for (const f of settingsFields) out[f.name] = f.default ?? '';
  for (const row of all('SELECT key, value FROM settings')) out[row.key] = row.value ?? '';
  return out;
}
