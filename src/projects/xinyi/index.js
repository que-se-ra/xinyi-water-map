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
};
