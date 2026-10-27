'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { basemapProps } from '@/lib/basemap';
import { useT, useLocale, useLocalePath } from '@/i18n/LocaleProvider';
import { useProject } from '@/projects/ProjectProvider';
import { surveyTagFor, withSurveyTag } from '@/lib/survey-tags';
import { surveyFormFor, hasOwnSurveyForm } from '@/lib/survey-forms';

// ── Google Form 對接設定 ──
// 表單網址、entry ID、第一題選項依專案查 lib/survey-forms.js；
// 提交經由自家 API 代交（/api/survey-submit），可讀取 Google 真實回應確認已記錄。
const SUBMIT_API = '/api/survey-submit';

// 只在地圖上點了位置、沒寫文字時的地點答案（送進表單的資料，一律中文）
const PINNED_ONLY_TEXT = '地圖標記位置';

// ── 問卷地圖設定 ──────────────────────────────────────────
// 預設是信水義河（信義區）；其他專案可在專案設定的 survey 欄位覆寫
// （中心、縮放、地標、搜尋範圍、地點題作答方式 pickMode）。見 projects/songshan/index.js。
//   pickMode 'navigate'（預設）：地標按鈕與搜尋只移動地圖，點地圖才算作答——適合範圍大的信義區
//   pickMode 'choose'：地標就是選項，點了直接作答；不顯示搜尋欄——適合園區這種小範圍

// 信義區中心
const XINYI_CENTER = [25.033, 121.565];

// 地標快速跳轉（六張犁/永春座標取自 projects/xinyi/routeData.js 站點實測值）
const LANDMARKS = [
  { id: 'taipei101', lat: 25.0339, lng: 121.5645 },
  { id: 'cityHall', lat: 25.041, lng: 121.5652 },
  { id: 'xiangshan', lat: 25.0329, lng: 121.57 },
  { id: 'yongchun', lat: 25.04087, lng: 121.5758 },
  { id: 'houshanpi', lat: 25.0447, lng: 121.5824 },
  { id: 'liuzhangli', lat: 25.0241, lng: 121.553 },
  { id: 'wuxingSt', lat: 25.0277, lng: 121.5583 },
];

// 信義區大致範圍（viewbox：minLon,maxLat,maxLon,minLat），供搜尋優先命中區內結果
const XINYI_VIEWBOX = '121.539,25.050,121.601,25.015';

const DEFAULT_SURVEY_MAP = { center: XINYI_CENTER, zoom: 15, landmarks: LANDMARKS, viewbox: XINYI_VIEWBOX, pickMode: 'navigate' };

/** 目前專案的問卷地圖設定（沒有設定的欄位沿用信義預設） */
function useSurveyMap() {
  const project = useProject();
  return { ...DEFAULT_SURVEY_MAP, ...(project.survey || {}) };
}

