// survey
const survey = {
  // ── 頁面外殼（SurveyPage.js）──
  'survey.page.loading': { zh: '載入問卷中…', en: 'Loading the survey…' },
  'survey.page.title': { zh: '信水義河', en: '信水義河 Waters of Xinyi' },
  // 中文標題與副標相連不用空格（CJK 慣例）；英文相連會黏成 DistrictThermal
  'survey.page.headingSep': { zh: '', en: ' — ' },
  'survey.page.subtitle': { zh: '熱舒適經驗調查', en: 'Thermal Comfort Survey' },
  'survey.page.backToMap': { zh: '回地圖', en: 'Back to map' },
  'survey.page.badge': { zh: '🌡️ 居民活動與研討會', en: '🌡️ Community workshop & conference' },
  'survey.page.heading': { zh: '信義區「體感溫度」地圖', en: 'Mapping perceived temperature in Xinyi District' },
  'survey.page.intro': {
    zh: '夏天的信義區，哪裡最熱？哪裡最涼？ 邀請您分享日常生活中的體感經驗， 地點題可以直接在地圖上點選位置作答。',
    en: 'Where in Xinyi is it hottest in summer, and where is it coolest? Share how the district feels to you day to day. For the location questions you can answer simply by tapping a spot on the map.',
  },
  'survey.page.orgFooter': { zh: '國立臺灣大學建築與城鄉研究所・信義社區大學', en: 'Graduate Institute of Building and Planning, National Taiwan University · Taipei Xinyi Community College' },
  'survey.page.privacyLink': { zh: '🛡️ 隱私聲明與資料使用說明', en: '🛡️ Privacy notice and data use' },

  // ── 地標快速跳轉（ThermalSurveyForm.js LANDMARKS，lat/lng 不譯）──
  'survey.landmark.taipei101': { zh: '台北101', en: 'Taipei 101' },
  'survey.landmark.cityHall': { zh: '市政府站', en: 'Taipei City Hall Stn' },
  'survey.landmark.xiangshan': { zh: '象山站', en: 'Xiangshan Stn' },
  'survey.landmark.yongchun': { zh: '永春站', en: 'Yongchun Stn' },
  'survey.landmark.houshanpi': { zh: '後山埤站', en: 'Houshanpi Stn' },
  'survey.landmark.liuzhangli': { zh: '六張犁站', en: 'Liuzhangli Stn' },
  'survey.landmark.wuxingSt': { zh: '吳興街', en: 'Wuxing Street' },

  // ── LocationQuestion 共用文字（Q3／Q5／Q7 共用同一顆元件）──
  'survey.location.step1': { zh: '① 先移動地圖到大概位置', en: '① First, move the map to roughly the right place' },
  'survey.location.step1Note': { zh: '（這一步只是移動畫面，還不算作答）', en: '(this only pans the view — it does not answer the question yet)' },
  'survey.location.searchPlaceholder': { zh: '或搜尋街名，例如：松高路', en: 'Or search a street name, e.g. Songgao Road' },
  'survey.location.searching': { zh: '搜尋中…', en: 'Searching…' },
  'survey.location.searchBtn': { zh: '🔍 搜尋', en: '🔍 Search' },
  'survey.location.searchMiss': {
    zh: '找不到這個地點，請換個寫法（例如加上「路」「街」），或改用上方地標按鈕。',
    en: 'No match for that place. Try phrasing it differently (adding "Road" or "Street" helps), or use the landmark buttons above.',
  },
  'survey.location.step2Before': { zh: '② 在地圖上', en: '② Now ' },
  'survey.location.step2Highlight': { zh: '點一下標記地點', en: 'tap the map to drop a pin' },
  'survey.location.step2After': { zh: '，出現圖釘才算完成這一題', en: ' — the question counts as answered once the pin appears' },
  'survey.location.mapHint': { zh: '👆 點地圖標記位置（會自動帶入地名，可再修改）', en: '👆 Tap the map to mark a spot (the place name is filled in for you, and you can edit it)' },
  'survey.location.inputGeocoding': { zh: '正在查詢地名…', en: 'Looking up the place name…' },
  'survey.location.inputPlaceholder': { zh: '也可以直接輸入街名或地標', en: 'Or just type a street name or landmark' },
  'survey.location.clearTitle': { zh: '清除地圖標記', en: 'Clear the map pin' },
  'survey.location.clearBtn': { zh: '清除標記', en: 'Clear pin' },
  'survey.location.hintGeneric': { zh: '請在地圖點選位置，或直接輸入街名、地標或附近位置', en: 'Tap a spot on the map, or type a street name, landmark or nearby place' },

  // ── Q1 關係（顯示標籤；送出值見 ThermalSurveyForm.js 的 RELATION_VALUES，不可譯）──
  'survey.q1.label': { zh: '您與信義區的關係？ ', en: 'What is your connection to Xinyi District? ' },
  'survey.q1.live': { zh: '居住', en: 'I live here' },
  'survey.q1.work': { zh: '工作', en: 'I work here' },
  'survey.q1.study': { zh: '就學', en: 'I study here' },
  'survey.q1.passBy': { zh: '經常經過', en: 'I pass through often' },
  'survey.q1.research': { zh: '研究場域', en: 'It is my research site' },
  'survey.q1.otherBtn': { zh: '其他', en: 'Other' },
  'survey.q1.otherPlaceholder': { zh: '請說明', en: 'Please describe' },

  // ── Q2 熱舒適量表 ──
  'survey.q2.label': { zh: '夏天在信義區戶外活動時，整體的熱舒適感受是？ ', en: 'Overall, how thermally comfortable does outdoor Xinyi feel to you in summer? ' },
  'survey.scale.hot': { zh: '悶熱＆難以久待', en: 'stifling, hard to linger' },
  'survey.scale.cool': { zh: '涼爽＆舒適宜人', en: 'cool and pleasant' },
  'survey.scale.hotBadge': { zh: '🥵 1 分＝', en: '🥵 1 = ' },
  'survey.scale.coolBadge': { zh: '😌 5 分＝', en: '😌 5 = ' },
  'survey.scale.moreHot': { zh: '← 愈悶熱', en: '← more stifling' },
  'survey.scale.moreCool': { zh: '愈涼爽 →', en: 'cooler →' },

  // ── Q3 最熱地點 ──
  'survey.q3.label': { zh: '信義區哪個地點或路段，讓您覺得最熱、最不舒適？', en: 'Which place or stretch of street in Xinyi feels hottest and least comfortable to you?' },
  'survey.q3.hint': {
    zh: '請在地圖點選位置，或直接輸入街名、地標，例如「松高路某段」「象山站出口一帶」',
    en: 'Tap a spot on the map, or type a street name or landmark — e.g. "a stretch of Songgao Road", "around the Xiangshan Station exit"',
  },

  // ── Q4 原因 ──
  'survey.q4.label': { zh: '為什麼那裡讓您覺得不舒適？ ', en: 'Why does it feel uncomfortable there? ' },
  'survey.q4.example': { zh: '例如：沒有路樹遮蔭、環境不通風、人潮眾多…', en: 'For example: no street trees for shade, stagnant air, heavy crowds…' },

  // ── Q5 最涼爽地點（hint 與 Q7 共用 survey.location.hintGeneric）──
  'survey.q5.label': { zh: '信義區哪個地點，讓您覺得最涼爽、最舒適？', en: 'Which place in Xinyi feels coolest and most comfortable to you?' },

  // ── Q6 原因 ──
  'survey.q6.label': { zh: '為什麼那裡讓您覺得舒適？ ', en: 'Why does it feel comfortable there? ' },
  'survey.q6.example': { zh: '例如：有公園樹蔭遮蔽、通風涼好、靠近河流圳溝…', en: 'For example: shaded by park trees, good air flow, close to a river or canal…' },

  // ── Q7 優先改善（hint 與 Q5 共用 survey.location.hintGeneric）──
  'survey.q7.label': { zh: '如果能優先改善一個地方，您希望優先改善哪裡？', en: 'If one place could be improved first, which would you choose?' },

  // ── 驗證錯誤 ──
  'survey.error.summary': { zh: '請先完成以下項目：', en: 'Please complete the following first:' },
  'survey.error.relationRequired': { zh: '請選擇您與信義區的關係', en: 'Please choose your connection to Xinyi District' },
  'survey.error.otherRequired': { zh: '請填寫「其他」的內容', en: 'Please fill in the "Other" field' },
  'survey.error.comfortRequired': { zh: '請選擇整體熱舒適感受（1–5）', en: 'Please rate your overall thermal comfort (1–5)' },
  'survey.error.hotPlaceRequired': { zh: '請填寫或在地圖點選「最熱、最不舒適」的地點', en: 'Please type or tap the place that feels hottest and least comfortable' },
  'survey.error.hotWhyRequired': { zh: '請填寫那裡讓您不舒適的原因', en: 'Please say why it feels uncomfortable there' },
  'survey.error.coolPlaceRequired': { zh: '請填寫或在地圖點選「最涼爽、最舒適」的地點', en: 'Please type or tap the place that feels coolest and most comfortable' },
  'survey.error.coolWhyRequired': { zh: '請填寫那裡讓您舒適的原因', en: 'Please say why it feels comfortable there' },
  'survey.error.improvePlaceRequired': { zh: '請填寫或在地圖點選「希望優先改善」的地點', en: 'Please type or tap the place you would improve first' },
  'survey.error.submitFailed': {
    zh: '送出失敗，請再試一次；若持續失敗，請點最下方連結改用 Google 表單填寫（您剛才的答案仍保留在此頁）。',
    en: 'Submission failed — please try again. If it keeps failing, use the Google Form link at the bottom instead (your answers are still here on this page).',
  },
  'survey.error.networkFailed': {
    zh: '送出時發生網路問題，請再試一次；若持續失敗，請點最下方連結改用 Google 表單填寫。',
    en: 'A network problem interrupted the submission — please try again. If it keeps failing, use the Google Form link at the bottom instead.',
  },

  // ── 送出 ──
  'survey.submit.sending': { zh: '送出中…', en: 'Sending…' },
  'survey.submit.button': { zh: '🌡️ 送出問卷', en: '🌡️ Submit survey' },
  'survey.footer.note': { zh: '回覆將直接存入信義社大的調查表單。若送出遇到問題，', en: 'Responses go directly into Taipei Xinyi Community College’s survey form. If you hit a problem submitting, ' },
  'survey.footer.linkText': { zh: '也可以改用 Google 表單填寫', en: 'you can use the Google Form instead' },

  // ── 送出成功 ──
  'survey.success.title': { zh: '感謝您的填答！', en: 'Thank you for taking part.' },
  'survey.success.body': {
    zh: '您的熱舒適經驗已成功送出，將協助我們描繪信義區的「體感溫度」地圖， 作為社區環境改善的重要參考。',
    en: 'Your responses have been submitted. They will help us map how Xinyi District actually feels, which in turn informs how the neighbourhood environment is improved.',
  },
  'survey.success.backLink': { zh: '回到水文地圖', en: 'Back to the water map' },
};

export default survey;
