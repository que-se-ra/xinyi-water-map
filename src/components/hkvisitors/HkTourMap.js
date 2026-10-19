'use client';

// /hkvisitors 專用地圖。
// 只重用既有圖層元件（HistoricalLayer / SatelliteLayer / ComfortLayer / ShadeMapLayer /
// TemperatureLayer / UserLocationLayer），完全沒有改動它們，也沒有用到 MapView，
// 所以其他專案（信水義河本體、松山、台大）不受任何影響。

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CARTO_LIGHT_URL, CARTO_ATTRIBUTION } from '@/lib/basemap';
import HistoricalLayer from '@/components/layers/HistoricalLayer';
import SatelliteLayer from '@/components/layers/SatelliteLayer';
import ComfortLayer from '@/components/layers/ComfortLayer';
import TemperatureLayer from '@/components/layers/TemperatureLayer';
import UserLocationLayer from '@/components/layers/UserLocationLayer';

const ShadeMapLayer = dynamic(() => import('@/components/layers/ShadeMapLayer'), { ssr: false });

/** 站點圖示：未解鎖＝灰點，下一站＝發光圈，已看過＝實心點 */
function stopIcon(label, state, color) {
  const base =
    'display:flex;align-items:center;justify-content:center;border-radius:9999px;' +
    'font-weight:700;font-family:system-ui,-apple-system,sans-serif;';
  if (state === 'locked') {
    return L.divIcon({
      className: 'hk-stop',
      html: `<div style="${base}width:16px;height:16px;background:#cbd5e1;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }
  if (state === 'next') {
    return L.divIcon({
      className: 'hk-stop hk-stop-next',
      html:
        `<div style="${base}width:34px;height:34px;background:${color};color:#fff;font-size:14px;` +
        `border:3px solid #fff;box-shadow:0 0 0 4px rgba(14,165,233,.35),0 2px 8px rgba(0,0,0,.35)">${label}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }
  return L.divIcon({
    className: 'hk-stop',
    html:
      `<div style="${base}width:26px;height:26px;background:#fff;color:${color};font-size:12px;` +
      `border:3px solid ${color};box-shadow:0 1px 4px rgba(0,0,0,.3)">${label}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function FitRoute({ lines }) {
  const map = useMap();
  useEffect(() => {
    const pts = lines.flat();
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.12), { animate: false });
  }, [map, lines]);
  return null;
}

function FlyToStop({ stop }) {
  const map = useMap();
  useEffect(() => {
    if (stop && stop.lat != null) map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 17), { duration: 0.8 });
  }, [map, stop]);
  return null;
}

export default function HkTourMap({
  lines,
  color = '#4580A0',
  stops,
  focusStop,
  userPos,
  accuracy,
  layers,            // { historical, satellite, trees, green, lst, shadow }
  temperatureUrl,
  shadeDate,
  onSelectStop,
}) {
  const center = useMemo(() => {
    const pts = lines.flat();
    return pts.length ? pts[0] : [25.0241, 121.553];
  }, [lines]);

  return (
    <MapContainer center={center} zoom={16} className="w-full h-full z-0" zoomControl={false} preferCanvas={true}>
      <TileLayer attribution={CARTO_ATTRIBUTION} url={CARTO_LIGHT_URL} />
      <FitRoute lines={lines} />
      <FlyToStop stop={focusStop} />

      {/* 歷史底圖、衛星影像（一次一張，由解鎖後的圖層列控制） */}
      <HistoricalLayer activeId={layers.historical} opacity={layers.historical === 'liugong1939' ? 0.55 : 0.7} />
      <SatelliteLayer activeId={layers.satellite} opacity={0.7} />

      {/* 環境圖層 */}
      <ComfortLayer showTrees={layers.trees} showSidewalks={false} showGreen={layers.green} />
      <TemperatureLayer show={layers.lst} url={temperatureUrl} opacity={0.65} />
      <ShadeMapLayer show={layers.shadow} date={shadeDate} opacity={0.5} showTrees={layers.trees} />

      {/* 路線 */}
      {lines.map((line, i) => (
        <Polyline key={i} positions={line} pathOptions={{ color, weight: 5, opacity: 0.85 }} />
      ))}

      {/* 站點 */}
      {stops
        .filter((s) => s.lat != null)
        .map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={stopIcon(s.id, s.state, color)}
            zIndexOffset={s.state === 'next' ? 1000 : 0}
            eventHandlers={{ click: () => onSelectStop && onSelectStop(s.id) }}
          />
        ))}

      <UserLocationLayer position={userPos} accuracy={accuracy} />
    </MapContainer>
  );
}
