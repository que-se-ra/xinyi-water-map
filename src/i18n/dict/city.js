// city — 全市氣候韌性圖層（騎樓、路燈、積水模擬）與「天光水氣」資訊列的字串
const city = {
  // 圖層面板分組
  'city.group.title': { zh: '🌦️ 城市氣候韌性', en: '🌦️ Climate resilience' },
  'city.group.hint': {
    zh: '臺北市全區資料，放大地圖才看得清楚。',
    en: 'City-wide Taipei data; zoom in to see the detail.',
  },

  // 騎樓
  'city.arcades.label': { zh: '騎樓整平路段', en: 'Levelled arcades' },
  'city.arcades.desc': {
    zh: '91–105 年完成整平的騎樓，雨天可以少淋雨。只含整平工程路段，不是全部騎樓。',
    en: 'Arcades levelled between 2002 and 2016 — handy for staying dry. Covers only levelled stretches, not every arcade.',
  },
  'city.arcades.popupTitle': { zh: '騎樓整平路段', en: 'Levelled arcade' },
  'city.arcades.range': { zh: '範圍', en: 'Stretch' },
  'city.arcades.length': { zh: '長度', en: 'Length' },
  'city.arcades.done': { zh: '完工', en: 'Completed' },
  'city.arcades.accessible': { zh: '無障礙', en: 'Step-free' },

  // 路燈
  'city.lamps.label': { zh: '路燈', en: 'Street lights' },
  'city.lamps.desc': {
    zh: '放大到街道層級才會顯示，夜間走路時參考哪裡比較亮。',
    en: 'Shown once you zoom in to street level; a guide to the better-lit streets at night.',
  },
  'city.lamps.zoomHint': { zh: '再放大地圖即可看到路燈', en: 'Zoom in further to see street lights' },
  'city.lamps.count': { zh: '畫面內 {n} 盞', en: '{n} in view' },

  // 積水模擬
  'city.waterlog.label': { zh: '短延時強降雨積水模擬', en: 'Cloudburst water-logging simulation' },
  'city.waterlog.desc': {
    zh: '每小時降雨強度達到下列數值時，可能積水的範圍與深度（15 公分以下不顯示）。',
    en: 'Where water may pond, and how deep, at each hourly rainfall intensity (under 15 cm not shown).',
  },
  'city.waterlog.scenario.788': { zh: '78.8 mm/h（排水設計標準）', en: '78.8 mm/h (drainage design standard)' },
  'city.waterlog.scenario.100': { zh: '100 mm/h', en: '100 mm/h' },
  'city.waterlog.scenario.130': { zh: '130 mm/h', en: '130 mm/h' },
  'city.waterlog.loading': { zh: '載入中…', en: 'Loading…' },
  'city.waterlog.depth': { zh: '積水深度', en: 'Water depth' },
  'city.waterlog.notice': {
    zh: '模擬圖假設均勻降雨、排水設施正常運作，無法代表單一颱風豪雨的實際淹水；依規定僅供防災參考，不能作為土地使用的判定依據。',
    en: 'The simulation assumes even rainfall and working drains, so it cannot show what any single storm will do. By regulation it is for disaster preparedness only, not for land-use decisions.',
  },

  // 天光水氣資訊列
  'city.sky.sunrise': { zh: '日出', en: 'Sunrise' },
  'city.sky.sunset': { zh: '日落', en: 'Sunset' },
  'city.sky.rain': { zh: '雨量', en: 'Rain' },
  'city.sky.temp': { zh: '氣溫', en: 'Temp' },
  'city.sky.feels': { zh: '體感', en: 'Feels' },
  'city.sky.dry': { zh: '無雨', en: 'Dry' },
  'city.sky.title': {
    zh: '氣溫、體感與雨量是 Open-Meteo 氣象模式的估計值（約每 15 分鐘更新），不是測站實測；日出日落依天文公式計算。',
    en: 'Temperature, feels-like and rainfall are Open-Meteo model estimates (updated about every 15 minutes), not station readings; sunrise and sunset are calculated astronomically.',
  },
  'city.sky.unavailable': { zh: '天氣資料暫時無法取得', en: 'Weather data unavailable right now' },

  // 資料來源
  'city.source.heading': { zh: '🌦️ 氣候韌性與天氣', en: '🌦️ Climate resilience and weather' },
  'city.source.arcades': {
    zh: '臺北市騎樓整平工程完成路段表（臺北市政府都市發展局建築管理工程處）',
    en: 'Taipei levelled-arcade works (Construction Management Office, Taipei City Government)',
  },
  'city.source.lamps': {
    zh: '臺北市路燈位置分布圖（臺北市政府工務局公園路燈工程管理處）',
    en: 'Taipei street light locations (Parks and Street Lights Office, Taipei City Government)',
  },
  'city.source.waterlog': {
    zh: '臺北市降雨積水模擬圖 112 年更新版（臺北市政府工務局水利工程處）',
    en: 'Taipei rainfall water-logging simulation, 2023 edition (Hydraulic Engineering Office, Taipei City Government)',
  },
  'city.source.weather': {
    zh: 'Open-Meteo 氣象資料（CC BY 4.0）',
    en: 'Open-Meteo weather data (CC BY 4.0)',
  },
  'city.source.basemap': {
    zh: '內政部國土測繪中心 臺灣通用電子地圖',
    en: 'National Land Surveying and Mapping Center, Taiwan e-Map',
  },
};

export default city;
