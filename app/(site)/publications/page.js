import { all } from '@/lib/db';
import { formatDate } from '@/lib/jalali';
import { PageHead, Cover, Empty } from '@/components/site/Bits';

export const metadata = { title: 'نشریه' };

export default function Publications() {
  const issues = all('SELECT * FROM publications WHERE published = 1 ORDER BY published_at DESC, id DESC');
  return (
    <>
      <PageHead title="نشریه" lead="شماره‌های نشریهٔ انجمن را از اینجا بخوانید و دریافت کنید." tone="cream" />
      <section className="block">
        <div className="in-w">
          {issues.length === 0 ? <Empty>هنوز شماره‌ای منتشر نشده است.</Empty> : (
            <div className="issues">
              {issues.map((it, k) => (
                <article className="issue rise" key={it.id} style={{ '--d': `${Math.min(k, 6) * 90}ms` }}>
                  <Cover src={it.cover} seed={it.id} className="weave" alt={`جلد ${it.title}`} />
                  <span className="card-meta">{[it.issue, formatDate(it.published_at)].filter(Boolean).join(' · ')}</span>
                  <h3>{it.title}</h3>
                  {it.description && <p>{it.description}</p>}
                  {it.file && <a className="btn small" href={it.file} target="_blank" rel="noopener noreferrer">دریافت PDF</a>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
