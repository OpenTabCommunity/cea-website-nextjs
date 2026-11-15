import localFont from 'next/font/local';
import { getSettings } from '@/lib/db';
import './globals.css';

const vazir = localFont({ src: './fonts/Vazirmatn.woff2', weight: '100 900', display: 'swap', variable: '--font-vazir' });

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  const s = getSettings();
  return { title: { default: s.site_name, template: `%s | ${s.short_name}` }, description: s.hero_text };
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#060918' };

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
