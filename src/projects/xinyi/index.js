// 信水義河（信義社大合作）專案設定。
// 路線／站點資料與這份設定放在同一個資料夾；共用圖層（古今地圖、衛星、公開資料）不在這裡。

import { routes, BASE_URL } from './routeData';
import { routesEn } from './routeData.en';

export const xinyi = {
  id: 'xinyi',
  slug: 'xinyi',
  status: 'active',
  // 回饋資料的專案識別；舊資料（欄位空白）一律視為 xinyi
  feedbackProjectId: 'xinyi',
  assetBaseUrl: BASE_URL,
  // 地圖在沒有路線資料時的後備視角
  center: [25.0235, 121.5555],
  zoom: 14,
  routes,
  routesEn,
  features: { survey: true },
  // SEO / 分享卡片文字（原本寫在 app/layout.js、app/en/layout.js 與 survey 頁）
  meta: {
    zh: {
      title: '信水義河 — 信義社大水文導覽互動地圖',
      description:
        '四條路線、57個站點，帶你走讀台北信義區的水文故事。瑠公圳、永春陂、五分埔支線、三張犁排水系——兩百年的水路記憶，就藏在你每天走過的街道裡。',
      keywords: '信義社大,水文導覽,瑠公圳,永春陂,五分埔,三張犁,信義區,台北,互動地圖',
      ogDescription: '四條路線、57個站點，走讀台北信義區的水文故事',
      survey: {
        title: '熱舒適經驗調查 — 信水義河',
        description: '信義區「體感溫度」地圖：分享你覺得熱／涼的地點，協助描繪社區的熱舒適地圖。',
      },
    },
    en: {
      // 站名維持中文字標「信水義河」，英文只作副標（2026-09-20 使用者拍板）
      title: '信水義河 Waters of Xinyi — Interactive Hydrological Map',
      description:
        'Four walking routes, 57 stops across the waterways of Xinyi District, Taipei. The Liu-kong-tsun canal, Yongchun Pond, the Wufenpu branch and the Sanzhangli drainage system — two centuries of water memory hidden in the streets you walk every day.',
      keywords:
        'Xinyi District, Taipei, hydrological map, Liu-kong-tsun, Yongchun Pond, Wufenpu, Sanzhangli, community mapping, smart city, thermal comfort',
      ogDescription: 'Four routes, 57 stops: walking the water history of Taipei’s Xinyi District.',
      survey: {
        title: 'Thermal Comfort Survey — Waters of Xinyi',
        description:
          'A perceived-temperature map of Xinyi District: mark the places that feel hot or cool to you and help draw the neighbourhood’s thermal comfort map.',
      },
    },
  },
};
