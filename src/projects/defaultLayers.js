// 進入地圖時的預設圖層狀態。2026-10-10 起：只開「1939 瑠公水利區域圖」當底圖，
// 其餘（含路線與站點、社群標記）全部預設關閉，由使用者自己在圖層面板打開。
// 每個專案可以在自己的 index.js 用 { ...BASE_DEFAULT_LAYERS, history: '…' } 覆寫
// （例如另一個專案的範圍不在 1939 瑠公水利區域圖內時，改選別張底圖或不開）。

export const BASE_DEFAULT_LAYERS = {
  history: 'liugong1939', // HISTORICAL_MAPS 的 id；null = 不開古地圖
  satellite: null, // SATELLITE_MAPS 的 id；null = 不開
  routes: false, // 路線與站點（同一組開關）
  trees: false,
  sidewalks: false,
  green: false,
  zoning: false,
  shadeMap: false,
  comfort: false,
  communityMarkers: false, // 社群審核通過的地景標記
  arcades: false, // 騎樓整平路段（全市）
  waterlog: false, // 短延時強降雨積水模擬（全市）
};
