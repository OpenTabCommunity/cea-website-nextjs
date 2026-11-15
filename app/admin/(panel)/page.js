import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { all, get } from '@/lib/db';
import { resources } from '@/lib/resources';
import { fa, formatDateTime, nowTehran } from '@/lib/jalali';

export default async function Dashboard() {
  const user = await requireUser();
  const counts = Object.entries(resources)
    .filter(([key]) => key !== 'users' && key !== 'stats')
    .map(([key, r]) => ({ key, label: r.label, singular: r.singular, n: get(`SELECT COUNT(*) n FROM ${key}`).n }));
  const upcoming = all('SELECT id, title, starts_at FROM events WHERE starts_at >= ? ORDER BY starts_at ASC LIMIT 5', nowTehran());
  return (
    <>
      <header className="adm-head">
        <div>
          <h1>سلام {user.name || user.username}</h1>
          <p>از اینجا همهٔ محتوای سایت را می‌توانید اضافه، ویرایش یا حذف کنید.</p>
        </div>
      </header>
      <div className="adm-tiles">
        {counts.map((c) => (
          <div className="adm-tile" key={c.key}>
            <b>{fa(c.n)}</b>
            <span>{c.label}</span>
            <div>
              <Link href={`/admin/${c.key}`}>مدیریت</Link>
              <Link href={`/admin/${c.key}/new`}>افزودن {c.singular}</Link>
            </div>
          </div>
        ))}
      </div>
      <section className="adm-panel">
        <h2>رویدادهای پیش رو</h2>
        {upcoming.length === 0 ? (
          <p className="adm-empty">رویدادی در پیش نیست. <Link href="/admin/events/new">یک رویداد اضافه کنید.</Link></p>
        ) : (
          <ul className="adm-list">
            {upcoming.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/events/${e.id}`}>{e.title}</Link>
                <span>{formatDateTime(e.starts_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
