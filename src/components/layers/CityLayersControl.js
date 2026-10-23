import { useT } from '@/i18n/LocaleProvider';
import { WATERLOG_DEPTHS, WATERLOG_SCENARIOS } from './CityLayers';

// 圖層面板裡「城市氣候韌性」這一組開關（騎樓、積水模擬）

function Toggle({ checked, onChange, accent, label, desc, children }) {
  return (
    <div className="flex flex-col">
      <label className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 mt-0.5 rounded cursor-pointer shrink-0"
          style={{ accentColor: accent }}
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-sm leading-tight text-slate-700">{label}</span>
          {desc && <span className="text-[10px] leading-snug text-slate-400">{desc}</span>}
        </span>
      </label>
      {checked && children}
    </div>
  );
}

export default function CityLayersControl({
  showArcades,
  setShowArcades,
  showWaterlog,
  setShowWaterlog,
  waterlogScenario,
  setWaterlogScenario,
  waterlogLoading,
}) {
  const t = useT();
  return (
    <div id="tour-city-layers" className="space-y-1 mb-4 pt-3 border-t border-slate-200">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">{t('city.group.title')}</p>
      <p className="text-[10px] text-slate-400 px-2 mb-1">{t('city.group.hint')}</p>

      <Toggle
        checked={showArcades}
        onChange={() => setShowArcades(!showArcades)}
        accent="#d97706"
        label={`☂️ ${t('city.arcades.label')}`}
        desc={t('city.arcades.desc')}
      />

      <Toggle
        checked={showWaterlog}
        onChange={() => setShowWaterlog(!showWaterlog)}
        accent="#2563eb"
        label={`🌊 ${t('city.waterlog.label')}`}
        desc={t('city.waterlog.desc')}
      >
        <div className="mx-2 mb-2 px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
          <div className="flex flex-col gap-1" role="radiogroup" aria-label={t('city.waterlog.label')}>
            {WATERLOG_SCENARIOS.map((s) => (
              <label key={s} className="flex items-center gap-2 text-[11px] text-blue-900 cursor-pointer">
                <input
                  type="radio"
                  name="waterlog-scenario"
                  checked={waterlogScenario === s}
                  onChange={() => setWaterlogScenario(s)}
                  className="accent-blue-600"
                />
                {t(`city.waterlog.scenario.${s}`)}
              </label>
            ))}
          </div>
          {waterlogLoading && <p className="text-[10px] text-blue-700">{t('city.waterlog.loading')}</p>}
          <div>
            <p className="text-[10px] text-blue-800 font-semibold mb-1">{t('city.waterlog.depth')}</p>
            <div className="flex flex-wrap gap-x-2.5 gap-y-1">
              {WATERLOG_DEPTHS.map((d) => (
                <span key={d.key} className="flex items-center gap-1 text-[10px] text-blue-900 tabular-nums">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: d.color, opacity: 0.75 }} />
                  {d.label}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[9px] text-blue-700/90 leading-relaxed">{t('city.waterlog.notice')}</p>
        </div>
      </Toggle>
    </div>
  );
}
