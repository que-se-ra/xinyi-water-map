// 「台大校園熱舒適走讀」專案設定。
//
// 目前狀態（2026-10-20）：只開基礎圖層，尚無路線（routeData.js 為空陣列）。
// 共用的古今地圖（1904／1921／1939／1944／1989）與衛星影像（Esri、Sentinel-2 真彩色／NDVI／濕度）
// 不需要在這裡另外設定，所有專案自動共用；五張古地圖的圖磚已實測涵蓋台大校園（2026-10-20）。
// 行道樹、人行道、綠地、都市計畫分區等開放資料是否涵蓋大安區校園，尚未查證。
//
// 英文名稱為暫譯，待使用者確認。

import { BASE_DEFAULT_LAYERS } from '../defaultLayers';
import { routes } from './routeData';
import { routesEn } from './routeData.en';

export const ntu = {
  id: 'ntu',
  slug: 'ntu',
  status: 'active',
  feedbackProjectId: 'ntu',
  assetBaseUrl: '',
  // 台大校總區椰林大道一帶（地圖在沒有路線時以此為視角）
  center: [25.017, 121.5395],
  zoom: 16,
  routes,
  routesEn,
  // 信義的 route-0.. 路線說明不適用，加前綴讓它找不到資料（就不顯示）
  tooltipPrefix: 'ntu-',
  defaultLayers: BASE_DEFAULT_LAYERS,
  // 沒有專屬問卷；側欄先只留地圖與圖層說明（水文調查表單、歷史故事是信義專屬內容）
  features: { survey: false },
  ui: { tabs: ['map', 'layers', 'changelog'], landingCards: false },
  reportSummary: {
    org: '「台大校園熱舒適走讀」',
    area: '臺灣大學校園環境',
  },
  card: {
    zh: {
      name: '台大校園熱舒適走讀',
      subtitle: '',
      partner: '國立臺灣大學',
      summary: '在臺大校園走讀，觀察校園裡的熱舒適與微氣候。',
    },
    en: {
      // 暫譯，待使用者確認
      name: 'NTU Campus Thermal Comfort Walk',
      subtitle: '',
      partner: 'National Taiwan University',
      summary: 'A walking tour of the National Taiwan University campus, observing thermal comfort and microclimate.',
    },
  },
  meta: {
    zh: {
      title: '台大校園熱舒適走讀',
      description: '臺大校園熱舒適走讀互動地圖。疊合古今地圖、衛星影像與開放資料，觀察校園裡的熱舒適與微氣候。',
      keywords: '熱舒適,微氣候,臺灣大學,台大校園,走讀,互動地圖,古今地圖,衛星影像,台北',
      ogDescription: '臺大校園熱舒適走讀互動地圖',
    },
    en: {
      title: 'NTU Campus Thermal Comfort Walk',
      description:
        'An interactive map for a thermal comfort walk on the National Taiwan University campus. Overlay historical maps, satellite imagery and open data to observe thermal comfort and microclimate on campus.',
      keywords:
        'thermal comfort, microclimate, National Taiwan University, NTU campus, walking tour, interactive map, historical maps, satellite imagery, Taipei',
      ogDescription: 'An interactive map for a thermal comfort walk on the NTU campus',
    },
  },
  // 覆寫全站字典中信義專屬的字串（只列這個專案用得到、且不適用的）。
  copy: {
    zh: {
      'site.title': '台大校園熱舒適走讀',
      'site.tagline': '互動地圖',
      'org.badge': '國立臺灣大學',
      'org.full': '國立臺灣大學',
      'landing.tagline': '互動地圖 · 臺大校園',
      'landing.ctaMap': '開啟互動地圖',
      'tour.welcome.title': '歡迎使用「台大校園熱舒適走讀」互動地圖！',
      'tour.welcome.body': '您可以疊合古今地圖、衛星影像與開放資料，觀察臺大校園的熱舒適與微氣候。',
      'changelog.subtitle': '互動地圖 · 版本歷史紀錄',
      'layersTab.hist.intro': '展示不同時期的歷史地圖，追蹤校園一帶的變遷：',
      'layersTab.hist.noteBody': '透過比較不同時期的地圖，可以看出校園一帶的土地與水路如何隨時間改變。',
      'layersTab.open.green.desc': '公園、草地、樹林等面狀綠地，補足行道樹資料未涵蓋的區域',
      'layersTab.open.zoning.desc': '都市計畫分區',
      'layersTab.temp.body': '實時溫度分布圖，顯示熱島效應與溫度變化。',
    },
    en: {
      'site.title': 'NTU Campus Thermal Comfort Walk',
      'site.tagline': 'Interactive Map',
      'org.badge': 'National Taiwan University',
      'org.full': 'National Taiwan University',
      'landing.tagline': 'Interactive map · NTU campus',
      'landing.ctaMap': 'Open the interactive map',
      'tour.welcome.title': 'Welcome to the "NTU Campus Thermal Comfort Walk" interactive map!',
      'tour.welcome.body':
        'Overlay historical maps, satellite imagery and open data to observe thermal comfort and microclimate on the National Taiwan University campus.',
      'changelog.subtitle': 'Interactive Map · Version history',
      'layersTab.hist.intro': 'Historical maps from different periods, for tracing how the campus area has changed:',
      'layersTab.hist.noteBody':
        'By comparing maps from different periods you can see how the land and waterways around the campus have changed over time.',
      'layersTab.open.green.desc': 'Area-based green space such as parks, grass and woodland, filling gaps in the street-tree data',
      'layersTab.open.zoning.desc': 'Urban planning zones',
      'layersTab.temp.body': 'A live temperature distribution map showing the urban heat island effect and temperature variation.',
    },
  },
};
