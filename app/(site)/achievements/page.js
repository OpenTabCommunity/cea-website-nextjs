import { all } from '@/lib/db';
import { PageHead, Empty } from '@/components/site/Bits';

export const metadata = { title: 'افتخارات' };

export default function Achievements() {
  const items = all('SELECT * FROM achievements ORDER BY sort, year DESC, id DESC');
  return (
    <>
      <PageHead title="افتخارات" lead="آنچه اعضای انجمن در این سال‌ها به دست آورده‌اند." tone="laki" />
      <section className="block">
        <div className="in-w">
          {items.length === 0 ? <Empty>هنوز موردی ثبت نشده است.</Empty> : (
            <ol className="honors">
              {items.map((a, k) => (
                <li className="honor rise" key={a.id} style={{ '--d': `${Math.min(k, 6) * 90}ms` }}>
                  <span className="honor-year">{a.year}</span>
                  <div>
                    <h3>{a.title}</h3>
                    {a.description && <p>{a.description}</p>}
                  </div>
                  {a.image && <img className="weave" src={a.image} alt="" loading="lazy" />}
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
