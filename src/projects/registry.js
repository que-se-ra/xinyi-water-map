// 專案登記表：新增專案只需要在這裡加一筆，並在 src/projects/<slug>/ 放該專案的路線資料。
// 共用的基礎圖層（古今地圖、衛星影像、公開資料）不屬於任何專案，所有專案都保留。

import { xinyi } from './xinyi';

export const PROJECTS = [xinyi];

export const DEFAULT_PROJECT_SLUG = 'xinyi';

// 不可拿來當專案網址的名稱（已被站內固定路由占用）
export const RESERVED_SLUGS = ['en', 'api', 'admin', 'privacy', 'survey', '_next'];

export function getProject(slug) {
  return PROJECTS.find((p) => p.slug === slug) || null;
}
