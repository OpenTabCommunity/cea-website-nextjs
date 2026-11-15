import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { all } from '@/lib/db';
import { resources, optionLabel } from '@/lib/resources';
import { fa, formatDate, formatDateTime } from '@/lib/jalali';
import { deleteRecord } from '../../actions';
import { DeleteButton } from '@/components/admin/Forms';

const NOTICES = { saved: 'ذخیره شد.', deleted: 'حذف شد.' };
const ERRORS = { self: 'نمی‌توانید حساب خودتان را حذف کنید.', last: 'دست‌کم یک مدیر باید باقی بماند.' };

export default async function ListPage({ params, searchParams }) {
  await requireUser();
  const { resource } = await params;
  const query = await searchParams;
  const res = resources[resource];
  if (!res) notFound();
  const rows = all(`SELECT * FROM ${resource} ORDER BY ${res.order}`);
  const cols = res.list.map((name) => res.fields.find((f) => f.name === name));
  const related = {};
  for (const f of cols) if (f.type === 'relation') related[f.name] = Object.fromEntries(all(`SELECT id, ${resources[f.resource].title} AS t FROM ${f.resource}`).map((r) => [r.id, r.t]));

  const cell = (f, row) => {
    const v = row[f.name];
    if (f.type === 'bool') return v ? 'بله' : 'خیر';
    if (f.type === 'select') return optionLabel(f, v);
    if (f.type === 'relation') return related[f.name][v] || '—';
    if (f.type === 'jdate') return formatDate(v) || '—';
    if (f.type === 'jdatetime') return formatDateTime(v) || '—';
    if (f.type === 'number') return fa(v ?? 0);
    return v || '—';
  };
  const notice = Object.keys(NOTICES).find((k) => query[k]);

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>{res.label}</h1>
          <p>{fa(rows.length)} مورد</p>
        </div>
        <Link className="adm-btn" href={`/admin/${resource}/new`}>افزودن {res.singular}</Link>
      </header>
      {notice && <p className="adm-alert good" role="status">{NOTICES[notice]}</p>}
      {ERRORS[query.error] && <p className="adm-alert bad" role="alert">{ERRORS[query.error]}</p>}
      {rows.length === 0 ? (
        <div className="adm-panel adm-empty">
          <p>هنوز چیزی اینجا نیست.</p>
          <Link className="adm-btn" href={`/admin/${resource}/new`}>اولین {res.singular} را اضافه کنید</Link>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>{res.fields.find((f) => f.name === res.title).label}</th>
                {cols.map((f) => (
                  <th key={f.name}>{f.label}</th>
                ))}
                <th><span className="adm-sr">کارها</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><Link href={`/admin/${resource}/${row.id}`} className="adm-title">{row[res.title] || 'بدون عنوان'}</Link></td>
                  {cols.map((f) => (
                    <td key={f.name}>{cell(f, row)}</td>
                  ))}
                  <td className="adm-row-actions">
                    <Link className="adm-link" href={`/admin/${resource}/${row.id}`}>ویرایش</Link>
                    {res.path && <Link className="adm-link" href={res.path(row)} target="_blank">دیدن</Link>}
                    <DeleteButton action={deleteRecord.bind(null, resource, row.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
