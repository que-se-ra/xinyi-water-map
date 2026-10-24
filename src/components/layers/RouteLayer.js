import { useState } from 'react';
import { Polyline, CircleMarker, Popup, Tooltip, LayerGroup, FeatureGroup, useMap, useMapEvents } from 'react-leaflet';
import PopupLightbox from './PopupLightbox';
import RouteFeedbackForm, { FACTORS, SCORES } from '../forms/RouteFeedbackForm';
import StationPopupContent from './StationPopupContent';
import RouteArrows from './RouteArrows';
import { useProject } from '@/projects/ProjectProvider';
import { useT } from '@/i18n/LocaleProvider';

function markerRadius(zoom) {
  if (zoom >= 17) return 9;
  if (zoom >= 15) return 7;
  if (zoom >= 13) return 5;
  return 3;
}

// 舒適度平均分（1-5）→ 8 階紅-綠色階，每 0.5 分一階（與圖層面板圖例對應）
// 色階取自 ColorBrewer RdYlGn，由深紅（最差）至深綠（最佳）
export const COMFORT_SCALE = [
  { min: 4.5, color: '#1a9850' }, // 深綠：極佳
  { min: 4.0, color: '#a6d96a' }, // 淺綠：良好
  { min: 3.5, color: '#d9ef8b' }, // 黃綠：偏好
  { min: 3.0, color: '#fee08b' }, // 淺黃：普通
  { min: 2.5, color: '#fdae61' }, // 淺橙：偏差
  { min: 2.0, color: '#f46d43' }, // 橙紅：欠佳
  { min: 1.5, color: '#d73027' }, // 紅：差
  { min: -Infinity, color: '#a50026' }, // 深紅：極差
];

function comfortColor(overall) {
  return COMFORT_SCALE.find(band => overall >= band.min).color;
}

// 評分分布圖：選一個面向，畫 1～5 分各有幾人的直條圖（顏色和舒適度色階一致：1 紅 → 5 綠）
function ScoreDistribution({ dist, count }) {
  const t = useT();
  const [factor, setFactor] = useState('comfort');
  const counts = dist?.[factor] || [0, 0, 0, 0, 0];
  const n = counts.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...counts);
  return (
    <div className="mt-2 pt-2 border-t border-slate-200">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-700">{t('layers.route.distTitle')}</span>
        <span className="text-[10px] text-slate-400">{t('layers.route.statsCount', { n: n || count })}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2" role="tablist">
        {FACTORS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={factor === f.id}
            onClick={(e) => {
              // 不要讓點擊冒泡到地圖，否則 Leaflet 會當成點地圖而關掉 popup
              e.stopPropagation();
              setFactor(f.id);
            }}
            className={`px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
              factor === f.id ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-1.5 h-24" aria-label={t('layers.route.distTitle')}>
        {counts.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="text-[10px] font-mono text-slate-600 mb-0.5">{c}</span>
            <div
              className="w-full rounded-t"
              style={{ height: `${(c / max) * 70}%`, minHeight: c ? 3 : 0, background: comfortColor(i + 1) }}
              title={`${SCORES[i].emoji} ${i + 1}：${c}（${n ? Math.round((c / n) * 100) : 0}%）`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {SCORES.map((sc) => (
          <span key={sc.value} className="flex-1 text-center text-[11px] leading-tight" title={t(sc.labelKey)}>
            {sc.emoji}
            <span className="block text-[9px] text-slate-400">{sc.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// popup 內的路段評分統計區塊（舒適度模式時顯示在表單上方）
function ComfortStatsBlock({ stats }) {
  const t = useT();
  if (!stats || stats.overall == null) {
    return (
      <div className="mb-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
        {t('layers.route.noRatingYet')}
      </div>
    );
  }
  return (
    <div className="mb-3 px-3 py-2.5 rounded-lg border" style={{ background: '#fafaf9', borderColor: comfortColor(stats.overall) + '55' }}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-700">{t('layers.route.statsTitle')}</span>
        <span className="text-[10px] text-slate-400">{t('layers.route.statsCount', { n: stats.count })}</span>
      </div>
      <div className="space-y-1">
        {FACTORS.map(f => {
          const v = stats.avg[f.id];
          if (v == null) return null;
          return (
            <div key={f.id} className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="w-16 flex-shrink-0">{t(f.labelKey)}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(v / 5) * 100}%`, background: comfortColor(v) }} />
              </div>
              <span className="w-7 text-right font-mono font-bold" style={{ color: comfortColor(v) }}>{v.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex justify-between text-[11px]">
        <span className="text-slate-500">{t('layers.route.overallAverage')}</span>
        <span className="font-bold font-mono" style={{ color: comfortColor(stats.overall) }}>{stats.overall.toFixed(1)} / 5.0</span>
      </div>
      {stats.dist && <ScoreDistribution dist={stats.dist} count={stats.count} />}
    </div>
  );
}

