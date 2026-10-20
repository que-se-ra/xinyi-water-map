/**
 * 社區文史與環境感知互動地圖 — Google Apps Script（GAS）回饋總表腳本
 *
 * 一份試算表收所有專案的回饋（2026-10-20 改版）。
 *
 * ── 分頁結構 ──────────────────────────────────────────────
 * 總表（網站寫入；欄名是程式用的英文，請勿手動改欄名或欄位順序）：
 *   地景標記回饋     地方記憶 / 環境通報（要經後台「地景審核」才公開）
 *   路線舒適度評分   路段評分
 *   地點熱舒適評分   地圖任意點的熱舒適評分（不公開）
 *   每一列都有 project_id（xinyi、songshan、ntu…）分辨屬於哪個專案；空白一律視為 xinyi。
 *
 * 專案檢視分頁（腳本自動建立，唯讀）：
 *   「專案｜<專案名稱>」：用 FILTER 公式把該專案在三張總表的資料左右並排顯示。
 *   有新專案第一次收到回饋時自動建立；要改資料請回總表改。
 *   PROJECT_NAMES 沒列到的專案，分頁名稱直接用 project_id。
 *
 * ── 第一次從舊版升級 ──────────────────────────────────────
 * 貼上本腳本後，在 Apps Script 編輯器上方的函式選單選「migrateLegacy」→「執行」（只需一次，重跑也安全）：
 *   - 「信水義河地景標記回饋」改名為「地景標記回饋」，補 project_id 欄，空白的舊資料填 xinyi
 *   - 舊格式的站點回饋、路線舒適度評分（皆為開發者測試資料）改名為「封存｜…」，不刪除
 *     （分頁名稱已先拿掉「信水義河」前綴也能處理；路線評分若已是英文欄名就不動）
 *   - 建立各專案的檢視分頁
 *
 * ── 外觀排版（可重複執行，只改樣式）──────────────────────────
 * 函式選單選「formatSheets」→「執行」：標題列配色與中文註解、分數與審核狀態上色、
 * 欄寬與換行、隱藏照片 EXIF 等技術欄位、分頁標籤上色。新長出來的專案檢視分頁會自動套用。
 *
 * ── 更新既有部署（網址不變）────────────────────────────────
 * 「部署」→「管理部署」→ 點既有部署的鉛筆圖示 →「版本」選「新版本」→「部署」。
 * ⚠️ 左側清單有好幾筆部署（2026-10-20 時有 6 筆），每一筆都要這樣更新，網站用的可能是任何一筆。
 * 不要用「新增部署」：那會產生新網址，得再改 Vercel 的 NODE_SHEETS_API_URL / SHEETS_API_URL。
 *
 * ── 第一次全新部署 ────────────────────────────────────────
 * 「部署」→「新增部署」→ 類型「網頁應用程式」→ 執行身分「我」、誰可以存取「任何人」→ 授權。
 * 把網址填進 Vercel 的 NODE_SHEETS_API_URL 與 SHEETS_API_URL（兩個填同一個網址）。
 */

// 總表分頁名稱
var SHEET_NAMES = {
  node: "地景標記回饋",
  route: "路線舒適度評分",
  point: "地點熱舒適評分"
};

// 舊版分頁名稱 → migrateLegacy 的處理方式
var LEGACY_RENAMES = [
  { from: "信水義河地景標記回饋", to: "地景標記回饋" },
  { from: "信水義河路線舒適度評分", to: "封存｜信水義河路線舒適度評分（測試）" },
  { from: "信水義河站點回饋", to: "封存｜信水義河站點回饋（舊版測試）" },
  // 分頁已先手動拿掉「信水義河」前綴的情況：舊格式（中文欄名）的路線評分與站點回饋一樣封存，
  // 讓腳本另建英文欄名的新「路線舒適度評分」
  { from: "路線舒適度評分", to: "封存｜信水義河路線舒適度評分（測試）", onlyIfMissing: "score_shade" },
  { from: "站點回饋", to: "封存｜信水義河站點回饋（舊版測試）" }
];

