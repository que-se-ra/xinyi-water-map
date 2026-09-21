import { LocaleProvider } from '@/i18n/LocaleProvider';
import PrivacyPage from '@/components/PrivacyPage';

export const metadata = {
  title: 'Privacy Notice — Waters of Xinyi',
  description: 'How the Waters of Xinyi interactive map collects, uses and protects your data.',
  alternates: { canonical: '/en/privacy', languages: { 'zh-Hant': '/privacy', en: '/en/privacy' } },
};

export default function Page() {
  return (
    <LocaleProvider locale="en">
      <PrivacyPage />
    </LocaleProvider>
  );
}
