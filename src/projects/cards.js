// 平台首頁用的專案卡片：只回傳可序列化的純文字，避免把整包路線資料送到 client。

import { PROJECTS, getProject } from './registry';

export function projectCards(locale) {
  return PROJECTS.map((p) => ({
    slug: p.slug,
    status: p.status,
    ...(p.card[locale] || p.card.zh),
  }));
}

export function projectCard(slug, locale) {
  const p = getProject(slug);
  return p ? { slug: p.slug, status: p.status, ...(p.card[locale] || p.card.zh) } : null;
}
