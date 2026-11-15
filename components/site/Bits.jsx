import Link from 'next/link';
import { optionLabel, resources, EVENT_KINDS } from '@/lib/resources';
import { formatDate, formatDayMonth, parts, fa } from '@/lib/jalali';
import { Loom } from './Client';

export const Arrow = () => <span className="arrow" aria-hidden="true">←</span>;

export function PageHead({ title, lead, tone = 'navy', children }) {
  return (
    <header className={`page-head tone-${tone}`}>
      <div className="in-w">
        <h1 className="rise">{title}</h1>
        {lead && <p className="rise" style={{ '--d': '100ms' }}>{lead}</p>}
        {children}
      </div>
      <div className="band" aria-hidden="true" />
    </header>
  );
}

/** A picture when there is one, otherwise one of five woven patterns picked by id. */
export function Cover({ src, alt = '', seed = 0, className = '' }) {
  if (src) return <img className={`cover ${className}`} src={src} alt={alt} loading="lazy" />;
  return <div className={`cover pat pat-${Math.abs(seed) % 5} ${className}`} aria-hidden="true" />;
}

export function initials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : '';
  return last ? `${first}‌${last}` : first;
}

export function Member({ m, delay = 0 }) {
  const body = (
    <>
      {m.photo ? <img className="avatar" src={m.photo} alt="" loading="lazy" /> : <span className={`avatar tint-${m.id % 5}`} aria-hidden="true">{initials(m.name)}</span>}
      <span className="member-text">
        <b>{m.name}</b>
        {m.role && <span>{m.role}</span>}
        {m.year && <small>ورودی {m.year}</small>}
      </span>
    </>
  );
  const props = { className: 'member rise', style: { '--d': `${delay}ms` } };
  return m.link ? <a {...props} href={m.link} target="_blank" rel="noopener noreferrer">{body}</a> : <div {...props}>{body}</div>;
}

const kindField = resources.events.fields.find((f) => f.name === 'kind');
export const eventKind = (v) => optionLabel({ options: EVENT_KINDS }, v) || optionLabel(kindField, v);

export function EventRow({ e, delay = 0 }) {
  const p = parts(e.starts_at);
  const meta = [eventKind(e.kind), e.location, p?.hasTime ? `ساعت ${fa(`${p.hour}:${p.minute}`)}` : null].filter(Boolean).join(' · ');
  return (
    <Link className="row rise" href={`/events/${e.slug}`} style={{ '--d': `${delay}ms` }}>
      <span className="day">{formatDayMonth(e.starts_at)}</span>
      <span className="row-text">
        <b>{e.title}</b>
        <small>{meta}</small>
      </span>
      <Arrow />
    </Link>
  );
}

export function PostCard({ post, delay = 0 }) {
  return (
    <Link className="card rise" href={`/news/${post.slug}`} style={{ '--d': `${delay}ms` }}>
      <Cover src={post.cover} seed={post.id} className="weave" />
      <span className="card-meta">{post.kind === 'article' ? 'مقاله' : 'خبر'} · {formatDate(post.published_at)}</span>
      <h3>{post.title}</h3>
      {post.excerpt && <p>{post.excerpt}</p>}
    </Link>
  );
}

export function TeamPanel({ team, delay = 0, withLoom = false }) {
  return (
    <Link className={`panel c-${team.color || 'firoozeh'} rise tilt`} href={`/teams/${team.slug}`} style={{ '--d': `${delay}ms` }}>
      {team.status === 'soon' && <span className="tag">به‌زودی</span>}
      <h3 className={team.name_en ? 'ltr' : undefined}>{team.name_en || team.name}</h3>
      {team.name_en && <span className="panel-fa">{team.name}</span>}
      {team.tagline && <p>{team.tagline}</p>}
      {withLoom ? <Loom /> : <span className="sheets" aria-hidden="true"><i /><i /><i /></span>}
      <span className="more">صفحهٔ تیم <Arrow /></span>
    </Link>
  );
}

export function Empty({ children }) {
  return <p className="empty">{children}</p>;
}
