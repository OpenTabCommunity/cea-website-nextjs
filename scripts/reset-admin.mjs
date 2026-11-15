// Usage: npm run reset-admin -- <username> <new-password>
// Sets (or creates) an admin account. Use it if you are locked out.
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { hashPassword } from '../lib/password.js';

const [username, password] = process.argv.slice(2);
if (!username || !password || password.length < 10) {
  console.error('Usage: npm run reset-admin -- <username> <new-password (10+ characters)>');
  process.exit(1);
}
const db = new DatabaseSync(path.join(path.resolve(process.env.DATA_DIR || './data'), 'site.db'));
const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
if (user) {
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(password), user.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
  console.log(`Password updated for "${username}".`);
} else {
  db.prepare('INSERT INTO users (username, name, password) VALUES (?, ?, ?)').run(username, username, hashPassword(password));
  console.log(`Admin "${username}" created.`);
}
