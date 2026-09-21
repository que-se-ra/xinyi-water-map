// privacy —— 隱私權聲明頁（PrivacyPage.js）。
// zh 值必須與原檔一字不差；en 由翻譯關填寫。
// key 前綴照頁面章節分（s1..s9 對應 sections 陣列與內文各 <section id>）。
// 內文遇到 <strong> 等行內標籤的段落，一律照標籤邊界切成多條 key，
// 標籤本身留在元件 JSX 裡、不塞進字典值；不含中文的純標點/純英數片段
// （例如括號、箭頭符號、日期）維持寫死，不建 key。
const privacy = {
  'privacy.docTitle': { zh: '隱私權聲明 — 信水義河 · 信義社大水文導覽互動地圖', en: 'Privacy Notice — 信水義河 Waters of Xinyi · Xinyi Community College Interactive Hydrological Guide Map' },
  'privacy.headerTag': { zh: '信水義河 · 隱私權聲明', en: '信水義河 Waters of Xinyi · Privacy Notice' },
  'privacy.title': { zh: '🛡️ 隱私權聲明與資料使用說明', en: '🛡️ Privacy Notice and Data Usage Statement' },
  'privacy.subtitle': { zh: '本頁面說明「信水義河」如何處理您的資料，以及您享有的權利。', en: 'This page explains how "Waters of Xinyi" processes your data, and the rights you have.' },

  'privacy.sidebar.toc': { zh: '章節目錄', en: 'Contents' },
  'privacy.sidebar.lastUpdatedLabel': { zh: '最後更新', en: 'Last updated' },

  'privacy.badge.low': { zh: '低', en: 'Low' },
  'privacy.badge.mid': { zh: '中', en: 'Medium' },
  'privacy.badge.high': { zh: '高', en: 'High' },

  // § 1 專案簡介（sidebar 導覽標籤與 h2 標題文字相同，共用一個 key）
  'privacy.s1.title': { zh: '專案簡介', en: 'Project Overview' },
  // 段落含 3 個 <strong>，依標籤邊界切成 body1/courseName/body2/orgName/body3；
  // 「信水義河」與 common.site.title 完全相同字串，直接共用該 key。
  // 中文用「」，英文用直引號——寫死在 JSX 裡的話英文版會冒出中文標點
  'privacy.s1.openQuote': { zh: '「', en: '"' },
  'privacy.s1.body1': { zh: '」是一個由國立臺灣大學建築與城鄉研究所「', en: '" is an interactive hydrological guide map project developed as part of the "' },
  'privacy.s1.courseName': { zh: '智慧城市與數位民主', en: 'Smart City and Digital Democracy' },
  'privacy.s1.body2': { zh: '」課程所開發的互動式水文導覽地圖專案，與', en: '" course at the NTU Graduate Institute of Building and Planning, in collaboration with ' },
  'privacy.s1.orgName': { zh: '信義社區大學', en: 'Taipei Xinyi Community College' },
  'privacy.s1.body3': { zh: '合作推動。本專案旨在透過數位工具，讓市民能夠探索臺北市信義區的水文歷史與環境變遷，並透過回饋機制促進公眾參與。', en: '. The project uses digital tools to help the public explore the hydrological history and environmental change of Taipei\'s Xinyi District, and to foster public participation through a feedback mechanism.' },

  // § 2 資料收集範圍
  'privacy.s2.navLabel': { zh: '收集範圍', en: 'Data Collected' },
  'privacy.s2.title': { zh: '資料收集範圍', en: 'Scope of Data Collection' },
  'privacy.s2.intro': { zh: '以下為本專案可能收集的使用者資料項目：', en: 'The following are the categories of user data that this project may collect:' },
  'privacy.s2.colType': { zh: '資料類型', en: 'Data Type' },
  'privacy.s2.colMethod': { zh: '收集方式', en: 'Collection Method' },
  'privacy.s2.colSensitivity': { zh: '敏感度', en: 'Sensitivity' },
  'privacy.s2.row1Type': { zh: '回饋文字', en: 'Feedback text' },
  'privacy.s2.row1Method': { zh: '使用者主動輸入', en: 'Actively entered by the user' },
  'privacy.s2.row2Type': { zh: '照片影像', en: 'Photos' },
  'privacy.s2.row2Method': { zh: '使用者主動上傳（可能含人臉）', en: 'Actively uploaded by the user (may include faces)' },
  'privacy.s2.row3Type': { zh: 'GPS 座標', en: 'GPS coordinates' },
  'privacy.s2.row3Method': { zh: 'EXIF 自動擷取 ＋ 使用者地圖標記', en: 'Automatically extracted from EXIF data + user map markers' },
  'privacy.s2.row4Type': { zh: '拍攝裝置型號與日期時間', en: 'Camera device model and date/time' },
  'privacy.s2.row4Method': { zh: 'EXIF 自動擷取', en: 'Automatically extracted from EXIF data' },

  // § 3 明確不收集的資料
  'privacy.s3.navLabel': { zh: '不收集項目', en: 'Not Collected' },
  'privacy.s3.title': { zh: '明確不收集的資料', en: 'Data Explicitly Not Collected' },
  // 段落含 1 個 <strong>，切成 intro1/intro2(絕不)/intro3
  'privacy.s3.intro1': { zh: '為保障您的隱私，以下資料', en: 'To protect your privacy, the following data is ' },
  'privacy.s3.intro2': { zh: '絕不', en: 'never' },
  'privacy.s3.intro3': { zh: '被本專案收集或儲存：', en: ' collected or stored by this project:' },
  'privacy.s3.item1': { zh: '使用者姓名、電子郵件、電話', en: 'User name, email address, or phone number' },
  'privacy.s3.item2': { zh: '瀏覽器 Cookie 或追蹤碼', en: 'Browser cookies or tracking identifiers' },
  'privacy.s3.item3': { zh: 'IP 位址', en: 'IP address' },
  'privacy.s3.item4': { zh: '語音錄音檔案', en: 'Speech recording files' },
  'privacy.s3.item5': { zh: '瀏覽歷史或使用行為分析', en: 'Browsing history or behavioural analytics' },

  // § 4 AI 系統使用說明
  'privacy.s4.navLabel': { zh: 'AI 使用說明', en: 'AI Usage' },
  'privacy.s4.title': { zh: 'AI 系統使用說明', en: 'AI System Usage' },
  // 提示框含 2 個 <strong>，切成 noticeLabel/noticeBody1/noticeOptIn/noticeBody2
  'privacy.s4.noticeLabel': { zh: '⚠️ 重要：', en: '⚠️ Important: ' },
  'privacy.s4.noticeBody1': { zh: '所有 AI 功能皆為', en: 'All AI features are' },
  'privacy.s4.noticeOptIn': { zh: 'opt-in（主動觸發）', en: 'opt-in (user-initiated)' },
  'privacy.s4.noticeBody2': { zh: '，非自動執行。使用者需手動啟動，且可隨時預覽、編輯或拒絕 AI 產出的結果。', en: ', not automatic. Users must manually activate each feature, and may preview, edit, or reject any AI-generated output at any time.' },
  'privacy.s4.item1Title': { zh: 'Gemini 2.5 Flash — 文字潤飾', en: 'Gemini 2.5 Flash — AI-Assisted Text Editing' },
  'privacy.s4.item1Desc': { zh: '使用者主動觸發後，AI 將協助潤飾回饋文字。使用者可預覽、編輯或拒絕 AI 修改的內容。', en: 'Once manually triggered by the user, AI assists in editing the feedback text. Users may preview, edit, or reject the AI-modified content.' },
  'privacy.s4.item1Tag': { zh: '文字處理', en: 'Text Processing' },
  'privacy.s4.item2Title': { zh: 'Gemini 2.5 Flash — 影像描述', en: 'Gemini 2.5 Flash — Image Description' },
  'privacy.s4.item2Desc': { zh: '使用者上傳照片後可主動觸發 AI 生成描述文字。生成結果可由使用者自行編輯。', en: 'After uploading a photo, users may actively trigger AI to generate descriptive text. The generated result can be edited by the user.' },
  'privacy.s4.item2Tag': { zh: '影像分析', en: 'Image Analysis' },
  'privacy.s4.item3Title': { zh: 'Web Speech API — 語音辨識', en: 'Web Speech API — Speech Recognition' },
  'privacy.s4.item3Desc': { zh: '語音辨識完全在瀏覽器端本地處理，不儲存任何錄音檔案。辨識結果即時顯示供使用者確認。', en: 'Speech recognition is processed entirely locally in the browser; no recording files are stored. The recognition result is displayed in real time for the user to confirm.' },
  'privacy.s4.item3Tag': { zh: '語音轉文字', en: 'Speech-to-Text' },

  // § 5 第三方資料傳輸
  'privacy.s5.navLabel': { zh: '第三方傳輸', en: 'Third-Party Transfers' },
  'privacy.s5.title': { zh: '第三方資料傳輸', en: 'Third-Party Data Transfers' },
  'privacy.s5.intro': { zh: '本專案使用以下第三方服務，傳輸的資料範圍與用途如下表所示：', en: 'This project uses the following third-party services; the scope of data transferred and its purpose are shown in the table below:' },
  'privacy.s5.colService': { zh: '第三方服務', en: 'Third-Party Service' },
  'privacy.s5.colData': { zh: '傳送資料', en: 'Data Transferred' },
  'privacy.s5.colPurpose': { zh: '用途', en: 'Purpose' },
  // service 欄位（Google Gemini API 等）本身是英文專有名詞，不含中文，不建 key
  'privacy.s5.row1Data': { zh: '文字 / 壓縮照片', en: 'Text / compressed photos' },
  'privacy.s5.row1Purpose': { zh: 'AI 推論（文字潤飾、影像描述）', en: 'AI inference (text editing, image description)' },
  'privacy.s5.row2Data': { zh: '表單資料 / 照片', en: 'Form data / photos' },
  'privacy.s5.row2Purpose': { zh: '資料儲存', en: 'Data storage' },
  'privacy.s5.row3Data': { zh: '壓縮照片', en: 'Compressed photos' },
  'privacy.s5.row3Purpose': { zh: '檔案儲存', en: 'File storage' },
  'privacy.s5.row4Data': { zh: '無使用者資料', en: 'No user data' },
  'privacy.s5.row4Purpose': { zh: '衛星影像運算', en: 'Satellite imagery processing' },
  'privacy.s5.row5Data': { zh: '語音串流', en: 'Speech audio stream' },
  'privacy.s5.row5Purpose': { zh: '語音辨識（瀏覽器本地）', en: 'Speech recognition (local, in-browser)' },

  // § 6 資料保留與刪除
  'privacy.s6.navLabel': { zh: '資料保留', en: 'Data Retention' },
  'privacy.s6.title': { zh: '資料保留與刪除', en: 'Data Retention and Deletion' },
  'privacy.s6.row1Item': { zh: '回饋文字 / 照片 / EXIF 資訊', en: 'Feedback text / photos / EXIF data' },
  'privacy.s6.row1Policy': { zh: '永久保留，直至管理員手動刪除', en: 'Retained permanently, until manually deleted by an administrator' },
  'privacy.s6.row2Item': { zh: '語音錄音', en: 'Speech recordings' },
  'privacy.s6.row2Policy': { zh: '不儲存 — 語音辨識僅在瀏覽器本地處理', en: 'Not stored — speech recognition is processed locally in the browser only' },
  'privacy.s6.row3Item': { zh: 'AI 潤飾前原文', en: 'Original text before AI editing' },
  'privacy.s6.row3Policy': { zh: '不儲存 — 僅保留使用者確認後的最終版本', en: 'Not stored — only the final version confirmed by the user is retained' },

  // § 7 內容審核（sidebar 導覽標籤與 h2 標題文字相同，共用一個 key）
  'privacy.s7.title': { zh: '內容審核', en: 'Content Moderation' },
  'privacy.s7.reviewTitle': { zh: '人工審核制度', en: 'Manual Review System' },
  // 段落含 1 個 <strong>，切成 reviewBody1/reviewPending/reviewBody2
  'privacy.s7.reviewBody1': { zh: '所有使用者提交的回饋預設為「', en: 'All feedback submitted by users defaults to "' },
  'privacy.s7.reviewPending': { zh: '待審核', en: 'Pending Review' },
  'privacy.s7.reviewBody2': { zh: '（pending）」狀態，需經管理員人工核准後方可公開顯示於地圖上。', en: '" (pending) status, and requires manual approval by an administrator before it can be publicly displayed on the map.' },
  'privacy.s7.noAiTitle': { zh: '無 AI 自動審核', en: 'No Automated AI Review' },
  // 段落含 1 個 <strong>，切成 noAiBody1/noAiStrong/noAiBody2
  'privacy.s7.noAiBody1': { zh: '本專案', en: 'This project ' },
  'privacy.s7.noAiStrong': { zh: '不使用', en: 'does not use' },
  'privacy.s7.noAiBody2': { zh: '任何 AI 自動決定是否公開使用者提交的內容。所有公開決策均由人工執行。', en: ' any AI to automatically decide whether user-submitted content is published. All publication decisions are made by humans.' },

  // § 8 使用者權利（sidebar 導覽標籤與 h2 標題文字相同，共用一個 key）
  'privacy.s8.title': { zh: '使用者權利', en: 'User Rights' },
  'privacy.s8.intro': { zh: '您在使用本專案時享有以下權利：', en: 'When using this project, you have the following rights:' },
  'privacy.s8.item1': { zh: '可自由選擇是否使用 AI 功能', en: 'Freely choose whether to use AI features' },
  'privacy.s8.item2': { zh: '可自由選擇是否上傳照片', en: 'Freely choose whether to upload photos' },
  'privacy.s8.item3': { zh: '可自由選擇是否分享 EXIF GPS 資料', en: 'Freely choose whether to share EXIF GPS data' },
  'privacy.s8.item4': { zh: '上傳前可預覽所有提交內容', en: 'Preview all submitted content before uploading' },

  // § 9 聯絡方式（sidebar 導覽標籤與 h2 標題文字相同，共用一個 key）
  'privacy.s9.title': { zh: '聯絡方式', en: 'Contact' },
  'privacy.s9.intro': { zh: '如果您對本隱私權聲明有任何疑問，或需要行使上述使用者權利，歡迎聯繫：', en: 'If you have any questions about this privacy notice, or need to exercise the user rights described above, please contact:' },
  'privacy.s9.orgLine1': { zh: '國立臺灣大學 建築與城鄉研究所', en: 'NTU Graduate Institute of Building and Planning' },
  'privacy.s9.orgLine2': { zh: '「智慧城市與數位民主」課程團隊', en: '"Smart City and Digital Democracy" Course Team' },

  // Footer
  'privacy.footer.lastUpdatedLabel': { zh: '最後更新日期：', en: 'Last updated: ' },
  'privacy.footer.copyright': { zh: '© 信水義河 · 信義社區大學 × 臺大城鄉所', en: '© 信水義河 Waters of Xinyi · Taipei Xinyi Community College × NTU Graduate Institute of Building and Planning' },
  'privacy.footer.backToMap': { zh: '← 返回地圖', en: '← Back to map' },
};

export default privacy;
