'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminNav({ groups, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href) => (href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <aside className={`adm-side${open ? ' open' : ''}`}>
      <div className="adm-side-top">
        <Link href="/admin" className="adm-logo">پنل مدیریت</Link>
        <button type="button" className="adm-burger" aria-expanded={open} aria-controls="adm-menu" onClick={() => setOpen(!open)}>
          {open ? 'بستن' : 'فهرست'}
        </button>
      </div>
      <nav id="adm-menu" aria-label="بخش‌های پنل">
        <Link href="/admin" className={active('/admin') ? 'on' : ''}>پیشخوان</Link>
        {Object.entries(groups).map(([title, items]) => (
          <div key={title}>
            <h2>{title}</h2>
            {items.map((it) => (
              <Link key={it.href} href={it.href} className={active(it.href) ? 'on' : ''} aria-current={active(it.href) ? 'page' : undefined}>
                {it.label}
              </Link>
            ))}
          </div>
        ))}
        {children}
      </nav>
    </aside>
  );
}
