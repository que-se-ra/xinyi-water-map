// city — 全市氣候韌性圖層（騎樓、積水模擬）與「天光水氣」資訊列的字串
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
  // 情境建議
  'sky.hint.rain': { zh: '🌧️ 下雨了，要看騎樓和可能積水的地方嗎？', en: '🌧️ It is raining. Show arcades and likely water-logging?' },
  'sky.hint.hot': { zh: '☀️ 體感很熱，要看哪裡有陰影嗎？', en: '☀️ It feels hot. Show where the shade is?' },
  'sky.hint.apply': { zh: '打開', en: 'Show' },
  'sky.hint.dismiss': { zh: '不用了', en: 'No thanks' },
  // 左側搜尋面板
  'map.control.locateMe': { zh: '我的位置', en: 'My location' },
  'map.panel.collapse': { zh: '收起左側面板', en: 'Hide the left panel' },
  'map.panel.expand': { zh: '展開左側面板（搜尋與遮蔭路線規劃）', en: 'Show the left panel (search and shade route)' },

  // 遮蔭路線規劃
  'route.open': { zh: '遮蔭路線規劃', en: 'Shade route' },
  'route.title': { zh: '遮蔭路線規劃', en: 'Plan a shaded walk' },
  'route.subtitle': { zh: '在臺北市內找一條遮蔭或可以躲雨的步行路線。', en: 'Find a walking route in Taipei with more shade or shelter from rain.' },
  'route.close': { zh: '收起', en: 'Close' },
  'route.start': { zh: '起點', en: 'From' },
  'route.end': { zh: '終點', en: 'To' },
  'route.startShort': { zh: '起', en: 'A' },
  'route.endShort': { zh: '終', en: 'B' },
  'route.searchPlaceholder': { zh: '輸入地點、地標或站點', en: 'Place, landmark or stop' },
  'route.search': { zh: '搜尋', en: 'Search' },
  'route.noResult': { zh: '找不到，換個說法試試', en: 'No matches; try another wording' },
  'route.stationTag': { zh: '站點', en: 'Stop' },
  'route.pickOnMap': { zh: '在地圖上點', en: 'Pick on map' },
  'route.picking': { zh: '請點地圖…', en: 'Tap the map…' },
  'route.pickedPoint': { zh: '地圖上選的點', en: 'Point picked on the map' },
  'route.myLocation': { zh: '我的位置', en: 'My location' },
  'route.clear': { zh: '清除', en: 'Clear' },
  'route.swap': { zh: '起終點對調', en: 'Swap start and end' },
  'route.scenario': { zh: '想要', en: 'I want' },
  'route.scenario.shade': { zh: '找樹蔭', en: 'Shade' },
  'route.scenario.rain': { zh: '躲雨', en: 'Shelter' },
  'route.preference': { zh: '願意繞路嗎', en: 'Detours' },
  'route.pref.near': { zh: '近一點', en: 'Keep it short' },
  'route.pref.balanced': { zh: '剛剛好', en: 'Balanced' },
  'route.pref.comfy': { zh: '舒服一點', en: 'Comfort first' },
  'route.time': { zh: '出發時間', en: 'Leaving at' },
  'route.compare': { zh: '一起顯示最短路線', en: 'Also show the shortest route' },
  'route.plan': { zh: '規劃路線', en: 'Plan route' },
  'route.planning': { zh: '計算中…', en: 'Working it out…' },
  'route.recommended': { zh: '建議路線', en: 'Suggested route' },
  'route.shortest': { zh: '最短路線（虛線）', en: 'Shortest route (dashed)' },
  'route.km': { zh: '公里', en: 'km' },
  'route.minutes': { zh: '分鐘', en: 'min' },
  'route.metric.shade': { zh: '有遮蔭', en: 'shaded' },
  'route.metric.cover': { zh: '可遮雨', en: 'sheltered' },
  'route.sameAsShortest': { zh: '最短路線已經是最舒服的走法。', en: 'The shortest route is already the most comfortable one.' },
  'route.tradeoff': {
    zh: '多走約 {m} 公尺（約 {min} 分鐘），{metric}比例多 {gain} 個百分點。',
    en: 'About {m} m ({min} min) longer, with {gain} percentage points more of the route {metric}.',
  },
  'route.legendLow': { zh: '路段顏色：少', en: 'Segment colour: less' },
  'route.legendHigh': { zh: '多{metric}', en: 'more {metric}' },
  'route.nearbyStations': { zh: '沿途會經過的導覽站點', en: 'Tour stops along the way' },
  'route.rateAfterWalk': { zh: '走完了？替路上的地點打熱舒適分數', en: 'Walked it? Rate the thermal comfort of a spot' },
  'route.note.shade': {
    zh: '遮蔭是依行道樹、樹林與建築陰影估算（建築沒有標高度時以 12 公尺計），以出發時間最接近的整點、夏季或春秋代表日計算，實際陰影會隨雲量與季節變化。路網資料建置於 {built}。',
    en: 'Shade is estimated from street trees, woodland and building shadows (12 m assumed where a building has no height), for the nearest whole hour on a summer or spring/autumn reference day; real shade varies with cloud and season. Network built {built}.',
  },
  'route.note.cover': {
    zh: '可遮雨只算得到 91–105 年整平的騎樓與標示為有頂的通道，沒整平的騎樓、雨遮與店家騎樓都沒有計入，實際能躲雨的地方會更多。路網資料建置於 {built}。',
    en: 'Shelter counts only arcades levelled in 2002–2016 and paths mapped as covered; other arcades and awnings are not included, so there is more shelter than shown. Network built {built}.',
  },
  'route.error.outside': { zh: '起點或終點不在臺北市內，目前只規劃臺北市的路線。', en: 'Start or end is outside Taipei City; only routes within Taipei are planned for now.' },
  'route.error.too-far': { zh: '兩點距離太遠了，請把起終點設近一點（10 公里內）。', en: 'The two points are too far apart; keep them within about 10 km.' },
  'route.error.no-road': { zh: '起點或終點附近 300 公尺內沒有可以走的路，請換個位置。', en: 'There is no walkable path within 300 m of the start or end; try another spot.' },
  'route.error.no-path': { zh: '兩點之間找不到連通的步行路線，可能被河流或快速道路隔開。', en: 'No connected walking route between the two points; a river or expressway may be in the way.' },
  'route.error.unknown': { zh: '路線計算失敗，請稍後再試。', en: 'Route planning failed; please try again later.' },
};

export default city;
