'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { parts } from '@/lib/jalali';

function JalaliInputs({ field, value, echo, withTime }) {
  const p = parts(value);
  const d = (suffix, fromParts) => echo?.[`${field.name}_${suffix}`] ?? fromParts ?? '';
  const num = (suffix, label, def, max, width) => (
    <label className="adm-mini">
      <span>{label}</span>
      <input name={`${field.name}_${suffix}`} inputMode="numeric" maxLength={max} defaultValue={def} dir="ltr" style={{ width }} required={field.required && suffix !== 'h' && suffix !== 'i'} />
    </label>
  );
  return (
    <div className="adm-date">
      {num('d', 'روز', d('d', p?.jd), 2, 64)}
      {num('m', 'ماه', d('m', p?.jm), 2, 64)}
      {num('y', 'سال', d('y', p?.jy), 4, 92)}
      {withTime && num('h', 'ساعت', d('h', p?.hour), 2, 64)}
      {withTime && num('i', 'دقیقه', d('i', p?.minute), 2, 64)}
    </div>
  );
}

function Field({ field: f, row, echo, relations }) {
  const id = `f-${f.name}`;
  const val = echo?.[f.name] ?? row?.[f.name] ?? f.default ?? '';
  let control;
  switch (f.type) {
    case 'textarea':
      control = <textarea id={id} name={f.name} rows={3} defaultValue={val} required={f.required} />;
      break;
    case 'markdown':
      control = (
        <>
          <textarea id={id} name={f.name} rows={12} defaultValue={val} className="adm-md" />
          <small>برای تیتر <code>## عنوان</code>، برای فهرست <code>- مورد</code>، برای پیوند <code>[متن](نشانی)</code> و برای متن پررنگ <code>**متن**</code> بنویسید.</small>
        </>
      );
      break;
    case 'number':
      control = <input id={id} name={f.name} inputMode="numeric" defaultValue={val} dir="ltr" required={f.required} style={{ maxWidth: 160 }} />;
      break;
    case 'bool':
      return (
        <label className="adm-check">
          <input type="checkbox" name={f.name} defaultChecked={echo ? echo[f.name] === 'on' : row ? !!row[f.name] : !!f.default} />
          <span>{f.label}</span>
        </label>
      );
    case 'select':
      control = (
        <select id={id} name={f.name} defaultValue={val}>
          {f.options.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      );
      break;
    case 'relation':
      control = (
        <select id={id} name={f.name} defaultValue={val || ''}>
          <option value="">هیچ‌کدام</option>
          {(relations[f.resource] || []).map((o) => (
            <option key={o.id} value={o.id}>{o.title}</option>
          ))}
        </select>
      );
      break;
    case 'jdate':
    case 'jdatetime':
      control = <JalaliInputs field={f} value={row?.[f.name]} echo={echo} withTime={f.type === 'jdatetime'} />;
      break;
    case 'image':
    case 'file': {
      const current = row?.[f.name];
      control = (
        <div className="adm-file">
          {current && f.type === 'image' && <img src={current} alt="" />}
          {current && f.type === 'file' && <a href={current} target="_blank" rel="noreferrer">دیدن فایل فعلی</a>}
          <input id={id} type="file" name={f.name} accept={f.type === 'image' ? 'image/jpeg,image/png,image/webp,image/avif,image/gif' : 'application/pdf'} />
          {current && (
            <label className="adm-check">
              <input type="checkbox" name={`${f.name}_remove`} /> <span>حذف فایل فعلی</span>
            </label>
          )}
        </div>
      );
      break;
    }
    case 'images': {
      let list = [];
      try {
        list = JSON.parse(row?.[f.name] || '[]');
      } catch {}
      control = (
        <div className="adm-file">
          {list.length > 0 && (
            <div className="adm-thumbs">
              {list.map((p) => (
                <label key={p}>
                  <img src={p} alt="" loading="lazy" />
                  <span><input type="checkbox" name={`${f.name}_remove`} value={p} /> حذف</span>
                </label>
              ))}
            </div>
          )}
          <input id={id} type="file" name={f.name} multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
        </div>
      );
      break;
    }
    case 'password':
      control = <input id={id} type="password" name={f.name} autoComplete="new-password" dir="ltr" minLength={10} />;
      break;
    case 'slug':
    case 'url':
      control = <input id={id} name={f.name} defaultValue={val} dir="ltr" />;
      break;
    default:
      control = <input id={id} name={f.name} defaultValue={val} dir={f.dir} required={f.required} />;
  }
  return (
    <div className="adm-field">
      <label htmlFor={id}>
        {f.label}
        {f.required && <b aria-hidden="true"> *</b>}
      </label>
      {control}
      {f.help && <small>{f.help}</small>}
    </div>
  );
}

export default function RecordForm({ action, fields, row, relations, backHref }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="adm-form" key={state.nonce || 0}>
      {state.error && <p className="adm-alert bad" role="alert">{state.error}</p>}
      {fields.map((f) => (
        <Field key={f.name} field={f} row={row} echo={state.values} relations={relations} />
      ))}
      <div className="adm-actions">
        <button className="adm-btn" disabled={pending}>{pending ? 'در حال ذخیره…' : 'ذخیره'}</button>
        <Link className="adm-btn quiet" href={backHref}>انصراف</Link>
      </div>
    </form>
  );
}
