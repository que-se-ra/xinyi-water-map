// layers — src/components/layers/ 底下各圖層元件抽出的字串
// 這一關只抽取，en 一律留空字串，翻譯由後續作業補上。
const layers = {
  // StationPopupContent.js
  'layers.station.close': {
    zh: '關閉',
    en: 'Close',
  },
  'layers.station.leaveMemoryPrompt': {
    zh: '在這裡留下回憶與照片',
    en: 'Leave a memory or a photo here',
  },

  // ComfortLayer.js — GREEN_KIND_LABEL（綠地 kind → 中文顯示名）
  'layers.comfort.green.park': {
    zh: '公園',
    en: 'Park',
  },
  'layers.comfort.green.garden': {
    zh: '花園／綠地',
    en: 'Garden / green space',
  },
  'layers.comfort.green.grass': {
    zh: '草地',
    en: 'Grass',
  },
  'layers.comfort.green.wood': {
    zh: '樹林',
    en: 'Wood',
  },
  'layers.comfort.green.forest': {
    zh: '森林',
    en: 'Forest',
  },
  'layers.comfort.green.scrub': {
    zh: '灌木叢',
    en: 'Scrub',
  },
  'layers.comfort.green.meadow': {
    zh: '草原',
    en: 'Meadow',
  },
  'layers.comfort.green.grassland': {
    zh: '草生地',
    en: 'Grassland',
  },
  'layers.comfort.green.recreationGround': {
    zh: '遊憩用地',
    en: 'Recreation ground',
  },
  'layers.comfort.green.villageGreen': {
    zh: '鄰里綠地',
    en: 'Village green',
  },
  'layers.comfort.green.cemetery': {
    zh: '墓園綠地',
    en: 'Cemetery green space',
  },
  'layers.comfort.green.default': {
    zh: '綠地',
    en: 'Green space',
  },
  'layers.comfort.typeLabel': {
    zh: '類型：',
    en: 'Type: ',
  },
  'layers.comfort.unknownTree': {
    zh: '未知樹種',
    en: 'Unidentified species',
  },
  'layers.comfort.treeHeightLabel': {
    zh: '樹高：',
    en: 'Height: ',
  },
  'layers.comfort.diameterLabel': {
    zh: '胸徑：',
    en: 'DBH: ',
  },
  'layers.comfort.noData': {
    zh: '無資料',
    en: 'No data',
  },

  // ZoningLayer.js — 判斷條件用的中文關鍵字（p.name.includes(...)）不抽，只抽輸出的說明文字
  'layers.zoning.info.residential': {
    zh: '此區主要供住宅使用，旨在保障居住環境的寧靜與安全，對建築高度、建蔽率及容積率有明確限制。',
    en: 'Primarily residential. The zoning protects a quiet, safe living environment and sets explicit limits on building height, site coverage and floor area ratio.',
  },
  'layers.zoning.info.commercial': {
    zh: '供商業設施及辦公室使用，是都市的經濟活動中心，通常擁有較高的容積率與建蔽率。',
    en: 'For commercial premises and offices. These are the city’s centres of economic activity, and usually carry higher floor area ratios and site coverage.',
  },
  'layers.zoning.info.industrial': {
    zh: '供工業生產及相關設施使用。',
    en: 'For industrial production and related facilities.',
  },
  'layers.zoning.info.park': {
    zh: '都市中的開放空間，提供市民休閒遊憩，並兼具生態保護功能，嚴禁非公共設施之建築。',
    en: 'Urban open space for recreation, which also serves an ecological function. Buildings other than public facilities are strictly prohibited.',
  },
  'layers.zoning.info.road': {
    zh: '都市交通動脈，維持交通運作與行人通行。',
    en: 'Urban traffic arteries, keeping vehicles and pedestrians moving.',
  },
  'layers.zoning.info.school': {
    zh: '供學校設施、教育環境使用。',
    en: 'For schools and educational facilities.',
  },
  'layers.zoning.info.default': {
    zh: '都市計畫中設定的特定土地用途區域。',
    en: 'A specific land use designated in the urban plan.',
  },
  'layers.zoning.defaultLabel': {
    zh: '使用分區',
    en: 'Zoning',
  },
  'layers.zoning.codeLabel': {
    zh: '分區代碼',
    en: 'Zone code',
  },
  'layers.zoning.shortLabel': {
    zh: '簡稱',
    en: 'Short code',
  },
  'layers.zoning.fullDescLabel': {
    zh: '詳細描述',
    en: 'Full description',
  },
  'layers.zoning.originalZone': {
    zh: '原屬分區: {name}',
    en: 'Originally zoned: {name}',
  },

  // RouteLayer.js
  'layers.route.noRatingYet': {
    zh: '本路段尚無評分資料，歡迎成為第一位評分的人！',
    en: 'No ratings for this segment yet — be the first to rate it.',
  },
  'layers.route.statsTitle': {
    zh: '📊 民眾評分統計',
    en: '📊 Public ratings',
  },
  'layers.route.statsCount': {
    zh: '共 {n} 筆',
    en: '{n} ratings',
  },
  'layers.route.overallAverage': {
    zh: '整體平均',
    en: 'Overall average',
  },

  // SatelliteLayer.js — SATELLITE_MAPS.label 只在本檔使用（已確認無其他 import 者讀取 .label），
  // 改為依 sm.id 查字典；description 欄位目前全庫無人讀取顯示，保留不動。
  'layers.satellite.panelTitle': {
    zh: '🛰️ 衛星影像',
    en: '🛰️ Satellite imagery',
  },
  'layers.satellite.esri-satellite.label': {
    zh: 'Esri 衛星影像',
    en: 'Esri satellite imagery',
  },
  'layers.satellite.sentinel2-natural.label': {
    zh: 'Sentinel-2 真彩色',
    en: 'Sentinel-2 true colour',
  },
  'layers.satellite.sentinel2-ndvi.label': {
    zh: 'Sentinel-2 植被指數',
    en: 'Sentinel-2 vegetation index',
  },
  'layers.satellite.sentinel2-moisture.label': {
    zh: 'Sentinel-2 濕度指數',
    en: 'Sentinel-2 moisture index',
  },

  // HistoricalLayer.js — HISTORICAL_MAPS.label 只在本檔使用（已確認無其他 import 者讀取 .label），
  // 改為依 hm.id 查字典。
  'layers.historical.attribution': {
    zh: '歷史圖資 © <a href="https://gis.sinica.edu.tw" target="_blank">中央研究院</a>',
    en: 'Historical maps © <a href="https://gis.sinica.edu.tw" target="_blank">Academia Sinica</a>',
  },
  'layers.historical.panelTitle': {
    zh: '🕰️ 古今地圖',
    en: '🕰️ Historical maps',
  },
  'layers.historical.jm1904.label': {
    zh: '1904 臺灣堡圖',
    en: '1904 Taiwan Baotu (cadastral survey)',
  },
  'layers.historical.jm1921.label': {
    zh: '1921 地形圖',
    en: '1921 Topographic Map',
  },
  'layers.historical.liugong1939.label': {
    zh: '1939 瑠公水利區域圖',
    en: '1939 Liu-kong-tsun Irrigation District Map',
  },
  'layers.historical.am1944.label': {
    zh: '1944 美軍地形圖',
    en: '1944 US Military Topographic Map',
  },
  'layers.historical.tm1989.label': {
    zh: '1989 地形圖',
    en: '1989 Topographic Map',
  },

  // TemperatureLayer.js
  'layers.temperature.loadFailedNoKey': {
    zh: '地表溫度載入失敗，可能未設定 GEE 金鑰。',
    en: 'Could not load land surface temperature — the GEE key may not be configured.',
  },
  'layers.temperature.loadFailed': {
    zh: '地表溫度載入失敗。',
    en: 'Could not load land surface temperature.',
  },
  'layers.temperature.controlLabel': {
    zh: '🌡️ 地表溫度 (2024夏)',
    en: '🌡️ Land surface temperature (summer 2024)',
  },
  'layers.temperature.loading': {
    zh: '載入中...',
    en: 'Loading…',
  },

  // SurveyPointsLayer.js — SURVEY_KIND_STYLE.label 不抽（MapView.js 第 683 行直接讀取該常數的
  // .label 顯示，MapView.js 不在本次負責清單內，改動會使其顯示壞掉，故保留原樣）。
  'layers.survey.zoneLabel': {
    zh: '分區',
    en: 'Zoning',
  },
  'layers.survey.greenWithinRadius': {
    zh: '綠地 {radius}m',
    en: 'Green space within {radius}m',
  },
  'layers.survey.canopyLabel': {
    zh: '行道樹冠 10m',
    en: 'Street tree canopy, 10m',
  },
  'layers.survey.canopyPct': {
    zh: '{pct}%（{count} 棵）',
    en: '{pct}% ({count} trees)',
  },
  'layers.survey.shadeLabel': {
    zh: '午後樹蔭 10m',
    en: 'Afternoon tree shade, 10m',
  },
  'layers.survey.overallFeeling': {
    zh: '整體感受',
    en: 'Overall impression',
  },
  'layers.survey.scorePoints': {
    zh: '{score} 分',
    en: '{score} pts',
  },
  'layers.survey.categoryLabel': {
    zh: '分類',
    en: 'Category',
  },

  // UserLocationLayer.js
  'layers.userLocation.currentPosition': {
    zh: '您目前的位置',
    en: 'Your current location',
  },

  // DataSourceControl.js
  'layers.dataSource.title': {
    zh: '資料來源與鳴謝',
    en: 'Data sources and acknowledgements',
  },
  'layers.dataSource.originHeading': {
    zh: '📖 專案發起與踏查內容',
    en: '📖 Project origin and field survey',
  },
  'layers.dataSource.originText': {
    zh: '臺北市信義社區大學 — 「信水義河」專案',
    en: 'Taipei Xinyi Community College — the 信水義河 Waters of Xinyi project',
  },
  'layers.dataSource.mapHeading': {
    zh: '🗺️ 基礎圖資與圖台支援',
    en: '🗺️ Base maps and mapping platform',
  },
  'layers.dataSource.osmContributors': {
    zh: 'OpenStreetMap 貢獻者',
    en: 'OpenStreetMap contributors',
  },
  'layers.dataSource.carto': {
    zh: 'CARTO (底圖樣式)',
    en: 'CARTO (base map style)',
  },
  'layers.dataSource.historicalHeading': {
    zh: '🏛️ 歷史地圖與航照圖',
    en: '🏛️ Historical maps and aerial photography',
  },
  'layers.dataSource.historicalText': {
    zh: '中央研究院 人社中心 GIS 專題中心（包含 1904 臺灣堡圖、1921 地形圖、1939 瑠公水利區域圖、1945 美軍地圖、1989 地形圖等）',
    en: 'Center for GIS, Research Center for Humanities and Social Sciences, Academia Sinica (including the 1904 Taiwan Baotu, 1921 Topographic Map, 1939 Liu-kong-tsun Irrigation District Map, 1945 US Military Map and 1989 Topographic Map)',
  },
  'layers.dataSource.openDataHeading': {
    zh: '📊 政府開放資料 (Open Data)',
    en: '📊 Government open data',
  },
  'layers.dataSource.openDataGov': {
    zh: '臺北市政府資料開放平台（行道樹、人行道、都市計畫分區）',
    en: 'Taipei City Government Open Data Platform (street trees, pavements, urban planning zones)',
  },
  'layers.dataSource.temperatureData': {
    zh: '地表溫度感測資料 (2024夏)',
    en: 'Land surface temperature sensing data (summer 2024)',
  },
  'layers.dataSource.buttonLabel': {
    zh: '資料來源',
    en: 'Data sources',
  },

  // info-tooltip/InfoTooltip.js — data.title / data.badge / data.desc 來自 tooltipData.js（禁區，不動）
  'layers.infoTooltip.title': {
    zh: '點擊或懸停查看圖層詳細說明',
    en: 'Tap or hover for a full description of this layer',
  },
  'layers.infoTooltip.viewAria': {
    zh: '查看{title}說明',
    en: 'View the {title} description',
  },

  // 問卷點位三種類型（SURVEY_KIND_STYLE，MapView 圖例顯示）
  'layers.surveyKind.hot': { zh: '最不舒適', en: 'Least comfortable' },
  'layers.surveyKind.cool': { zh: '最舒適', en: 'Most comfortable' },
  'layers.surveyKind.improve': { zh: '優先改善', en: 'Priority for improvement' },
};

export default layers;
