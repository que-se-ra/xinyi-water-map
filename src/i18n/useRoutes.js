'use client';

// 路線／站點是資料不是介面文字，所以走「平行英文資料檔」而不是字典 key：
// routeData.js（中文，原封不動）+ routeData.en.js（英文，依 id 對應）。
// 缺翻譯的欄位自動退回中文——譯到一半也能跑，漏譯在畫面上看得見。
//
// 🔴 每個 route / station 一律額外帶一個 nameZh（永遠是中文原名）。
// 回饋表單送出去的 route_name / station_name 必須用 nameZh，不可以用顯示名：
// 英文版使用者留言若把站名寫成英文，就會跟中文回饋混在同一張 Google 表裡對不起來。

import { useMemo } from 'react';
import { routes as routesZh } from '@/data/routeData';
import { routesEn } from '@/data/routeData.en';
import { useLocale } from './LocaleProvider';

function pick(en, zh) {
  return en !== undefined && en !== null && en !== '' ? en : zh;
}

export function localizeRoutes(routes, overrides) {
  return routes.map((route) => {
    const ro = overrides && overrides[route.id];
    return {
      ...route,
      nameZh: route.name,
      name: pick(ro && ro.name, route.name),
      subtitle: pick(ro && ro.subtitle, route.subtitle),
      startStation: pick(ro && ro.startStation, route.startStation),
      stations: route.stations.map((st) => {
        const so = ro && ro.stations && ro.stations[st.id];
        return {
          ...st,
          nameZh: st.name,
          name: pick(so && so.name, st.name),
          badge: pick(so && so.badge, st.badge),
          hook: pick(so && so.hook, st.hook),
          body: pick(so && so.body, st.body),
          imgs: (st.imgs || []).map((img, i) => ({
            ...img,
            cap: pick(so && so.imgCaps && so.imgCaps[i], img.cap),
          })),
        };
      }),
    };
  });
}

export function useRoutes() {
  const { locale } = useLocale();
  return useMemo(
    () => localizeRoutes(routesZh, locale === 'en' ? routesEn : null),
    [locale]
  );
}
