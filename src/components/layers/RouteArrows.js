'use client';

// 路線方向箭頭：每一條夠長的直線邊放一個箭頭（很長的邊放兩三個），箭頭直接畫在線上，指向「走的方向」。
// 只有專案設定 ui.routeArrows 為 true 時才會用到（見 projects/<slug>/index.js）。
//
// 設計重點
// - 數量少：以「螢幕像素」計間隔（SPACING_PX），放大縮小時疏密差不多；縮得太小（< MIN_ZOOM）就不畫。
// - 箭頭放在每條邊的 40% 處（而不是正中間）。兩條路線在同一條邊上走法相反時，兩個箭頭
//   各自離「自己的起點」40%，也就是彼此錯開邊長的 20%，不會疊在一起。
// - 箭頭一律不可互動（pointer-events 為 none），點擊會穿透到下面的路段，不影響路段評分。
// - 太靠近站點圓點就略過（改試另一側 60% 處，仍擋到才不放）。
// - 顏色用該路線的深色加白邊，在一般模式與舒適度上色模式（線條改成紅綠色階）都看得清楚。

import { useState } from 'react';
import L from 'leaflet';
import { Marker, useMap, useMapEvents } from 'react-leaflet';

const MIN_ZOOM = 16; // 低於這個縮放等級不畫箭頭
const SPACING_PX = 260; // 同一條邊上箭頭的間隔（螢幕像素）；比這短的邊只放一個
const MIN_EDGE_M = 25; // 短於這個長度的邊（例如ㄇ字的短連接線）不放箭頭
const STATION_CLEARANCE_M = 14; // 離站點多近就不放
const FRACTION = 0.4; // 箭頭在邊上的位置（從該邊的起點算起）
const ICON_SIZE = 16;

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
 * 一條折線上要放的箭頭。回傳 [{ pos: [lat, lng], bearing }]。
 * 每條邊（相鄰兩個轉折點）：長度 < MIN_EDGE_M 不放；否則放 round(長度 / spacingM) 個（至少 1 個），
 * 第 k 個在 (k + FRACTION) / n 處。
 */
export function arrowsAlong(line, spacingM, stations = []) {
  if (!line || line.length < 2) return [];
  const out = [];
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    const len = lengthM(a, b);
    if (len < MIN_EDGE_M) continue;

    const n = Math.max(1, Math.round(len / spacingM));
    const bearing = bearingDeg(a, b);
    for (let k = 0; k < n; k++) {
      // 先試 40% 處，被站點擋到就試對稱的 60% 處
      for (const f of [(k + FRACTION) / n, (k + 1 - FRACTION) / n]) {
        const pos = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        if (stations.some((s) => lengthM(pos, s) < STATION_CLEARANCE_M)) continue;
        out.push({ pos, bearing });
        break;
      }
    }
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
      `style="transform:rotate(${bearing.toFixed(1)}deg);display:block;pointer-events:none">` +
      `<path d="M10 1.5 L17.5 17 L10 13 L2.5 17 Z" fill="${color}" stroke="#ffffff" ` +
      `stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  });
}

/**
 * lines：該路線所有已畫出的折線（每條是 [[lat,lng], ...]），順序與走向就是路線的走法。
 */
export default function RouteArrows({ route, lines }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  if (zoom < MIN_ZOOM) return null;

  const lat = route.stations[0]?.lat ?? map.getCenter().lat;
  const metersPerPx = (156543.03392 * Math.cos(toRad(lat))) / 2 ** zoom;
  const spacingM = SPACING_PX * metersPerPx;
  const stations = route.stations.map((s) => [s.lat, s.lng]);
  const color = route.colorDark || route.color;

  return (
    <>
      {lines.flatMap((line, li) =>
        arrowsAlong(line, spacingM, stations).map((a, ai) => (
          <Marker
            key={`${route.id}-arrow-${li}-${ai}-${zoom}`}
            position={a.pos}
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
