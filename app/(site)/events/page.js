import { all } from '@/lib/db';
import { nowTehran } from '@/lib/jalali';
import { PageHead, EventRow, Empty } from '@/components/site/Bits';

export const metadata = { title: 'رویدادها' };

export default function Events() {
  const now = nowTehran();
  const upcoming = all('SELECT * FROM events WHERE published = 1 AND starts_at >= ? ORDER BY starts_at ASC', now);
  const past = all('SELECT * FROM events WHERE published = 1 AND starts_at < ? ORDER BY starts_at DESC LIMIT 60', now);
  return (
    <>
      <PageHead title="رویدادها" lead="کارگاه‌ها، مسابقه‌ها، دوره‌ها و دورهمی‌های انجمن." />
      <section className="block">
        <div className="in-w">
          <div className="block-head"><h2 className="rise">پیش رو</h2></div>
          {upcoming.length === 0 ? <Empty>فعلاً رویدادی در برنامه نیست. به‌زودی خبرهای تازه اینجا می‌آید.</Empty> : upcoming.map((e, k) => <EventRow key={e.id} e={e} delay={k * 80} />)}
        </div>
      </section>
      {past.length > 0 && (
        <section className="block tone-navy">
          <div className="in-w">
            <div className="block-head"><h2 className="rise">برگزارشده</h2></div>
            {past.map((e, k) => <EventRow key={e.id} e={e} delay={Math.min(k, 6) * 60} />)}
          </div>
        </section>
      )}
    </>
  );
}
