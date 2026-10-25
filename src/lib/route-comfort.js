// 路線舒適度評分的彙整（/api/route-comfort-stats 使用；抽成純函式方便離線測試）。
//
// 輸入：GAS「路線舒適度評分」分頁的原始列（每列一位參與者對一個路段／評分單位的評分）
// 輸出：{ stats: { [route_id]: { [segment_id]: 統計 } }, total }
//   統計 = {
//     count,                                  // 評分人數（列數）
//     avg:  { shade, surface, safety, comfort },  // 各面向平均（小數一位）
//     overall,                                // 各面向平均再平均
//     dist: { shade: [n1..n5], surface: [...], safety: [...], comfort: [...] },
//                                             // 各面向 1～5 分各有幾人（給分布圖用）
//   }

import { recordProjectId } from './project-scope';

export const SCORE_KEYS = ['shade', 'ventilation', 'surface', 'cooling', 'comfort'];

export function aggregateRouteComfort(records, project = null) {
  const acc = {};
  let total = 0;

  for (const row of Array.isArray(records) ? records : []) {
    if (project && recordProjectId(row) !== project) continue;
    const routeId = String(row.route_id ?? '').trim();
    const segmentId = String(row.segment_id ?? '').trim();
    if (!routeId || !segmentId) continue;

    const scores = {};
    let valid = false;
    for (const key of SCORE_KEYS) {
      const n = parseFloat(row[`score_${key}`]);
      // 收 1～5 分（和舊版相同）；分布圖只統計整數分，表單本來就只能選整數
      if (!Number.isNaN(n) && n >= 1 && n <= 5) {
        scores[key] = n;
        valid = true;
      }
    }
    if (!valid) continue;

    acc[routeId] ??= {};
    acc[routeId][segmentId] ??= {
      count: 0,
      sums: Object.fromEntries(SCORE_KEYS.map((k) => [k, 0])),
      counts: Object.fromEntries(SCORE_KEYS.map((k) => [k, 0])),
      dist: Object.fromEntries(SCORE_KEYS.map((k) => [k, [0, 0, 0, 0, 0]])),
    };

    const seg = acc[routeId][segmentId];
    seg.count += 1;
    total += 1;
    for (const key of SCORE_KEYS) {
      if (scores[key] !== undefined) {
        seg.sums[key] += scores[key];
        seg.counts[key] += 1;
        if (Number.isInteger(scores[key])) seg.dist[key][scores[key] - 1] += 1;
      }
    }
  }

  const stats = {};
  for (const [routeId, segments] of Object.entries(acc)) {
    stats[routeId] = {};
    for (const [segmentId, seg] of Object.entries(segments)) {
      const avg = {};
      const presentAvgs = [];
      for (const key of SCORE_KEYS) {
        if (seg.counts[key] > 0) {
          avg[key] = Math.round((seg.sums[key] / seg.counts[key]) * 10) / 10;
          presentAvgs.push(avg[key]);
        }
      }
      const overall = presentAvgs.length
        ? Math.round((presentAvgs.reduce((a, b) => a + b, 0) / presentAvgs.length) * 10) / 10
        : null;
      stats[routeId][segmentId] = { count: seg.count, avg, overall, dist: seg.dist };
    }
  }
  return { stats, total };
}

// ── 跨路線合併同一個評分單位 ─────────────────────────────────
// 有些專案（例如松菸）的每條路線評的是同一組對象（ratingUnits，id 相同），
// 這時應該把各路線同一個對象的評分加在一起看。分布 dist 可以直接相加，
// 平均再由合併後的分布重算（比用各路線平均加權更精確）。

function avgFromDist(d) {
  const n = d.reduce((a, b) => a + b, 0);
  return n ? Math.round((d.reduce((a, c, i) => a + c * (i + 1), 0) / n) * 10) / 10 : null;
}

/** 合併多筆同一評分單位的統計；只有一筆時原樣回傳（加上 routes: 1） */
export function mergeSegmentStats(list) {
  const items = list.filter(Boolean);
  if (items.length === 0) return undefined;
  if (items.length === 1) return { ...items[0], routes: 1 };
  const count = items.reduce((a, s) => a + (s.count || 0), 0);
  const avg = {};
  const dist = {};
  for (const key of SCORE_KEYS) {
    if (items.every((s) => s.dist?.[key])) {
      dist[key] = [0, 1, 2, 3, 4].map((i) => items.reduce((a, s) => a + s.dist[key][i], 0));
      const v = avgFromDist(dist[key]);
      if (v != null) avg[key] = v;
    } else {
      // 舊資料沒有分布時，退回用人數加權平均
      const withKey = items.filter((s) => s.avg?.[key] != null);
      const w = withKey.reduce((a, s) => a + s.count, 0);
      if (w) avg[key] = Math.round((withKey.reduce((a, s) => a + s.avg[key] * s.count, 0) / w) * 10) / 10;
    }
  }
  const vals = Object.values(avg);
  const overall = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
  return { count, avg, overall, dist: Object.keys(dist).length ? dist : undefined, routes: items.length };
}

/**
 * 依各路線的 ratingUnits，把同 id 的評分單位跨路線合併。
 * 回傳 { [route_id]: { ...該路線原本的統計, [unit_id]: 合併後的統計 } }；
 * 沒有 ratingUnits 的路線原樣保留。
 */
export function combineRatingUnits(statsByRoute, routes) {
  const unitRoutes = routes.filter((r) => Array.isArray(r.ratingUnits) && r.ratingUnits.length);
  if (unitRoutes.length < 2) return statsByRoute;
  const ids = new Set(unitRoutes.flatMap((r) => r.ratingUnits.map((u) => u.id)));
  const merged = {};
  for (const id of ids) {
    merged[id] = mergeSegmentStats(
      unitRoutes.filter((r) => r.ratingUnits.some((u) => u.id === id)).map((r) => statsByRoute?.[String(r.id)]?.[id])
    );
  }
  const out = { ...statsByRoute };
  for (const r of unitRoutes) {
    out[String(r.id)] = { ...(statsByRoute?.[String(r.id)] || {}) };
    for (const id of ids) {
      if (merged[id]) out[String(r.id)][id] = merged[id];
      else delete out[String(r.id)][id];
    }
  }
  return out;
}
