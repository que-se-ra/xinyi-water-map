'use client';

// 地圖左上角的地點搜尋：先比對本專案的走讀站點，再查 OpenStreetMap（Nominatim）。
// Nominatim 使用規範：每秒最多 1 次、不可邊打字邊查，所以只在按下搜尋 / Enter 時查詢。
// 搜尋範圍偏向目前地圖畫面（viewbox，bounded=0 不限縮），找不到畫面內的也會給全台結果。
// 選中結果後地圖飛過去，並放一個暫時的標記（清除搜尋就移除）。

import { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { useT, useLocale } from '@/i18n/LocaleProvider';

const MAX_RESULTS = 6;

const pinIcon = typeof window !== 'undefined'
  ? L.divIcon({
      className: '',
      html: `<div style="width:30px;height:40px;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35))">
        <svg viewBox="0 0 30 40" width="30" height="40">
          <path d="M15 0C7 0 1 6.3 1 14c0 10.2 12.2 24.6 13.4 25.4a1 1 0 0 0 1.2 0C16.8 38.6 29 24.2 29 14 29 6.3 23 0 15 0z" fill="#0284c7"/>
          <circle cx="15" cy="14" r="5.5" fill="white"/>
        </svg></div>`,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -36],
    })
  : null;

function matchStations(routes, q) {
  const needle = q.toLowerCase();
  const seen = new Set();
  const hits = [];
  routes.forEach((route) => {
    (route.stations || []).forEach((s) => {
      const key = `${s.lat},${s.lng}`;
      if (!s.name || seen.has(key) || !s.name.toLowerCase().includes(needle)) return;
      seen.add(key);
      hits.push({ kind: 'station', name: s.name, detail: route.name || '', lat: s.lat, lng: s.lng });
    });
  });
  return hits;
}

async function searchNominatim(q, map, lang) {
  const b = map.getBounds();
  const viewbox = [b.getWest(), b.getNorth(), b.getEast(), b.getSouth()].map((n) => n.toFixed(5)).join(',');
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=tw' +
    `&limit=${MAX_RESULTS}&accept-language=${lang}&viewbox=${viewbox}&bounded=0&q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const arr = await res.json();
  return arr.map((r) => {
    const [name, ...rest] = String(r.display_name || '').split(',').map((x) => x.trim());
    return {
      kind: 'place',
      name: r.name || name,
      // 地址只留前幾段（區、市），完整地址太長
      detail: rest.slice(0, 3).join('、'),
      lat: Number(r.lat),
      lng: Number(r.lon),
    };
  });
}

export default function PlaceSearch({ map, routes }) {
  const t = useT();
  const { isEn } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null); // null = 尚未搜尋
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const markerRef = useRef(null);
  const boxRef = useRef(null);

  // 搜尋框上的點擊、捲動不要傳到地圖（否則會觸發新增標記或拖動地圖）
  useEffect(() => {
    if (!boxRef.current) return;
    L.DomEvent.disableClickPropagation(boxRef.current);
    L.DomEvent.disableScrollPropagation(boxRef.current);
  }, []);

  useEffect(() => () => markerRef.current?.remove(), []);

  const clearMarker = () => {
    markerRef.current?.remove();
    markerRef.current = null;
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q || !map || loading) return;
    setLoading(true);
    setError(false);
    const stations = matchStations(routes, q);
    try {
      const places = await searchNominatim(q, map, isEn ? 'en' : 'zh-TW');
      setResults([...stations, ...places].slice(0, MAX_RESULTS + stations.length));
    } catch (err) {
      console.error('Place search failed:', err);
      setResults(stations);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (r) => {
    clearMarker();
    markerRef.current = L.marker([r.lat, r.lng], { icon: pinIcon, keyboard: false })
      .addTo(map)
      .bindPopup(`<strong>${escapeHtml(r.name)}</strong>${r.detail ? `<br><span style="color:#64748b;font-size:11px">${escapeHtml(r.detail)}</span>` : ''}`)
      .openPopup();
    map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 17), { duration: 1 });
    setResults(null);
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setError(false);
    clearMarker();
  };

  return (
    <div
      ref={boxRef}
      id="place-search"
      className="absolute top-3 left-3 right-[72px] md:right-auto md:w-80 z-[1000]"
    >
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-1 bg-white/95 backdrop-blur-md border border-sky-200/60 shadow-md rounded-2xl pl-3 pr-1 h-12"
        role="search"
      >
        <span aria-hidden="true" className="text-base">🔍</span>
        <input
          // 用 text 而不是 search：iOS/Chrome 的 search 欄位會多一個內建的清除鈕，和旁邊的 ✕ 重複
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('map.search.placeholder')}
          aria-label={t('map.search.placeholder')}
          enterKeyHint="search"
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none px-1"
        />
        {(query || results) && (
          <button
            type="button"
            onClick={handleClear}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label={t('map.search.clear')}
            title={t('map.search.clear')}
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="h-9 px-3 rounded-xl bg-sky-600 text-white text-xs font-bold disabled:opacity-40 active:scale-95 transition-all"
        >
          {loading ? '…' : t('map.search.button')}
        </button>
      </form>

      {results && (
        <ul className="mt-1.5 bg-white/97 backdrop-blur-md border border-sky-200/60 shadow-lg rounded-2xl overflow-hidden max-h-[50dvh] overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-3 text-xs text-slate-500">
              {error ? t('map.search.error') : t('map.search.none')}
            </li>
          )}
          {results.map((r, i) => (
            <li key={`${r.kind}-${r.lat}-${r.lng}-${i}`} className="border-b border-slate-100 last:border-b-0">
              <button
                type="button"
                onClick={() => handlePick(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-sky-50 active:bg-sky-100"
              >
                <div className="flex items-center gap-1.5 text-sm text-slate-800">
                  {r.kind === 'station' && (
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      {t('map.search.stationBadge')}
                    </span>
                  )}
                  <span className="truncate">{r.name}</span>
                </div>
                {r.detail && <div className="text-[11px] text-slate-500 truncate mt-0.5">{r.detail}</div>}
              </button>
            </li>
          ))}
          {error && results.length > 0 && (
            <li className="px-4 py-2 text-[11px] text-slate-400">{t('map.search.error')}</li>
          )}
        </ul>
      )}
    </div>
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