// 專案檢視分頁的顯示名稱（新增專案時在這裡加一行；沒加也會用 project_id 自動建立）
var PROJECT_NAMES = {
  xinyi: "信水義河",
  songshan: "松山文創",
  ntu: "台大校園",
  hkvisitors: "香港朋友走讀" // /hkvisitors 走讀專頁的路段評分
};
var DEFAULT_PROJECT = "xinyi";
var VIEW_PREFIX = "專案｜";

// 總表欄位（新建分頁時使用；既有分頁缺 project_id 會自動補在最右邊）
var COLUMNS = {
  node: [
    "id", "timestamp", "lat", "lng", "station_id", "feedback_type", "description", "tags",
    "photo_url", "ai_summary", "is_voice",
    "photo_exif_latitude", "photo_exif_longitude", "photo_exif_dateTime", "photo_exif_device",
    "status",
    "photo_url_2", "photo_exif_2_latitude", "photo_exif_2_longitude", "photo_exif_2_dateTime", "photo_exif_2_device",
    "project_id"
  ],
  route: [
    "timestamp", "route_id", "route_name", "segment_id",
    "score_shade", "score_surface", "score_safety", "score_comfort",
    "project_id"
  ],
  point: [
    "id", "timestamp", "lat", "lng",
    "score_shade", "score_surface", "score_safety", "score_comfort",
    "reason", "project_id"
  ]
};

// 檢視分頁上每一區的標題
var BLOCK_TITLES = {
  node: "📍 地景標記回饋",
  route: "🚶 路線舒適度評分",
  point: "🌡️ 地點熱舒適評分"
};

// 所有專案的回饋照片共用同一個雲端資料夾（以名稱尋找，找不到才建立）
var DRIVE_FOLDER_NAME = "信水義河地景相片";

// 這份腳本支援的功能；網站 /api/feedback-point 送出前會用 ?sheet=capabilities 確認
var CAPABILITIES = ["point_comfort", "project_views"];

/* ── 外觀（formatSheets 與專案檢視分頁使用；只改樣式，不動資料） ── */

// 欄位中文名：總表顯示在欄名的註解（滑鼠移上去看得到），專案檢視分頁直接當欄名
var COLUMN_LABELS = {
  id: "編號",
  timestamp: "送出時間（UTC，台灣 +8 小時）",
  lat: "緯度",
  lng: "經度",
  station_id: "站點",
  feedback_type: "類型（memory 地方記憶／report 環境通報）",
  description: "描述",
  tags: "標籤",
  photo_url: "照片 1",
  ai_summary: "AI 摘要",
  is_voice: "語音輸入",
  photo_exif_latitude: "照片 1 拍攝緯度",
  photo_exif_longitude: "照片 1 拍攝經度",
  photo_exif_dateTime: "照片 1 拍攝時間",
  photo_exif_device: "照片 1 裝置",
  status: "審核狀態（pending 待審／approved 通過／rejected 拒絕）",
  photo_url_2: "照片 2",
  photo_exif_2_latitude: "照片 2 拍攝緯度",
  photo_exif_2_longitude: "照片 2 拍攝經度",
  photo_exif_2_dateTime: "照片 2 拍攝時間",
  photo_exif_2_device: "照片 2 裝置",
  project_id: "專案",
  route_id: "路線代號",
  route_name: "路線名稱",
  segment_id: "路段",
  score_shade: "遮蔭（1–5）",
  score_surface: "路面（1–5）",
  score_safety: "安全感（1–5）",
  score_comfort: "整體舒適（1–5）",
  reason: "舒適／不舒適的原因"
};

// 預設隱藏的技術欄位（點欄位上方的小箭頭即可展開）
var HIDDEN_COLUMNS = [
  "is_voice",
  "photo_exif_latitude", "photo_exif_longitude", "photo_exif_dateTime", "photo_exif_device",
  "photo_exif_2_latitude", "photo_exif_2_longitude", "photo_exif_2_dateTime", "photo_exif_2_device"
];

