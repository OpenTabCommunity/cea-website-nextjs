import { all } from '@/lib/db';
import { PageHead, Member, Empty } from '@/components/site/Bits';

export const metadata = { title: 'اعضا' };

export default function Members() {
  const members = all('SELECT * FROM members WHERE active = 1 ORDER BY sort, id');
  const teams = all('SELECT id, name, name_en FROM teams ORDER BY sort, id');
  const board = members.filter((m) => m.is_board);
  const groups = teams.map((t) => ({ title: t.name_en ? `${t.name_en} (${t.name})` : t.name, list: members.filter((m) => m.team_id === t.id) })).filter((g) => g.list.length);
  const rest = members.filter((m) => !m.is_board && !teams.some((t) => t.id === m.team_id));
  const sections = [{ title: 'شورای مرکزی', list: board }, ...groups, { title: 'دیگر اعضا', list: rest }].filter((s) => s.list.length);
  return (
    <>
      <PageHead title="اعضای انجمن" lead="کسانی که انجمن را می‌گردانند." />
      {sections.length === 0 && <section className="block"><div className="in-w"><Empty>هنوز عضوی ثبت نشده است.</Empty></div></section>}
      {sections.map((s, n) => (
        <section className={`block${n % 2 ? ' tone-navy' : ''}`} key={s.title}>
          <div className="in-w">
            <div className="block-head"><h2 className="rise">{s.title}</h2></div>
            <div className="members">{s.list.map((m, k) => <Member key={m.id} m={m} delay={Math.min(k, 8) * 50} />)}</div>
          </div>
        </section>
      ))}
    </>
  );
}
