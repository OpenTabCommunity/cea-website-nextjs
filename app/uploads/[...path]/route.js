import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR } from '@/lib/db';
import { MIME } from '@/lib/uploads';

export async function GET(_req, { params }) {
  const parts = (await params).path || [];
  // Only "<year>/<random-hex>.<ext>" is ever served, so nothing outside the uploads folder can be reached.
  if (parts.length !== 2 || !/^\d{4}$/.test(parts[0]) || !/^[a-f0-9]{24}\.[a-z0-9]+$/.test(parts[1])) return new Response('Not found', { status: 404 });
  const type = MIME[parts[1].split('.').pop()];
  if (!type) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, parts[0], parts[1]));
    return new Response(data, {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
