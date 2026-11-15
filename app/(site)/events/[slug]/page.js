import Link from 'next/link';
import { notFound } from 'next/navigation';
import { get } from '@/lib/db';
import { decodeParam } from '@/lib/params';
import { renderMarkdown } from '@/lib/md';
import { formatDateTime, nowTehran } from '@/lib/jalali';
import { PageHead, eventKind, Arrow } from '@/components/site/Bits';

const find = async (params) => get('SELECT * FROM events WHERE published = 1 AND slug = ?', decodeParam((await params).slug));

export async function generateMetadata({ params }) {
  const e = await find(params);
  return e ? { title: e.title, description: e.summary } : {};
}

export default async function EventPage({ params }) {
  const e = await find(params);
  if (!e) notFound();
  const team = e.team_id ? get('SELECT name, name_en, slug FROM teams WHERE id = ?', e.team_id) : null;
  const over = e.starts_at < nowTehran();
  return (
    <>
      <PageHead title={e.title} lead={e.summary}>
        <dl className="facts rise" style={{ '--d': '160ms' }}>
          <div><dt>نوع</dt><dd>{eventKind(e.kind)}</dd></div>
          <div><dt>زمان</dt><dd>{formatDateTime(e.starts_at)}</dd></div>
          {e.location && <div><dt>مکان</dt><dd>{e.location}</dd></div>}
          {team && <div><dt>برگزارکننده</dt><dd><Link href={`/teams/${team.slug}`}>{team.name_en || team.name}</Link></dd></div>}
        </dl>
        {over ? <p className="tag rise">این رویداد برگزار شده است</p> : e.register_url && <a className="btn rise" style={{ '--d': '220ms' }} href={e.register_url} target="_blank" rel="noopener noreferrer">ثبت‌نام</a>}
      </PageHead>
      <section className="block">
        <div className="in-w article">
          {e.cover && <img className="article-cover weave" src={e.cover} alt="" />}
          {e.body && <div className="prose rise" dangerouslySetInnerHTML={{ __html: renderMarkdown(e.body) }} />}
          <Link className="text-link" href="/events">همهٔ رویدادها <Arrow /></Link>
        </div>
      </section>
    </>
  );
}