// 欄寬（像素）；沒列到的用 DEFAULT_WIDTH
var COLUMN_WIDTHS = {
  id: 150, timestamp: 190, description: 320, reason: 320, ai_summary: 260, tags: 150,
  photo_url: 170, photo_url_2: 170, route_name: 170, status: 110, feedback_type: 110
};
var DEFAULT_WIDTH = 100;
var WRAP_COLUMNS = ["description", "reason", "ai_summary", "tags"];
var SCORE_COLUMNS = ["score_shade", "score_surface", "score_safety", "score_comfort"];

// 配色：沿用網站的淺藍、暖棕、米色
var COLORS = {
  headerBg: "#dbeafe",     // 淺藍
  headerText: "#1e3a5f",
  band: "#fdf8ef",         // 米色隔列
  white: "#ffffff",
  scoreLow: "#f6c9c4",     // 1 分
  scoreMid: "#fdf3dc",     // 3 分
  scoreHigh: "#cfe8cf",    // 5 分
  pending: "#fff1c2",
  approved: "#d6efd6",
  rejected: "#e5e7eb",
  tabMaster: "#3b82f6",
  tabView: "#b08968",      // 暖棕
  tabArchive: "#9ca3af",
  blockTitle: { node: "#f3e8d8", route: "#dbeafe", point: "#fde2cf" }
};

/* ═══════════════════════ 網頁應用程式入口 ═══════════════════════ */

/**
 * GET：?sheet=route → 路線舒適度評分；?sheet=capabilities → 支援功能；其他 → 地景標記回饋。
 * 地點熱舒適評分不公開，不提供 GET。
 */
function doGet(e) {
  try {
    var param = e && e.parameter ? e.parameter.sheet : "";
    if (param === "capabilities") {
      return jsonResponse({ capabilities: CAPABILITIES });
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrInitSheet(ss, param === "route" ? "route" : "node");

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return jsonResponse([]);

    var headers = data[0];
    var out = [];
    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j];
        if (val instanceof Date) val = val.toISOString();
        obj[headers[j]] = val;
      }
      out.push(obj);
    }
    return jsonResponse(out);
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

/**
 * POST：依 payload 路由
 *   action === "update_status"   → 地景標記回饋（審核狀態）
 *   formType === "route_comfort" → 路線舒適度評分
 *   formType === "point_comfort" → 地點熱舒適評分
 *   其他                          → 地景標記回饋（新增標記）
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);

    if (payload.action === "update_status") {
      return handleUpdateStatus(getOrInitSheet(ss, "node"), payload);
    }

    var type = payload.formType === "route_comfort" ? "route"
      : payload.formType === "point_comfort" ? "point"
      : "node";
    var sheet = getOrInitSheet(ss, type);
    var result = type === "route" ? handleCreateRouteRecord(sheet, payload)
      : type === "point" ? handleCreatePointRecord(sheet, payload)
      : handleCreateNodeRecord(sheet, payload);

    // 新專案第一次收到回饋：自動建立它的檢視分頁（失敗不影響已寫入的資料）
    try {
      ensureProjectView(ss, normalizeProject(payload.project_id));
    } catch (viewError) {
      Logger.log("ensureProjectView failed: " + viewError);
    }
    return result;
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/* ═══════════════════════ 總表寫入 ═══════════════════════ */

function getOrInitSheet(ss, type) {
  var sheet = ss.getSheetByName(SHEET_NAMES[type]);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAMES[type]);
    var range = sheet.getRange(1, 1, 1, COLUMNS[type].length);
    range.setValues([COLUMNS[type]]);
    styleHeader(range);
    sheet.setFrozenRows(1);
  }
  ensureColumn(sheet, "project_id");
  return sheet;
}

/** 依標題列逐欄填值：values 是 { 欄名: 值 }，沒列到的欄留空 */
function appendByHeaders(sheet, values) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function (h) {
    return values.hasOwnProperty(h) ? values[h] : "";
  });
  sheet.appendRow(row);
}

