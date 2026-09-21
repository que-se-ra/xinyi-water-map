// common —— 跨頁共用：頁首、側欄導覽、機構署名、共用按鈕。
// zh 值必須與原檔一字不差。英文拼法用英式（見 scratchpad/ui-terminology.md）。
const common = {
  // 站名保留中文字標，英文只作副標——「信義」拆開包住「水河」的雙關直譯必失。
  'site.title': { zh: '信水義河', en: '信水義河' },
  'site.titleEn': { zh: 'Waters of Xinyi', en: 'Waters of Xinyi' },
  'site.tagline': { zh: '信義社大 水文導覽地圖', en: 'Waters of Xinyi' },
  'site.signature': {
    zh: '信水義河 · 臺大城鄉所 × 信義社大',
    en: '信水義河 Waters of Xinyi · NTU GIBP × Xinyi Community College',
  },

  'org.badge': {
    zh: '臺大城鄉所「智慧城市與數位民主」× 信義社區大學',
    en: 'NTU GIBP — "Smart City and Digital Democracy" × Taipei Xinyi Community College',
  },
  'org.full': {
    zh: '國立臺灣大學建築與城鄉研究所・信義社區大學',
    en: 'Graduate Institute of Building and Planning, National Taiwan University · Taipei Xinyi Community College',
  },

  'header.toggleMenu': { zh: '切換選單', en: 'Toggle menu' },
  'header.surveyTitle': { zh: '信義區熱舒適經驗調查', en: 'Thermal comfort survey, Xinyi District' },
  'header.survey': { zh: '熱舒適問卷', en: 'Comfort survey' },
  'header.surveyShort': { zh: '問卷', en: 'Survey' },
  'header.privacy': { zh: '隱私聲明', en: 'Privacy' },
  'header.home': { zh: '首頁', en: 'Home' },

  'nav.map': { zh: '地圖', en: 'Map' },
  'nav.mapTitle': { zh: '地圖 (Map)', en: 'Map' },
  'nav.layers': { zh: '圖層說明', en: 'Layer guide' },
  'nav.layersTitle': { zh: '圖層說明 (Layers)', en: 'Layer guide' },
  'nav.form': { zh: '回饋表單', en: 'Feedback' },
  'nav.formTitle': { zh: '回饋表單 (Feedback)', en: 'Feedback' },
  'nav.history': { zh: '歷史故事', en: 'History' },
  'nav.historyTitle': { zh: '歷史故事 (History)', en: 'History' },
  'nav.changelog': { zh: '更新日誌', en: 'Changelog' },
  'nav.changelogTitle': { zh: '查看版本更新日誌', en: 'View the version changelog' },

  'nav.fontSize': { zh: '字體大小', en: 'Text size' },
  'nav.fontSmall': { zh: '小', en: 'Small' },
  'nav.fontMedium': { zh: '中', en: 'Medium' },
  'nav.fontLarge': { zh: '大', en: 'Large' },

  'common.backToMap': { zh: '返回地圖', en: 'Back to map' },
  'common.backToMapArrow': { zh: '返回地圖 →', en: 'Back to map →' },
  'common.exploreMap': { zh: '探索地圖', en: 'Explore the map' },
  'common.close': { zh: '關閉', en: 'Close' },
  'common.loadingMap': { zh: '載入地圖中…', en: 'Loading map…' },
  'common.loadingForm': { zh: '載入表單中...', en: 'Loading form...' },
  'common.privacyLink': { zh: '🛡️ 隱私聲明與資料使用說明', en: '🛡️ Privacy notice and data use' },
};

export default common;
