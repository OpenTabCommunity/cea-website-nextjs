import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { get } from '@/lib/db';
import { resources } from '@/lib/resources';
import { saveRecord, relationOptions } from '../../../actions';
import RecordForm from '@/components/admin/RecordForm';

export default async function EditPage({ params }) {
  await requireUser();
  const { resource, id } = await params;
  const res = resources[resource];
  if (!res) notFound();
  const isNew = id === 'new';
  const numericId = isNew ? null : Number(id);
  const row = isNew ? null : get(`SELECT * FROM ${resource} WHERE id = ?`, numericId);
  if (!isNew && !row) notFound();
  if (row && 'password' in row) row.password = '';
  const relations = await relationOptions();
  return (
    <>
      <header className="adm-head">
        <div>
          <p><Link href={`/admin/${resource}`}>{res.label}</Link></p>
          <h1>{isNew ? `افزودن ${res.singular}` : `ویرایش ${res.singular}`}</h1>
        </div>
      </header>
      <RecordForm action={saveRecord.bind(null, resource, numericId)} fields={res.fields} row={row ? { ...row } : null} relations={relations} backHref={`/admin/${resource}`} />
    </>
  );
}
