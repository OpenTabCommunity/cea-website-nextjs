'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { get, run, all } from '@/lib/db';
import { resources, settingsFields } from '@/lib/resources';
import { createSession, destroySession, requireUser, loginAllowed, loginFailed, loginSucceeded } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { saveUpload, removeUpload } from '@/lib/uploads';
import { fromJalaliInput, toLatinDigits } from '@/lib/jalali';

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const isFile = (v) => v && typeof v === 'object' && typeof v.arrayBuffer === 'function' && v.size > 0;
const cleanUrl = (v) => (v === '' || /^(https?:\/\/|mailto:|\/)/i.test(v) ? v : `https://${v}`);

function slugify(s) {
  return toLatinDigits(String(s || ''))
    .trim()
    .toLowerCase()
    .replace(/[\s_‌]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Text values sent back to the form when saving fails, so nothing typed is lost.
function echo(formData) {
  const out = {};
  for (const [k, v] of formData.entries()) if (typeof v === 'string' && !k.startsWith('$')) out[k] = v;
  return out;
}

export async function login(_prev, formData) {
  const username = str(formData.get('username'));
  const password = String(formData.get('password') || '');
  const key = username.toLowerCase();
  if (!loginAllowed(key)) return { error: 'تلاش‌های ناموفق زیاد بود. ده دقیقهٔ دیگر دوباره امتحان کنید.' };
  const user = get('SELECT id, password FROM users WHERE username = ?', username);
  if (!user || !verifyPassword(password, user.password)) {
    loginFailed(key);
    return { error: 'نام کاربری یا رمز عبور درست نیست.' };
  }
  loginSucceeded(key);
  await createSession(user.id);
  redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}

export async function saveRecord(resource, id, _prev, formData) {
  const me = await requireUser();
  const res = resources[resource];
  if (!res) return { error: 'این بخش وجود ندارد.' };
  const existing = id ? get(`SELECT * FROM ${resource} WHERE id = ?`, id) : null;
  if (id && !existing) return { error: 'این مورد دیگر وجود ندارد.' };

  const values = {};
  const errors = [];
  const toRemove = [];
  const fail = (msg) => ({ error: msg, values: echo(formData), nonce: Date.now() });

  try {
    for (const f of res.fields) {
      const raw = formData.get(f.name);
      switch (f.type) {
        case 'number':
          values[f.name] = parseInt(toLatinDigits(str(raw)), 10) || 0;
          break;
        case 'bool':
          values[f.name] = raw === 'on' ? 1 : 0;
          break;
        case 'relation':
          values[f.name] = parseInt(str(raw), 10) || null;
          break;
        case 'select':
          values[f.name] = f.options.some(([v]) => v === str(raw)) ? str(raw) : f.default ?? f.options[0][0];
          break;
        case 'url':
          values[f.name] = cleanUrl(str(raw));
          break;
        case 'jdate':
          values[f.name] = fromJalaliInput(formData.get(`${f.name}_y`), formData.get(`${f.name}_m`), formData.get(`${f.name}_d`));
          if (!values[f.name] && str(formData.get(`${f.name}_y`))) errors.push(`«${f.label}» تاریخ درستی نیست.`);
          break;
        case 'jdatetime':
          values[f.name] = fromJalaliInput(formData.get(`${f.name}_y`), formData.get(`${f.name}_m`), formData.get(`${f.name}_d`), formData.get(`${f.name}_h`) || '0', formData.get(`${f.name}_i`) || '0');
          if (!values[f.name] && str(formData.get(`${f.name}_y`))) errors.push(`«${f.label}» تاریخ درستی نیست.`);
          break;
        case 'image':
        case 'file':
          if (isFile(raw)) {
            values[f.name] = await saveUpload(raw, { imageOnly: f.type === 'image' });
            if (existing?.[f.name]) toRemove.push(existing[f.name]);
          } else if (formData.get(`${f.name}_remove`) === 'on') {
            values[f.name] = '';
            if (existing?.[f.name]) toRemove.push(existing[f.name]);
          }
          break;
        case 'images': {
          let list = [];
          try {
            list = JSON.parse(existing?.[f.name] || '[]');
          } catch {}
          const drop = new Set(formData.getAll(`${f.name}_remove`));
          toRemove.push(...list.filter((p) => drop.has(p)));
          list = list.filter((p) => !drop.has(p));
          for (const file of formData.getAll(f.name)) if (isFile(file)) list.push(await saveUpload(file, { imageOnly: true }));
          values[f.name] = JSON.stringify(list);
          break;
        }
        case 'password': {
          const pw = String(raw || '');
          if (pw) {
            if (pw.length < 10) errors.push('رمز عبور باید دست‌کم ۱۰ نویسه باشد.');
            else values[f.name] = hashPassword(pw);
          } else if (!existing) errors.push('برای مدیر تازه رمز عبور لازم است.');
          break;
        }
        case 'slug':
          break; // filled below, once the other fields are known
        default:
          values[f.name] = str(raw);
      }
      if (f.required && f.type !== 'password' && (values[f.name] === '' || values[f.name] === undefined || values[f.name] === null) && !(existing && ['image', 'file'].includes(f.type))) {
        errors.push(`«${f.label}» را پر کنید.`);
      }
    }
  } catch (e) {
    return fail(e.message || 'بارگذاری فایل انجام نشد.');
  }

  const slugField = res.fields.find((f) => f.type === 'slug');
  if (slugField) {
    let base = slugify(str(formData.get(slugField.name)) || values[slugField.from] || values[res.title]) || `item-${Date.now()}`;
    let slug = base;
    for (let n = 2; get(`SELECT id FROM ${resource} WHERE ${slugField.name} = ? AND id != ?`, slug, id || 0); n++) slug = `${base}-${n}`;
    values[slugField.name] = slug;
  }
  if (resource === 'users' && values.username && get('SELECT id FROM users WHERE username = ? AND id != ?', values.username, id || 0)) {
    errors.push('این نام کاربری قبلاً گرفته شده است.');
  }
  if (errors.length) return fail(errors.join(' '));

  const keys = Object.keys(values);
  if (existing) {
    run(`UPDATE ${resource} SET ${keys.map((k) => `${k} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...keys.map((k) => values[k]), id);
    // Changing a password signs that account out everywhere else.
    if (resource === 'users' && values.password && id !== me.id) run('DELETE FROM sessions WHERE user_id = ?', id);
  } else {
    run(`INSERT INTO ${resource} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, ...keys.map((k) => values[k]));
  }
  for (const p of toRemove) await removeUpload(p);

  revalidatePath('/', 'layout');
  redirect(`/admin/${resource}?saved=1`);
}

export async function deleteRecord(resource, id) {
  const me = await requireUser();
  const res = resources[resource];
  if (!res) return;
  const row = get(`SELECT * FROM ${resource} WHERE id = ?`, id);
  if (!row) redirect(`/admin/${resource}`);
  if (resource === 'users') {
    if (id === me.id) redirect('/admin/users?error=self');
    if (get('SELECT COUNT(*) n FROM users').n <= 1) redirect('/admin/users?error=last');
    run('DELETE FROM sessions WHERE user_id = ?', id);
  }
  run(`DELETE FROM ${resource} WHERE id = ?`, id);
  // Anything that pointed at the deleted row is simply unlinked.
  for (const [table, other] of Object.entries(resources)) {
    for (const f of other.fields) if (f.type === 'relation' && f.resource === resource) run(`UPDATE ${table} SET ${f.name} = NULL WHERE ${f.name} = ?`, id);
  }
  for (const f of res.fields) {
    if (f.type === 'image' || f.type === 'file') await removeUpload(row[f.name]);
    if (f.type === 'images') {
      try {
        for (const p of JSON.parse(row[f.name] || '[]')) await removeUpload(p);
      } catch {}
    }
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/${resource}?deleted=1`);
}

export async function saveSettings(_prev, formData) {
  await requireUser();
  for (const f of settingsFields) {
    let v = str(formData.get(f.name));
    if (f.type === 'url') v = cleanUrl(v);
    run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', f.name, v);
  }
  revalidatePath('/', 'layout');
  return { ok: true, nonce: Date.now() };
}

export async function relationOptions() {
  await requireUser();
  const out = {};
  for (const [name, res] of Object.entries(resources)) out[name] = all(`SELECT id, ${res.title} AS title FROM ${name} ORDER BY ${res.order}`);
  return out;
}
