// 「城市裡的微氣候觀察｜互動地圖工作坊」（與松山文創園區合作）。
// 目前只有佔位：沒有路線、沒有地圖內容（2026-10-10 說明「先不用做」）。
// 之後要做時：在這個資料夾放 routeData.js / routeData.en.js、把 status 改成 'active'、
// 補上 meta 與 defaultLayers，並把路線 id 加專案前綴（例如 songshan-route-01）避免與其他專案的回饋統計混在一起。

export const songshan = {
  id: 'songshan',
  slug: 'songshan',
  status: 'coming-soon',
  feedbackProjectId: 'songshan',
  assetBaseUrl: '',
  // 松山文創園區附近的後備視角（尚未使用，專案啟用時再確認）
  center: [25.0436, 121.5604],
  zoom: 15,
  routes: [],
  routesEn: {},
  features: { survey: false },
  card: {
    zh: {
      name: '城市裡的微氣候觀察｜互動地圖工作坊',
      subtitle: '',
      partner: '松山文創園區',
      summary: '',
    },
    en: {
      // 暫譯，待使用者確認
      name: 'Urban Microclimate Observation | Interactive Mapping Workshop',
      subtitle: '',
      partner: 'Songshan Cultural and Creative Park',
      summary: '',
    },
  },
};
