import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR } from './db.js';

// Only these types are accepted, checked by the file's first bytes and not by its name.
// SVG is left out on purpose: it can carry scripts.
const SNIFF = [
  { ext: 'jpg', mime: 'image/jpeg', image: true, test: (b) => b[0] === 0xff && b[1] === 0xd8 },
  { ext: 'png', mime: 'image/png', image: true, test: (b) => b.subarray(0, 4).toString('hex') === '89504e47' },
  { ext: 'gif', mime: 'image/gif', image: true, test: (b) => b.subarray(0, 4).toString() === 'GIF8' },
  { ext: 'webp', mime: 'image/webp', image: true, test: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
  { ext: 'avif', mime: 'image/avif', image: true, test: (b) => b.subarray(4, 12).toString() === 'ftypavif' },
  { ext: 'pdf', mime: 'application/pdf', image: false, test: (b) => b.subarray(0, 4).toString() === '%PDF' },
];
export const MIME = Object.fromEntries(SNIFF.map((s) => [s.ext, s.mime]));

const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_FILE = 50 * 1024 * 1024;

/** Saves an uploaded File and returns its public path, or throws an Error with a Persian message. */
export async function saveUpload(file, { imageOnly }) {
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = SNIFF.find((s) => s.test(buf));
  if (!kind || (imageOnly && !kind.image)) {
    throw new Error(imageOnly ? 'فقط تصویر با قالب JPG، PNG، WebP، AVIF یا GIF پذیرفته می‌شود.' : 'فقط فایل PDF یا تصویر پذیرفته می‌شود.');
  }
  const limit = kind.image ? MAX_IMAGE : MAX_FILE;
  if (buf.length > limit) throw new Error(`حجم فایل بیشتر از ${limit / 1024 / 1024} مگابایت است.`);
  const folder = String(new Date().getFullYear());
  const name = `${crypto.randomBytes(12).toString('hex')}.${kind.ext}`;
  await fs.mkdir(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, folder), { recursive: true });
  await fs.writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, folder, name), buf);
  return `/uploads/${folder}/${name}`;
}

export async function removeUpload(publicPath) {
  const m = /^\/uploads\/(\d{4})\/([a-f0-9]{24}\.[a-z0-9]+)$/.exec(publicPath || '');
  if (!m) return;
  await fs.rm(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, m[1], m[2]), { force: true });
}
