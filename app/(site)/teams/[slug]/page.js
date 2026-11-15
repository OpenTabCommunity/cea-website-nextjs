import { notFound } from 'next/navigation';
import { all, get } from '@/lib/db';
import { decodeParam } from '@/lib/params';
import { renderMarkdown } from '@/lib/md';
import { PageHead, Member, EventRow, PostCard } from '@/components/site/Bits';

const find = async (params) => get('SELECT * FROM teams WHERE slug = ?', decodeParam((await params).slug));

export async function generateMetadata({ params }) {
  const team = await find(params);
  return team ? { title: team.name_en ? `${team.name_en} (${team.name})` : team.name, description: team.tagline } : {};
}

export default async function TeamPage({ params }) {
  const team = await find(params);
  if (!team) notFound();
  const members = all('SELECT * FROM members WHERE active = 1 AND team_id = ? ORDER BY sort, id', team.id);
  const events = all('SELECT * FROM events WHERE published = 1 AND team_id = ? ORDER BY starts_at DESC LIMIT 6', team.id);
  const posts = all('SELECT * FROM posts WHERE published = 1 AND team_id = ? ORDER BY published_at DESC LIMIT 6', team.id);
  return (
    <>
      <PageHead title={team.name_en || team.name} lead={team.tagline} tone={team.color || 'firoozeh'}>
        <div className="head-meta rise" style={{ '--d': '160ms' }}>
          {team.name_en && <span>{team.name}</span>}
          {team.status === 'soon' && <span className="tag">به‌زودی</span>}
          {team.link && <a className="btn small" href={team.link} target="_blank" rel="noopener noreferrer">پیوند تیم</a>}
        </div>
      </PageHead>
      {team.body && (
        <section className="block">
          <div className="in-w"><div className="prose rise" dangerouslySetInnerHTML={{ __html: renderMarkdown(team.body) }} /></div>
        </section>
      )}
      {members.length > 0 && (
        <section className="block tone-navy">
          <div className="in-w">
            <div className="block-head"><h2 className="rise">اعضای تیم</h2></div>
            <div className="members">{members.map((m, k) => <Member key={m.id} m={m} delay={k * 60} />)}</div>
          </div>
        </section>
      )}
      {events.length > 0 && (
        <section className="block">
          <div className="in-w">
            <div className="block-head"><h2 className="rise">رویدادهای تیم</h2></div>
            {events.map((e, k) => <EventRow key={e.id} e={e} delay={k * 80} />)}
          </div>
        </section>
      )}
      {posts.length > 0 && (
        <section className="block tone-navy">
          <div className="in-w">
            <div className="block-head"><h2 className="rise">نوشته‌های تیم</h2></div>
            <div className="cards">{posts.map((p, k) => <PostCard key={p.id} post={p} delay={k * 100} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
