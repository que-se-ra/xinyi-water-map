'use client';

// /hkvisitors ——「信義區地底有條河？」香港朋友走讀專頁。
// 自成一頁：團碼閘門、書面語／粵語切換、背景介紹、Checkpoint 式走讀。
// 內容全部在 src/content/hkvisitors/tour.js；地圖在 ./HkTourMap。
// 沒有改動任何共用元件，其他專案不受影響。

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { routes } from '@/projects/xinyi/routeData';
import {
  TOUR_CODE,
  ROUTE_ID,
  REACH_RADIUS_M,
  ui,
  intro,
  stopExtras,
  extraStops,
  LAYER_INFO,
  LAYER_GROUPS,
} from '@/content/hkvisitors/tour';

const HkTourMap = dynamic(() => import('./HkTourMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-sky-50 flex items-center justify-center text-sm text-slate-400">地圖載入中…</div>,
});

const LS_CODE = 'hk_tour_code_ok';
const LS_LANG = 'hk_tour_lang';
const LS_DONE = 'hk_tour_done';

const isGeoStop = (id) => /^[A-Z]$/.test(id);

/** 兩點距離（公尺） */
function distanceM(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const la1 = toRad(a[0]);
  const la2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 路線折線（與主地圖同一套 segments 資料，這裡自行組裝，不動 MapView） */
function buildLines(route) {
  const pos = {};
  route.stations.forEach((s) => { pos[s.id] = [s.lat, s.lng]; });
  if (!route.segments || !route.segments.length) return [route.stations.map((s) => [s.lat, s.lng])];
  const lines = [];
  route.segments.forEach((seg) => {
    const from = pos[seg.from];
    const to = pos[seg.to];
    if (!from || !to) return;
    const pts = [from];
    (seg.waypoints || []).forEach((w) => pts.push([w.lat, w.lng]));
    pts.push(to);
    if (seg.skipLeading) pts.splice(0, seg.skipLeading);
    lines.push(pts);
  });
  return lines;
}

export default function HkTourClient() {
  const route = useMemo(() => routes.find((r) => r.id === ROUTE_ID), []);
  const lines = useMemo(() => buildLines(route), [route]);

  // ── 站點序列：路線一的站 ＋ 加插的知識站 ──
  const sequence = useMemo(() => {
    const out = [];
    const push = (s) => out.push(s);
    route.stations.forEach((st) => {
      const extra = stopExtras[st.id] || {};
      push({
        id: st.id,
        kind: isGeoStop(st.id) ? 'geo' : 'knowledge',
        lat: st.lat,
        lng: st.lng,
        badge: { zh: st.badge, yue: st.badge },
        name: { zh: st.name, yue: (extra.yue && extra.yue.name) || st.name },
        hook: { zh: st.hook, yue: (extra.yue && extra.yue.hook) || st.hook },
        body: { zh: st.body, yue: (extra.yue && extra.yue.body) || st.body },
        hk: extra.yue && extra.yue.hk ? { zh: extra.yue.hk, yue: extra.yue.hk } : null,
        imgs: st.imgs || [],
        unlock: extra.unlock || [],
      });
      extraStops
        .filter((e) => e.after === st.id)
        .forEach((e) => push({ ...e, kind: 'knowledge', lat: null, lng: null, imgs: [], unlock: e.unlock || [] }));
    });
    return out;
  }, [route]);

  // ── 基本狀態 ──
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);      // 團碼
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [lang, setLang] = useState('yue');
  const [view, setView] = useState('intro');            // intro | tour
  const [done, setDone] = useState([]);                 // 已看完的站 id（有順序）
  const [openId, setOpenId] = useState(null);           // 正在看的站
  const [seenLayers, setSeenLayers] = useState([]);     // 已經看過的圖層（NEW 標記用）
  const [panel, setPanel] = useState('card');           // card | list | layers

  // 定位
  const [userPos, setUserPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [geoState, setGeoState] = useState('idle');     // idle | on | denied | far
  const watchRef = useRef(null);

  // 圖層
  const [layerState, setLayerState] = useState({ historical: null, satellite: null, trees: false, green: false, lst: false, shadow: false });
  // 地表溫度圖磚網址：自己取，唔好喺呢個檔 import TemperatureLayer，
  // 因為嗰個檔連住 react-leaflet／leaflet，喺伺服器端預先算頁面時會因為冇 window 而炸。
  const [temperatureUrl, setTemperatureUrl] = useState('');
  const [temperatureError, setTemperatureError] = useState(false);
  const shadeDate = useMemo(() => new Date(), []);

  const T = useCallback((key) => (ui[key] ? ui[key][lang] : key), [lang]);

  // ── 載入本機進度 ──
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = (params.get('code') || '').trim().toUpperCase();
      if (fromUrl && fromUrl === TOUR_CODE) {
        localStorage.setItem(LS_CODE, '1');
      }
      if (localStorage.getItem(LS_CODE) === '1') setUnlocked(true);
      const l = localStorage.getItem(LS_LANG);
      if (l === 'zh' || l === 'yue') setLang(l);
      const d = JSON.parse(localStorage.getItem(LS_DONE) || '[]');
      if (Array.isArray(d) && d.length) {
        setDone(d);
        setView('tour');
      }
    } catch (e) { /* 私密模式等情況：當成全新開始 */ }
    setReady(true);
  }, []);

  const persistDone = useCallback((next) => {
    setDone(next);
    try { localStorage.setItem(LS_DONE, JSON.stringify(next)); } catch (e) {}
  }, []);

  const switchLang = (next) => {
    setLang(next);
    try { localStorage.setItem(LS_LANG, next); } catch (e) {}
  };

  const submitCode = (e) => {
    e.preventDefault();
    if (codeInput.trim().toUpperCase() === TOUR_CODE) {
      setUnlocked(true);
      setCodeError(false);
      try { localStorage.setItem(LS_CODE, '1'); } catch (err) {}
    } else {
      setCodeError(true);
    }
  };

  // ── 進度推演 ──
  const doneSet = useMemo(() => new Set(done), [done]);
  const nextIndex = useMemo(() => {
    for (let i = 0; i < sequence.length; i++) if (!doneSet.has(sequence[i].id)) return i;
    return sequence.length;
  }, [sequence, doneSet]);
  const nextStop = sequence[nextIndex] || null;
  const nextGeoStop = useMemo(() => {
    for (let i = nextIndex; i < sequence.length; i++) if (sequence[i].kind === 'geo') return sequence[i];
    return null;
  }, [sequence, nextIndex]);

  // 已解鎖圖層（看完某站之後）
  const unlockedLayers = useMemo(() => {
    const ids = [];
    sequence.forEach((s) => { if (doneSet.has(s.id)) (s.unlock || []).forEach((l) => ids.push(l)); });
    return ids;
  }, [sequence, doneSet]);

  // 距離下一個實地站
  const distanceToNext = useMemo(
    () => (userPos && nextGeoStop ? distanceM(userPos, [nextGeoStop.lat, nextGeoStop.lng]) : null),
    [userPos, nextGeoStop]
  );

  const markDone = useCallback(
    (id) => {
      if (doneSet.has(id)) { setOpenId(id); return; }
      persistDone([...done, id]);
      setOpenId(id);
      setPanel('card');
    },
    [doneSet, done, persistDone]
  );

  // 第一次開地表溫度先去攞圖磚網址（Google Earth Engine）
  useEffect(() => {
    if (!layerState.lst || temperatureUrl || temperatureError) return;
    let cancelled = false;
    fetch('/api/temperature')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d && d.urlFormat) setTemperatureUrl(d.urlFormat);
        else { setTemperatureError(true); setLayerState((s) => ({ ...s, lst: false })); }
      })
      .catch(() => {
        if (cancelled) return;
        setTemperatureError(true);
        setLayerState((s) => ({ ...s, lst: false }));
      });
    return () => { cancelled = true; };
  }, [layerState.lst, temperatureUrl, temperatureError]);

  // ── 定位：行到 50 米內自動解鎖下一個實地站 ──
  useEffect(() => {
    if (!unlocked || view !== 'tour') return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setGeoState('denied'); return; }
    watchRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const { latitude, longitude, accuracy: acc } = p.coords;
        setUserPos([latitude, longitude]);
        setAccuracy(acc);
        // 離台北太遠（例如仲喺香港試用）：唔好自動判定到站
        const farFromTaipei = latitude < 24.7 || latitude > 25.4 || longitude < 121.2 || longitude > 121.9;
        setGeoState(farFromTaipei ? 'far' : 'on');
      },
      () => setGeoState('denied'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => {
      if (watchRef.current != null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [unlocked, view]);

  useEffect(() => {
    if (geoState !== 'on' || !nextGeoStop || !userPos) return;
    // 只有輪到這一站（前面的站都看完）才會自動解鎖
    if (nextStop && nextStop.id !== nextGeoStop.id) return;
    if (distanceToNext != null && distanceToNext <= REACH_RADIUS_M) markDone(nextGeoStop.id);
  }, [geoState, userPos, distanceToNext, nextGeoStop, nextStop, markDone]);

  // 圖層列：第一次出現的標 NEW
  const newLayers = useMemo(() => unlockedLayers.filter((l) => !seenLayers.includes(l)), [unlockedLayers, seenLayers]);

  const toggleLayer = (id) => {
    const info = LAYER_INFO[id];
    if (!info) return;
    setSeenLayers((prev) => (prev.includes(id) ? prev : [...prev, id]));
    if (info.kind === 'historical') setLayerState((s) => ({ ...s, historical: s.historical === id ? null : id }));
    else if (info.kind === 'satellite') setLayerState((s) => ({ ...s, satellite: s.satellite === id ? null : id }));
    else if (id === 'lst') setLayerState((s) => ({ ...s, lst: !s.lst }));
    else setLayerState((s) => ({ ...s, [id]: !s[id] }));
  };

  const layerActive = (id) => {
    const info = LAYER_INFO[id];
    if (!info) return false;
    if (info.kind === 'historical') return layerState.historical === id;
    if (info.kind === 'satellite') return layerState.satellite === id;
    return Boolean(layerState[id]);
  };

  const mapStops = useMemo(
    () =>
      sequence
        .filter((s) => s.lat != null)
        .map((s) => ({
          id: s.id,
          lat: s.lat,
          lng: s.lng,
          state: doneSet.has(s.id) ? 'done' : nextStop && s.id === nextStop.id ? 'next' : 'locked',
        })),
    [sequence, doneSet, nextStop]
  );

  const openStop = openId ? sequence.find((s) => s.id === openId) : null;
  const focusStop = openStop && openStop.lat != null ? openStop : nextGeoStop;
  const progressPct = Math.round((done.length / sequence.length) * 100);

  if (!ready) return null;

  // ── 團碼閘門 ──
  if (!unlocked) {
    return (
      <main className="h-dvh overflow-y-auto bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <p className="text-sm font-semibold tracking-widest text-sky-700">XINYI · TAIPEI</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 leading-tight">{ui.pageTitle.zh}</h1>
          <p className="mt-2 text-slate-500">{ui.pageSubtitle.zh}</p>
          <form onSubmit={submitCode} className="mt-8 bg-white rounded-2xl border border-sky-100 shadow-sm p-5">
            <label className="block text-sm font-semibold text-slate-700">{ui.codePrompt.zh}</label>
            <input
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value); setCodeError(false); }}
              placeholder="XXXXXX"
              autoCapitalize="characters"
              className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-200 text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {codeError && <p className="mt-2 text-sm text-rose-600">{ui.codeError.zh}</p>}
            <button type="submit" className="mt-4 w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-colors">
              {ui.codeSubmit.zh}
            </button>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">{ui.codeHint.zh}</p>
          </form>
        </div>
      </main>
    );
  }

  const LangSwitch = () => (
    <div className="flex items-center gap-1 bg-white/80 rounded-full p-1 border border-sky-100">
      {[['zh', '書面語'], ['yue', '粵語']].map(([k, label]) => (
        <button
          key={k}
          onClick={() => switchLang(k)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            lang === k ? 'bg-sky-600 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // ── 背景介紹 ──
  if (view === 'intro') {
    return (
      <main className="h-dvh overflow-y-auto bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="mx-auto max-w-2xl px-5 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-sky-700">XINYI · TAIPEI · {ui.tourDate[lang]}</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{ui.pageTitle[lang]}</h1>
              <p className="mt-2 text-slate-500">{ui.pageSubtitle[lang]}</p>
              <p className="mt-1 text-sm text-sky-700 font-semibold">📍 {ui.meetPoint[lang]}</p>
            </div>
            <LangSwitch />
          </div>

          <div className="mt-8 space-y-6">
            {intro.map((sec) => (
              <section key={sec.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span aria-hidden>{sec.icon}</span>
                  {sec.title[lang]}
                </h2>
                <div className="mt-3 space-y-3">
                  {sec.paras[lang].map((p, i) => (
                    <p key={i} className="text-[15px] leading-[1.9] text-slate-700">{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <button
            onClick={() => setView('tour')}
            className="mt-8 w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-lg transition-colors shadow-lg shadow-sky-200"
          >
            {T('startTour')} →
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">{T('draftNote')}</p>
        </div>
      </main>
    );
  }

  // ── 走讀畫面 ──
  return (
    <main className="h-dvh flex flex-col bg-slate-50">
      {/* 頁首 */}
      <header className="shrink-0 px-4 py-2 bg-white border-b border-slate-200 flex items-center gap-3">
        <button onClick={() => setView('intro')} className="text-xs text-slate-500 hover:text-sky-700 shrink-0">
          {T('backToIntro')}
        </button>
        <div className="flex-1 min-w-0">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-sky-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {T('progress')} {done.length}/{sequence.length}
          </p>
        </div>
        <LangSwitch />
      </header>

      {/* 地圖 */}
      <div className="relative" style={{ height: '46vh' }}>
        <HkTourMap
          lines={lines}
          color={route.color}
          stops={mapStops}
          focusStop={focusStop}
          userPos={userPos}
          accuracy={accuracy}
          layers={layerState}
          temperatureUrl={temperatureUrl}
          shadeDate={shadeDate}
          onSelectStop={(id) => { if (doneSet.has(id)) { setOpenId(id); setPanel('card'); } }}
        />

        {/* 下一站提示 */}
        {nextStop && (
          <div className="absolute left-3 right-3 bottom-3 z-[1000] bg-white/95 backdrop-blur rounded-2xl border border-sky-100 shadow-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-wider text-sky-700">
                  {T('nextStop')} · {nextStop.badge[lang]}
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">{nextStop.name[lang]}</p>
                {nextStop.kind === 'geo' && distanceToNext != null && geoState === 'on' && (
                  <p className="text-[11px] text-slate-500">
                    {T('distanceAway')} {Math.round(distanceToNext)} m
                    {distanceToNext <= REACH_RADIUS_M ? ` · ${T('arrivedAuto')}` : ''}
                  </p>
                )}
                {geoState === 'denied' && <p className="text-[11px] text-amber-600">{T('gpsOff')}</p>}
                {geoState === 'far' && <p className="text-[11px] text-amber-600">{T('gpsFar')}</p>}
              </div>
              <button
                onClick={() => markDone(nextStop.id)}
                className="shrink-0 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
              >
                {nextStop.kind === 'geo' ? T('arrivedManual') : T('readDone')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 下方面板 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border-t border-slate-200">
        <div className="shrink-0 flex items-center gap-1 px-3 pt-2">
          {[['card', lang === 'zh' ? '解說' : '解說'], ['list', T('openList')], ['layers', T('layersTitle')]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setPanel(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                panel === k ? 'bg-sky-50 text-sky-700' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {label}
              {k === 'layers' && newLayers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-[9px] text-white animate-pulse">NEW</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
          {panel === 'card' && (
            openStop ? (
              <article>
                <p className="text-[11px] font-bold tracking-wider text-sky-700">{openStop.badge[lang]}</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">{openStop.name[lang]}</h2>
                <p className="mt-3 text-[15px] leading-[1.9] text-sky-900 bg-sky-50 rounded-xl px-4 py-3">{openStop.hook[lang]}</p>
                {openStop.body[lang].split('\n\n').map((p, i) => (
                  <p key={i} className="mt-3 text-[15px] leading-[1.9] text-slate-700">{p}</p>
                ))}
                {openStop.hk && (
                  <p className="mt-3 text-[14px] leading-[1.9] text-amber-900 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    🇭🇰 {openStop.hk[lang]}
                  </p>
                )}
                {openStop.footnote && (
                  <p className="mt-3 text-[12px] leading-relaxed text-slate-400">{openStop.footnote[lang]}</p>
                )}
                {(openStop.unlock || []).length > 0 && (
                  <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <p className="text-xs font-bold text-emerald-800">
                      🔓 {lang === 'zh' ? '解鎖了新圖層' : '解鎖咗新圖層'}
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      {openStop.unlock.map((l) => LAYER_INFO[l] && LAYER_INFO[l].label[lang]).filter(Boolean).join('、')}
                    </p>
                    <button onClick={() => setPanel('layers')} className="mt-2 text-xs font-bold text-emerald-700 underline">
                      {lang === 'zh' ? '去圖層列打開' : '去圖層列開佢'}
                    </button>
                  </div>
                )}
              </article>
            ) : (
              <p className="text-sm text-slate-400 py-8 text-center">
                {lang === 'zh' ? '走到下一站，解說就會出現在這裡。' : '行到下一站，解說就會喺呢度出現。'}
              </p>
            )
          )}

          {panel === 'list' && (
            <ol className="space-y-1.5">
              {sequence.map((s, i) => {
                const isDone = doneSet.has(s.id);
                const isNext = nextStop && s.id === nextStop.id;
                return (
                  <li key={s.id}>
                    <button
                      disabled={!isDone && !isNext}
                      onClick={() => (isDone ? (setOpenId(s.id), setPanel('card')) : markDone(s.id))}
                      className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                        isDone
                          ? 'bg-white border-slate-200 hover:border-sky-300'
                          : isNext
                          ? 'bg-sky-50 border-sky-300 animate-pulse'
                          : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 w-6 shrink-0">{i + 1}</span>
                        <span className="text-sm font-bold text-slate-800 truncate flex-1">
                          {isDone || isNext ? s.name[lang] : `${s.badge[lang]} · ${T('locked')}`}
                        </span>
                        {isNext && <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-[9px] font-bold text-white">NEW</span>}
                        {isDone && <span className="text-emerald-500 text-xs">✓</span>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          {panel === 'layers' && (
            <div className="space-y-4">
              {LAYER_GROUPS.map((g) => {
                const ids = unlockedLayers.filter((id) => LAYER_INFO[id] && LAYER_INFO[id].kind === g.id);
                if (!ids.length) return null;
                return (
                  <section key={g.id}>
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider">{g.title[lang]}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ids.map((id) => (
                        <button
                          key={id}
                          onClick={() => toggleLayer(id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            layerActive(id)
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          {LAYER_INFO[id].label[lang]}
                          {newLayers.includes(id) && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-[9px] text-white">NEW</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
              {unlockedLayers.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">{T('layersLocked')}</p>}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (window.confirm(T('resetConfirm'))) {
                      persistDone([]);
                      setOpenId(null);
                      setSeenLayers([]);
                      setLayerState({ historical: null, satellite: null, trees: false, green: false, lst: false, shadow: false });
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  {T('resetTour')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
