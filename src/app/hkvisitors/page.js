// /hkvisitors ——「信義區地底有條河？」2026-10-21 香港朋友走讀專頁。
// 靜態路由，會蓋過 [project] 動態路由；不在專案登記表內，不影響任何專案。
// 需要團碼才看得到內容，並且不給搜尋引擎收錄。

import HkTourClient from '@/components/hkvisitors/HkTourClient';

export const metadata = {
  title: '信義區地底有條河？ — 香港朋友走讀',
  description: '台北信義區水圳走讀：給香港朋友的導覽頁（需要團碼）。',
  robots: { index: false, follow: false },
  alternates: { canonical: '/hkvisitors' },
};

export default function Page() {
  return <HkTourClient />;
}
