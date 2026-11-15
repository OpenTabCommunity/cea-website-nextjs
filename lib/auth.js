import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { get, run } from './db.js';

const COOKIE = 'ce_session';
const TWO_WEEKS = 14 * 24 * 3600;
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const secureCookie = () => process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1';

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Math.floor(Date.now() / 1000) + TWO_WEEKS;
  run('DELETE FROM sessions WHERE expires_at < ?', Math.floor(Date.now() / 1000));
  run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)', sha(token), userId, expires);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: secureCookie(), path: '/', maxAge: TWO_WEEKS });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) run('DELETE FROM sessions WHERE token_hash = ?', sha(token));
  jar.delete(COOKIE);
}

export async function getUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = get(
    'SELECT u.id, u.username, u.name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?',
    sha(token),
    Math.floor(Date.now() / 1000),
  );
  return row || null;
}

/** Every admin page and every admin action calls this first. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/admin/login');
  return user;
}

// Slow down password guessing: 6 failed tries per username lock it for 10 minutes.
const attempts = (globalThis.__ceAttempts ||= new Map());
export function loginAllowed(key) {
  const a = attempts.get(key);
  return !a || a.count < 6 || Date.now() - a.first > 10 * 60e3;
}
export function loginFailed(key) {
  const a = attempts.get(key);
  if (!a || Date.now() - a.first > 10 * 60e3) attempts.set(key, { count: 1, first: Date.now() });
  else a.count++;
}
export const loginSucceeded = (key) => attempts.delete(key);
