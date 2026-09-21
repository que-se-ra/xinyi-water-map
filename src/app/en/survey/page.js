import { LocaleProvider } from '@/i18n/LocaleProvider';
import SurveyPage from '@/components/SurveyPage';

export const metadata = {
  title: 'Thermal Comfort Survey — Waters of Xinyi',
  description:
    'A perceived-temperature map of Xinyi District: mark the places that feel hot or cool to you and help draw the neighbourhood’s thermal comfort map.',
  alternates: { canonical: '/en/survey', languages: { 'zh-Hant': '/survey', en: '/en/survey' } },
};

export default function Page() {
  return (
    <LocaleProvider locale="en">
      <SurveyPage />
    </LocaleProvider>
  );
}
