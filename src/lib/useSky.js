import { useEffect, useMemo, useState } from 'react';
import SunCalc from 'suncalc';

// 天光水氣的共用狀態：
//   - 即時天氣：Open-Meteo（免金鑰、有開 CORS，氣象模式估計值，約每 15 分鐘更新）。
//     current.precipitation 是「這 15 分鐘」的雨量（current.interval = 900 秒），
//     乘上 3600 / interval 換成每小時雨量。
//   - 日出日落：SunCalc 依日期與座標計算。
//   - 是否下雨：只看即時雨量。
//   - 是否天黑：依日出日落判斷，只用在「大熱天提醒開陰影」不在晚上出現。
// （原本有日夜模式與晴雨預覽會改變地圖畫面，會干擾古地圖閱讀，2026-10-23 依使用者決定移除。）
//
// 地圖、資訊列與路線規劃都從這裡取同一份結果，畫面和規劃用的情境才會一致。

const REFRESH_MS = 10 * 60 * 1000;
// 每小時雨量達到這個值就當作「下雨」（0.5 mm/h 約是走路會被淋濕的毛毛雨）
export const RAIN_THRESHOLD = 0.5;

export function useSky({ lat = 25.04, lng = 121.56 } = {}) {
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

  return useMemo(() => {
    const sun = SunCalc.getTimes(now, lat, lng);
    const rainPerHour = wx ? (wx.precipitation * 3600) / (wx.interval || 900) : null;
    const isNight = now < sun.sunrise || now > sun.sunset;
    const isRainy = rainPerHour != null && rainPerHour >= RAIN_THRESHOLD;
    return { wx, failed, sun, rainPerHour, isNight, isRainy };
  }, [wx, failed, now, lat, lng]);
}
