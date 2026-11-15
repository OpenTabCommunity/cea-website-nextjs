import Link from 'next/link';
import { getSettings } from '@/lib/db';
import { patternVars } from '@/lib/carpet';
import { Effects, SiteNav } from '@/components/site/Client';
import './site.css';

const LINKS = [
  { href: '/teams', label: 'تیم‌ها' },
  { href: '/events', label: 'رویدادها' },
  { href: '/news', label: 'خبرها و مقاله‌ها' },
  { href: '/publications', label: 'نشریه' },
  { href: '/members', label: 'اعضا' },
  { href: '/achievements', label: 'افتخارات' },
  { href: '/plans', label: 'برنامه‌ها' },
  { href: '/gallery', label: 'گالری' },
];

export default function SiteLayout({ children }) {
  const s = getSettings();
  const join = s.join_url || '/#contact';
  const socials = [['تلگرام', s.telegram], ['اینستاگرام', s.instagram], ['گیت‌هاب', s.github], ['لینکدین', s.linkedin]].filter(([, url]) => url);
  return (
    <div className="site" style={patternVars()}>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      <a className="skip" href="#main">رفتن به محتوا</a>
      <div className="grain" aria-hidden="true" />
      <SiteNav brand={s.short_name} links={LINKS} join={join} />
      <main id="main">{children}</main>
      <footer className="footer" id="contact">
        <div className="band flip" aria-hidden="true" />
        <div className="in-w footer-grid">
          <div>
            <h2>تماس با انجمن</h2>
            {s.address && <p>{s.address}</p>}
            {s.email && <p><a className="ltr" href={`mailto:${s.email}`}>{s.email}</a></p>}
            {socials.length > 0 && (
              <ul className="socials">
                {socials.map(([label, url]) => (
                  <li key={label}><a href={url} target="_blank" rel="noopener noreferrer">{label}</a></li>
                ))}
              </ul>
            )}
          </div>
          <nav aria-label="پیوندهای پایین صفحه">
            <ul className="footer-links">
              {LINKS.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="footer-big rise" aria-hidden="true">{s.short_name}</div>
        <p className="footer-note">{s.site_name}</p>
      </footer>
      <Effects />
    </div>
  );
}