function handleCreateNodeRecord(sheet, payload) {
  var id = payload.id || "node_" + new Date().getTime() + "_" + Math.random().toString(36).substr(2, 5);
  var photoUrl = payload.photo_base64 && payload.photo_filename
    ? uploadPhotoToDrive(payload.photo_base64, payload.photo_filename) : "";
  var photoUrl2 = payload.photo_base64_2 && payload.photo_filename_2
    ? uploadPhotoToDrive(payload.photo_base64_2, payload.photo_filename_2) : "";
  var exif = payload.photo_exif || {};
  var exif2 = payload.photo_exif_2 || {};
  var tags = Array.isArray(payload.tags) ? payload.tags.join(", ") : (payload.tags ? String(payload.tags) : "");

  appendByHeaders(sheet, {
    id: id,
    timestamp: payload.timestamp || new Date().toISOString(),
    lat: pick(payload.lat),
    lng: pick(payload.lng),
    station_id: payload.station_id || "",
    feedback_type: payload.feedback_type || "memory",
    description: safeText(payload.description),
    tags: safeText(tags),
    photo_url: photoUrl,
    ai_summary: safeText(payload.ai_summary),
    is_voice: payload.is_voice ? "TRUE" : "FALSE",
    photo_exif_latitude: pick(exif.latitude),
    photo_exif_longitude: pick(exif.longitude),
    photo_exif_dateTime: exif.dateTime || "",
    photo_exif_device: safeText(exif.device),
    status: "pending", // 新回饋一律待審
    photo_url_2: photoUrl2,
    photo_exif_2_latitude: pick(exif2.latitude),
    photo_exif_2_longitude: pick(exif2.longitude),
    photo_exif_2_dateTime: exif2.dateTime || "",
    photo_exif_2_device: safeText(exif2.device),
    project_id: payload.project_id || ""
  });
  return jsonResponse({ success: true, id: id, status: "pending", photo_url: photoUrl, photo_url_2: photoUrl2 });
}

function handleCreateRouteRecord(sheet, payload) {
  var s = payload.scores || {};
  appendByHeaders(sheet, {
    timestamp: payload.timestamp || new Date().toISOString(),
    route_id: pick(payload.route_id),
    route_name: payload.route_name || "",
    segment_id: payload.segment_id || "",
    score_shade: pick(s.shade),
    score_surface: pick(s.surface),
    score_safety: pick(s.safety),
    score_comfort: pick(s.comfort),
    project_id: payload.project_id || ""
  });
  return jsonResponse({ success: true });
}

function handleCreatePointRecord(sheet, payload) {
  var s = payload.scores || {};
  appendByHeaders(sheet, {
    id: "point_" + new Date().getTime() + "_" + Math.random().toString(36).substr(2, 5),
    timestamp: payload.timestamp || new Date().toISOString(),
    lat: pick(payload.lat),
    lng: pick(payload.lng),
    score_shade: pick(s.shade),
    score_surface: pick(s.surface),
    score_safety: pick(s.safety),
    score_comfort: pick(s.comfort),
    reason: safeText(payload.reason),
    project_id: payload.project_id || ""
  });
  return jsonResponse({ success: true });
}

/** 審核狀態變更（只作用於地景標記回饋） */
function handleUpdateStatus(sheet, payload) {
  if (!payload.id || !payload.status) {
    return jsonResponse({ success: false, error: "Missing id or status parameters" });
  }
  var data = sheet.getDataRange().getValues();
  var idCol = data[0].indexOf("id");
  var statusCol = data[0].indexOf("status");
  if (idCol === -1 || statusCol === -1) {
    return jsonResponse({ success: false, error: "Spreadsheet schema mismatch (missing id or status column)" });
  }
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === String(payload.id).trim()) {
      sheet.getRange(i + 1, statusCol + 1).setValue(payload.status);
      return jsonResponse({ success: true, id: payload.id, status: payload.status });
    }
  }
  return jsonResponse({ success: false, error: "Record not found with ID: " + payload.id });
}

