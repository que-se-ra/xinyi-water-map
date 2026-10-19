'use client';

// /hkvisitors ——「信義區地底有條河？」香港朋友走讀專頁。
// 自成一頁：團碼閘門、書面語／粵語切換、背景介紹、Checkpoint 式走讀、
// 路段舒適度評分、站 A 錦囊（補給／捷運圖層）、終點回饋。
// 內容全部在 src/content/hkvisitors/tour.js；地圖在 ./HkTourMap。
// 🔴 這個檔不可以 import 任何連住 react-leaflet／leaflet 的模組（例如 layers/TemperatureLayer），
//    否則伺服器端預先算頁面時會因為冇 window 而 build 失敗。

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { routes } from '@/projects/xinyi/routeData';
import {
  TOUR_CODE,
  ROUTE_ID,
  REACH_RADIUS_M,
  SKIP_STOPS,
  RATING_FROM,
  RATING_SCALE,
  RATING_PROJECT_ID,
  FEEDBACK_FORM_URL,
  MAIN_MAP_URL,
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
const LS_ARRIVED = 'hk_tour_arrived';
const LS_ANCHOR = 'hk_tour_anchor';
const LS_PID = 'hk_tour_pid';

const EMPTY_LAYERS = {
  historical: null, satellite: null, trees: false, green: false, lst: false, shadow: false,
  'kit-shops': false, 'kit-mrt': false,
};

const isLetterStop = (id) => /^[A-Z]$/.test(id);

/** 兩點距離（公尺） */
function distanceM(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 台北時間的 ISO 字串（+08:00），方便日後對照日照與溫度 */
function taipeiISO(d = new Date()) {
  const t = new Date(d.getTime() + 8 * 3600 * 1000);
  return t.toISOString().replace(/\.\d{3}Z$/, '+08:00');
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

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch (e) { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
};

export default function HkTourClient() {
  const route = useMemo(() => routes.find((r) => r.id === ROUTE_ID), []);
  const lines = useMemo(() => buildLines(route), [route]);

  // ── 站點序列：路線一的站（跳過 SKIP_STOPS）＋ 加插的站（可以接龍：after 指向另一個加插站）──
  const sequence = useMemo(() => {
    const out = [];
    const insertAfter = (id) => {
      extraStops.filter((e) => e.after === id).forEach((e) => {
        out.push({
          ...e,
          kind: e.type === 'geo' ? 'geo' : 'knowledge',
          lat: e.lat ?? null,
          lng: e.lng ?? null,
          imgs: [],
          unlock: e.unlock || [],
        });
        insertAfter(e.id);
      });
    };
    route.stations.forEach((st) => {
      if (!SKIP_STOPS.includes(st.id)) {
        const extra = stopExtras[st.id] || {};
        const y = extra.yue || {};
        out.push({
          id: st.id,
          kind: isLetterStop(st.id) ? 'geo' : 'knowledge',
          lat: st.lat,
          lng: st.lng,
          badge: { zh: st.badge, yue: st.badge },
          name: { zh: st.name, yue: y.name || st.name },
          hook: { zh: st.hook, yue: y.hook || st.hook },
          body: { zh: st.body, yue: y.body || st.body },
          hk: extra.hk || null,
          imgs: st.imgs || [],
          unlock: extra.unlock || [],
          kit: Boolean(extra.kit),
          finale: Boolean(extra.finale),
        });
      }
      insertAfter(st.id);
    });
    return out;
  }, [route]);

  const indexOf = useCallback((id) => sequence.findIndex((s) => s.id === id), [sequence]);

  // ── 基本狀態 ──
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);      // 團碼
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [lang, setLang] = useState('yue');
  const [view, setView] = useState('intro');            // intro | tour
  const [done, setDone] = useState([]);                 // 已看完的站 id（有順序）
  const [arrivedAt, setArrivedAt] = useState({});       // 實地站：到達時間（台北時間）
  const [anchor, setAnchor] = useState(null);           // 下一段評分的起點站
  const [pid, setPid] = useState('');                   // 這部手機的匿名代號
  const [openId, setOpenId] = useState(null);           // 正在看的站
  const [seenLayers, setSeenLayers] = useState([]);     // 已經看過的圖層（NEW 標記用）
  const [panel, setPanel] = useState('card');           // card | list | layers
  const [pendingRating, setPendingRating] = useState(null);
  const [ratingMsg, setRatingMsg] = useState(null);     // { ok: bool }
  const [ratingBusy, setRatingBusy] = useState(false);
  const [inApp, setInApp] = useState(null);            // 'line' | 'other' | null
  const [gpsHelp, setGpsHelp] = useState(false);

  // 定位
  const [userPos, setUserPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [geoState, setGeoState] = useState('idle');     // idle | on | denied | far
  const watchRef = useRef(null);

  // 圖層
  const [layerState, setLayerState] = useState(EMPTY_LAYERS);
  // 地表溫度圖磚網址：自己取，唔好喺呢個檔 import TemperatureLayer（見檔頭）。
  const [temperatureUrl, setTemperatureUrl] = useState('');
  const [temperatureError, setTemperatureError] = useState(false);
  const [shadowOpacity, setShadowOpacity] = useState(0.35);   // 日照陰影透明度（圖層列可調）
  // 「即時」日照陰影：每 5 分鐘更新一次太陽位置（走讀會行兩三個鐘，唔可以定死喺開頁嗰一刻）
  const [shadeDate, setShadeDate] = useState(() => new Date());
  useEffect(() => {
    if (!layerState.shadow) return;
    setShadeDate(new Date());
    const t = setInterval(() => setShadeDate(new Date()), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [layerState.shadow]);

  const T = useCallback((key) => (ui[key] ? ui[key][lang] : key), [lang]);

  // ── 載入本機進度 ──
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = (params.get('code') || '').trim().toUpperCase();
      if (fromUrl && fromUrl === TOUR_CODE) localStorage.setItem(LS_CODE, '1');
      if (localStorage.getItem(LS_CODE) === '1') setUnlocked(true);
      const l = localStorage.getItem(LS_LANG);
      if (l === 'zh' || l === 'yue') setLang(l);
    } catch (e) { /* 私密模式等情況：當成全新開始 */ }
    const d = read(LS_DONE, []);
    if (Array.isArray(d) && d.length) { setDone(d); setView('tour'); }
    setArrivedAt(read(LS_ARRIVED, {}));
    setAnchor(read(LS_ANCHOR, null));
    try {
      const ua = navigator.userAgent || '';
      // LINE 的內建瀏覽器 UA 帶「Line/版本號」；FB、IG、微信同理，定位都比 Safari／Chrome 不穩定
      setInApp(/Line\/\d/i.test(ua) ? 'line' : /FBAN|FBAV|Instagram|MicroMessenger/i.test(ua) ? 'other' : null);
    } catch (e) {}
    let p = read(LS_PID, '');
    if (!p) { p = Math.random().toString(36).slice(2, 8); write(LS_PID, p); }
    setPid(p);
    setReady(true);
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

  // 距離下一個實地站（未有座標的站只能手動解鎖）
  const distanceToNext = useMemo(
    () => (userPos && nextGeoStop && nextGeoStop.lat != null ? distanceM(userPos, [nextGeoStop.lat, nextGeoStop.lng]) : null),
    [userPos, nextGeoStop]
  );

  // ── 到站：記時間、決定要不要問上一段路的舒適度 ──
  const markDone = useCallback(
    (id) => {
      if (doneSet.has(id)) { setOpenId(id); setPanel('card'); return; }
      const stop = sequence.find((s) => s.id === id);
      const nextDone = [...done, id];
      setDone(nextDone);
      write(LS_DONE, nextDone);
      setOpenId(id);
      setPanel('card');

      if (stop && stop.kind === 'geo') {
        const now = taipeiISO();
        const nextArrived = { ...arrivedAt, [id]: now };
        setArrivedAt(nextArrived);
        write(LS_ARRIVED, nextArrived);

        const fromIdx = indexOf(RATING_FROM);
        const curIdx = indexOf(id);
        const start = anchor || 'A';
        if (fromIdx !== -1 && curIdx >= fromIdx && start !== id && indexOf(start) < curIdx) {
          // 起點到這一站之間路過的實地站（有略過的段落時會不只一個）
          const via = sequence
            .slice(indexOf(start) + 1, curIdx)
            .filter((s) => s.kind === 'geo')
            .map((s) => s.id);
          setPendingRating({ from: start, to: id, via, dep: nextArrived[start] || '', arr: now });
        } else if (!anchor) {
          setAnchor(id);
          write(LS_ANCHOR, id);
        }
      }
    },
    [doneSet, done, sequence, arrivedAt, anchor, indexOf]
  );

  const submitRating = async (score) => {
    if (!pendingRating || ratingBusy) return;
    setRatingBusy(true);
    const { from, to, via, dep, arr } = pendingRating;
    // 試算表只有 timestamp／route_id／route_name／segment_id／score_* 幾欄，
    // 額外資訊（經過的站、出發與到達時間、手機代號）一律包進 segment_id，唔使改 Google Apps Script。
    const segmentId = `hk:${from}-${to}|via=${via.join('.')}|dep=${dep}|arr=${arr}|pid=${pid}|lang=${lang}`;
    try {
      const res = await fetch('/api/feedback-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'route_comfort',
          project_id: RATING_PROJECT_ID,
          timestamp: taipeiISO(),
          route_id: ROUTE_ID,
          route_name: route.name,
          segment_id: segmentId,
          scores: { comfort: score },
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setAnchor(to);
      write(LS_ANCHOR, to);
      setPendingRating(null);
      setRatingMsg({ ok: true });
    } catch (e) {
      setRatingMsg({ ok: false });
    } finally {
      setRatingBusy(false);
      setTimeout(() => setRatingMsg(null), 2500);
    }
  };

  const skipRating = () => setPendingRating(null);   // 起點不變：下一站會一次過評整段

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
    if (geoState !== 'on' || !nextGeoStop || !userPos || pendingRating) return;
    // 只有輪到這一站（前面的站都看完）才會自動解鎖
    if (nextStop && nextStop.id !== nextGeoStop.id) return;
    if (distanceToNext != null && distanceToNext <= REACH_RADIUS_M) markDone(nextGeoStop.id);
  }, [geoState, userPos, distanceToNext, nextGeoStop, nextStop, markDone, pendingRating]);

  // 圖層列：第一次出現的標 NEW
  const newLayers = useMemo(() => unlockedLayers.filter((l) => !seenLayers.includes(l)), [unlockedLayers, seenLayers]);

  const toggleLayer = (id) => {
    const info = LAYER_INFO[id];
    if (!info) return;
    setSeenLayers((prev) => (prev.includes(id) ? prev : [...prev, id]));
    if (info.kind === 'historical') setLayerState((s) => ({ ...s, historical: s.historical === id ? null : id }));
    else if (info.kind === 'satellite') setLayerState((s) => ({ ...s, satellite: s.satellite === id ? null : id }));
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
          label: s.extra ? '＋' : s.id,
          lat: s.lat,
          lng: s.lng,
          state: doneSet.has(s.id) ? 'done' : nextStop && s.id === nextStop.id ? 'next' : 'locked',
        })),
    [sequence, doneSet, nextStop]
  );

  const openStop = openId ? sequence.find((s) => s.id === openId) : null;
  const focusStop = openStop && openStop.lat != null ? openStop : nextGeoStop && nextGeoStop.lat != null ? nextGeoStop : null;
  const progressPct = Math.round((done.length / sequence.length) * 100);
  const stopName = (id) => {
    const s = sequence.find((x) => x.id === id);
    return s ? s.name[lang] : id;
  };

  if (!ready) return null;

  // ── 團碼閘門 ──
  if (!unlocked) {
    return (
      <main className="h-dvh overflow-y-auto bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <p className="text-sm font-semibold tracking-widest text-sky-700">XINYI · TAIPEI</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 leading-tight">{ui.pageTitle.zh}</h1>
          <p className="mt-2 text-slate-500">{ui.pageSubtitle.zh}</p>
          {inApp && (
            <div className="mt-6">
              <InAppBanner />
            </div>
          )}
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

  // LINE 支援在網址加 openExternalBrowser=1，按下去會改用手機預設瀏覽器打開。
  // 已經入過團碼就順手帶上 code，外部瀏覽器不用再輸入一次。
  const externalUrl = (() => {
    if (typeof window === 'undefined') return '';
    const u = new URL(window.location.href);
    u.searchParams.set('openExternalBrowser', '1');
    if (unlocked) u.searchParams.set('code', TOUR_CODE);
    return u.toString();
  })();

  const InAppBanner = () =>
    inApp ? (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
        <p className="text-sm font-bold text-amber-900">⚠️ {T('inAppTitle')}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-amber-800">{inApp === 'line' ? T('inAppLine') : T('inAppOther')}</p>
        {inApp === 'line' && (
          <a href={externalUrl} className="mt-2 block text-center py-2.5 rounded-xl bg-amber-500 text-white text-sm font-black">
            {T('inAppButton')}
          </a>
        )}
      </div>
    ) : null;

  const GpsHelp = () => (
    <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 text-[13px] leading-relaxed text-slate-700">
      <p className="font-bold text-slate-900">📍 {T('gpsHelpTitle')}</p>
      <p className="mt-2 font-bold text-slate-500">iPhone（Safari）</p>
      <ol className="mt-1 list-decimal pl-5 space-y-1">{ui.gpsHelpIOS[lang].map((x, i) => <li key={i}>{x}</li>)}</ol>
      <p className="mt-3 font-bold text-slate-500">Android（Chrome）</p>
      <ol className="mt-1 list-decimal pl-5 space-y-1">{ui.gpsHelpAndroid[lang].map((x, i) => <li key={i}>{x}</li>)}</ol>
      <p className="mt-3 text-slate-500">{T('gpsHelpTip')}</p>
    </div>
  );

  const LangSwitch = () => (
    <div className="flex items-center gap-1 bg-white/80 rounded-full p-1 border border-sky-100 shrink-0">
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

          {inApp && (
            <div className="mt-6">
              <InAppBanner />
            </div>
          )}

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

          <div className="mt-6">
            <GpsHelp />
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
          shadowOpacity={shadowOpacity}
          onSelectStop={(id) => { if (doneSet.has(id)) { setOpenId(id); setPanel('card'); } }}
        />

        {/* 下一站提示 */}
        {nextStop && !pendingRating && (
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
                {(geoState === 'denied' || geoState === 'far' || inApp) && (
                  <p className="text-[11px] text-amber-700 truncate">
                    {geoState === 'far' ? T('gpsFar') : geoState === 'denied' ? T('gpsOff') : ''}
                    {(geoState === 'denied' || inApp) && (
                      <button onClick={() => { setGpsHelp(true); setPanel('card'); }} className="ml-1 font-bold text-sky-700 underline">
                        {T('gpsHelpButton')}
                      </button>
                    )}
                  </p>
                )}
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

        {/* 路段舒適度評分 */}
        {pendingRating && (
          <div className="absolute left-3 right-3 bottom-3 z-[1001] bg-white rounded-2xl border-2 border-orange-300 shadow-xl px-4 py-3">
            <p className="text-sm font-black text-slate-900">🌡️ {T('rateTitle')}</p>
            <p className="mt-0.5 text-[12px] text-slate-500">
              {T('rateSegment')}：{stopName(pendingRating.from)} → {stopName(pendingRating.to)}
            </p>
            {pendingRating.via.length > 0 && (
              <p className="mt-0.5 text-[11px] text-orange-700">{T('rateCombined')}</p>
            )}
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  disabled={ratingBusy}
                  onClick={() => submitRating(n)}
                  className="py-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50 transition-colors"
                >
                  <span className="block text-lg font-black text-slate-800">{n}</span>
                  <span className="block text-[9px] leading-tight text-slate-500">{RATING_SCALE[lang][n - 1]}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[10px] leading-snug text-slate-400 flex-1">{T('rateHint')}</p>
              <button onClick={skipRating} className="shrink-0 text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1">
                {T('rateSkip')} →
              </button>
            </div>
          </div>
        )}
        {ratingMsg && (
          <div className={`absolute left-1/2 -translate-x-1/2 top-3 z-[1002] px-4 py-2 rounded-full text-xs font-bold shadow ${ratingMsg.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
            {ratingMsg.ok ? T('rateThanks') : T('rateFailed')}
          </div>
        )}
      </div>

      {/* 下方面板 */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border-t border-slate-200">
        <div className="shrink-0 flex items-center gap-1 px-3 pt-2">
          {[['card', '解說'], ['list', T('openList')], ['layers', T('layersTitle')]].map(([k, label]) => (
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
          {panel === 'card' && (gpsHelp || inApp) && (
            <div className="mb-4 space-y-3">
              <InAppBanner />
              {gpsHelp && <GpsHelp />}
            </div>
          )}
          {panel === 'card' && (
            openStop ? (
              <article>
                <p className="text-[11px] font-bold tracking-wider text-sky-700">{openStop.badge[lang]}</p>
                {openStop.extra && (
                  <p className="mt-1 inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">{T('extraBadge')}</p>
                )}
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
                {openStop.link && (
                  <a href={openStop.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-sky-700 underline">
                    {lang === 'zh' ? '官方說明頁 ↗' : '官方說明頁 ↗'}
                  </a>
                )}
                {openStop.footnote && (
                  <p className="mt-3 text-[12px] leading-relaxed text-slate-400">{openStop.footnote[lang]}</p>
                )}
                {openStop.kit && (
                  <div className="mt-4 rounded-xl bg-violet-50 border border-violet-200 px-4 py-3">
                    <p className="text-sm font-black text-violet-900">{T('kitTitle')}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-violet-800">{T('kitBody')}</p>
                  </div>
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
                {openStop.finale && (
                  <div className="mt-5 rounded-2xl bg-sky-600 text-white px-5 py-4">
                    <p className="text-lg font-black">🎉 {T('finaleTitle')}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-sky-50">{T('finaleBody')}</p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <a href={FEEDBACK_FORM_URL} className="block text-center py-3 rounded-xl bg-white text-sky-700 font-black">
                        📝 {T('finaleForm')}
                      </a>
                      <a href={MAIN_MAP_URL} className="block text-center py-3 rounded-xl bg-sky-700 text-white font-black border border-sky-400">
                        🗺️ {T('finaleMap')}
                      </a>
                    </div>
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
                        {s.extra && <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-[9px] font-bold text-amber-800">額外</span>}
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
                    {g.id === 'toggle' && layerState.shadow && (
                      <label className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                        <span className="shrink-0">{lang === 'zh' ? '陰影深淺' : '陰影深淺'}</span>
                        <input
                          type="range"
                          min="0.1"
                          max="0.8"
                          step="0.05"
                          value={shadowOpacity}
                          onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                          className="flex-1 accent-sky-600"
                        />
                        <span className="w-9 text-right font-mono">{Math.round(shadowOpacity * 100)}%</span>
                      </label>
                    )}
                  </section>
                );
              })}
              {unlockedLayers.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">{T('layersLocked')}</p>}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (window.confirm(T('resetConfirm'))) {
                      setDone([]); write(LS_DONE, []);
                      setArrivedAt({}); write(LS_ARRIVED, {});
                      setAnchor(null); write(LS_ANCHOR, null);
                      setOpenId(null);
                      setPendingRating(null);
                      setSeenLayers([]);
                      setLayerState(EMPTY_LAYERS);
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
