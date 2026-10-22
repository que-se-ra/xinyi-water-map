import { useEffect, useMemo, useState } from 'react';
import SunCalc from 'suncalc';

// 天光水氣的共用狀態：
//   - 即時天氣：Open-Meteo（免金鑰、有開 CORS，氣象模式估計值，約每 15 分鐘更新）。
//     current.precipitation 是「這 15 分鐘」的雨量（current.interval = 900 秒），
//     乘上 3600 / interval 換成每小時雨量。
//   - 日出日落：SunCalc 依日期與座標計算。
//   - 顯示模式：日夜（自動／白天／夜間）與天氣（自動／晴天／雨天）。自動時跟著
//     日出日落與即時雨量走；手動選的值記在這台裝置（localStorage），下次打開沿用。
//
// 地圖、資訊列與路線規劃都從這裡取同一份結果，畫面和規劃用的情境才會一致。

const REFRESH_MS = 10 * 60 * 1000;
// 每小時雨量達到這個值就當作「下雨」（0.5 mm/h 約是走路會被淋濕的毛毛雨）
export const RAIN_THRESHOLD = 0.5;

const LS_KEY = 'sky-modes-v1';

function readModes() {
  if (typeof window === 'undefined') return { dayNight: 'auto', weather: 'auto' };
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return {
      dayNight: ['auto', 'day', 'night'].includes(v.dayNight) ? v.dayNight : 'auto',
      weather: ['auto', 'sunny', 'rainy'].includes(v.weather) ? v.weather : 'auto',
    };
  } catch {
    return { dayNight: 'auto', weather: 'auto' };
  }
}

export function useSky({ lat = 25.04, lng = 121.56 } = {}) {
  const [wx, setWx] = useState(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => new Date());
  // 用到這個 hook 的地圖元件都只在瀏覽器端渲染（dynamic import, ssr: false），可以直接讀 localStorage
  const [modes, setModesState] = useState(readModes);

  const setModes = (patch) =>
    setModesState((m) => {
      const next = { ...m, ...patch };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {
        /* 私密瀏覽等情況寫不進去就算了，只影響下次開啟 */
      }
      return next;
    });

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

  return useMemo(() => {
    const sun = SunCalc.getTimes(now, lat, lng);
    const rainPerHour = wx ? (wx.precipitation * 3600) / (wx.interval || 900) : null;
    const autoNight = now < sun.sunrise || now > sun.sunset;
    const autoRainy = rainPerHour != null && rainPerHour >= RAIN_THRESHOLD;
    const isNight = modes.dayNight === 'auto' ? autoNight : modes.dayNight === 'night';
    const isRainy = modes.weather === 'auto' ? autoRainy : modes.weather === 'rainy';
    return { wx, failed, sun, rainPerHour, isNight, isRainy, autoNight, autoRainy, modes, setModes };
    // setModes 每次都是新函式但行為相同（只呼叫 setModesState），不放進依賴
  }, [wx, failed, now, lat, lng, modes]);
}
