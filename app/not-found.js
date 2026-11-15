import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(4rem, 16vw, 10rem)', fontWeight: 900, color: '#f2b83b', lineHeight: 1.2 }}>۴۰۴</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: 24 }}>این صفحه پیدا نشد.</p>
        <Link href="/" style={{ fontWeight: 800, textDecoration: 'underline' }}>بازگشت به صفحهٔ اصلی</Link>
      </div>
    </main>
  );
}
