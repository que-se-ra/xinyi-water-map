import { useEffect, useRef, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useT, useLocale } from '@/i18n/LocaleProvider';

// 全市氣候韌性圖層：騎樓整平路段、短延時強降雨積水模擬。
// （路燈圖層 2026-10-23 依使用者決定移除。）
// 資料由 src/scripts/process_city_layers.py 從臺北市開放資料轉出，放在 public/data/city/。
// 兩層都是打開開關才下載，不影響地圖首次載入速度。

const DATA = '/data/city';

// 積水深度分級（依水利處原始分級）：越深越濃的藍，最深一級改用紫色，
// 和古地圖的灰藍水道、行道樹的綠色都分得開。
export const WATERLOG_DEPTHS = [
  { key: '0.15m_0.30m', label: '0.15–0.3 m', color: '#93c5fd' },
  { key: '0.30m_0.50m', label: '0.3–0.5 m', color: '#3b82f6' },
  { key: '0.50m_1.00m', label: '0.5–1 m', color: '#1d4ed8' },
  { key: '1.00m_2.00m', label: '1–2 m', color: '#1e3a8a' },
  { key: 'Above 2.00m', label: '> 2 m', color: '#6d28d9' },
];
const DEPTH_COLOR = Object.fromEntries(WATERLOG_DEPTHS.map((d) => [d.key, d.color]));

export const WATERLOG_SCENARIOS = ['788', '100', '130'];

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function useJson(url, enabled) {
  const [data, setData] = useState(null);
  const cache = useRef({});
  useEffect(() => {
    if (!enabled || !url) return;
    if (cache.current[url]) {
      setData(cache.current[url]);
      return;
    }
    let alive = true;
    setData(null);
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        cache.current[url] = j;
        if (alive) setData(j);
      })
      .catch((e) => console.error('城市圖層載入失敗', url, e));
    return () => {
      alive = false;
    };
  }, [url, enabled]);
  return data;
}

function ArcadesLayer() {
  const t = useT();
  const { isEn } = useLocale();
  const colon = isEn ? ': ' : '：';
  const data = useJson(`${DATA}/arcades.json`, true);
  if (!data) return null;
  return (
    <GeoJSON
      data={data}
      style={{ color: '#b45309', weight: 1.5, opacity: 0.85, fillColor: '#f59e0b', fillOpacity: 0.45 }}
      onEachFeature={(f, layer) => {
        const p = f.properties || {};
        const rows = [
          [t('city.arcades.range'), p.range],
          [t('city.arcades.length'), p.length ? `${Math.round(p.length)} m` : ''],
          [t('city.arcades.done'), p.done],
          [t('city.arcades.accessible'), p.accessible],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => `<div><span class="text-slate-400">${esc(k)}${colon}</span>${esc(v)}</div>`)
          .join('');
        layer.bindPopup(
          `<div class="p-1 min-w-[160px]">
             <h3 class="text-sm font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">☂️ ${esc(p.district)} ${esc(p.road)}</h3>
             <div class="text-xs text-slate-600 space-y-0.5">${rows}</div>
           </div>`
        );
      }}
    />
  );
}

function WaterlogLayer({ scenario, onLoading }) {
  const data = useJson(`${DATA}/waterlog_${scenario}.json`, true);
  useEffect(() => {
    onLoading?.(!data);
  }, [data, onLoading]);
  if (!data) return null;
  return (
    <GeoJSON
      key={scenario}
      data={data}
      interactive={false}
      style={(f) => ({
        stroke: false,
        fillColor: DEPTH_COLOR[f.properties?.depth] || '#60a5fa',
        fillOpacity: 0.6,
      })}
    />
  );
}

export default function CityLayers({ showArcades, showWaterlog, waterlogScenario, onWaterlogLoading }) {
  return (
    <>
      {showWaterlog && <WaterlogLayer scenario={waterlogScenario} onLoading={onWaterlogLoading} />}
      {showArcades && <ArcadesLayer />}
    </>
  );
}
