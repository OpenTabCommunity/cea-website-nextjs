import Link from 'next/link';
import { all, getSettings } from '@/lib/db';
import { nowTehran, fa } from '@/lib/jalali';
import HeroScene from '@/components/site/HeroScene';
import { EventRow, PostCard, TeamPanel, Member, Arrow } from '@/components/site/Bits';

export default function Home() {
  const s = getSettings();
  const stats = all('SELECT * FROM stats ORDER BY sort, id LIMIT 4');
  const teams = all('SELECT * FROM teams ORDER BY sort, id');
  let events = all('SELECT * FROM events WHERE published = 1 AND starts_at >= ? ORDER BY starts_at ASC LIMIT 4', nowTehran());
  const upcoming = events.length > 0;
  if (!upcoming) events = all('SELECT * FROM events WHERE published = 1 ORDER BY starts_at DESC LIMIT 3');
  const posts = all('SELECT * FROM posts WHERE published = 1 ORDER BY published_at DESC, id DESC LIMIT 3');
  const board = all('SELECT * FROM members WHERE active = 1 AND is_board = 1 ORDER BY sort, id LIMIT 8');
  const words = [...teams.map((t) => t.name_en || t.name), 'کارگاه', 'مسابقه', 'هکاتون', 'نشریه', 'متن‌باز', 'دورهمی'];
  const join = s.join_url || '/#contact';

  return (
    <>
      <HeroScene
        title={s.hero_title}
        highlight={s.hero_highlight}
        text={s.hero_text}
        statement={s.statement}
        primary={{ href: join, label: 'عضویت در انجمن' }}
        secondary={{ href: '/events', label: 'رویدادهای پیش رو' }}
      />
      <div className="band" aria-hidden="true" />

      <section className="about">
        <div className="in-w about-grid">
          <div>
            <h2 className="rise">{s.about_title}</h2>
            <p className="lead rise" style={{ '--d': '120ms' }}>{s.about_text}</p>
            <Link className="text-link rise" style={{ '--d': '200ms' }} href="/members">اعضای انجمن را ببینید <Arrow /></Link>
          </div>
          {stats.length > 0 && (
            <div className="stats">
              {stats.map((st, k) => (
                <div className="stat weave" key={st.id} style={{ '--d': `${k * 120}ms` }}>
                  <b data-count={st.value}>{fa(st.value)}</b>
                  <span>{st.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mq" aria-hidden="true">
        <div className="mq-t">
          {[...words, ...words].map((w, k) => (
            <span key={k}>{w}</span>
          ))}
        </div>
      </div>

      {teams.length > 0 && (
        <section className="block">
          <div className="in-w">
            <div className="block-head">
              <h2 className="rise">تیم‌های انجمن</h2>
              <p className="rise" style={{ '--d': '120ms' }}>هر تیم صفحه، اعضا و کارهای خودش را دارد.</p>
            </div>
            <div className="duo">
              {teams.map((t, k) => (
                <TeamPanel key={t.id} team={t} delay={k * 140} withLoom={k === 0 && (t.color || 'firoozeh') === 'firoozeh'} />
              ))}
            </div>
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="block tone-navy">
          <div className="in-w">
            <div className="block-head">
              <h2 className="rise">{upcoming ? 'رویدادهای پیش رو' : 'آخرین رویدادها'}</h2>
              <Link className="text-link rise" href="/events">همهٔ رویدادها <Arrow /></Link>
            </div>
            {events.map((e, k) => (
              <EventRow key={e.id} e={e} delay={k * 90} />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="block">
          <div className="in-w">
            <div className="block-head">
              <h2 className="rise">تازه‌ها</h2>
              <Link className="text-link rise" href="/news">همهٔ نوشته‌ها <Arrow /></Link>
            </div>
            <div className="cards">
              {posts.map((p, k) => (
                <PostCard key={p.id} post={p} delay={k * 110} />
              ))}
            </div>
          </div>
        </section>
      )}

      {board.length > 0 && (
        <section className="block tone-navy">
          <div className="in-w">
            <div className="block-head">
              <h2 className="rise">شورای مرکزی</h2>
              <Link className="text-link rise" href="/members">همهٔ اعضا <Arrow /></Link>
            </div>
            <div className="members">
              {board.map((m, k) => (
                <Member key={m.id} m={m} delay={k * 60} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="join">
        <div className="in-w">
          <h2 className="rise">عضو انجمن شوید</h2>
          <p className="rise" style={{ '--d': '120ms' }}>تجربهٔ قبلی لازم نیست. کافی است بخواهید یاد بگیرید و در کارها سهم داشته باشید.</p>
          <Link className="btn rise" style={{ '--d': '200ms' }} href={join}>عضویت در انجمن</Link>
        </div>
      </section>
    </>
  );
}
