// 信水義河（信義社大合作）專案設定。
// 路線／站點資料與這份設定放在同一個資料夾；共用圖層（古今地圖、衛星、公開資料）不在這裡。

import { BASE_DEFAULT_LAYERS } from '../defaultLayers';
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
  defaultLayers: BASE_DEFAULT_LAYERS,
  features: { survey: true },
  // 介面區塊：側欄有哪些分頁、開場頁是否顯示功能介紹卡
  // headerSurvey：頁頂右上角的「熱舒適問卷」按鈕（2026-10-20 使用者要求隱藏；問卷頁本身與開場頁按鈕仍在）
  // landingTour：開場頁問卷按鈕旁的「走讀導覽專用」連結（中文版才顯示，因為導覽頁只有中文與粵語）
  // landingTourUntil：過了這個時間按鈕自動隱藏（2026-10-20 走讀當天限定；下次活動改日期即可）
  ui: { tabs: ['map', 'layers', 'form', 'history', 'changelog'], landingCards: true, headerSurvey: false, landingTour: '/hkvisitors', landingTourUntil: '2026-10-21T00:00:00+08:00' },
  // 後台「環境通報彙整」AI 提示詞用的單位與地區描述（原本寫死在 api/admin/report-summary）
  reportSummary: {
    org: '臺北市信義社區大學「信水義河」水文地圖計畫',
    area: '信義區水文環境',
  },
  // 平台首頁的專案卡片
  card: {
    zh: {
      name: '信水義河',
      subtitle: 'Waters of Xinyi',
      partner: '信義社區大學',
      summary: '四條水文走讀路線、57個站點，並蒐集居民對街道熱舒適的經驗。',
    },
    en: {
      name: '信水義河',
      subtitle: 'Waters of Xinyi',
      partner: 'Taipei Xinyi Community College',
      summary:
        'Four walking routes and 57 stops tracing the waterways of Xinyi District, plus a survey of how the streets feel in the heat.',
    },
  },
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
