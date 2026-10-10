// 「城市裡的微氣候觀察｜互動地圖工作坊」（與松山文創園區合作）。
//
// 目前狀態（2026-10-10）：地圖與所有共用基礎圖層（古今地圖、衛星影像、開放資料、日照陰影、
// 溫度圖層）已啟用；**路線與站點還沒有**——這次工作坊的走讀路線要重新設計，所以刻意不複製信義的路線。
// 沒有路線時，介面會自動隱藏路線開關、步行舒適度、導覽的路線步驟。
//
// 之後做路線：在這個資料夾放 routeData.js / routeData.en.js，匯入後填進下面的 routes / routesEn；
// 路線 id 請加專案前綴（例如 songshan-route-01），避免和其他專案的回饋統計混在一起。
//
// 松山文創園區在信義區（光復南路），共用的行道樹、綠地、都市計畫分區資料已涵蓋園區（2026-10-10 查證）。

import { BASE_DEFAULT_LAYERS } from '../defaultLayers';

export const songshan = {
  id: 'songshan',
  slug: 'songshan',
  status: 'active',
  feedbackProjectId: 'songshan',
  assetBaseUrl: '',
  // 松山文創園區（地圖在沒有路線時以此為視角）
  center: [25.0439, 121.5605],
  zoom: 16,
  routes: [],
  routesEn: {},
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
