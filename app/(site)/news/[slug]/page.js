import Link from 'next/link';
import { notFound } from 'next/navigation';
import { get } from '@/lib/db';
import { decodeParam } from '@/lib/params';
import { renderMarkdown } from '@/lib/md';
import { formatDate } from '@/lib/jalali';
import { PageHead, Arrow } from '@/components/site/Bits';

const find = async (params) => get('SELECT * FROM posts WHERE published = 1 AND slug = ?', decodeParam((await params).slug));

export async function generateMetadata({ params }) {
  const p = await find(params);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function PostPage({ params }) {
  const p = await find(params);
  if (!p) notFound();
  const meta = [p.kind === 'article' ? 'مقاله' : 'خبر', formatDate(p.published_at), p.author].filter(Boolean).join(' · ');
  return (
    <>
      <PageHead title={p.title} lead={p.excerpt}>
        <p className="head-meta rise" style={{ '--d': '160ms' }}>{meta}</p>
      </PageHead>
      <section className="block">
        <article className="in-w article">
          {p.cover && <img className="article-cover weave" src={p.cover} alt="" />}
          <div className="prose rise" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
          <Link className="text-link" href="/news">همهٔ نوشته‌ها <Arrow /></Link>
        </article>
      </section>
    </>
  );
}
