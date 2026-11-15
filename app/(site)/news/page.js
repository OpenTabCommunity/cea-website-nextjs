import Link from 'next/link';
import { all } from '@/lib/db';
import { PageHead, PostCard, Empty } from '@/components/site/Bits';

export const metadata = { title: 'خبرها و مقاله‌ها' };

const TABS = [['', 'همه'], ['news', 'خبرها'], ['article', 'مقاله‌ها']];

export default async function News({ searchParams }) {
  const kind = ['news', 'article'].includes((await searchParams).kind) ? (await searchParams).kind : '';
  const posts = kind
    ? all('SELECT * FROM posts WHERE published = 1 AND kind = ? ORDER BY published_at DESC, id DESC LIMIT 90', kind)
    : all('SELECT * FROM posts WHERE published = 1 ORDER BY published_at DESC, id DESC LIMIT 90');
  return (
    <>
      <PageHead title="خبرها و مقاله‌ها" lead="اطلاعیه‌های انجمن و نوشته‌های اعضا.">
        <nav className="tabs rise" style={{ '--d': '160ms' }} aria-label="نوع نوشته">
          {TABS.map(([v, label]) => (
            <Link key={v} href={v ? `/news?kind=${v}` : '/news'} className={kind === v ? 'on' : ''} aria-current={kind === v ? 'page' : undefined}>{label}</Link>
          ))}
        </nav>
      </PageHead>
      <section className="block">
        <div className="in-w">
          {posts.length === 0 ? <Empty>هنوز نوشته‌ای منتشر نشده است.</Empty> : <div className="cards">{posts.map((p, k) => <PostCard key={p.id} post={p} delay={Math.min(k, 6) * 90} />)}</div>}
        </div>
      </section>
    </>
  );
}
