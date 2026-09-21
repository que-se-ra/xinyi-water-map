import { LocaleProvider } from '@/i18n/LocaleProvider';
import SurveyPage from '@/components/SurveyPage';

export const metadata = {
  title: '熱舒適經驗調查 — 信水義河',
  description: '信義區「體感溫度」地圖：分享你覺得熱／涼的地點，協助描繪社區的熱舒適地圖。',
};

export default function Page() {
  return (
    <LocaleProvider locale="zh">
      <SurveyPage />
    </LocaleProvider>
  );
}
