import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';

// 「天光水氣」資訊列：日出日落、氣溫體感、每小時雨量（資料來自 useSky）。
// 點一下展開「看天色」設定：日夜（自動／白天／夜間）與天氣（自動／晴天／雨天），
// 地圖色調與路線規劃的預設情境都跟著這兩個設定走。

// WMO 天氣代碼 → 圖示（只分大類）
function weatherIcon(code, isDay) {
  if (code == null) return '·';
  if (code >= 95) return '⛈️';
  if (code >= 51) return '🌧️';
  if (code >= 45) return '🌫️';
  if (code >= 2) return '☁️';
  return isDay ? '☀️' : '🌙';
}

const hhmm = (d) =>
  d && !isNaN(d) ? d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Taipei' }) : '--:--';

function Segmented({ value, options, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-1 bg-slate-100 rounded-xl p-1">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`text-[11px] py-1.5 rounded-lg transition-colors ${
            value === v ? 'bg-white text-sky-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export default function SkyBar({ sky }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { wx, failed, sun, rainPerHour, isNight, isRainy, autoNight, autoRainy, modes, setModes } = sky;

  // 點面板外面就收起來
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="sky-bar flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-sky-100 shadow-md rounded-2xl px-3 py-1.5 text-[11px] text-slate-600 font-medium tabular-nums hover:bg-white transition-colors"
        title={t('city.sky.title')}
      >
        <span className="flex items-center gap-1">
          <span aria-hidden>🌅</span>
          <span className="sr-only">{t('city.sky.sunrise')}</span>
          {hhmm(sun.sunrise)}
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden>🌇</span>
          <span className="sr-only">{t('city.sky.sunset')}</span>
          {hhmm(sun.sunset)}
        </span>
        <span className="h-3 w-px bg-slate-200" aria-hidden />
        {failed && !wx ? (
          <span className="text-slate-400">{t('city.sky.unavailable')}</span>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <span aria-hidden>{weatherIcon(wx?.weather_code, wx?.is_day)}</span>
              {wx ? `${Math.round(wx.temperature_2m)}°C` : '--'}
              <span className="text-slate-400">
                {t('city.sky.feels')} {wx ? `${Math.round(wx.apparent_temperature)}°` : '--'}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span aria-hidden>💧</span>
              {rainPerHour == null ? '--' : rainPerHour < 0.1 ? t('city.sky.dry') : `${rainPerHour.toFixed(1)} mm/h`}
            </span>
          </>
        )}
        {/* 手動模式時提醒目前不是跟著實際天色 */}
        {(modes.dayNight !== 'auto' || modes.weather !== 'auto') && (
          <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">{t('sky.preview.badge')}</span>
        )}
        <span aria-hidden className="text-slate-400">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-[290px] max-w-[calc(100vw-24px)] bg-white/97 backdrop-blur-md border border-sky-100 rounded-2xl shadow-xl p-4 space-y-3 text-slate-700 z-[1001]">
          <p className="text-sm font-bold">{t('sky.panel.title')}</p>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-500">{t('sky.panel.dayNight')}</p>
            <Segmented
              label={t('sky.panel.dayNight')}
              value={modes.dayNight}
              onChange={(v) => setModes({ dayNight: v })}
              options={[
                ['auto', t('sky.mode.auto')],
                ['day', `☀️ ${t('sky.mode.day')}`],
                ['night', `🌙 ${t('sky.mode.night')}`],
              ]}
            />
            <p className="text-[10px] text-slate-400 leading-snug">
              {modes.dayNight === 'auto'
                ? t(autoNight ? 'sky.auto.nowNight' : 'sky.auto.nowDay', { rise: hhmm(sun.sunrise), set: hhmm(sun.sunset) })
                : t(isNight ? 'sky.manual.night' : 'sky.manual.day')}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-500">{t('sky.panel.weather')}</p>
            <Segmented
              label={t('sky.panel.weather')}
              value={modes.weather}
              onChange={(v) => setModes({ weather: v })}
              options={[
                ['auto', t('sky.mode.auto')],
                ['sunny', `🌤️ ${t('sky.mode.sunny')}`],
                ['rainy', `🌧️ ${t('sky.mode.rainy')}`],
              ]}
            />
            <p className="text-[10px] text-slate-400 leading-snug">
              {modes.weather === 'auto'
                ? t(autoRainy ? 'sky.auto.nowRainy' : 'sky.auto.nowDry')
                : t(isRainy ? 'sky.manual.rainy' : 'sky.manual.sunny')}
            </p>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2">{t('city.sky.title')}</p>
        </div>
      )}
    </div>
  );
}
