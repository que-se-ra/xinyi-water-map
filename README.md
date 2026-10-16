# 社區文史與環境感知互動地圖

多專案互動地圖平台。每個專案有自己的網址、路線與回饋資料；古今地圖、衛星影像、公開資料等基礎圖層所有專案共用。

| 專案 | 網址 | 狀態 |
|------|------|------|
| 信水義河（信義社大合作） | `/xinyi`、`/en/xinyi` | 開放中 |
| 城市裡的微氣候觀察｜互動地圖工作坊（松山文創園區合作） | `/songshan`、`/en/songshan` | 開放中：基礎圖層已啟用，路線與站點待設計 |

平台首頁（`/`、`/en`）列出所有專案。舊連結 `/survey`、`/en/survey` 與帶 `?landing=` / `?tab=` 的首頁連結會自動轉到信水義河。

## 新增一個專案

1. 建 `src/projects/<slug>/`：`index.js`（專案設定，可參考 `xinyi/index.js`）、`routeData.js`、`routeData.en.js`。
   路線 id 請加專案前綴（例如 `songshan-route-01`），避免舒適度統計與其他專案混在一起。
2. 在 `src/projects/registry.js` 的 `PROJECTS` 加進去，`status` 改成 `'active'`（`'coming-soon'` 只顯示說明頁）。專案沒有路線時（`routes: []`），介面會自動隱藏路線開關與步行舒適度；`ui.routeArrows: true` 會在路線上畫方向箭頭；`ui.tabs` 決定側欄分頁、`copy` 覆寫信義專屬文案，可參考 `songshan/index.js`。
3. 圖層預設值在 `src/projects/defaultLayers.js`；專案可以在自己的設定覆寫（例如改選別張古地圖）。
4. `<slug>` 不可以是 `registry.js` 的 `RESERVED_SLUGS` 內的名稱。
5. 回饋資料靠試算表的 `project_id` 欄位區分，不需要另外建試算表。

## 信水義河專案：路線總覽

四條路線、57 個站點，帶你走讀台北信義區兩百年的水文故事。

## 路線總覽

| 路線 | 名稱 | 站數 | 起點 | 顏色 |
|------|------|------|------|------|
| 路線一 | 瑠公圳水泱泱 三犁農田綠昂揚 | 17 站 | 六張犁捷運站 | 🔵 藍色 |
| 路線二 | 信義之源 陂水之觀 | 12 站 | 永春捷運站 | 🟢 綠色 |
| 路線三 | 錫口 五分埔支線 | 12 站 | 象山站周邊 | 🟠 橙色 |
| 路線四 | 東西神 三大排水系 | 16 站 | 象山公園 | 🟣 紫色 |

## 技術架構

- **Framework**: Next.js 16 (App Router)
- **地圖**: react-leaflet + Leaflet.js
- **底圖**: OpenStreetMap (免費，無需 API Key)
- **樣式**: Tailwind CSS v4
- **部署**: Vercel

## 本地開發

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev
# → http://localhost:3000

# 正式建置
npm run build
npm start
```

## 部署到 Vercel

```bash
# 方法一：Vercel CLI
npm i -g vercel
vercel

# 方法二：GitHub 連動
# 推送至 GitHub，在 Vercel Dashboard 匯入 repo 即可
```

## 資料來源

站點資料來自 [xycc.pages.dev](https://xycc.pages.dev)（信義社大水文化脈絡特展）

## 專案結構

```
xinyi-water-map/
├── src/
│   ├── app/
│   │   ├── page.js           # 平台首頁（專案列表）
│   │   ├── [project]/        # 各專案地圖（HomeApp）與 survey；/en/[project] 為英文版
│   │   ├── layout.js         # Root layout + 字型 + SEO
│   │   ├── globals.css       # 全域樣式（注意：為全螢幕地圖鎖住 html/body 捲動）
│   │   ├── admin/            # 管理後台（審核回饋、匯出）
│   │   ├── privacy/          # 隱私權說明
│   │   └── api/              # survey-submit、feedback-node、temperature、
│   │                         #  summarize、describe-image、detect-faces…
│   ├── components/
│   │   ├── MapView.js        # 核心地圖元件
│   │   ├── forms/            # 問卷與回饋表單（含地圖點選）
│   │   └── layers/           # 歷史地圖、衛星、日照、溫度、分區等圖層
│   ├── lib/
│   │   ├── basemap.js        # 底圖網址與版權標示（CARTO API Key 由此帶入）
│   │   └── gas-template.js   # Google Apps Script 範本
│   └── projects/
│       ├── registry.js       # 專案登記表
│       ├── defaultLayers.js  # 進入地圖時的預設圖層
│       ├── ProjectProvider.js# 目前專案（context）
│       └── xinyi/            # 信水義河：設定 + 四條路線完整站點資料（中英文）
├── public/
│   ├── CHANGELOG.md          # 更新日誌（網站 UI 會動態讀取，每次改動都要更新）
│   └── TaipeiTree_filtered.json  # 行道樹資料（由 processTrees.js 產生）
├── processTrees.js           # 行道樹原始資料前處理腳本
├── vercel.json               # Vercel 部署設定
└── .env.local                # 金鑰（不在 git，需手動放置）
```

## 環境變數

| 變數 | 用途 |
|------|------|
| `NODE_SHEETS_API_URL` / `SHEETS_API_URL` | Google Apps Script webhook（回饋寫入試算表） |
| `GEMINI_API_KEY` | AI 語音整理與圖片轉譯 |
| `NEXT_PUBLIC_CARTO_KEY` | CARTO 底圖金鑰（未設定時圖磚會被印上浮水印） |
| `ADMIN_PASSCODE` | 管理後台 `/admin` 密碼 |
| `GEE_PRIVATE_KEY` / `GEE_CLIENT_EMAIL` | 地表溫度圖層的 Google Earth Engine 服務帳號憑證 |