// Nominatim 地點搜尋：先限定專案範圍（預設信義區），找不到再放寬至全台北重試
// （教訓：過度限縮的篩選會令正確結果全消失，必須有 fallback）
async function searchXinyiPlace(q, lang = 'zh-TW', viewbox = XINYI_VIEWBOX) {
  const base = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=${lang}`;
  let res = await fetch(`${base}&viewbox=${viewbox}&bounded=1&q=${encodeURIComponent(q)}`);
  let arr = res.ok ? await res.json() : [];
  if (!arr.length) {
    // 放寬重試時補上行政區。英文介面用英文地名，否則 OSM 對不上使用者輸入的英文查詢。
    const suffix = lang.startsWith('en') ? ' Xinyi District Taipei' : ' 信義區 臺北市';
    res = await fetch(`${base}&q=${encodeURIComponent(q + suffix)}`);
    arr = res.ok ? await res.json() : [];
  }
  return arr[0] || null;
}

// 由外部觸發地圖飛行（target 每次點擊都是新物件，effect 才會重跑）
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.setView([target.lat, target.lng], target.zoom ?? 16, { animate: false });
    }
  }, [target, map]);
  return null;
}

// ── 地圖點選器 ──

function makePinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:30px;height:40px;">
      <svg viewBox="0 0 30 40" width="30" height="40" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.35));">
        <path d="M15 0C7 0 1 6.3 1 14c0 10.2 12.2 24.6 13.4 25.4a1 1 0 0 0 1.2 0C16.8 38.6 29 24.2 29 14 29 6.3 23 0 15 0z" fill="${color}"/>
        <circle cx="15" cy="14" r="5.5" fill="white"/>
      </svg>
    </div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });
}

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

// Nominatim 反查地名（zh-TW，街道層級）
async function reverseGeocode(lat, lng, lang = 'zh-TW') {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&accept-language=${lang}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = await res.json();
  const a = data.address || {};
  const parts = [a.road, a.neighbourhood || a.suburb || a.quarter].filter(Boolean);
  if (parts.length) return parts.join('，');
  // 沒有街名時退而求其次：截取 display_name 前兩段
  if (data.display_name) return data.display_name.split(',').slice(0, 2).join('').trim();
  return '';
}

/**
 * 一條「地點題」：小地圖點選 + 可編輯文字欄。
 * 提交值 = 文字 +（若有點選）座標尾註，例如「松高路（25.03981, 121.56712）」。
 * 作答方式依專案的 pickMode：'navigate' 地標只移動地圖；'choose' 地標就是選項（見上方 DEFAULT_SURVEY_MAP 說明）。
 */
function LocationQuestion({ label, hint, color, value, onChange, coord, onCoordChange }) {
  const t = useT();
  const surveyMap = useSurveyMap();
  const choose = surveyMap.pickMode === 'choose';
  const { locale } = useLocale();
  // Nominatim 的 accept-language：英文介面回英文地名，使用者才對得上自己看到的地圖
  const geoLang = locale === 'en' ? 'en' : 'zh-TW';
  const [geocoding, setGeocoding] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMiss, setSearchMiss] = useState(false);

  const landmarkName = (lm) => t(`survey.landmark.${lm.id}`);
  // 選項模式下，目前答案是哪個地標（圖釘在地標上、文字也還是地標名稱）
  const chosen = choose
    ? surveyMap.landmarks.find((lm) => coord && coord.lat === lm.lat && coord.lng === lm.lng && value === landmarkName(lm))
    : null;

  const chooseLandmark = (lm) => {
    onChange(landmarkName(lm));
    onCoordChange({ lat: lm.lat, lng: lm.lng });
    setFlyTarget({ lat: lm.lat, lng: lm.lng, zoom: surveyMap.zoom });
  };

  const handleSearch = useCallback(async () => {
    const q = searchText.trim();
    if (!q || searching) return;
    setSearching(true);
    setSearchMiss(false);
    try {
      const hit = await searchXinyiPlace(q, geoLang, surveyMap.viewbox);
      if (hit) {
        setFlyTarget({ lat: +hit.lat, lng: +hit.lon, zoom: 16, nonce: Date.now() });
      } else {
        setSearchMiss(true);
      }
    } catch (err) {
      console.warn('地點搜尋失敗:', err);
      setSearchMiss(true);
    } finally {
      setSearching(false);
    }
  }, [searchText, searching, geoLang, surveyMap.viewbox]);

  const handlePick = async (latlng) => {
    const lat = +latlng.lat.toFixed(5);
    const lng = +latlng.lng.toFixed(5);
    onCoordChange({ lat, lng });
    if (choose) {
      // 園區內反查只會得到外圍道路名，沒有幫助；改請填答者自己描述。
      // 原本選的是地標的話清掉名稱，避免圖釘移走了答案還寫著那個地標。
      if (surveyMap.landmarks.some((lm) => value === landmarkName(lm))) onChange('');
      return;
    }
    setGeocoding(true);
    try {
      const name = await reverseGeocode(lat, lng, geoLang);
      if (name) onChange(name);
    } catch (err) {
      console.warn('反查地名失敗（座標仍已記錄）:', err);
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <label className="block text-slate-800 font-semibold mb-1 leading-relaxed">
        {label} <span className="text-rose-500">*</span>
      </label>
      {hint && <p className="text-slate-400 text-xs mb-3 leading-relaxed">{hint}</p>}

      {choose ? (
        /* 選項模式：地標就是答案，點了圖釘和答案欄立刻出現 */
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">{t('survey.location.chooseStep')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={label}>
            {surveyMap.landmarks.map((lm) => {
              const on = chosen?.id === lm.id;
              return (
                <button
                  key={lm.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => chooseLandmark(lm)}
                  className={`px-3 py-2.5 rounded-xl text-sm text-left border transition-all cursor-pointer active:scale-95 ${
                    on ? 'text-white font-semibold shadow-md' : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-sky-50 hover:border-sky-200'
                  }`}
                  style={on ? { background: color, borderColor: color } : undefined}
                >
                  {on ? '✓ ' : '📍 '}
                  {landmarkName(lm)}
                </button>
              );
            })}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-3">{t('survey.location.chooseOr')}</p>
        </div>
      ) : (
        /* 步驟①：移動地圖（僅導航，非作答）。用框線和標題與作答區隔開，避免誤會按了地標就算答完 */
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 mb-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">
            {t('survey.location.step1')}<span className="text-slate-400 font-normal">{t('survey.location.step1Note')}</span>
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {surveyMap.landmarks.map((lm) => (
              <button
                key={lm.id}
                type="button"
                onClick={() => setFlyTarget({ lat: lm.lat, lng: lm.lng, zoom: 16, nonce: Date.now() })}
                className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs text-slate-600 bg-white border border-sky-200 hover:bg-sky-100 active:scale-95 transition-all cursor-pointer"
              >
                🧭 {landmarkName(lm)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setSearchMiss(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
              placeholder={t('survey.location.searchPlaceholder')}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-sky-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-slate-300"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 rounded-xl text-sm text-white bg-sky-500 hover:bg-sky-400 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {searching ? t('survey.location.searching') : t('survey.location.searchBtn')}
            </button>
          </div>
          {searchMiss && (
            <p className="text-xs text-rose-500 mt-2">{t('survey.location.searchMiss')}</p>
          )}
        </div>
      )}

      {/* 步驟②：真正作答（選項模式下是「不在清單上就點地圖」） */}
      {!choose && (
        <p className="text-xs font-semibold text-amber-700 mb-1.5">
          {t('survey.location.step2Before')}<span className="underline decoration-amber-400 decoration-2 underline-offset-2">{t('survey.location.step2Highlight')}</span>{t('survey.location.step2After')}
        </p>
      )}
      <div className="rounded-xl overflow-hidden border border-sky-100 relative" style={{ height: '230px' }}>
        <MapContainer
          center={surveyMap.center}
          zoom={surveyMap.zoom}
          scrollWheelZoom={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <FlyTo target={flyTarget} />
          {/* 與主地圖一致：國土測繪中心灰階底圖＋水文色調 filter */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            className="map-tiles-tinted"
          />
          <ClickCapture onPick={handlePick} />
          {coord && <Marker position={[coord.lat, coord.lng]} icon={makePinIcon(color)} />}
        </MapContainer>
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white/85 backdrop-blur-sm text-[11px] text-slate-500 px-3 py-1.5 flex items-center justify-between pointer-events-none">
          <span>{choose ? t('survey.location.mapHintChoose') : t('survey.location.mapHint')}</span>
          {coord && (
            <span className="font-mono text-slate-400">
              {coord.lat}, {coord.lng}
            </span>
          )}
        </div>
      </div>

      {/* 答案欄：選了地標或點了地圖，這裡就會出現答案，可以再修改或補充 */}
      {choose && <p className="mt-3 text-xs font-semibold text-slate-500">{t('survey.location.answerLabel')}</p>}
      <div className={`${choose ? 'mt-1.5' : 'mt-3'} flex items-center gap-2`}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          placeholder={
            geocoding
              ? t('survey.location.inputGeocoding')
              : choose
                ? coord
                  ? t('survey.location.describePlaceholder')
                  : t('survey.location.choosePlaceholder')
                : t('survey.location.inputPlaceholder')
          }
          className={`flex-1 px-4 py-2.5 rounded-xl border text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 placeholder:text-slate-300 ${
            choose && (value || coord) ? 'border-slate-300 bg-white font-medium' : 'border-sky-200 bg-sky-50/40'
          }`}
        />
        {coord && (
          <button
            type="button"
            onClick={() => {
              onCoordChange(null);
              if (chosen) onChange('');
            }}
            className="px-3 py-2.5 rounded-xl text-xs text-slate-400 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer flex-shrink-0"
            title={t('survey.location.clearTitle')}
          >
            {t('survey.location.clearBtn')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── 主表單 ──

export default function ThermalSurveyForm() {
  const t = useT();
  const lp = useLocalePath();
  const project = useProject();
  // 專案有自己的 Google 表單就送到那份；沒有的話共用信水義河的表單，
  // 並在地點答案前加上【標註】，後台才分得出是哪個專案（見 lib/survey-forms.js、lib/survey-tags.js）
  const form = surveyFormFor(project.id);
  const ENTRY = form.entries;
  const surveyTag = hasOwnSurveyForm(project.id) ? null : surveyTagFor(project.id);
  // 專案自訂的「與這裡的關係」選項；若專案有設定 relations 則完全取代預設選項，否則沿用預設＋extraRelations
  const customRelations = project.survey?.relations;
  const extraRelations = project.survey?.extraRelations || [];
  const [relation, setRelation] = useState('');
  const [relationOther, setRelationOther] = useState('');
  const [comfort, setComfort] = useState('');
  const [hotPlace, setHotPlace] = useState('');
  const [hotCoord, setHotCoord] = useState(null);
  const [hotWhy, setHotWhy] = useState('');
  const [coolPlace, setCoolPlace] = useState('');
  const [coolCoord, setCoolCoord] = useState(null);
  const [coolWhy, setCoolWhy] = useState('');
  const [improvePlace, setImprovePlace] = useState('');
  const [improveCoord, setImproveCoord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState([]);

  const withCoord = (text, coord) => {
    const place = text.trim() || PINNED_ONLY_TEXT;
    return withSurveyTag(coord ? `${place}（${coord.lat}, ${coord.lng}）` : place, surveyTag);
  };
  // 地點題：有文字或有地圖標記都算作答
  const placeAnswered = (text, coord) => Boolean(text.trim() || coord);

  const validate = () => {
    const errs = [];
    if (!relation) errs.push(t('survey.error.relationRequired'));
    if (relation === '__other__' && !relationOther.trim()) errs.push(t('survey.error.otherRequired'));
    if (!comfort) errs.push(t('survey.error.comfortRequired'));
    if (!placeAnswered(hotPlace, hotCoord)) errs.push(t('survey.error.hotPlaceRequired'));
    if (!hotWhy.trim()) errs.push(t('survey.error.hotWhyRequired'));
    if (!placeAnswered(coolPlace, coolCoord)) errs.push(t('survey.error.coolPlaceRequired'));
    if (!coolWhy.trim()) errs.push(t('survey.error.coolWhyRequired'));
    if (!placeAnswered(improvePlace, improveCoord)) errs.push(t('survey.error.improvePlaceRequired'));
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const answers = {
      [ENTRY.comfort]: comfort,
      [ENTRY.hotPlace]: withCoord(hotPlace, hotCoord),
      [ENTRY.hotWhy]: hotWhy.trim(),
      [ENTRY.coolPlace]: withCoord(coolPlace, coolCoord),
      [ENTRY.coolWhy]: coolWhy.trim(),
      [ENTRY.improvePlace]: withCoord(improvePlace, improveCoord),
    };
    const relationOtherKey = `${ENTRY.relation}.other_option_response`;
    if (relation === '__other__') {
      answers[ENTRY.relation] = '__other_option__';
      answers[relationOtherKey] = relationOther.trim();
    } else if (relation.startsWith('extra:')) {
      // 專案額外選項：表單上沒有這個選項，以「其他」＋選項文字送出
      answers[ENTRY.relation] = '__other_option__';
      answers[relationOtherKey] = relation.slice('extra:'.length);
    } else if (form.relationValues.includes(relation)) {
      answers[ENTRY.relation] = relation;
    } else {
      // 專案自訂選項不在 Google 表單的選項裡時，以「其他」＋選項文字送出
      answers[ENTRY.relation] = '__other_option__';
      answers[relationOtherKey] = relation;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${SUBMIT_API}?project=${encodeURIComponent(project.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.ok) {
        setSubmitted(true);
      } else {
        console.error('問卷送出失敗:', res.status, result);
        setErrors([t('survey.error.submitFailed')]);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('問卷送出失敗:', err);
      setErrors([t('survey.error.networkFailed')]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4">
        <span className="text-5xl">💧</span>
        <h3 className="text-2xl text-slate-700 font-bold tracking-wider" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('survey.success.title')}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed max-w-md">
          {t('survey.success.body')}
        </p>
        <Link
          href={lp('/')}
          className="mt-2 px-8 py-3 rounded-2xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-all duration-300 shadow-lg shadow-sky-300/40 active:scale-95 tracking-widest"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {t('survey.success.backLink')}
        </Link>
      </div>
    );
  }

  const relationLabels = [
    t('survey.q1.live'),
    t('survey.q1.work'),
    t('survey.q1.study'),
    t('survey.q1.passBy'),
    t('survey.q1.research'),
  ];
  const relationOptions = customRelations
    ? customRelations.map((r) => [r.value, t(r.labelKey) || r.label || r.value])
    : [
        ...surveyFormFor('default').relationValues.map((opt, i) => [opt, relationLabels[i]]),
        ...extraRelations.map((ex) => [`extra:${ex.value}`, t(ex.labelKey)]),
      ];
  const scaleLabels = { 1: t('survey.scale.hot'), 5: t('survey.scale.cool') };

  return (
    <div className="space-y-5">
      {errors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-600">
          <p className="font-semibold mb-1">{t('survey.error.summary')}</p>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Q1 關係 */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-slate-800 font-semibold mb-3 leading-relaxed">
          {t('survey.q1.label')}<span className="text-rose-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {relationOptions.map(([opt, label]) => (
            <button
              key={opt}
              type="button"
              onClick={() => setRelation(opt)}
              className={`px-4 py-2 rounded-xl text-sm border transition-all cursor-pointer ${
                relation === opt
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-300/40'
                  : 'bg-sky-50/60 text-slate-600 border-sky-200 hover:bg-sky-100'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRelation('__other__')}
            className={`px-4 py-2 rounded-xl text-sm border transition-all cursor-pointer ${
              relation === '__other__'
                ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-300/40'
                : 'bg-sky-50/60 text-slate-600 border-sky-200 hover:bg-sky-100'
            }`}
          >
            {t('survey.q1.otherBtn')}
          </button>
        </div>
        {relation === '__other__' && (
          <input
            type="text"
            value={relationOther}
            onChange={(e) => setRelationOther(e.target.value)}
            placeholder={t('survey.q1.otherPlaceholder')}
            className="mt-3 w-full px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50/40 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder:text-slate-300"
          />
        )}
      </div>

      {/* Q2 量表 */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-slate-800 font-semibold mb-3 leading-relaxed">
          {t('survey.q2.label')}<span className="text-rose-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm md:text-base font-semibold text-rose-600 bg-rose-50 border border-rose-200">
            {t('survey.scale.hotBadge')}{scaleLabels[1]}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm md:text-base font-semibold text-sky-700 bg-sky-50 border border-sky-200 sm:justify-end">
            {t('survey.scale.coolBadge')}{scaleLabels[5]}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {['1', '2', '3', '4', '5'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setComfort(v)}
              className={`flex-1 py-3 rounded-xl text-base font-semibold border transition-all cursor-pointer ${
                comfort === v
                  ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-white border-orange-400 shadow-md shadow-orange-200'
                  : 'bg-sky-50/60 text-slate-500 border-sky-200 hover:bg-sky-100'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div
          className="mt-2 h-1.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #f43f5e 0%, #f59e0b 50%, #0ea5e9 100%)' }}
          aria-hidden="true"
        />
        <div className="flex justify-between mt-1 text-xs md:text-sm text-slate-500 font-medium">
          <span>{t('survey.scale.moreHot')}</span>
          <span>{t('survey.scale.moreCool')}</span>
        </div>
      </div>

      {/* Q3 最熱地點（地圖） */}
      <LocationQuestion
        label={t('survey.q3.label')}
        hint={t('survey.q3.hint')}
        color="#ef4444"
        value={hotPlace}
        onChange={setHotPlace}
        coord={hotCoord}
        onCoordChange={setHotCoord}
      />

      {/* Q4 原因 */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-slate-800 font-semibold mb-1 leading-relaxed">
          {t('survey.q4.label')}<span className="text-rose-500">*</span>
        </label>
        <p className="text-slate-400 text-xs mb-3">{t('survey.q4.example')}</p>
        <input
          type="text"
          value={hotWhy}
          onChange={(e) => setHotWhy(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50/40 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      {/* Q5 最涼爽地點（地圖） */}
      <LocationQuestion
        label={t('survey.q5.label')}
        hint={t('survey.location.hintGeneric')}
        color="#0ea5e9"
        value={coolPlace}
        onChange={setCoolPlace}
        coord={coolCoord}
        onCoordChange={setCoolCoord}
      />

      {/* Q6 原因 */}
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-slate-800 font-semibold mb-1 leading-relaxed">
          {t('survey.q6.label')}<span className="text-rose-500">*</span>
        </label>
        <p className="text-slate-400 text-xs mb-3">{t('survey.q6.example')}</p>
        <textarea
          value={coolWhy}
          onChange={(e) => setCoolWhy(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-sky-200 bg-sky-50/40 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 resize-y"
        />
      </div>

      {/* Q7 優先改善（地圖） */}
      <LocationQuestion
        label={t('survey.q7.label')}
        hint={t('survey.location.hintGeneric')}
        color="#10b981"
        value={improvePlace}
        onChange={setImprovePlace}
        coord={improveCoord}
        onCoordChange={setImproveCoord}
      />

      {/* 送出 */}
      <div className="pt-2 pb-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full md:w-auto px-14 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all duration-300 cursor-pointer shadow-lg shadow-orange-200 active:scale-95 tracking-widest disabled:opacity-50 disabled:cursor-wait"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {submitting ? t('survey.submit.sending') : t('survey.submit.button')}
        </button>
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          {t('survey.footer.note')}
          <a href={form.fallbackUrl} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-400 underline">
            {t('survey.footer.linkText')}
          </a>
          。
        </p>
      </div>
    </div>
  );
}