// 評分單位的編號：①②③…（照 ratingUnits 的順序）
const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

// ratingUnit：這個站本身是一個「點」評分單位時傳入，popup 裡會多一份評分表
function ZoomAwareMarker({ station, route, ratingUnit = null, unitNo = null, comfortData = null }) {
  const map = useMap();
  const [radius, setRadius] = useState(() => markerRadius(map.getZoom()));

  useMapEvents({
    zoomend: () => setRadius(markerRadius(map.getZoom())),
  });

  const comfortMode = ratingUnit && comfortData != null;
  const unitStats = comfortMode ? comfortData[ratingUnit.id] : undefined;

  return (
    <CircleMarker
      center={[station.lat, station.lng]}
      radius={ratingUnit ? radius + 2 : radius}
      pathOptions={{
        // 評分點用路線的深色外圈標出來（路線一藍、路線二橘）；舒適度檢視時依平均分上色
        color: ratingUnit ? (comfortMode && unitStats?.overall != null ? comfortColor(unitStats.overall) : route.colorDark || route.color) : 'rgba(255,255,255,0.55)',
        weight: ratingUnit ? 3 : 1.5,
        fillColor: route.color,
        fillOpacity: 1,
      }}
    >
      {ratingUnit && (
        <Tooltip permanent direction="right" offset={[radius + 4, 0]} className="rating-unit-label">
          <span className="rating-unit-badge" style={{ background: route.colorDark || route.color }}>{CIRCLED[unitNo - 1] || unitNo}</span>
        </Tooltip>
      )}
      <Popup maxWidth={420} minWidth={340} className="custom-popup">
        <PopupLightbox />
        {/* 舒適度檢視時，評分統計與分布圖放在最上面，一打開就看得到 */}
        {comfortMode && (
          <div className="mb-3">
            <p className="text-sm font-bold text-slate-800 mb-1.5">
              {CIRCLED[unitNo - 1] || unitNo} {station.name}
            </p>
            <ComfortStatsBlock stats={unitStats} />
          </div>
        )}
        <StationPopupContent station={station} routeColor={route.color} />
        {ratingUnit && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <RouteFeedbackForm
              routeId={route.id}
              routeName={route.name}
              routeNameZh={route.nameZh}
              segmentId={ratingUnit.id}
              unitLabel={`${CIRCLED[unitNo - 1] || unitNo} ${station.name}`}
            />
          </div>
        )}
      </Popup>
    </CircleMarker>
  );
}

// 單一路段：可見線 + 隱形點擊區 + 回饋 popup
// comfortData 為 null 時是一般模式；為物件時進入舒適度檢視（依平均分上色，無資料顯示灰虛線）
// unitLabel / unitNo：這段是「線」評分單位時傳入（加粗、常駐編號、表單標題顯示名稱）
function RouteSegment({ route, positions, segmentId, comfortData, unitLabel = null, unitNo = null }) {
  const comfortMode = comfortData != null;
  const segStats = comfortMode ? comfortData[segmentId] : undefined;

  // dashArray 必須在所有分支明確指定：Leaflet setStyle 是合併式更新，
  // 缺少該 key 時不會清除先前設定的虛線樣式
  const visibleOptions = comfortMode
    ? (segStats?.overall != null
        ? { color: comfortColor(segStats.overall), weight: 5, opacity: 0.9, dashArray: null }
        : { color: '#94a3b8', weight: 4, opacity: 0.65, dashArray: '6 8' })
    : { color: route.color, weight: unitLabel ? 7 : 4, opacity: unitLabel ? 0.95 : 0.75, dashArray: null };

  // 編號標在路段中間：兩點的線取中點，多點的線取中間那個點
  const midPt = positions.length === 2
    ? [(positions[0][0] + positions[1][0]) / 2, (positions[0][1] + positions[1][1]) / 2]
    : positions[Math.floor(positions.length / 2)];

  return (
    <FeatureGroup>
      {/* 評分路段：底下多一條同路線顏色的淡色寬邊，和一般路段區分 */}
      {unitLabel && !comfortMode && (
        <Polyline positions={positions} pathOptions={{ color: route.color, weight: 14, opacity: 0.3, interactive: false }} />
      )}
      <Polyline
        positions={positions}
        pathOptions={{ ...visibleOptions, interactive: false }}
      />
      {unitLabel && (
        <CircleMarker center={midPt} radius={0} pathOptions={{ opacity: 0, fillOpacity: 0, interactive: false }}>
          <Tooltip permanent direction="top" offset={[0, -6]} className="rating-unit-label">
            <span className="rating-unit-badge" style={{ background: route.colorDark || route.color }}>{CIRCLED[unitNo - 1] || unitNo}</span>
          </Tooltip>
        </CircleMarker>
      )}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#000000',
          weight: 20,
          opacity: 0.001,
          interactive: true
        }}
      >
        <Popup className="feedback-popup" minWidth={300} maxWidth={400}>
          {/* 評分路段在舒適度檢視時，名稱放最上面，和評分點的視窗一致 */}
          {comfortMode && unitLabel && <p className="text-sm font-bold text-slate-800 mb-1.5">{unitLabel}</p>}
          {comfortMode && <ComfortStatsBlock stats={segStats} />}
          <RouteFeedbackForm
            routeId={route.id}
            routeName={route.name || `路線 ${route.id}`}
            routeNameZh={route.nameZh || `路線 ${route.id}`}
            segmentId={segmentId}
            unitLabel={unitLabel}
          />
        </Popup>
      </Polyline>
    </FeatureGroup>
  );
}

