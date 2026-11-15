import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/db';
import { settingsGroups } from '@/lib/resources';
import { saveSettings } from '../../actions';
import { SettingsForm } from '@/components/admin/Forms';

export default async function SettingsPage() {
  await requireUser();
  return (
    <>
      <header className="adm-head">
        <div>
          <h1>متن‌ها و تماس</h1>
          <p>نام انجمن، متن‌های صفحهٔ اصلی و راه‌های تماس.</p>
        </div>
      </header>
      <SettingsForm action={saveSettings} groups={settingsGroups} values={getSettings()} />
    </>
  );
}
