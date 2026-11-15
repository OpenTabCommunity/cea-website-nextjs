import './admin.css';

export const metadata = { title: 'پنل مدیریت', robots: { index: false, follow: false } };

export default function AdminRoot({ children }) {
  return <div className="adm">{children}</div>;
}
