import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { resources } from '@/lib/resources';
import { logout } from '../actions';
import AdminNav from '@/components/admin/AdminNav';

export default async function PanelLayout({ children }) {
  const user = await requireUser();
  const groups = {};
  for (const [key, r] of Object.entries(resources)) (groups[r.group] ||= []).push({ href: `/admin/${key}`, label: r.label });
  groups['تنظیمات'].unshift({ href: '/admin/settings', label: 'متن‌ها و تماس' });
  return (
    <div className="adm-shell">
      <AdminNav groups={groups}>
        <div className="adm-user">
          <span>{user.name || user.username}</span>
          <Link href="/" target="_blank">دیدن سایت</Link>
          <form action={logout}>
            <button className="adm-link">خروج</button>
          </form>
        </div>
      </AdminNav>
      <main className="adm-main">{children}</main>
    </div>
  );
}