export default function RouteLayer({ route, polylines, comfortData = null }) {
  const project = useProject();
  // 已畫出的折線清單（單一折線與多段兩種格式都統一成「折線陣列」）
  const lines = Array.isArray(polylines[0]) && Array.isArray(polylines[0][0]) ? polylines : [polylines];

  // 有 ratingUnits 的路線（例如松菸）：評分改以指定的點與路段為單位，一般路段只畫線、不給評分
  const units = route.ratingUnits || null;
  if (units) {
    const pointUnits = Object.fromEntries(
      units.map((u, i) => [u, i + 1]).filter(([u]) => u.kind === 'point').map(([u, no]) => [u.station, { unit: u, no }])
    );
    const stationName = (sid) => route.stations.find((st) => st.id === sid)?.name || sid;
    // 轉角節點：各路段 waypoints 的位置
    const corners = (route.segments || []).flatMap((sg) => (sg.waypoints || []).map((w) => [w.lat, w.lng]));
    return (
      <LayerGroup>
        {lines.map((pts, si) => (
          <Polyline
            key={`${route.id}-line-${si}`}
            positions={pts}
            pathOptions={{ color: route.color, weight: 4, opacity: comfortData != null ? 0.35 : 0.75, interactive: false }}
          />
        ))}
        {units.map((u, i) =>
          u.kind === 'line' ? (
            <RouteSegment
              key={`${route.id}-${u.id}`}
              route={route}
              positions={u.path}
              segmentId={u.id}
              comfortData={comfortData}
              unitLabel={`${CIRCLED[i] || i + 1} ${stationName(u.station)}`}
              unitNo={i + 1}
            />
          ) : null
        )}
        {project.ui?.routeArrows && <RouteArrows route={route} lines={lines} />}
        {corners.map((c, i) => (
          <CircleMarker
            key={`${route.id}-corner-${i}`}
            center={c}
            radius={3.5}
            pathOptions={{ color: route.color, weight: 2, fillColor: '#ffffff', fillOpacity: 1, interactive: false }}
          />
        ))}
        {route.stations.map((station) => (
          <ZoomAwareMarker
            key={`${route.id}-${station.id}`}
            station={station}
            route={route}
            ratingUnit={pointUnits[station.id]?.unit || null}
            unitNo={pointUnits[station.id]?.no || null}
            comfortData={comfortData}
          />
        ))}
      </LayerGroup>
    );
  }

  return (
    <LayerGroup>
      {/* Polylines */}
      {Array.isArray(polylines[0])
        ? Array.isArray(polylines[0][0])
          ? polylines.map((seg, si) => (
            <RouteSegment
              key={`${route.id}-seg-${si}`}
              route={route}
              positions={seg}
              segmentId={`seg_${si + 1}`}
              comfortData={comfortData}
            />
          ))
          : (
            <RouteSegment
              route={route}
              positions={polylines}
              segmentId="seg_1"
              comfortData={comfortData}
            />
          )
        : null}

      {/* 方向箭頭：專案選用（ui.routeArrows） */}
      {project.ui?.routeArrows && <RouteArrows route={route} lines={lines} />}

      {/* Station markers — zoom-aware size, soft earth-tone border */}
      {route.stations.map((station) => (
        <ZoomAwareMarker
          key={`${route.id}-${station.id}`}
          station={station}
          route={route}
        />
      ))}
    </LayerGroup>
  );
}
