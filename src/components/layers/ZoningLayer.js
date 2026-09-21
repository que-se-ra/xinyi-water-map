import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useT } from '@/i18n/LocaleProvider';

export default function ZoningLayer({ showZoning, opacity = 0.45 }) {
  const t = useT();
  const [zoning, setZoning] = useState(null);

  useEffect(() => {
    if (!showZoning || zoning) return;
    fetch('/data/xinyi_zoning.json')
      .then((res) => res.json())
      .then((data) => setZoning(data))
      .catch((err) => console.error('Failed to load zoning:', err));
  }, [showZoning, zoning]);

  if (!showZoning || !zoning) return null;

  return (
    <GeoJSON
      data={zoning}
      style={(feature) => {
        const name = feature.properties.name || '';
        let color = '#bfdbfe'; // Light Blue (Other)
        if (name.includes('住')) color = '#fef08a'; // Yellow (Residential)
        else if (name.includes('商')) color = '#fb923c'; // Orange (Commercial)
        else if (name.includes('工')) color = '#e9d5ff'; // Purple (Industrial)
        else if (name.includes('公園') || name.includes('綠地') || name.includes('保護區')) color = '#4ade80'; // Green (Park)
        else if (name.includes('道') || name.includes('街')) color = '#94a3b8'; // Gray (Road)
        
        return {
          fillColor: color,
          fillOpacity: opacity,
          color: color,
          weight: 1,
          opacity: Math.min(1.0, opacity * 1.33)
        };
      }}
      onEachFeature={(feature, layer) => {
        const p = feature.properties;
        
        // 構建補充說明（判斷條件用的中文關鍵字不可改，會影響比對邏輯）
        let info = '';
        if (p.name.includes('住')) info = t('layers.zoning.info.residential');
        else if (p.name.includes('商')) info = t('layers.zoning.info.commercial');
        else if (p.name.includes('工')) info = t('layers.zoning.info.industrial');
        else if (p.name.includes('公園') || p.name.includes('綠地')) info = t('layers.zoning.info.park');
        else if (p.name.includes('道') || p.name.includes('街')) info = t('layers.zoning.info.road');
        else if (p.name.includes('學')) info = t('layers.zoning.info.school');

        layer.bindTooltip(`<b>${p.name}</b>`, { sticky: true });
        layer.bindPopup(`
          <div class="popup-content min-w-[280px]">
            <div class="popup-badge mb-2" style="background: #fb923c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; display: inline-block;">
              ${p.code || t('layers.zoning.defaultLabel')}
            </div>
            <h3 class="text-lg font-bold text-blue-900 mb-2">${p.name}</h3>
            <div class="space-y-3 text-sm text-slate-700 leading-relaxed">
              <p class="bg-blue-50 p-2 rounded-lg border-l-4 border-blue-200">
                ${info || t('layers.zoning.info.default')}
              </p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-slate-50 p-2 rounded">
                  <span class="text-slate-400 block mb-1">${t('layers.zoning.codeLabel')}</span>
                  <span class="font-mono font-bold">${p.code || 'N/A'}</span>
                </div>
                <div class="bg-slate-50 p-2 rounded">
                  <span class="text-slate-400 block mb-1">${t('layers.zoning.shortLabel')}</span>
                  <span class="font-bold">${p.short || p.name}</span>
                </div>
              </div>
              ${p.full ? `
                <div>
                  <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">${t('layers.zoning.fullDescLabel')}</span>
                  <p class="mt-1">${p.full}</p>
                </div>
              ` : ''}
              ${p.original ? `
                <div class="text-[10px] text-slate-400 italic">
                  ${t('layers.zoning.originalZone', { name: p.original })}
                </div>
              ` : ''}
            </div>
          </div>
        `);
      }}
    />
  );
}
