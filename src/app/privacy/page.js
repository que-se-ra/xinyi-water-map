import { LocaleProvider } from '@/i18n/LocaleProvider';
import PrivacyPage from '@/components/PrivacyPage';

export const metadata = {
  title: '隱私聲明 — 信水義河',
  description: '信水義河互動地圖的資料蒐集、使用與保護說明。',
};

export default function Page() {
  return (
    <LocaleProvider locale="zh">
      <PrivacyPage />
    </LocaleProvider>
  );
}
