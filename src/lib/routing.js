// 涼徑規劃的路線計算（全部在瀏覽器裡算，不需要伺服器）。
//
// 路網資料由 src/scripts/build_route_graph.py 從 OpenStreetMap 建出，依 0.01° 方格切檔，
// 每條路段帶三個舒適指標（0–100）：
//   shade[季][時] 遮蔭比例、cover 可遮雨比例、lit 照明比例
// 規劃時只下載起終點附近的方格，用 Dijkstra 找「加權成本」最低的路：
//   成本 = 長度 ×（1 + 權重 ×（1 − 指標））× 路型係數
// 權重由「偏好」決定，0 就是最短路線。

const DATA = '/data/route';

// 三種情境：各用哪個指標
export const SCENARIOS = {
  shade: { metric: 'shade', icon: '🌳' },
  rain: { metric: 'cover', icon: '☂️' },
  night: { metric: 'lit', icon: '💡' },
};

// 三種偏好：願意為了舒適多繞多少
export const PREFERENCES = {
  near: 0.5,
  balanced: 1.5,
  comfy: 4,
};

// 路型係數：大馬路走起來比較不舒服、階梯比較累（與情境無關，最短路線不套用）
const CLASS_FACTOR = [1, 0.95, 1.15, 1.2];

export const WALK_M_PER_MIN = 75; // 每分鐘約 75 公尺（4.5 km/h）
const MARGIN = 0.006; // 起終點外框再往外多載約 600 公尺的路網，讓繞路有空間
const MAX_CELLS = 120; // 約 10×12 公里，臺北市內兩點之間都夠用

let indexPromise = null;
const cellCache = new Map();

