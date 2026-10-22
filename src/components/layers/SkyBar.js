import { useEffect, useState } from 'react';
import SunCalc from 'suncalc';
import { useT } from '@/i18n/LocaleProvider';

// 「天光水氣」資訊列：日出日落（SunCalc 依日期與座標計算，不需外部服務）
// ＋ 氣溫、體感與雨量（Open-Meteo，免金鑰、有開 CORS，模式估計值約每 15 分鐘更新）。
// Open-Meteo 的 current.precipitation 是「這 15 分鐘」的雨量（current.interval = 900 秒），
// 乘上 3600 / interval 換成每小時雨量顯示。

const REFRESH_MS = 10 * 60 * 1000;

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

export default function SkyBar({ lat = 25.04, lng = 121.56 }) {
  const t = useT();
  const [wx, setWx] = useState(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    const load = () => {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        '&current=precipitation,temperature_2m,apparent_temperature,weather_code,is_day&timezone=Asia%2FTaipei';
      fetch(url)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => {
          if (!alive) return;
          setWx(j.current);
          setFailed(false);
        })
        .catch(() => alive && setFailed(true));
      setNow(new Date());
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [lat, lng]);

  const sun = SunCalc.getTimes(now, lat, lng);
  const rainPerHour = wx ? (wx.precipitation * 3600) / (wx.interval || 900) : null;

  return (
    <div
      className="sky-bar flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-sky-100 shadow-md rounded-2xl px-3 py-1.5 text-[11px] text-slate-600 font-medium tabular-nums"
      title={t('city.sky.title')}
    >
      <span className="flex items-center gap-1" aria-label={`${t('city.sky.sunrise')} ${hhmm(sun.sunrise)}`}>
        <span aria-hidden>🌅</span>
        {hhmm(sun.sunrise)}
      </span>
      <span className="flex items-center gap-1" aria-label={`${t('city.sky.sunset')} ${hhmm(sun.sunset)}`}>
        <span aria-hidden>🌇</span>
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
              {t('city.sky.feels')}{' '}
              {wx ? `${Math.round(wx.apparent_temperature)}°` : '--'}
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
