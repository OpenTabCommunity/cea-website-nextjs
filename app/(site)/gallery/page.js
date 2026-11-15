import Link from 'next/link';
import { all } from '@/lib/db';
import { formatDate, fa } from '@/lib/jalali';
import { PageHead, Cover, Empty } from '@/components/site/Bits';

export const metadata = { title: 'گالری' };

const images = (row) => {
  try {
    return JSON.parse(row.images || '[]');
  } catch {
    return [];
  }
};

export default function Gallery() {
  const albums = all('SELECT * FROM albums WHERE published = 1 ORDER BY date DESC, id DESC');
  return (
    <>
      <PageHead title="گالری" lead="عکس‌هایی از رویدادها و روزهای انجمن." />
      <section className="block">
        <div className="in-w">
          {albums.length === 0 ? <Empty>هنوز آلبومی منتشر نشده است.</Empty> : (
            <div className="cards">
              {albums.map((a, k) => {
                const list = images(a);
                return (
                  <Link className="card rise" href={`/gallery/${a.id}`} key={a.id} style={{ '--d': `${Math.min(k, 6) * 90}ms` }}>
                    <Cover src={list[0]} seed={a.id} className="weave" />
                    <span className="card-meta">{[formatDate(a.date), `${fa(list.length)} عکس`].filter(Boolean).join(' · ')}</span>
                    <h3>{a.title}</h3>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
