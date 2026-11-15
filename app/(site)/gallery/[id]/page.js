import Link from 'next/link';
import { notFound } from 'next/navigation';
import { get } from '@/lib/db';
import { formatDate } from '@/lib/jalali';
import { PageHead, Arrow, Empty } from '@/components/site/Bits';

const find = async (params) => get('SELECT * FROM albums WHERE published = 1 AND id = ?', Number((await params).id) || 0);

export async function generateMetadata({ params }) {
  const a = await find(params);
  return a ? { title: a.title, description: a.description } : {};
}

export default async function Album({ params }) {
  const a = await find(params);
  if (!a) notFound();
  let list = [];
  try {
    list = JSON.parse(a.images || '[]');
  } catch {}
  return (
    <>
      <PageHead title={a.title} lead={a.description}>
        {a.date && <p className="head-meta rise" style={{ '--d': '160ms' }}>{formatDate(a.date)}</p>}
      </PageHead>
      <section className="block">
        <div className="in-w">
          {list.length === 0 ? <Empty>این آلبوم هنوز عکسی ندارد.</Empty> : (
            <div className="photos">
              {list.map((src, k) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="photo weave" style={{ '--d': `${Math.min(k, 8) * 60}ms` }}>
                  <img src={src} alt={`${a.title}، عکس ${k + 1}`} loading="lazy" />
                </a>
              ))}
            </div>
          )}
          <Link className="text-link" href="/gallery">همهٔ آلبوم‌ها <Arrow /></Link>
        </div>
      </section>
    </>
  );
}
