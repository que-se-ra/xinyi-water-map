// map
const map = {
  'map.route.line1': {
    zh: '路線一：瑠公圳水泱泱',
    en: 'Route 1: Liu-kong-tsun Canal',
  },
  'map.route.line2': {
    zh: '路線二：信義之源 陂水之觀',
    en: 'Route 2: The Source of Xinyi',
  },
  'map.route.line3': {
    zh: '路線三：錫口 五分埔支線',
    en: 'Route 3: Wufenpu Branch Line',
  },
  'map.route.line4': {
    zh: '路線四：東西神 三大排水系',
    en: 'Route 4: The Three Main Drains',
  },
  'map.control.am': {
    zh: '上午',
    en: 'AM',
  },
  'map.control.pm': {
    zh: '下午',
    en: 'PM',
  },
  'map.control.locateErrorHttps': {
    zh: '📡 定位需要 HTTPS 連線。請使用正式網址（https://）開啟本網站。',
    en: '📡 Location access requires HTTPS. Please open this site over https://.',
  },
  'map.control.locateErrorDenied': {
    zh: '🔒 位置存取被拒絕。請在 Safari 設定 → 網站 → 位置 中允許本網站存取。',
    en: '🔒 Location access was denied. In Safari, allow it under Settings → Websites → Location.',
  },
  'map.control.locateErrorUnsupported': {
    zh: '⚠️ 您的瀏覽器不支援定位功能。',
    en: '⚠️ Your browser does not support geolocation.',
  },
  'map.control.locateErrorOutside': {
    zh: '📍 您目前不在台北一帶，地圖維持在信義區，方便您瀏覽路線與圖層。',
    en: '📍 You appear to be outside the Taipei area, so the map stays on Xinyi District where the routes and layers are.',
  },
  'map.control.locateErrorFailed': {
    zh: '⚠️ 無法取得位置，請稍後再試。',
    en: '⚠️ Could not get your location. Please try again shortly.',
  },
  'map.popup.reportBadge': {
    zh: '⚠️ 環境通報',
    en: '⚠️ Environmental report',
  },
  'map.popup.communityBadge': {
    zh: '👥 社群走讀地標',
    en: '👥 Community landmark',
  },
  'map.popup.aiBadge': {
    zh: '✨ AI 輔助潤飾',
    en: '✨ AI-assisted edit',
  },
  'map.popup.surveyTime': {
    zh: '踏查時間：',
    en: 'Surveyed: ',
  },
  'map.popup.aiBadgeFullLabel': {
    zh: 'AI 輔助潤飾（本段文字經 AI 協助生成）：',
    en: 'AI-assisted edit (this passage was drafted with AI help):',
  },
  'map.control.togglePanel': {
    zh: '切換圖層面板',
    en: 'Toggle layer panel',
  },
  'map.control.closePanel': {
    zh: '✕ 關閉',
    en: '✕ Close',
  },
  'map.control.panelTitle': {
    zh: '圖層控制',
    en: 'Layers',
  },
  'map.control.addMarkerModeOn': {
    zh: '點擊地圖新增標記 (點此取消)',
    en: 'Tap the map to add a marker (tap here to cancel)',
  },
  'map.control.addMarkerModeOff': {
    zh: '自由新增地景標記',
    en: 'Add a landscape marker',
  },
  'map.control.selectAll': {
    zh: '全選',
    en: 'All on',
  },
  'map.control.clearAll': {
    zh: '全清',
    en: 'All off',
  },
  'map.control.comfortToggle': {
    zh: '步行舒適度檢視',
    en: 'Walking comfort view',
  },
  'map.control.comfortLoading': {
    zh: '評分統計載入中...',
    en: 'Loading ratings…',
  },
  'map.control.comfortLegendIntro': {
    zh: '路線依民眾評分平均上色（每 0.5 分一階）：',
    en: 'Routes are coloured by average public rating, in steps of 0.5:',
  },
  'map.control.comfortScaleWorst': {
    zh: '1.0 差',
    en: '1.0 poor',
  },
  'map.control.comfortScaleBest': {
    zh: '5.0 極佳',
    en: '5.0 excellent',
  },
  'map.control.noRatingLabel': {
    zh: '無評分',
    en: 'No rating',
  },
  'map.control.comfortHint': {
    zh: '點擊路線可查看各項平均分與評分。',
    en: 'Tap a route to see its average scores and ratings.',
  },
  'map.control.adminOnlyBadge': {
    zh: '後台專用',
    en: 'Admin only',
  },
  'map.control.surveyPointsTitle': {
    zh: '熱舒適問卷地點',
    en: 'Thermal comfort survey points',
  },
  'map.control.communityFeedbackLabel': {
    zh: '🧡 民眾走讀回饋',
    en: '🧡 Community feedback',
  },
  'map.control.treesLabel': {
    zh: '🌳 行道樹遮蔭',
    en: '🌳 Street tree shade',
  },
  'map.control.greenLabel': {
    zh: '🌲 公園綠地與樹林',
    en: '🌲 Parks and woodland',
  },
  'map.control.sidewalksLabel': {
    zh: '🚶 人行道範圍',
    en: '🚶 Pavement extent',
  },
  'map.control.zoningLabel': {
    zh: '🏘️ 都市計畫分區',
    en: '🏘️ Urban planning zones',
  },
  'map.control.shademapLabel': {
    zh: '☀️ 即時日照陰影',
    en: '☀️ Live sun and shadow',
  },
  'map.control.nowTimeButton': {
    zh: '🔄 目前時間',
    en: '🔄 Now',
  },
  'map.control.shadowDepth': {
    zh: '陰影深度',
    en: 'Shadow depth',
  },
  'map.control.shademapLoading': {
    zh: '正在載入建築輪廓…',
    en: 'Loading building footprints…',
  },
  'map.control.shademapRetrying': {
    zh: '⏳ 圖資伺服器沒有回應，正在重試…',
    en: '⏳ The map data server is not responding. Retrying…',
  },
  'map.control.shademapError': {
    zh: '⚠️ 建築圖資載入失敗，請稍後移動地圖重試。',
    en: '⚠️ Could not load building data. Pan the map shortly to retry.',
  },
  'map.control.shademapZoom': {
    zh: '🔍 請再放大地圖，才會顯示建築陰影。',
    en: '🔍 Zoom in further to see building shadows.',
  },
  'map.control.shademapTreesHint': {
    zh: '🌳 勾選「行道樹遮蔭」可同時顯示樹冠 3D 陰影',
    en: '🌳 Switch on "Street tree shade" to add 3D tree-canopy shadows',
  },
  'map.control.shademapHeightNote': {
    zh: 'ℹ️ 建築高度取自 OpenStreetMap 標註；未標註者以 12 公尺（約 4 層樓）估算，陰影長度僅供參考。',
    en: 'ℹ️ Building heights come from OpenStreetMap. Where none is tagged, 12 metres (about four storeys) is assumed, so shadow lengths are indicative only.',
  },
  'map.legend.stationCount': {
    zh: '共 {n} 個站點 ・點擊站點查看詳情',
    en: '{n} stops · tap a stop for details',
  },
  'map.control.locateButtonTitle': {
    zh: '取得目前位置',
    en: 'Find my location',
  },
  'map.control.usageGuideTitle': {
    zh: '使用方法 (How to Use)',
    en: 'How to use',
  },
  'map.control.usageGuideLabel': {
    zh: '❓ 使用方法',
    en: '❓ How to use',
  },
};

export default map;
