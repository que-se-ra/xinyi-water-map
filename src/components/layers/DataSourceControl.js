import { useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';

export default function DataSourceControl() {
  const t = useT();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="absolute bottom-[68px] left-4 z-[1000] flex flex-col items-start"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* 展開的氣泡內容 */}
      <div 
        className={`
          bg-white/95 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-xl overflow-hidden
          transition-all duration-300 ease-out origin-bottom-left
          ${isExpanded ? 'max-h-96 opacity-100 scale-100 mb-2' : 'max-h-0 opacity-0 scale-95 mb-0'}
        `}
      >
        <div className="p-4 text-xs text-slate-600 space-y-3 font-medium min-w-[260px] max-w-[320px]">
          <p className="font-bold text-slate-800 border-b border-slate-200/80 pb-2 mb-2 text-sm">
            {t('layers.dataSource.title')}
          </p>

          <div>
            <p className="font-bold text-slate-700 mb-1">{t('layers.dataSource.originHeading')}</p>
            <p className="pl-4 text-slate-500 leading-relaxed">{t('layers.dataSource.originText')}</p>
          </div>

          <div>
            <p className="font-bold text-slate-700 mb-1">{t('layers.dataSource.mapHeading')}</p>
            <ul className="pl-4 text-slate-500 list-disc list-inside leading-relaxed">
              <li>{t('layers.dataSource.osmContributors')}</li>
              <li>{t('layers.dataSource.carto')}</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-slate-700 mb-1">{t('layers.dataSource.historicalHeading')}</p>
            <p className="pl-4 text-slate-500 leading-relaxed">{t('layers.dataSource.historicalText')}</p>
          </div>

          <div>
            <p className="font-bold text-slate-700 mb-1">{t('layers.dataSource.openDataHeading')}</p>
            <ul className="pl-4 text-slate-500 list-disc list-inside leading-relaxed">
              <li>{t('layers.dataSource.openDataGov')}</li>
              <li>{t('layers.dataSource.temperatureData')}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 預設顯示的小按鈕 */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-md rounded-full px-3.5 py-1.5 text-[11px] font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-1.5">
        <span>{t('layers.dataSource.buttonLabel')}</span>
        <span className="text-sm">ℹ️</span>
      </div>
    </div>
  );
}
