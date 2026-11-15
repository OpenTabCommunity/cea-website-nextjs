import { all } from '@/lib/db';
import { PageHead, TeamPanel, Empty } from '@/components/site/Bits';

export const metadata = { title: 'تیم‌ها' };

export default function Teams() {
  const teams = all('SELECT * FROM teams ORDER BY sort, id');
  return (
    <>
      <PageHead title="تیم‌های انجمن" lead="کارهای انجمن در تیم‌ها پیش می‌رود. هر تیم مسئول، اعضا و برنامهٔ خودش را دارد." />
      <section className="block">
        <div className="in-w">
          {teams.length === 0 ? <Empty>هنوز تیمی ثبت نشده است.</Empty> : (
            <div className="duo">
              {teams.map((t, k) => (
                <TeamPanel key={t.id} team={t} delay={k * 120} withLoom={k === 0 && (t.color || 'firoozeh') === 'firoozeh'} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
