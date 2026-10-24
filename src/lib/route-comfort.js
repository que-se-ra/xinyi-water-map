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

export const SCORE_KEYS = ['shade', 'surface', 'safety', 'comfort'];

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