/* ═══════════════════════ 專案檢視分頁 ═══════════════════════ */

function normalizeProject(id) {
  var s = id ? String(id).trim() : "";
  return s || DEFAULT_PROJECT;
}

function viewName(projectId) {
  return VIEW_PREFIX + (PROJECT_NAMES[projectId] || projectId);
}

/** 檢視分頁不存在才建立；已存在就不動 */
function ensureProjectView(ss, projectId) {
  if (ss.getSheetByName(viewName(projectId))) return;
  buildProjectView(ss, projectId);
}

/**
 * 建立（或重建）一個專案的檢視分頁：三張總表左右並排，各一區。
 * 第 1 列：區塊標題；第 2 列：欄名；第 3 列起：FILTER 公式結果。
 */
function buildProjectView(ss, projectId) {
  var name = viewName(projectId);
  var sheet = ss.getSheetByName(name);
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet(name);
  }

  sheet.getBandings().forEach(function (b) { b.remove(); });
  var rules = [];
  var col = 1;
  ["node", "route", "point"].forEach(function (type) {
    var src = getOrInitSheet(ss, type);
    var width = src.getLastColumn();
    var headers = src.getRange(1, 1, 1, width).getValues()[0];
    var pidIdx = headers.indexOf("project_id");
    var srcName = "'" + SHEET_NAMES[type] + "'";
    var lastLetter = colLetter(width);
    var pidLetter = colLetter(pidIdx + 1);
    var pidRange = srcName + "!" + pidLetter + "2:" + pidLetter;
    // 預設專案也收 project_id 空白的舊資料（但排除整列空白）
    var cond = projectId === DEFAULT_PROJECT
      ? "(" + pidRange + "=\"" + projectId + "\")+(" + pidRange + "=\"\")*(" + srcName + "!A2:A<>\"\")"
      : pidRange + "=\"" + projectId + "\"";

    sheet.getRange(1, col, 1, width).setBackground(COLORS.blockTitle[type]);
    sheet.getRange(1, col).setValue(BLOCK_TITLES[type]).setFontWeight("bold").setFontSize(12);
    var headerRange = sheet.getRange(2, col, 1, width);
    headerRange.setValues([headers.map(function (h) { return COLUMN_LABELS[h] || h; })]);
    styleHeader(headerRange);
    sheet.getRange(3, col).setFormula(
      "=IFERROR(FILTER(" + srcName + "!A2:" + lastLetter + ", " + cond + "), \"（尚無資料）\")"
    );
    // FILTER 帶出的日期會變成數字（例如 46169.58），照片拍攝時間欄改回日期格式
    headers.forEach(function (h, i) {
      if (/dateTime/.test(String(h))) {
        sheet.getRange(3, col + i, Math.max(sheet.getMaxRows() - 2, 1), 1).setNumberFormat("yyyy/mm/dd hh:mm");
      }
    });
    rules = rules.concat(formatBlock(sheet, headers, 2, col));
    col += width + 1; // 區塊之間空一欄
  });

  sheet.setConditionalFormatRules(rules);
  sheet.setFrozenRows(2);
  sheet.setTabColor(COLORS.tabView);
  // 防止誤改：編輯時跳出警告（仍可強制編輯，不會鎖死）
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  if (protections.length === 0) {
    sheet.protect().setDescription("專案檢視分頁由腳本自動產生，要改資料請回總表").setWarningOnly(true);
  }
  return sheet;
}

/** 依總表裡出現過的所有 project_id 重建每個專案的檢視分頁（欄位有變動後可手動執行） */
function refreshProjectViews() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ids = {};
  ids[DEFAULT_PROJECT] = true;
  Object.keys(PROJECT_NAMES).forEach(function (k) { ids[k] = true; });
  ["node", "route", "point"].forEach(function (type) {
    var sheet = getOrInitSheet(ss, type);
    var data = sheet.getDataRange().getValues();
    var idx = data[0].indexOf("project_id");
    for (var i = 1; i < data.length; i++) ids[normalizeProject(data[i][idx])] = true;
  });
  Object.keys(ids).forEach(function (id) { buildProjectView(ss, id); });
  return Object.keys(ids);
}

