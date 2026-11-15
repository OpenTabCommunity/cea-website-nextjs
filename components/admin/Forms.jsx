'use client';

import { useActionState, useState } from 'react';

export function LoginForm({ action }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="adm-login-form">
      {state.error && <p className="adm-alert bad" role="alert">{state.error}</p>}
      <div className="adm-field">
        <label htmlFor="username">نام کاربری</label>
        <input id="username" name="username" dir="ltr" autoComplete="username" autoCapitalize="none" autoCorrect="off" required />
      </div>
      <div className="adm-field">
        <label htmlFor="password">رمز عبور</label>
        <input id="password" name="password" type="password" dir="ltr" autoComplete="current-password" required />
      </div>
      <button className="adm-btn" disabled={pending}>{pending ? 'در حال ورود…' : 'ورود'}</button>
    </form>
  );
}

export function SettingsForm({ action, groups, values }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="adm-form">
      {state.ok && <p className="adm-alert good" role="status" key={state.nonce}>تنظیمات ذخیره شد.</p>}
      {groups.map((g) => (
        <fieldset key={g.title} className="adm-group">
          <legend>{g.title}</legend>
          {g.fields.map((f) => (
            <div className="adm-field" key={f.name}>
              <label htmlFor={`s-${f.name}`}>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea id={`s-${f.name}`} name={f.name} rows={3} defaultValue={values[f.name]} />
              ) : (
                <input id={`s-${f.name}`} name={f.name} defaultValue={values[f.name]} dir={f.type === 'url' ? 'ltr' : f.dir} />
              )}
              {f.help && <small>{f.help}</small>}
            </div>
          ))}
        </fieldset>
      ))}
      <div className="adm-actions">
        <button className="adm-btn" disabled={pending}>{pending ? 'در حال ذخیره…' : 'ذخیرهٔ تنظیمات'}</button>
      </div>
    </form>
  );
}

/** Delete with a second click instead of a browser dialog. */
export function DeleteButton({ action }) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" className="adm-link danger" onClick={() => setArmed(true)}>
        حذف
      </button>
    );
  }
  return (
    <form action={action} className="adm-confirm">
      <button className="adm-link danger strong">مطمئنم، حذف کن</button>
      <button type="button" className="adm-link" onClick={() => setArmed(false)}>نه</button>
    </form>
  );
}
