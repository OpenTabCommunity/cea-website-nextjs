import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { login } from '../actions';
import { LoginForm } from '@/components/admin/Forms';

export default async function LoginPage() {
  if (await getUser()) redirect('/admin');
  return (
    <main className="adm-login">
      <div className="adm-login-card">
        <h1>پنل مدیریت</h1>
        <p>برای ویرایش محتوای سایت وارد شوید.</p>
        <LoginForm action={login} />
      </div>
    </main>
  );
}