/* ═══════════════════════ 外觀排版（手動執行，可重複） ═══════════════════════ */

/**
 * 整份試算表套用統一外觀：總表、專案檢視分頁、封存分頁。只改樣式，不動任何資料。
 * 在 Apps Script 編輯器的函式選單選「formatSheets」→「執行」。
 */
function formatSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = [];

  ["node", "route", "point"].forEach(function (type) {
    var sheet = getOrInitSheet(ss, type);
    var width = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, width).getValues()[0];

    var headerRange = sheet.getRange(1, 1, 1, width);
    styleHeader(headerRange);
    headerRange.setNotes([headers.map(function (h) { return COLUMN_LABELS[h] || ""; })]);
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);

    sheet.getBandings().forEach(function (b) { b.remove(); });
    var dataRows = Math.max(sheet.getMaxRows() - 1, 1);
    var banding = sheet.getRange(2, 1, dataRows, width).applyRowBanding();
    banding.setFirstRowColor(COLORS.white).setSecondRowColor(COLORS.band);

    sheet.setConditionalFormatRules(formatBlock(sheet, headers, 1, 1));
    sheet.setTabColor(COLORS.tabMaster);
    log.push("總表「" + SHEET_NAMES[type] + "」");
  });

  log.push("專案檢視分頁：" + refreshProjectViews().join("、"));

  ss.getSheets().forEach(function (sheet) {
    if (sheet.getName().indexOf("封存") === 0) {
      sheet.setTabColor(COLORS.tabArchive);
      log.push("封存分頁「" + sheet.getName() + "」標成灰色");
    }
  });

  Logger.log(log.join("\n"));
  return log;
}

/**
 * 一個資料區塊的欄寬、換行、隱藏欄與條件式格式（分數上色、審核狀態上色）。
 * headerRow：欄名所在列；startCol：區塊第一欄。回傳條件式格式規則（由呼叫端一次設定）。
 */
function formatBlock(sheet, headers, headerRow, startCol) {
  var firstData = headerRow + 1;
  var rows = Math.max(sheet.getMaxRows() - headerRow, 1);
  var rules = [];

  headers.forEach(function (h, i) {
    var c = startCol + i;
    var colRange = sheet.getRange(firstData, c, rows, 1);
    sheet.setColumnWidth(c, COLUMN_WIDTHS[h] || DEFAULT_WIDTH);
    colRange.setVerticalAlignment("top");
    if (WRAP_COLUMNS.indexOf(h) !== -1) colRange.setWrap(true);
    if (HIDDEN_COLUMNS.indexOf(h) !== -1) {
      sheet.hideColumns(c);
    } else {
      sheet.showColumns(c);
    }

    if (SCORE_COLUMNS.indexOf(h) !== -1) {
      colRange.setHorizontalAlignment("center");
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .setGradientMinpointWithValue(COLORS.scoreLow, SpreadsheetApp.InterpolationType.NUMBER, "1")
        .setGradientMidpointWithValue(COLORS.scoreMid, SpreadsheetApp.InterpolationType.NUMBER, "3")
        .setGradientMaxpointWithValue(COLORS.scoreHigh, SpreadsheetApp.InterpolationType.NUMBER, "5")
        .setRanges([colRange])
        .build());
    }
    if (h === "status") {
      colRange.setHorizontalAlignment("center");
      [["pending", COLORS.pending], ["approved", COLORS.approved], ["rejected", COLORS.rejected]].forEach(function (pair) {
        rules.push(SpreadsheetApp.newConditionalFormatRule()
          .whenTextEqualTo(pair[0])
          .setBackground(pair[1])
          .setRanges([colRange])
          .build());
      });
    }
  });
  return rules;
}

/* ═══════════════════════ 舊版升級（手動執行一次） ═══════════════════════ */

