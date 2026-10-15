// 「城市裡的微氣候觀察｜互動地圖工作坊」（與松山文創園區合作）。
//
// 目前狀態（2026-10-15）：兩條走讀路線已建（路線一 A→B→D→E→C、路線二 A→E→D→B→C），
// 站點與路徑來自使用者的 GPX，細節與待確認項目見 routeData.js 開頭註解。站點的講解文字尚未撰寫。
// 路線預設關閉（同信義），由使用者在圖層面板打開。
//
// 之後新增或調整路線：改 routeData.js / routeData.en.js；路線 id 保持專案前綴（songshan-route-0N），
// 避免和其他專案的回饋統計混在一起。
//
// 松山文創園區在信義區（光復南路），共用的行道樹、綠地、都市計畫分區資料已涵蓋園區（2026-10-10 查證）。

import { BASE_DEFAULT_LAYERS } from '../defaultLayers';
import { routes } from './routeData';
import { routesEn } from './routeData.en';

export const songshan = {
  id: 'songshan',
  slug: 'songshan',
  status: 'active',
  feedbackProjectId: 'songshan',
  assetBaseUrl: '',
  // 松山文創園區（地圖在沒有路線時以此為視角）
  center: [25.0439, 121.5605],
  zoom: 16,
  routes,
  routesEn,
  // 圖層面板路線旁的 ⓘ 說明框：信義的 route-0.. 說明不適用，加前綴讓它找不到資料（就不顯示）
  tooltipPrefix: 'songshan-',
  defaultLayers: BASE_DEFAULT_LAYERS,
  // 沒有專屬問卷；側欄先只留地圖與圖層說明（水文調查表單、歷史故事是信義專屬內容）
  features: { survey: false },
  ui: { tabs: ['map', 'layers', 'changelog'], landingCards: false },
  reportSummary: {
    org: '「城市裡的微氣候觀察｜互動地圖工作坊」（松山文創園區）',
    area: '園區周邊環境',
  },
  card: {
    zh: {
      name: '城市裡的微氣候觀察｜互動地圖工作坊',
      subtitle: '',
      partner: '松山文創園區',
      summary: '與松山文創園區合作的互動地圖工作坊。',
    },
    en: {
      // 暫譯，待使用者確認
      name: 'Urban Microclimate Observation | Interactive Mapping Workshop',
      subtitle: '',
      partner: 'Songshan Cultural and Creative Park',
      summary: 'An interactive mapping workshop in partnership with Songshan Cultural and Creative Park.',
    },
  },
  meta: {
    zh: {
      title: '城市裡的微氣候觀察｜互動地圖工作坊',
      description: '與松山文創園區合作的互動地圖工作坊。疊合古今地圖、衛星影像與開放資料，觀察城市裡的微氣候。',
      keywords: '微氣候,松山文創園區,互動地圖,工作坊,古今地圖,衛星影像,台北',
      ogDescription: '與松山文創園區合作的互動地圖工作坊',
    },
    en: {
      title: 'Urban Microclimate Observation | Interactive Mapping Workshop',
      description:
        'An interactive mapping workshop with Songshan Cultural and Creative Park. Overlay historical maps, satellite imagery and open data to observe the microclimate of the city.',
      keywords:
        'microclimate, Songshan Cultural and Creative Park, interactive map, workshop, historical maps, satellite imagery, Taipei',
      ogDescription: 'An interactive mapping workshop with Songshan Cultural and Creative Park',
    },
  },
  // 覆寫全站字典中信義專屬的字串（只列這個專案用得到、且不適用的）。
  copy: {
    zh: {
      'site.title': '城市裡的微氣候觀察',
      'map.route.line1': '路線一：文創大街 → 新仁里農園 → 楓香大道 → 松山匯 → 巴洛克花園',
      'map.route.line2': '路線二：文創大街 → 松山匯 → 楓香大道 → 新仁里農園 → 巴洛克花園',
      'tour.routes.title': '🚶 走讀路線',
      'tour.routes.body': '包含兩條不同顏色的走讀路線。您可以勾選來顯示或隱藏路線，或點擊地圖上的站點標記查看站點資訊。也可利用全選/全清按鈕快速切換。',
      'layersTab.routes.intro': '兩條走讀路線：',
      'layersTab.routes.r1.name': '文創大街 → 新仁里農園 → 楓香大道 → 松山匯 → 巴洛克花園',
      'layersTab.routes.r2.name': '文創大街 → 松山匯 → 楓香大道 → 新仁里農園 → 巴洛克花園',
      'site.tagline': '互動地圖工作坊',
      'org.badge': '與松山文創園區合作',
      'org.full': '松山文創園區',
      'landing.tagline': '互動地圖工作坊 · 與松山文創園區合作',
      'landing.ctaMap': '開啟互動地圖',
      'tour.welcome.title': '歡迎使用「城市裡的微氣候觀察」互動地圖！',
      'tour.welcome.body': '這是與松山文創園區合作的互動地圖工作坊。您可以疊合古今地圖、衛星影像與開放資料，觀察園區周邊的環境。',
      'changelog.subtitle': '互動地圖 · 版本歷史紀錄',
      'layersTab.hist.intro': '展示不同時期的歷史地圖，追蹤這一帶的變遷：',
      'layersTab.hist.noteBody': '透過比較不同時期的地圖，可以看出這一帶的土地與水路如何隨時間改變。',
      'layersTab.open.green.desc': '公園、草地、樹林等面狀綠地，補足行道樹資料未涵蓋的區域',
      'layersTab.open.zoning.desc': '都市計畫分區',
      'layersTab.temp.body': '實時溫度分布圖，顯示熱島效應與溫度變化。',
    },
    en: {
      'site.title': 'Urban Microclimate Observation',
      'map.route.line1': 'Route 1: Creative Street → Xinren Village Farm → Sweetgum Avenue → Songshan Hub → Baroque Garden',
      'map.route.line2': 'Route 2: Creative Street → Songshan Hub → Sweetgum Avenue → Xinren Village Farm → Baroque Garden',
      'tour.routes.title': '🚶 Walking routes',
      'tour.routes.body':
        'There are two walking routes, each in a different colour. Tick a route to show or hide it, or tap a stop marker on the map to read about the stop. Use the select-all / clear-all buttons to switch quickly.',
      'layersTab.routes.intro': 'Two walking routes:',
      'layersTab.routes.r1.name': 'Creative Street → Xinren Village Farm → Sweetgum Avenue → Songshan Hub → Baroque Garden',
      'layersTab.routes.r2.name': 'Creative Street → Songshan Hub → Sweetgum Avenue → Xinren Village Farm → Baroque Garden',
      'site.tagline': 'Interactive Mapping Workshop',
      'org.badge': 'In partnership with Songshan Cultural and Creative Park',
      'org.full': 'Songshan Cultural and Creative Park',
      'landing.tagline': 'Interactive mapping workshop · with Songshan Cultural and Creative Park',
      'landing.ctaMap': 'Open the interactive map',
      'tour.welcome.title': 'Welcome to the "Urban Microclimate Observation" interactive map!',
      'tour.welcome.body':
        'This is an interactive mapping workshop in partnership with Songshan Cultural and Creative Park. Overlay historical maps, satellite imagery and open data to observe the surroundings of the park.',
      'changelog.subtitle': 'Interactive Map · Version history',
      'layersTab.hist.intro': 'Historical maps from different periods, for tracing how the area has changed:',
      'layersTab.hist.noteBody':
        'By comparing maps from different periods you can see how the land and waterways here have changed over time.',
      'layersTab.open.green.desc': 'Area-based green space such as parks, grass and woodland, filling gaps in the street-tree data',
      'layersTab.open.zoning.desc': 'Urban planning zones',
      'layersTab.temp.body': 'A live temperature distribution map showing the urban heat island effect and temperature variation.',
    },
  },
};
