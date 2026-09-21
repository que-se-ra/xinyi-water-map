// forms
// NodeFeedbackForm（站點回饋）與 RouteFeedbackForm（路線舒適度評分）共用字典。
//
// 注意：MEMORY_TAGS / REPORT_TAGS（NodeFeedbackForm）與 selectedTags 會原樣送進
// /api/feedback-node 的 payload.tags；FEEDBACK_TYPES 的 label/hint 與 SCORES 的
// label 只用於顯示、不會送出，故已在元件內轉成 labelKey/hintKey 形式改走 t()。
// forms.node.tag.* 的 zh 值＝送出的中文常數本身，元件端仍用原字串做識別/送出，
// 這裡的 key 只負責「顯示」那一份，兩者已在元件內分離（見 NodeFeedbackForm.js）。
const forms = {
  // ── node: 回饋性質 ──
  'forms.node.type.label': {
    zh: '回饋性質',
    en: 'Type of feedback',
  },
  'forms.node.type.memory.label': {
    zh: '📖 地方記憶',
    en: '📖 Local memory',
  },
  'forms.node.type.memory.hint': {
    zh: '分享這裡的故事與觀察',
    en: 'Share a story or an observation about this place',
  },
  'forms.node.type.report.label': {
    zh: '⚠️ 環境通報',
    en: '⚠️ Environmental report',
  },
  'forms.node.type.report.hint': {
    zh: '回報積水、異味等環境問題',
    en: 'Report flooding, odours and other environmental problems',
  },

  // ── node: 標籤（顯示用；送出仍用元件內原中文常數） ──
  'forms.node.tags.label.report': {
    zh: '通報類型 (可複選)',
    en: 'Report type (choose any)',
  },
  'forms.node.tags.label.memory': {
    zh: '地景標籤 (可複選)',
    en: 'Landscape tags (choose any)',
  },
  'forms.node.tag.memory.history': {
    zh: '歷史',
    en: 'History',
  },
  'forms.node.tag.memory.water': {
    zh: '水源',
    en: 'Water source',
  },
  'forms.node.tag.memory.ecology': {
    zh: '生態',
    en: 'Ecology',
  },
  'forms.node.tag.memory.smell': {
    zh: '氣味',
    en: 'Smell',
  },
  'forms.node.tag.memory.landscape': {
    zh: '地景',
    en: 'Landscape',
  },
  'forms.node.tag.memory.roadCondition': {
    zh: '路況實境',
    en: 'Road conditions',
  },
  'forms.node.tag.memory.thermal': {
    zh: '熱成像',
    en: 'Thermal imaging',
  },
  'forms.node.tag.other': {
    zh: '其他',
    en: 'Other',
  },
  'forms.node.tag.report.flooding': {
    zh: '積水',
    en: 'Flooding',
  },
  'forms.node.tag.report.odor': {
    zh: '異味',
    en: 'Odour',
  },
  'forms.node.tag.report.pollution': {
    zh: '疑似污染排放',
    en: 'Suspected pollution discharge',
  },
  'forms.node.tag.report.noShade': {
    zh: '缺遮蔭',
    en: 'No shade',
  },
  'forms.node.tag.report.litter': {
    zh: '垃圾堆積',
    en: 'Litter build-up',
  },

  // ── node: 標題 ──
  'forms.node.title.defaultStation': {
    zh: '新增地景標記',
    en: 'Add a landscape marker',
  },
  'forms.node.title.suffix': {
    zh: '提供回饋',
    en: '— leave feedback',
  },

  // ── node: 描述欄 ──
  'forms.node.desc.labelReport': {
    zh: '現場觀察描述',
    en: 'What you observed on site',
  },
  'forms.node.desc.labelMemory': {
    zh: '您的記憶與故事',
    en: 'Your memory or story',
  },
  'forms.node.desc.placeholderReport': {
    zh: '請描述您觀察到的環境問題（位置、範圍、發生時間等）',
    en: 'Describe the environmental problem you saw — where it is, how large, when it happens.',
  },
  'forms.node.desc.placeholderMemoryVoice': {
    zh: '這裡有什麼特別的回憶嗎？（可點擊上方「語音輸入」用語音說故事喔！）',
    en: 'Any particular memory of this place? (You can tap "Voice input" above and tell it out loud.)',
  },
  'forms.node.desc.placeholderMemory': {
    zh: '這裡有什麼特別的回憶嗎？',
    en: 'Any particular memory of this place?',
  },

  // ── node: 語音輸入 ──
  'forms.node.voice.titleStart': {
    zh: '用語音說故事',
    en: 'Tell your story by voice',
  },
  'forms.node.voice.listening': {
    zh: '聆聽中...',
    en: 'Listening…',
  },
  'forms.node.voice.inputButton': {
    zh: '語音輸入',
    en: 'Voice input',
  },
  'forms.node.voice.httpsRequiredTitle': {
    zh: '語音輸入需要 HTTPS 連線（正式網址）才能使用',
    en: 'Voice input needs an HTTPS connection (the live site address)',
  },
  'forms.node.voice.httpsRequiredLabel': {
    zh: '語音輸入（需 HTTPS）',
    en: 'Voice input (HTTPS required)',
  },
  'forms.node.voice.listeningPrompt': {
    zh: '語音聆聽中...請對麥克風說話',
    en: 'Listening… speak into the microphone',
  },
  'forms.node.voice.stopButton': {
    zh: '說完了，點擊停止 ⏹️',
    en: 'Done — tap to stop ⏹️',
  },

  // ── node: AI 潤飾／摘要 ──
  'forms.node.ai.polishedBadge': {
    zh: '✨ AI 已潤飾',
    en: '✨ Edited with AI',
  },
  'forms.node.ai.polishTitle': {
    zh: '使用 Gemini AI 潤飾並整理故事',
    en: 'Use Gemini AI to tidy up and edit the story',
  },
  'forms.node.ai.polishButton': {
    zh: 'AI 潤飾',
    en: 'AI edit',
  },
  'forms.node.ai.cardTitle': {
    zh: '✨ Gemini AI 智慧地景故事潤飾',
    en: '✨ Gemini AI landscape-story editing',
  },
  'forms.node.ai.thinking': {
    zh: 'AI 正在斟酌字句中...',
    en: 'The AI is working on the wording…',
  },
  'forms.node.ai.applyButton': {
    zh: '套用 (覆蓋原文)',
    en: 'Apply (replaces your text)',
  },
  'forms.node.ai.keepButton': {
    zh: '保留，與原文一同送出',
    en: 'Keep both and submit together',
  },
  'forms.node.ai.summarizeErrorWithDetail': {
    zh: '{error} (詳細原因：{detail})',
    en: '{error} (details: {detail})',
  },
  'forms.node.ai.summarizeErrorFallback': {
    zh: 'AI 整理服務暫時發生錯誤',
    en: 'The AI editing service hit a temporary error',
  },
  'forms.node.ai.describeErrorFallback': {
    zh: 'AI 圖片轉譯服務暫時發生錯誤',
    en: 'The AI image-description service hit a temporary error',
  },
  'forms.node.ai.analyzing': {
    zh: '分析中...',
    en: 'Analysing…',
  },
  'forms.node.ai.describeButton1': {
    zh: '📝 AI 照片 ① 轉譯',
    en: '📝 AI description, photo ①',
  },
  'forms.node.ai.describeButton2': {
    zh: '📝 AI 照片 ② 轉譯',
    en: '📝 AI description, photo ②',
  },

  // ── node: 照片上傳 ──
  'forms.node.photo.label1': {
    zh: '上傳照片 ① (必填/選填)',
    en: 'Upload photo ① (required / optional)',
  },
  'forms.node.photo.label2': {
    zh: '上傳照片 ② (選填)',
    en: 'Upload photo ② (optional)',
  },
  'forms.node.photo.empty1': {
    zh: '照片 ①',
    en: 'Photo ①',
  },
  'forms.node.photo.empty2': {
    zh: '照片 ② (加選)',
    en: 'Photo ② (optional)',
  },
  'forms.node.photoDescribe.prefix1': {
    zh: '📷 照片 ① 描述',
    en: '📷 Photo ① description',
  },
  'forms.node.photoDescribe.prefix2': {
    zh: '📷 照片 ② 描述',
    en: '📷 Photo ② description',
  },

  // ── node: 人臉偵測 ──
  'forms.node.face.detecting': {
    zh: '偵測人臉中...',
    en: 'Detecting faces…',
  },
  'forms.node.face.warning': {
    zh: '⚠️ 偵測到 {n} 處人臉',
    en: '⚠️ {n} face(s) detected',
  },
  'forms.node.face.blurButton': {
    zh: '🧩 馬賽克',
    en: '🧩 Pixelate',
  },
  'forms.node.face.ignoreButton': {
    zh: '忽略',
    en: 'Ignore',
  },

  // ── node: EXIF GPS ──
  'forms.node.exif.removeGps1': {
    zh: '🔒 移除照片 ① GPS ({lat}, {lng})',
    en: '🔒 Strip GPS from photo ① ({lat}, {lng})',
  },
  'forms.node.exif.removeGps2': {
    zh: '🔒 移除照片 ② GPS ({lat}, {lng})',
    en: '🔒 Strip GPS from photo ② ({lat}, {lng})',
  },

  // ── node: 提示與錯誤 ──
  'forms.node.alert.micPermission': {
    zh: '請允許麥克風權限以進行語音輸入。',
    en: 'Please allow microphone access to use voice input.',
  },
  'forms.node.alert.needTextForAi': {
    zh: '請先輸入或用語音說一段話，再進行 AI 整理。',
    en: 'Type or dictate some text first, then run the AI edit.',
  },
  'forms.node.alert.needPhoto': {
    zh: '請先上傳照片。',
    en: 'Please upload a photo first.',
  },
  'forms.node.alert.emptySubmit': {
    zh: '請至少填寫文字、選擇標籤或上傳照片',
    en: 'Please add some text, choose a tag, or upload a photo',
  },
  'forms.node.alert.submitFailed': {
    zh: '送出失敗，請稍後再試。',
    en: 'Submission failed. Please try again shortly.',
  },
  'forms.node.error.serverResponse': {
    zh: '伺服器回應錯誤',
    en: 'Server returned an error',
  },

  // ── node: 送出成功畫面 ──
  'forms.node.success.title': {
    zh: '感謝您的分享！',
    en: 'Thank you for sharing.',
  },
  'forms.node.success.body': {
    zh: '資料已成功送出。',
    en: 'Your submission was received.',
  },
  'forms.node.success.resetButton': {
    zh: '再次填寫表單 📝',
    en: 'Fill in the form again 📝',
  },
  'forms.node.success.closeButton': {
    zh: '返回地圖 🗺️',
    en: 'Back to map 🗺️',
  },

  // ── node: 送出按鈕 ──
  'forms.node.submit.processing': {
    zh: '處理中 (若含照片可能需要較久)...',
    en: 'Processing (photos may take a little longer)…',
  },
  'forms.node.submit.button': {
    zh: '送出回饋',
    en: 'Submit feedback',
  },

  // ── route: 評分文字（RouteFeedbackForm 內部用，非送出值） ──
  'forms.route.score.veryBad': {
    zh: '很差',
    en: 'Very poor',
  },
  'forms.route.score.bad': {
    zh: '不佳',
    en: 'Poor',
  },
  'forms.route.score.neutral': {
    zh: '普通',
    en: 'Average',
  },
  'forms.route.score.good': {
    zh: '良好',
    en: 'Good',
  },
  'forms.route.score.veryGood': {
    zh: '極佳',
    en: 'Excellent',
  },

  // ── route: 標題／提示／錯誤 ──
  'forms.route.title.suffix': {
    zh: '路線評分',
    en: '— rate this route',
  },
  'forms.route.alert.incomplete': {
    zh: '請為所有項目進行評分',
    en: 'Please rate every item',
  },
  'forms.route.error.serverResponse': {
    zh: '伺服器回應錯誤',
    en: 'Server returned an error',
  },
  'forms.route.alert.submitFailed': {
    zh: '送出失敗，請稍後再試。',
    en: 'Submission failed. Please try again shortly.',
  },

  // ── route: 送出成功畫面 ──
  'forms.route.success.title': {
    zh: '感謝您的評分！',
    en: 'Thank you for your rating.',
  },
  'forms.route.success.body': {
    zh: '視窗將自動關閉...',
    en: 'This window will close automatically…',
  },

  // ── route: 送出按鈕 ──
  'forms.route.submit.processing': {
    zh: '送出中...',
    en: 'Sending…',
  },
  'forms.route.submit.button': {
    zh: '送出回饋',
    en: 'Submit feedback',
  },

  // 路線評分四個面向（FACTORS，RouteLayer 與評分表單共用）
  'forms.route.factor.shade': { zh: '遮蔭程度', en: 'Shade' },
  'forms.route.factor.surface': { zh: '路面狀況', en: 'Surface' },
  'forms.route.factor.safety': { zh: '安全感', en: 'Safety' },
  'forms.route.factor.comfort': { zh: '整體舒適度', en: 'Overall comfort' },
};

export default forms;
