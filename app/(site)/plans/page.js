import { all } from '@/lib/db';
import { PLAN_STATUS } from '@/lib/resources';
import { PageHead, Empty } from '@/components/site/Bits';

export const metadata = { title: 'برنامه‌ها' };

const ORDER = ['doing', 'planned', 'done'];

export default function Plans() {
  const plans = all('SELECT * FROM plans ORDER BY sort, id');
  const label = Object.fromEntries(PLAN_STATUS);
  return (
    <>
      <PageHead title="برنامه‌ها" lead="کارهایی که در دست داریم، کارهایی که در راه است و کارهایی که تمام شده." tone="cobalt" />
      <section className="block">
        <div className="in-w">
          {plans.length === 0 ? <Empty>هنوز برنامه‌ای ثبت نشده است.</Empty> : (
            <div className="board">
              {ORDER.map((st, n) => {
                const list = plans.filter((p) => (p.status || 'planned') === st);
                return (
                  <div className={`lane lane-${st} rise`} key={st} style={{ '--d': `${n * 120}ms` }}>
                    <h2>{label[st]}</h2>
                    {list.length === 0 && <p className="lane-empty">موردی نیست</p>}
                    {list.map((p) => (
                      <article className="plan" key={p.id}>
                        <h3>{p.title}</h3>
                        {p.description && <p>{p.description}</p>}
                        {p.target && <small>{p.target}</small>}
                      </article>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
