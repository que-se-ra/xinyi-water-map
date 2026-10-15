# 待向信義社大／郭老師確認的內容問題

這些不是翻譯問題，是**原始內容的事實問題**，英文版先用保守寫法，確認後可一行替換升級。

## 1. 「中陂」與「中坡」是不是同一個地方？
- 原始資料兩種寫法都有：`中陂庄`、`中陂圳路`、`中陂之灌概水源`、`中陂福德宮沿革碑`（7 處）
  對上 `中坡福壽宮`（1 處）。
- 信義區現有「中坡北路／中坡南路」，中坡的漢語拼音 Zhongpo 可查證。
- **英文版現況**：`中坡福壽宮` → Zhongpo Fushou Temple；`中陂` 一律保留中文 + 英文類名
  （`中陂 Village`、`the 中陂 canal`）。
- 若確認是同一地，把 `中陂` 全部改成 Zhongpo 即可。

## 2. 「惠安親水公園」這個名稱在官方資料裡不存在
- 台北市公園處與本專案自己的 `xinyi_green.json` 都只有兩個獨立地點：
  **惠安公園**（信義區最大鄰里公園）與 **惠安水與綠生活綠地**（俗稱「神大排」一帶）。
- 路線四站 O 現用名是「惠安親水公園」。**要確認指的是哪一個**，或這是社大自用的合稱。

## 3. 路線四「東西神 三大排水系」的三條排水，名稱有兩套
- 路線名與站點用：**東大排 / 西大排 / 神大排**
- 但圖層 tooltip（`tooltipData.js` 的 route-3）寫的是：**廍後排水、興雅排水、特一號排水**
- 兩套是同指還是不同？英文版目前兩處各自照原文譯，沒有強行統一。

## 4. 「神大排」的「神」字來歷
- 影響英文要不要意譯。目前保留 `神大排 Main Drain`。

## 5. 水名的台語讀音（影響羅馬拼音）
目前只有 `瑠公圳 → Liu-kong-tsun` 是確立的。以下保留中文原名：
柴頭陂、永春陂、允龜陂、舊陂溪、新埤溪、蝴蝶陂、沈祖厝陂。
若社大有慣用羅馬拼法，給我一份對照表即可全站替換。

## 6. 多專案平台的英文名稱（暫譯，待確認）
2026-10-10 改成多專案平台時，下列英文名稱是暫譯，請確認或指定：
- 平台總標題「社區文史與環境感知互動地圖」→ **Community History & Environmental Sensing Map**
  （備選：Community Heritage and Environmental Sensing Interactive Map）
- 專案「城市裡的微氣候觀察｜互動地圖工作坊」→ **Urban Microclimate Observation | Interactive Mapping Workshop**
- 合作單位「松山文創園區」→ **Songshan Cultural and Creative Park**
- 專案「信水義河」維持 2026-09-20 的決定：中文字標 + 英文副標 Waters of Xinyi。
改名只需要動 `src/i18n/dict/platform.js`、`src/app/en/layout.js`、`src/projects/songshan/index.js`。

## 7. 松山路線的站名英文與巴洛克花園座標（2026-10-15，待確認）
- 站名英文為暫譯：文創大街 Creative Street、新仁里農園 Xinren Village Farm、巴洛克花園 Baroque Garden、
  楓香大道 Sweetgum Avenue、松山匯 遊客中心 Songshan Hub Visitor Centre。若園區有官方英文名稱請指定，
  只需改 `src/projects/songshan/routeData.en.js` 與 `index.js` 的 `copy.en`。
- 巴洛克花園（C）沒有 GPX 航點，座標由 OpenStreetMap 底圖目測推算；使用者 2026-10-15 已確認位置正確。路線為直角示意圖，非實測軌跡。

