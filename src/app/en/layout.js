import LangSync from '@/i18n/LangSync';

// 平台層級的英文 metadata；各專案頁自己覆寫。
// 英文總站名為暫譯，待使用者拍板。專案名稱「信水義河」維持中文字標加英文副標（2026-09-20 使用者拍板）。
export const metadata = {
  title: 'Community History & Environmental Sensing Map',
  description:
    'Walk through the history and environment of a neighbourhood on a map, and share what you notice along the way. Currently featuring 信水義河 Waters of Xinyi, with more projects on the way.',
  keywords:
    'community history, environmental sensing, interactive map, walking tour, Waters of Xinyi, microclimate, Taipei',
  openGraph: {
    title: 'Community History & Environmental Sensing Map',
    description: 'Walk through the history and environment of a neighbourhood on a map, and share what you notice along the way.',
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
