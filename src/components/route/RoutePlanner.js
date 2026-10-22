'use client';

// 涼徑規劃：輸入起點、終點，依情境（找樹蔭／躲雨／走亮路）與偏好（近一點／剛剛好／舒服一點）
// 找一條比較舒服的步行路線，並和最短路線並排比較。
// 和本站其他資料整合：結果會列出沿途 80 公尺內的導覽站點，並可以直接替這條路打熱舒適分數。

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Polyline, Marker, Tooltip, useMapEvents } from 'react-leaflet';
import { useT, useLocale } from '@/i18n/LocaleProvider';
import { SCENARIOS, PREFERENCES, planRoute } from '@/lib/routing';
import { matchStations, searchNominatim } from '@/components/layers/PlaceSearch';

const NEAR_STATION_M = 80;

// 指標百分比 → 路段顏色（低：暖橘、高：深綠／藍／金，依情境）
const RAMP = {
  shade: ['#f97316', '#facc15', '#84cc16', '#15803d'],
  cover: ['#f97316', '#facc15', '#38bdf8', '#1d4ed8'],
  lit: ['#64748b', '#a8a29e', '#fcd34d', '#f59e0b'],
};
const colorFor = (metric, pct) => RAMP[metric][Math.min(3, Math.floor(pct / 25))];

function makeEndIcon(label, color) {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};color:#fff;font:700 13px/28px sans-serif;text-align:center;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function haversine(a, b) {
  const R = 6371000;
  const toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b[0] - a[0]);
  const dLng = toR(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function defaultScenario(sky) {
  if (sky.isRainy) return 'rain';
  if (sky.isNight) return 'night';
  return 'shade';
}

const fmtTime = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** 規劃狀態（放在 MapView，讓面板與地圖圖層共用） */
export function useRoutePlanner(sky) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [pick, setPick] = useState(null); // 'start' | 'end' | null：正在地圖上點選
  const [scenario, setScenario] = useState(() => defaultScenario(sky));
  const [scenarioTouched, setScenarioTouched] = useState(false);
  const [preference, setPreference] = useState('balanced');
  const [time, setTime] = useState(() => fmtTime(new Date()));
  const [compare, setCompare] = useState(true);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState(null);

  // 使用者還沒自己選情境時，跟著天色走（下雨→躲雨、天黑→走亮路）
  const autoScenario = defaultScenario(sky);
  const effectiveScenario = scenarioTouched ? scenario : autoScenario;

  return {
    open, setOpen, start, setStart, end, setEnd, pick, setPick,
    scenario: effectiveScenario,
    setScenario: (s) => {
      setScenario(s);
      setScenarioTouched(true);
    },
    preference, setPreference, time, setTime, compare, setCompare,
    result, setResult, status, setStatus, error, setError,
  };
}

/** 地圖上的路線、起終點，以及點地圖選點 */
export function RoutePlanLayer({ planner }) {
  const t = useT();
  const { start, end, pick, setPick, setStart, setEnd, result, compare } = planner;
  const startIcon = useMemo(() => makeEndIcon(t('route.startShort'), '#0f766e'), [t]);
  const endIcon = useMemo(() => makeEndIcon(t('route.endShort'), '#be123c'), [t]);

  useMapEvents({
    click(e) {
      if (!pick) return;
      const p = { lat: e.latlng.lat, lng: e.latlng.lng, name: t('route.pickedPoint') };
      if (pick === 'start') setStart(p);
      else setEnd(p);
      setPick(null);
    },
  });

  return (
    <>
      {result && compare && (
        <Polyline
          positions={result.shortest.coords}
          pathOptions={{ color: '#475569', weight: 4, opacity: 0.7, dashArray: '6 8', interactive: false }}
        />
      )}
      {result && (
        <>
          {/* 白色外框讓路線在任何底圖上都看得清楚 */}
          <Polyline positions={result.best.coords} pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.9, interactive: false }} />
          {result.best.segments.map((s, i) => (
            <Polyline
              key={i}
              positions={s.coords}
              pathOptions={{ color: colorFor(result.metric, s.pct), weight: 6, opacity: 0.95, lineCap: 'round', interactive: false }}
            />
          ))}
        </>
      )}
      {start && (
        <Marker position={[start.lat, start.lng]} icon={startIcon} keyboard={false}>
          <Tooltip direction="top" offset={[0, -12]}>{start.name}</Tooltip>
        </Marker>
      )}
      {end && (
        <Marker position={[end.lat, end.lng]} icon={endIcon} keyboard={false}>
          <Tooltip direction="top" offset={[0, -12]}>{end.name}</Tooltip>
        </Marker>
      )}
    </>
  );
}

