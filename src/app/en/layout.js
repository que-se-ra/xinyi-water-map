import LangSync from '@/i18n/LangSync';

// 站名維持中文字標「信水義河」，英文只作副標（2026-09-20 使用者拍板）：
// 這是「信義」拆開包住「水河」的雙關，直譯必然損失，保留原字標讓它站得住。
export const metadata = {
  title: '信水義河 Waters of Xinyi — Interactive Hydrological Map',
  description:
    'Four walking routes, 57 stops across the waterways of Xinyi District, Taipei. The Liu-kong-tsun canal, Yongchun Pond, the Wufenpu branch and the Sanzhangli drainage system — two centuries of water memory hidden in the streets you walk every day.',
  keywords:
    'Xinyi District, Taipei, hydrological map, Liu-kong-tsun, Yongchun Pond, Wufenpu, Sanzhangli, community mapping, smart city, thermal comfort',
  openGraph: {
    title: '信水義河 Waters of Xinyi — Interactive Hydrological Map',
    description:
      'Four routes, 57 stops: walking the water history of Taipei’s Xinyi District.',
    type: 'website',
    locale: 'en',
  },
  alternates: {
    canonical: '/en',
    languages: { 'zh-Hant': '/', en: '/en' },
  },
};

export default function EnLayout({ children }) {
  return (
    <>
      <LangSync lang="en" />
      {children}
    </>
  );
}
