'use client';

// 路線方向箭頭：沿著路線每隔一段距離放一個小箭頭，指向「走的方向」。
// 只有專案設定 ui.routeArrows 為 true 時才會用到（見 projects/<slug>/index.js）。
//
// 設計重點
// - 間隔以「螢幕像素」計（放大縮小時箭頭疏密差不多），縮得太小就不畫，避免擠成一團。
// - 箭頭一律不可互動（pointer-events 為 none），點擊會穿透到下面的路段，不影響路段評分。
// - 避開站點與轉角：箭頭太靠近站點圓點或折線轉折處就略過。
// - 兩條路線共用同一段路時，起始位置錯開（phase），箭頭不會疊在一起；
//   方向相反時兩個顏色各自指向自己的走法。
// - 顏色用該路線的深色加白邊，在一般模式與舒適度上色模式（線條改成紅綠色階）都看得清楚。

import { useState } from 'react';
import L from 'leaflet';
import { Marker, useMap, useMapEvents } from 'react-leaflet';

const MIN_ZOOM = 16; // 低於這個縮放等級不畫箭頭
const SPACING_PX = 110; // 箭頭間隔（螢幕像素）
const STATION_CLEARANCE_M = 16; // 離站點多近就不放
const CORNER_CLEARANCE_M = 9; // 離折線轉折多近就不放
const MIN_EDGE_FOR_ARROW_M = 25; // 邊短於這個長度就不強制放箭頭
const ICON_SIZE = 20;
const LANE_OFFSET_PX = 7; // 箭頭往行進方向右側偏移（像靠右行駛），相反方向的箭頭才不會疊在一起

const toRad = (d) => (d * Math.PI) / 180;

// 兩點的區域平面座標差（公尺）：[東向, 北向]
function deltaMeters(a, b) {
  const lat = toRad((a[0] + b[0]) / 2);
  return [(b[1] - a[1]) * 111320 * Math.cos(lat), (b[0] - a[0]) * 111320];
}
const lengthM = (a, b) => Math.hypot(...deltaMeters(a, b));

// 指向 b 的方位角（度，從北順時針）
function bearingDeg(a, b) {
  const [dx, dy] = deltaMeters(a, b);
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}

/**
 * 沿一條折線每隔 spacingM 取一個點（起點偏移 spacingM * phase）。
 * 回傳 [{ pos: [lat, lng], bearing }]；太短、一個都放不下的路段改放在正中間。
 */
export function arrowsAlong(line, spacingM, phase, stations = []) {
  if (!line || line.length < 2) return [];
  const edges = [];
  let total = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const len = lengthM(line[i], line[i + 1]);
    edges.push({ a: line[i], b: line[i + 1], len, start: total });
    total += len;
  }

  const at = (dist) => {
    const e = edges.find((x) => dist >= x.start && dist <= x.start + x.len) || edges[edges.length - 1];
    const t = e.len === 0 ? 0 : (dist - e.start) / e.len;
    return {
      pos: [e.a[0] + (e.b[0] - e.a[0]) * t, e.a[1] + (e.b[1] - e.a[1]) * t],
      bearing: bearingDeg(e.a, e.b),
      toCorner: Math.min(dist - e.start, e.start + e.len - dist),
      isInnerCornerStart: e.start > 0,
      isInnerCornerEnd: e.start + e.len < total,
    };
  };

  const ok = (p) => {
    // 只有「路段內部的轉角」才需要避開；路段的頭尾是站點，由站點距離處理
    const nearCorner =
      p.toCorner < CORNER_CLEARANCE_M && (p.isInnerCornerStart || p.isInnerCornerEnd);
    if (nearCorner) return false;
    return !stations.some((s) => lengthM(p.pos, s) < STATION_CLEARANCE_M);
  };

  const out = [];
  for (let d = spacingM * phase; d < total; d += spacingM) {
    const p = at(d);
    if (ok(p)) out.push({ pos: p.pos, bearing: p.bearing });
  }
  // 每一條夠長的邊至少要有一個箭頭（短邊容易剛好被站點／轉角避讓掉）：
  // 沒有就放在邊的正中間，仍然擋到就不放。
  for (const e of edges) {
    if (e.len < MIN_EDGE_FOR_ARROW_M) continue;
    const hasArrow = out.some((a) => {
      const along = lengthM(e.a, a.pos) + lengthM(a.pos, e.b);
      return Math.abs(along - e.len) < 1; // 箭頭落在這條邊上
    });
    if (hasArrow) continue;
    const p = at(e.start + e.len / 2);
    if (ok(p)) out.push({ pos: p.pos, bearing: p.bearing });
  }
  return out;
}

function arrowIcon(color, bearing) {
  return L.divIcon({
    className: 'route-direction-arrow',
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ICON_SIZE / 2, ICON_SIZE / 2],
    html:
      `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 20 20" ` +
      `style="transform:rotate(${bearing.toFixed(1)}deg);display:block;pointer-events:none;` +
      `filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))">` +
      `<path d="M10 1.5 L17.5 17 L10 13 L2.5 17 Z" fill="${color}" stroke="#ffffff" ` +
      `stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  });
}

/**
 * lines：該路線所有已畫出的折線（每條是 [[lat,lng], ...]），順序與走向就是路線的走法。
 * phaseIndex：第幾條路線，用來把箭頭的起始位置錯開。
 */
// 把箭頭往行進方向的右側挪 offsetM 公尺
function shiftRight(pos, bearing, offsetM) {
  const th = toRad(bearing);
  const east = Math.cos(th) * offsetM; // 右手邊 = (cosθ 東, -sinθ 北)
  const north = -Math.sin(th) * offsetM;
  return [pos[0] + north / 111320, pos[1] + east / (111320 * Math.cos(toRad(pos[0])))];
}

export default function RouteArrows({ route, lines, phaseIndex = 0 }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  if (zoom < MIN_ZOOM) return null;

  const lat = route.stations[0]?.lat ?? map.getCenter().lat;
  const metersPerPx = (156543.03392 * Math.cos(toRad(lat))) / 2 ** zoom;
  const spacingM = SPACING_PX * metersPerPx;
  const phase = phaseIndex % 2 === 0 ? 0.5 : 0.27; // 兩條路線錯開
  const stations = route.stations.map((s) => [s.lat, s.lng]);
  const color = route.colorDark || route.color;

  return (
    <>
      {lines.flatMap((line, li) =>
        arrowsAlong(line, spacingM, phase, stations).map((a, ai) => (
          <Marker
            key={`${route.id}-arrow-${li}-${ai}-${zoom}`}
            position={shiftRight(a.pos, a.bearing, LANE_OFFSET_PX * metersPerPx)}
            icon={arrowIcon(color, a.bearing)}
            interactive={false}
            keyboard={false}
            zIndexOffset={-500}
          />
        ))
      )}
    </>
  );
}