function PlaceField({ label, value, onChange, onPick, picking, map, routes, extra }) {
  const t = useT();
  const { isEn } = useLocale();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    const query = q.trim();
    if (!query || !map || loading) return;
    setLoading(true);
    const stations = matchStations(routes, query);
    try {
      const places = await searchNominatim(query, map, isEn ? 'en' : 'zh-TW');
      setResults([...stations, ...places].slice(0, 6));
    } catch {
      setResults(stations);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      {value ? (
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700">
          <span className="flex-1 truncate">{value.name}</span>
          <button type="button" onClick={() => onChange(null)} className="text-slate-400 hover:text-slate-600" aria-label={t('route.clear')}>
            ✕
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={search} className="flex gap-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('route.searchPlaceholder')}
              className="flex-1 min-w-0 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400"
            />
            <button type="submit" className="px-2.5 rounded-xl bg-slate-100 text-xs text-slate-600 hover:bg-slate-200">
              {loading ? '…' : t('route.search')}
            </button>
          </form>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={onPick}
              className={`text-[11px] px-2 py-1 rounded-lg border ${picking ? 'bg-sky-600 text-white border-sky-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              🗺️ {picking ? t('route.picking') : t('route.pickOnMap')}
            </button>
            {extra}
          </div>
          {results && (
            <ul className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto">
              {results.length === 0 && <li className="px-3 py-2 text-[11px] text-slate-400">{t('route.noResult')}</li>}
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ lat: r.lat, lng: r.lng, name: r.name });
                      setResults(null);
                      setQ('');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-sky-50"
                  >
                    <span className="block text-xs text-slate-700">
                      {r.kind === 'station' && <span className="mr-1 text-[10px] text-sky-700">{t('route.stationTag')}</span>}
                      {r.name}
                    </span>
                    {r.detail && <span className="block text-[10px] text-slate-400 truncate">{r.detail}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Chips({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-1">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`text-[11px] py-1.5 rounded-xl border transition-colors ${
            value === v ? 'bg-teal-700 text-white border-teal-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

/** 規劃面板（地圖外層的浮動卡片） */
export function RoutePlannerPanel({ planner, map, routes, userPos, onRateRoute }) {
  const t = useT();
  const boxRef = useRef(null);
  const {
    open, setOpen, start, setStart, end, setEnd, pick, setPick, scenario, setScenario,
    preference, setPreference, time, setTime, compare, setCompare, result, setResult, status, setStatus, error, setError,
  } = planner;

  useEffect(() => {
    if (!boxRef.current) return;
    L.DomEvent.disableClickPropagation(boxRef.current);
    L.DomEvent.disableScrollPropagation(boxRef.current);
  }, [open]);

  // 起終點或條件變了，舊結果就不算數
  useEffect(() => {
    setResult(null);
    setStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, scenario, preference, time]);

  const run = async () => {
    if (!start || !end) return;
    setStatus('loading');
    setError(null);
    try {
      const [hh, mm] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hh, mm, 0, 0);
      const r = await planRoute({ start, end, scenario, preference, date });
      setResult(r);
      setStatus('done');
      if (map) {
        // 寬螢幕時面板在左側，留出面板寬度，路線才不會被擋住
        const wide = map.getContainer().clientWidth >= 640;
        map.fitBounds(L.latLngBounds([...r.best.coords, ...r.shortest.coords]), {
          maxZoom: 17,
          paddingTopLeft: wide ? [360, 60] : [20, 60],
          paddingBottomRight: [40, 40],
        });
      }
    } catch (e) {
      setError(e.code || 'unknown');
      setStatus('error');
    }
  };

  // 沿途 80 公尺內的導覽站點
  const nearby = useMemo(() => {
    if (!result) return [];
    const seen = new Set();
    const out = [];
    const pts = result.best.coords.filter((_, i) => i % 2 === 0);
    routes.forEach((route) =>
      (route.stations || []).forEach((s) => {
        const key = `${s.lat},${s.lng}`;
        if (seen.has(key)) return;
        if (pts.some((p) => haversine(p, [s.lat, s.lng]) <= NEAR_STATION_M)) {
          seen.add(key);
          out.push({ name: s.name, route: route.name });
        }
      })
    );
    return out;
  }, [result, routes]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-teal-700 text-white shadow-lg rounded-2xl px-3.5 py-2.5 text-xs font-bold hover:bg-teal-800"
      >
        🧭 {t('route.open')}
      </button>
    );
  }

  const metricLabel = t(`route.metric.${SCENARIOS[scenario].metric}`);
  const b = result?.best;
  const s = result?.shortest;
  const extraM = b && s ? b.lengthM - s.lengthM : 0;

  return (
    <div
      ref={boxRef}
      className="w-[330px] max-w-[calc(100vw-24px)] max-h-[calc(100dvh-170px)] overflow-y-auto bg-white/97 backdrop-blur-md border border-teal-100 rounded-2xl shadow-xl p-4 space-y-3 text-slate-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold">🧭 {t('route.title')}</p>
          <p className="text-[10px] text-slate-400 leading-snug">{t('route.subtitle')}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 px-1" aria-label={t('route.close')}>
          ✕
        </button>
      </div>

      <PlaceField
        label={t('route.start')}
        value={start}
        onChange={setStart}
        onPick={() => setPick(pick === 'start' ? null : 'start')}
        picking={pick === 'start'}
        map={map}
        routes={routes}
        extra={
          userPos && (
            <button
              type="button"
              onClick={() => setStart({ lat: userPos[0], lng: userPos[1], name: t('route.myLocation') })}
              className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              📍 {t('route.myLocation')}
            </button>
          )
        }
      />
      <PlaceField
        label={t('route.end')}
        value={end}
        onChange={setEnd}
        onPick={() => setPick(pick === 'end' ? null : 'end')}
        picking={pick === 'end'}
        map={map}
        routes={routes}
      />
      {start && end && (
        <button
          type="button"
          onClick={() => {
            setStart(end);
            setEnd(start);
          }}
          className="text-[11px] text-sky-700 hover:underline"
        >
          ⇅ {t('route.swap')}
        </button>
      )}

      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-slate-500">{t('route.scenario')}</p>
        <Chips
          label={t('route.scenario')}
          value={scenario}
          onChange={setScenario}
          options={Object.keys(SCENARIOS).map((k) => [k, `${SCENARIOS[k].icon} ${t(`route.scenario.${k}`)}`])}
        />
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-slate-500">{t('route.preference')}</p>
        <Chips
          label={t('route.preference')}
          value={preference}
          onChange={setPreference}
          options={Object.keys(PREFERENCES).map((k) => [k, t(`route.pref.${k}`)])}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {scenario === 'shade' && (
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
            🕒 {t('route.time')}
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200"
            />
          </label>
        )}
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="accent-teal-700" />
          {t('route.compare')}
        </label>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={!start || !end || status === 'loading'}
        className="w-full py-2.5 rounded-xl bg-teal-700 text-white text-sm font-bold hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400"
      >
        {status === 'loading' ? t('route.planning') : t('route.plan')}
      </button>

      {status === 'error' && (
        <p className="text-[11px] text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{t(`route.error.${error}`) || t('route.error.unknown')}</p>
      )}

      {b && (
        <div className="space-y-2">
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3">
            <p className="text-[11px] font-bold text-teal-800">{t('route.recommended')}</p>
            <div className="grid grid-cols-3 gap-2 mt-1 tabular-nums">
              <div>
                <p className="text-lg font-black text-slate-800">{(b.lengthM / 1000).toFixed(2)}</p>
                <p className="text-[10px] text-slate-500">{t('route.km')}</p>
              </div>
              <div>
                <p className="text-lg font-black text-slate-800">{Math.round(b.minutes)}</p>
                <p className="text-[10px] text-slate-500">{t('route.minutes')}</p>
              </div>
              <div>
                <p className="text-lg font-black text-teal-700">{Math.round(b.metricPct)}%</p>
                <p className="text-[10px] text-slate-500">{metricLabel}</p>
              </div>
            </div>
          </div>
          {compare && (
            <div className="rounded-xl border border-dashed border-slate-300 p-3 text-[11px] text-slate-600 tabular-nums">
              <p className="font-bold text-slate-500">{t('route.shortest')}</p>
              <p>
                {(s.lengthM / 1000).toFixed(2)} {t('route.km')} · {Math.round(s.minutes)} {t('route.minutes')} · {metricLabel}{' '}
                {Math.round(s.metricPct)}%
              </p>
              <p className="mt-1 text-slate-500">
                {extraM < 15
                  ? t('route.sameAsShortest')
                  : t('route.tradeoff', {
                      m: Math.round(extraM),
                      min: Math.max(1, Math.round(extraM / 75)),
                      gain: Math.round(b.metricPct - s.metricPct),
                      metric: metricLabel,
                    })}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>{t('route.legendLow')}</span>
            {RAMP[result.metric].map((c) => (
              <span key={c} className="inline-block w-5 h-1.5 rounded" style={{ background: c }} />
            ))}
            <span>{t('route.legendHigh', { metric: metricLabel })}</span>
          </div>
          {nearby.length > 0 && (
            <div className="rounded-xl bg-sky-50 p-3">
              <p className="text-[11px] font-bold text-sky-800">{t('route.nearbyStations')}</p>
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                {nearby.map((n) => (
                  <li key={n.name}>
                    · {n.name}
                    <span className="text-slate-400">（{n.route}）</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {onRateRoute && (
            <button
              type="button"
              onClick={onRateRoute}
              className="w-full py-2 rounded-xl border border-orange-200 text-orange-700 text-xs font-bold hover:bg-orange-50"
            >
              🌡️ {t('route.rateAfterWalk')}
            </button>
          )}
          <p className="text-[9px] text-slate-400 leading-relaxed">{t(`route.note.${result.metric}`, { built: result.builtAt })}</p>
        </div>
      )}
    </div>
  );
}
