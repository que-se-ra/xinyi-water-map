import { TileLayer } from 'react-leaflet';
import { useT } from '@/i18n/LocaleProvider';

// ── Historical basemap definitions ─────────────────────────
// label 欄位原本硬寫中文，且已確認全庫只有本檔的 HistoricalControl 讀取它做顯示
// （MapView.js 只用到 .id），故改由 HistoricalControl 依 id 向字典查字串，
// 這裡拿掉硬寫的 label 值。
export const HISTORICAL_MAPS = [
  {
    id: 'jm1904',
    emoji: '🗺️',
    url: 'https://gis.sinica.edu.tw/tileserver/file-exists.php?img=JM20K_1904-jpg-{z}-{x}-{y}',
    color: '#a16207',
  },
  {
    id: 'jm1921',
    emoji: '🗺️',
    url: 'https://gis.sinica.edu.tw/tileserver/file-exists.php?img=JM25K_1921-jpg-{z}-{x}-{y}',
    color: '#15803d',
  },
  {
    id: 'liugong1939',
    emoji: '🗺️',
    url: 'https://gis.sinica.edu.tw/taipei/file-exists.php?img=liugong_1939-jpg-{z}-{x}-{y}',
    color: '#0284c7', // light blue
  },
  {
    id: 'am1944',
    emoji: '🗺️',
    url: 'https://gis.sinica.edu.tw/tileserver/file-exists.php?img=AM25K_1944A-png-{z}-{x}-{y}',
    color: '#ea580c',
  },
  {
    id: 'tm1989',
    emoji: '🗺️',
    url: 'https://gis.sinica.edu.tw/tileserver/file-exists.php?img=TM25K_1989-jpg-{z}-{x}-{y}',
    color: '#7c3aed',
  },
];

/**
 * Renders the selected historical raster tile layer.
 * Placed inside MapContainer *after* the base CartoDB tile but *before*
 * all data layers (routes, trees, zoning) so it acts as a historical basemap.
 *
 * @param {{ activeId: string|null, opacity: number }} props
 *   activeId — the id of the chosen historical map, or null for none.
 *   opacity — the opacity of the historical map (0 to 1).
 */
export default function HistoricalLayer({ activeId, opacity }) {
  const t = useT();
  const map = HISTORICAL_MAPS.find((m) => m.id === activeId);
  if (!map) return null;

  return (
    <TileLayer
      key={map.id}          // key forces remount when switching maps
      url={map.url}
      tileSize={256}
      opacity={opacity}
      attribution={t('layers.historical.attribution')}
    />
  );
}

/**
 * Renders the UI control panel section for historical maps.
 * Intended to be placed in the control panel outside the MapContainer.
 */
import InfoTooltip from './info-tooltip/InfoTooltip';

export function HistoricalControl({ activeHistory, toggleHistory, historyOpacities, onOpacityChange }) {
  const t = useT();
  return (
    <div id="tour-historical-control" className="space-y-1 mb-4 pt-3 border-t border-slate-200">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
        {t('layers.historical.panelTitle')}
      </p>
      {HISTORICAL_MAPS.map((hm) => (
        <div key={hm.id} className="flex flex-col mb-1">
          <div className="flex items-center justify-between gap-2 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors w-full">
            <label
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <input
                type="checkbox"
                checked={activeHistory === hm.id}
                onChange={() => toggleHistory(hm.id)}
                className="w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: hm.color }}
              />
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/50"
                style={{ background: hm.color }}
              />
              <span className="text-sm leading-tight text-slate-700">{t(`layers.historical.${hm.id}.label`)}</span>
            </label>
            <InfoTooltip id={hm.id} />
          </div>
          
          {/* Opacity Slider - Visible when active or with reduced height when inactive */}
          <div className={`
            flex items-center gap-2 px-10 transition-all duration-300 ease-in-out
            ${activeHistory === hm.id ? 'h-6 opacity-100 mt-0.5' : 'h-0 opacity-0 overflow-hidden'}
          `}>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={historyOpacities[hm.id] || 0.7} 
              onChange={(e) => onOpacityChange(hm.id, parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] font-mono font-bold text-slate-500 w-8 text-right">
              {Math.round((historyOpacities[hm.id] || 0.7) * 100)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

