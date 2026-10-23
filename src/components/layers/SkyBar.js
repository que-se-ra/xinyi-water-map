import { useT } from '@/i18n/LocaleProvider';

// 「天光水氣」資訊列：日出日落、氣溫體感、每小時雨量（資料來自 useSky）。
// 單純顯示資訊，不改變地圖畫面（日夜模式與雨幕會干擾古地圖閱讀，2026-10-23 移除）。
// 即時雨量另外用來決定路線規劃的預設情境與圖層建議。

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

export default function SkyBar({ sky }) {
  const t = useT();
  const { wx, failed, sun, rainPerHour } = sky;

  return (
    <div
      className="sky-bar max-w-full overflow-x-auto whitespace-nowrap flex items-center gap-2.5 bg-white/90 border border-sky-100 shadow-sm rounded-2xl px-3 py-1.5 text-sm text-slate-600 font-medium tabular-nums"
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
    </div>
  );
}
