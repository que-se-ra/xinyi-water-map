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
  // 熱舒適問卷：2026-10-24 從信水義河複製一份（/songshan/survey）。共用同一份 Google 表單，
  // 回覆以地點答案前的【松菸】標註區分（見 src/lib/survey-tags.js）；題目文字見下方 copy 的 survey.*。
  features: { survey: true },
  survey: {
    center: [25.0438, 121.5605],
    zoom: 17,
    // 地標快跳：用路線站點（10/15 實地 GPX 座標）
    landmarks: [
      { id: 'ssBaroque', lat: 25.04366, lng: 121.56057 },
      { id: 'ssHub', lat: 25.04366, lng: 121.55919 },
      { id: 'ssCreative', lat: 25.04423, lng: 121.55919 },
      { id: 'ssSweetgum', lat: 25.04321, lng: 121.56141 },
      { id: 'ssFarm', lat: 25.04423, lng: 121.56232 },
    ],
    // 搜尋時優先找園區一帶（minLon,maxLat,maxLon,minLat）
    viewbox: '121.552,25.050,121.570,25.037',
    // 這裡沒有人居住或就學，依參加者與松菸的連結強弱設計選項：
    relations: [
      { value: '在園區工作', labelKey: 'survey.q1.songshan.work' },
      { value: '經常造訪（散步、休閒）', labelKey: 'survey.q1.songshan.frequent' },
      { value: '偶爾來訪（看展、活動、市集）', labelKey: 'survey.q1.songshan.occasional' },
      { value: '初次造訪（第一次來）', labelKey: 'survey.q1.songshan.firstTime' },
      { value: '經常經過（周邊通勤）', labelKey: 'survey.q1.songshan.passBy' },
      { value: '研究場域／活動合作', labelKey: 'survey.q1.songshan.research' },
    ],
  },
  ui: { tabs: ['map', 'layers', 'changelog'], landingCards: false, routeArrows: true },
  // 首頁（進入地圖前）的園區介紹：文字由松山文創園區提供，需標註出處（2026-10-27）
  landingIntro: {
    zh: {
      title: '松山文創園區',
      paragraphs: [
        '從1937年(民國26年)日據時期的「臺灣總督府專賣局松山菸草工廠」，光復後由公賣局接手更名的「臺灣菸酒公賣局松山菸廠」，專門製造捲菸、雪茄等菸草製品。',
        '松山菸廠在1998年停止生產、併入臺北菸廠後正式走入歷史，再到2001年由臺北市政府指定為第99處市定古蹟後所定名的「松山文創園區」，這塊曾經是臺灣第一座現代化的捲菸工廠，替臺灣創造了相當高的經濟產值的地方，在2011年11月15日正式對外開放後，搖身一變，成為了臺灣原創發展基地。',
        '松山菸廠早期在規劃時，就用「工業村」的概念去規劃，不只考量生產動線，也加入了員工福祉與需求，還保留了大片的開放空間修築庭園，可以說是當時工業廠房建築的創舉。',
        '在建築風格方面屬於「日本初現代主義」作品，強調水平視線，形式簡潔典雅、做工精細，堪稱當時工業廠房之楷模。',
        '鍋爐房、機械修理場、製菸工廠、工作作業場於1939年完工，並於10月間開始開工生產捲菸，初期員工約1200人。1940年完成辦公廳及檢查室，全廠區共費時3年3個月全面完工。',
      ],
      credit: '文字：松山文創園區提供',
    },
    en: {
      title: 'Songshan Cultural and Creative Park',
      paragraphs: [
        'The park began in 1937, under Japanese rule, as the Songshan Tobacco Factory of the Taiwan Governor-General Monopoly Bureau. After 1945 the Monopoly Bureau took it over and renamed it the Songshan Tobacco Factory of the Taiwan Provincial Monopoly Bureau, making cigarettes, cigars and other tobacco products.',
        "Production stopped in 1998, when the factory was merged into the Taipei Cigarette Factory. In 2001 the Taipei City Government designated the site its 99th municipal historic site, and it was named Songshan Cultural and Creative Park. Once Taiwan's first modern cigarette factory, and a major contributor to the economy, it opened to the public on 15 November 2011 and became a base for original creative work in Taiwan.",
        'From the beginning the factory was planned as an "industrial village": beyond the flow of production, it catered for the welfare and needs of its staff and kept large open spaces for gardens, a pioneering approach for factory buildings of its time.',
        'Its architecture belongs to early Japanese Modernism, with an emphasis on horizontal lines, simple and elegant forms and fine workmanship, a model for the industrial buildings of the period.',
        'The boiler room, machine repair shop, cigarette factory and workshops were completed in 1939, and cigarette production began that October with about 1,200 staff. The office building and inspection rooms followed in 1940; the whole site took three years and three months to complete.',
      ],
      credit: 'Text courtesy of Songshan Cultural and Creative Park',
    },
  },
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
      survey: {
        title: '熱舒適經驗調查 — 城市裡的微氣候觀察',
        description: '松山文創園區「體感溫度」地圖：分享園區裡你覺得熱／涼的地點，一起描繪園區的熱舒適地圖。',
      },
    },
    en: {
      title: 'Urban Microclimate Observation | Interactive Mapping Workshop',
      description:
        'An interactive mapping workshop with Songshan Cultural and Creative Park. Overlay historical maps, satellite imagery and open data to observe the microclimate of the city.',
      keywords:
        'microclimate, Songshan Cultural and Creative Park, interactive map, workshop, historical maps, satellite imagery, Taipei',
      ogDescription: 'An interactive mapping workshop with Songshan Cultural and Creative Park',
      survey: {
        title: 'Thermal Comfort Survey — Urban Microclimate Observation',
        description:
          'A perceived-temperature map of Songshan Cultural and Creative Park: mark the places in the park that feel hot or cool to you and help draw its thermal comfort map.',
      },
    },
  },
  // 覆寫全站字典中信義專屬的字串（只列這個專案用得到、且不適用的）。
  copy: {
    zh: {
      // 熱舒適問卷：題目沿用信水義河，地名改成松山文創園區
      'survey.page.title': '城市裡的微氣候觀察',
      'survey.page.badge': '🌡️ 互動地圖工作坊',
      'survey.page.heading': '松山文創園區「體感溫度」地圖',
      'survey.page.intro': '在松山文創園區，哪裡最熱？哪裡最涼？ 邀請您分享在園區裡的體感經驗， 地點題可以直接在地圖上點選位置作答。',
      'survey.location.searchPlaceholder': '或搜尋地點，例如：巴洛克花園',
      'survey.q1.label': '您與松山文創園區的關係？ ',
      'survey.q1.songshan.work': '在園區工作',
      'survey.q1.songshan.frequent': '經常造訪（散步、運動、休閒）',
      'survey.q1.songshan.occasional': '偶爾來訪（看展覽、逛市集、參加活動）',
      'survey.q1.songshan.firstTime': '初次造訪（第一次來松菸）',
      'survey.q1.songshan.passBy': '經常經過（周邊通勤路過）',
      'survey.q1.songshan.research': '研究場域／活動合作',
      'survey.q2.label': '在松山文創園區戶外活動時，整體的熱舒適感受是？ ',
      'survey.q3.label': '松山文創園區哪個地點或路段，讓您覺得最熱、最不舒適？',
      'survey.q3.hint': '請在地圖點選位置，或直接輸入地點，例如「楓香大道」「文創大街靠農園那段」',
      'survey.q4.example': '例如：缺乏樹蔭或遮陽設施、水泥鋪面日曬吸熱、通風不良、冷氣室外機排熱…',
      'survey.q5.label': '松山文創園區哪個地點，讓您覺得最涼爽、最舒適？',
      'survey.q6.example': '例如：有大樹綠蔭遮蔽、草地旁涼爽、靠近生態池水體、古蹟建築迴廊通風…',
      'survey.error.relationRequired': '請選擇您與松山文創園區的關係',
      'survey.success.body': '您的熱舒適經驗已成功送出，將協助我們描繪松山文創園區的「體感溫度」地圖， 作為改善園區環境的參考。',
      'site.title': '城市裡的微氣候觀察',
      'map.route.line1': '路線一：巴洛克花園 → 楓香大道 → 松山匯 → 文創大街 → 新仁里農園',
      'map.route.line2': '路線二：松山匯 → 楓香大道 → 巴洛克花園 → 文創大街 → 新仁里農園',
      'tour.routes.title': '🚶 走讀路線',
      'tour.routes.body': '包含兩條不同顏色的走讀路線。您可以勾選來顯示或隱藏路線，或點擊地圖上的站點標記查看站點資訊。也可利用全選/全清按鈕快速切換。',
      'layersTab.routes.intro': '兩條走讀路線：',
      'layersTab.routes.r1.name': '巴洛克花園 → 楓香大道 → 松山匯 → 文創大街 → 新仁里農園',
      'layersTab.routes.r2.name': '松山匯 → 楓香大道 → 巴洛克花園 → 文創大街 → 新仁里農園',
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
      // Thermal comfort survey: same questions as Waters of Xinyi, with the place changed to the park
      'survey.page.title': 'Urban Microclimate Observation',
      'survey.page.badge': '🌡️ Interactive mapping workshop',
      'survey.page.heading': 'Mapping perceived temperature in Songshan Cultural and Creative Park',
      'survey.page.intro': 'Where in Songshan Cultural and Creative Park is it hottest, and where is it coolest? Share how the park feels to you. For the location questions you can answer simply by tapping a spot on the map.',
      'survey.location.searchPlaceholder': 'Or search a place, e.g. Baroque Garden',
      'survey.q1.label': 'What is your connection to Songshan Cultural and Creative Park? ',
      'survey.q1.songshan.work': 'Working in the park',
      'survey.q1.songshan.frequent': 'Frequent visitor (walking, leisure)',
      'survey.q1.songshan.occasional': 'Occasional visitor (exhibitions, events, markets)',
      'survey.q1.songshan.firstTime': 'First-time visitor',
      'survey.q1.songshan.passBy': 'Passing through (commute / nearby)',
      'survey.q1.songshan.research': 'Research or collaboration',
      'survey.q2.label': 'Overall, how thermally comfortable does the park feel outdoors? ',
      'survey.q3.label': 'Which place or stretch in the park feels hottest and least comfortable to you?',
      'survey.q3.hint': 'Tap a spot on the map, or type a place — e.g. "Sweetgum Avenue", "the end of Creative Street near the farm"',
      'survey.q4.example': 'For example: lack of tree shade or shelter, paved surfaces absorbing heat, poor air circulation, AC exhaust heat…',
      'survey.q5.label': 'Which place in the park feels coolest and most comfortable to you?',
      'survey.q6.example': 'For example: dense tree canopy shade, cool grassy spots, near the eco-pond, breezy heritage building corridors…',
      'survey.error.relationRequired': 'Please choose your connection to the park',
      'survey.success.body': 'Your responses have been submitted. They will help us map how Songshan Cultural and Creative Park actually feels, as a reference for improving the park environment.',
      'site.title': 'Urban Microclimate Observation',
      'map.route.line1': 'Route 1: Baroque Garden → Sweetgum Avenue → Songshan Hub → Creative Street → Xinren Village Farm',
      'map.route.line2': 'Route 2: Songshan Hub → Sweetgum Avenue → Baroque Garden → Creative Street → Xinren Village Farm',
      'tour.routes.title': '🚶 Walking routes',
      'tour.routes.body':
        'There are two walking routes, each in a different colour. Tick a route to show or hide it, or tap a stop marker on the map to read about the stop. Use the select-all / clear-all buttons to switch quickly.',
      'layersTab.routes.intro': 'Two walking routes:',
      'layersTab.routes.r1.name': 'Baroque Garden → Sweetgum Avenue → Songshan Hub → Creative Street → Xinren Village Farm',
      'layersTab.routes.r2.name': 'Songshan Hub → Sweetgum Avenue → Baroque Garden → Creative Street → Xinren Village Farm',
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
