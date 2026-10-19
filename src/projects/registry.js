// 專案登記表：新增專案只需要在這裡加一筆，並在 src/projects/<slug>/ 放該專案的路線資料。
// 共用的基礎圖層（古今地圖、衛星影像、公開資料）不屬於任何專案，所有專案都保留。

import { xinyi } from './xinyi';
import { songshan } from './songshan';
import { ntu } from './ntu';

// 順序即平台首頁卡片順序
export const PROJECTS = [xinyi, songshan, ntu];

export const DEFAULT_PROJECT_SLUG = 'xinyi';

// 不可拿來當專案網址的名稱（已被站內固定路由占用）
export const RESERVED_SLUGS = ['en', 'api', 'admin', 'privacy', 'survey', '_next'];

// 登記時就檢查，錯誤在 build / dev 啟動時立刻看到，而不是上線後某個網址莫名 404 或撞到固定頁面。
for (const p of PROJECTS) {
  if (RESERVED_SLUGS.includes(p.slug)) {
    throw new Error(`[projects] slug「${p.slug}」是站內保留字，請換一個名稱`);
  }
  if (!/^[a-z0-9-]+$/.test(p.slug)) {
    throw new Error(`[projects] slug「${p.slug}」只能用小寫英數與連字號`);
  }
}
if (new Set(PROJECTS.map((p) => p.slug)).size !== PROJECTS.length) {
  throw new Error('[projects] 有重複的 slug');
}

export function getProject(slug) {
  return PROJECTS.find((p) => p.slug === slug) || null;
}