function migrateLegacy() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = [];

  LEGACY_RENAMES.forEach(function (r) {
    var sheet = ss.getSheetByName(r.from);
    if (!sheet) return;
    if (r.onlyIfMissing) {
      var hdr = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      if (hdr.indexOf(r.onlyIfMissing) !== -1) return; // 已經是新格式，不動
    }
    if (ss.getSheetByName(r.to)) {
      log.push("略過「" + r.from + "」：已有同名分頁「" + r.to + "」，請手動處理");
      return;
    }
    sheet.setName(r.to);
    log.push("「" + r.from + "」→「" + r.to + "」");
  });

  // 舊的地景標記沒有 project_id：空白的一律補上預設專案
  var nodeSheet = getOrInitSheet(ss, "node");
  var pidCol = ensureColumn(nodeSheet, "project_id");
  var idCol = nodeSheet.getRange(1, 1, 1, nodeSheet.getLastColumn()).getValues()[0].indexOf("id") + 1;
  var last = nodeSheet.getLastRow();
  if (last > 1 && idCol > 0) {
    var ids = nodeSheet.getRange(2, idCol, last - 1, 1).getValues();
    var pidRange = nodeSheet.getRange(2, pidCol, last - 1, 1);
    var filled = 0;
    var vals = pidRange.getValues().map(function (v, i) {
      if (v[0] === "" && ids[i][0] !== "") { filled++; return [DEFAULT_PROJECT]; }
      return [v[0]];
    });
    pidRange.setValues(vals);
    if (filled) log.push("地景標記回饋：補上 project_id = " + DEFAULT_PROJECT + "（" + filled + " 列）");
  }

  ["node", "route", "point"].forEach(function (type) { getOrInitSheet(ss, type); });
  log.push("建立專案檢視分頁：" + refreshProjectViews().join("、"));

  // 總表排在最前面，檢視分頁接著，封存放最後
  var order = [SHEET_NAMES.node, SHEET_NAMES.route, SHEET_NAMES.point];
  order.forEach(function (n, i) {
    var s = ss.getSheetByName(n);
    if (s) { ss.setActiveSheet(s); ss.moveActiveSheet(i + 1); }
  });

  Logger.log(log.join("\n"));
  return log;
}

/* ═══════════════════════ 小工具 ═══════════════════════ */

/** 欄名不存在就補在最右邊，回傳該欄的欄號（從 1 起算） */
function ensureColumn(sheet, name) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = headers.indexOf(name);
  if (idx !== -1) return idx + 1;
  var col = headers.length === 1 && headers[0] === "" ? 1 : lastCol + 1;
  var cell = sheet.getRange(1, col);
  cell.setValue(name);
  styleHeader(cell);
  return col;
}

function styleHeader(range) {
  range.setFontWeight("bold");
  range.setBackground(COLORS.headerBg);
  range.setFontColor(COLORS.headerText);
  range.setVerticalAlignment("middle");
  range.setWrap(true);
}

function pick(v) {
  return v !== undefined && v !== null ? v : "";
}

/** 使用者自由輸入的文字：開頭是 = + - @ 時加單引號，避免被試算表當成公式執行 */
function safeText(v) {
  var str = v ? String(v) : "";
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

/** 欄號 → 欄位字母（1 → A，27 → AA） */
function colLetter(n) {
  var s = "";
  while (n > 0) {
    var m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** 將 Base64 圖片上傳至雲端硬碟並設為「知道連結者可檢視」 */
function uploadPhotoToDrive(base64Data, filename) {
  try {
    var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);

    var decoded = Utilities.base64Decode(base64Data.split(",")[1] || base64Data);
    var lower = filename.toLowerCase();
    var contentType = lower.endsWith(".png") ? "image/png" : lower.endsWith(".heic") ? "image/heic" : "image/jpeg";

    var file = folder.createFile(Utilities.newBlob(decoded, contentType, filename));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://lh3.googleusercontent.com/d/" + file.getId();
  } catch (e) {
    Logger.log("Drive upload failed: " + e.toString());
    return "";
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