function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${DATA}/index.json`).then((r) => {
      if (!r.ok) throw new Error('路網索引載入失敗');
      return r.json();
    });
  }
  return indexPromise;
}

function loadCell(key) {
  if (!cellCache.has(key)) {
    cellCache.set(
      key,
      fetch(`${DATA}/${key}.json`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    );
  }
  return cellCache.get(key);
}

function decodeGeom(u, enc, v) {
  const pts = [u];
  let la = Math.round(u[0] * 1e5);
  let lo = Math.round(u[1] * 1e5);
  for (let i = 0; i < enc.length; i += 2) {
    la += enc[i];
    lo += enc[i + 1];
    pts.push([la / 1e5, lo / 1e5]);
  }
  pts.push(v);
  return pts;
}

/** 依時間選遮蔭資料的「季節 × 整點」欄位；超出 7–17 點時夾到最近的整點 */
export function shadeSlot(index, date) {
  const month = date.getMonth() + 1;
  const season = month >= 5 && month <= 9 ? 'summer' : 'autumn';
  const hours = index.hours;
  const h = Math.min(hours[hours.length - 1], Math.max(hours[0], Math.round(date.getHours() + date.getMinutes() / 60)));
  return index.seasons.indexOf(season) * hours.length + hours.indexOf(h);
}

/** 下載涵蓋兩點的路網並組成圖 */
export async function loadGraph(a, b) {
  const index = await loadIndex();
  const have = new Set(index.cells);
  const s = Math.floor((Math.min(a.lat, b.lat) - MARGIN) * 100);
  const n = Math.floor((Math.max(a.lat, b.lat) + MARGIN) * 100);
  const w = Math.floor((Math.min(a.lng, b.lng) - MARGIN) * 100);
  const e = Math.floor((Math.max(a.lng, b.lng) + MARGIN) * 100);
  const keys = [];
  for (let la = s; la <= n; la++) for (let lo = w; lo <= e; lo++) if (have.has(`${la}_${lo}`)) keys.push(`${la}_${lo}`);
  if (keys.length === 0) throw Object.assign(new Error('outside'), { code: 'outside' });
  if (keys.length > MAX_CELLS) throw Object.assign(new Error('too-far'), { code: 'too-far' });

  const cells = await Promise.all(keys.map(loadCell));
  const nodes = new Map();
  const edges = [];
  const adj = new Map();
  const link = (from, ei) => {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from).push(ei);
  };
  cells.forEach((c) => {
    if (!c) return;
    for (const [id, ll] of Object.entries(c.n)) nodes.set(Number(id), ll);
    c.e.forEach(([u, v, len, enc, shade, cover, lit, cls]) => {
      const ei = edges.length;
      edges.push({ u, v, len, enc, shade, cover, lit, cls });
      link(u, ei);
      link(v, ei);
    });
  });
  return { index, nodes, edges, adj };
}

/** 找離某點最近、而且有路段相連的節點 */
export function nearestNode(graph, p) {
  let best = null;
  let bestD = Infinity;
  const cosLat = Math.cos((p.lat * Math.PI) / 180);
  for (const [id, ll] of graph.nodes) {
    if (!graph.adj.has(id)) continue;
    const dy = ll[0] - p.lat;
    const dx = (ll[1] - p.lng) * cosLat;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best == null ? null : { id: best, distM: Math.sqrt(bestD) * 111320 };
}

// 最小堆（Dijkstra 用）
class Heap {
  constructor() {
    this.a = [];
  }
  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
  get size() {
    return this.a.length;
  }
}

function metricOf(edge, metric, slot) {
  if (metric === 'shade') return edge.shade[slot];
  return edge[metric];
}

/**
 * 找路線。weight = 0 為最短路線。
 * 回傳 { coords, lengthM, minutes, metricPct, segments: [{coords, pct}] }，找不到時回 null。
 */
export function findRoute(graph, from, to, { metric, weight, slot }) {
  const dist = new Map([[from, 0]]);
  const prev = new Map();
  const heap = new Heap();
  heap.push([0, from]);
  while (heap.size) {
    const [d, n] = heap.pop();
    if (n === to) break;
    if (d > (dist.get(n) ?? Infinity)) continue;
    for (const ei of graph.adj.get(n) || []) {
      const e = graph.edges[ei];
      const m = n === e.u ? e.v : e.u;
      const comfort = weight > 0 ? 1 + weight * (1 - metricOf(e, metric, slot) / 100) : 1;
      const cls = weight > 0 ? CLASS_FACTOR[e.cls] ?? 1 : 1;
      const nd = d + e.len * comfort * cls;
      if (nd < (dist.get(m) ?? Infinity)) {
        dist.set(m, nd);
        prev.set(m, [n, ei]);
        heap.push([nd, m]);
      }
    }
  }
  if (!prev.has(to) && from !== to) return null;

  // 回溯路徑
  const path = [];
  for (let n = to; n !== from; ) {
    const [p, ei] = prev.get(n);
    path.push([p, n, ei]);
    n = p;
  }
  path.reverse();

  let lengthM = 0;
  let metricSum = 0;
  const coords = [];
  const segments = [];
  path.forEach(([a, b, ei]) => {
    const e = graph.edges[ei];
    let pts = decodeGeom(graph.nodes.get(e.u), e.enc, graph.nodes.get(e.v));
    if (a !== e.u) pts = pts.reverse();
    const pct = metricOf(e, metric, slot);
    lengthM += e.len;
    metricSum += e.len * pct;
    segments.push({ coords: pts, pct });
    coords.push(...(coords.length ? pts.slice(1) : pts));
  });
  return {
    coords,
    segments,
    lengthM,
    minutes: lengthM / WALK_M_PER_MIN,
    metricPct: lengthM > 0 ? metricSum / lengthM : 0,
  };
}

/** 一次算出推薦路線與最短路線 */
export async function planRoute({ start, end, scenario, preference, date }) {
  const graph = await loadGraph(start, end);
  const a = nearestNode(graph, start);
  const b = nearestNode(graph, end);
  if (!a || !b) throw Object.assign(new Error('no-road'), { code: 'no-road' });
  // 起終點離最近的路超過 300 公尺，多半是點到河上或山裡
  if (a.distM > 300 || b.distM > 300) throw Object.assign(new Error('no-road'), { code: 'no-road' });
  const { metric } = SCENARIOS[scenario];
  const slot = shadeSlot(graph.index, date);
  const opts = { metric, slot };
  const best = findRoute(graph, a.id, b.id, { ...opts, weight: PREFERENCES[preference] });
  const shortest = findRoute(graph, a.id, b.id, { ...opts, weight: 0 });
  if (!best || !shortest) throw Object.assign(new Error('no-path'), { code: 'no-path' });
  return { best, shortest, metric, builtAt: graph.index.built };
}
