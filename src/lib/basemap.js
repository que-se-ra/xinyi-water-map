// 共用底圖設定（主地圖、問卷小地圖、走讀頁、後台共用，改這裡即可全站生效）
//
// 2026-10 起改用內政部國土測繪中心「臺灣通用電子地圖」WMTS：
//   - 免申請、免金鑰（國土測繪圖資服務雲「免申請服務」），不會再有 CARTO 那種
//     「API KEY REQUIRED」浮水印；中文路名、門牌、地標比 OpenStreetMap 系底圖完整。
//   - 中文版用 EMAP01（灰階），英文版用 EMAP8（英文標註）。EMAP8 是彩色的，
//     由 CSS（.basemap-en）轉成和中文版接近的淡灰色調。
//   - 圖磚伺服器有開 CORS，最大到第 19 級以上（實測 20 級仍有圖）。
//   - 夜間模式不另外載入一組底圖，而是在同一組圖磚上用 CSS 濾鏡反相成深色
//     （見 globals.css 的 .basemap-night），切換時不必重新下載圖磚。
//
// 服務說明：https://maps.nlsc.gov.tw/S09SOA/homePage.action
// 舊的 CARTO 設定在 git 歷史（v1.22.4 之前的本檔）。

const NLSC = 'https://wmts.nlsc.gov.tw/wmts';

const tileUrl = (layer) => `${NLSC}/${layer}/default/GoogleMapsCompatible/{z}/{y}/{x}`;

/** 底圖網址：中文 EMAP01（灰階）、英文 EMAP8（英文標註） */
export const BASEMAP_URL = {
  zh: tileUrl('EMAP01'),
  en: tileUrl('EMAP8'),
};

/** 底圖版權標示 */
export const BASEMAP_ATTRIBUTION = {
  zh: '底圖 &copy; <a href="https://maps.nlsc.gov.tw/" target="_blank" rel="noopener">內政部國土測繪中心</a>',
  en: 'Basemap &copy; <a href="https://maps.nlsc.gov.tw/" target="_blank" rel="noopener">National Land Surveying and Mapping Center</a>',
};

/** 這組圖磚實際提供的最大級數；再放大時由 Leaflet 放大最後一級顯示 */
export const BASEMAP_MAX_NATIVE_ZOOM = 19;

/** 依語系取底圖設定，給 <TileLayer {...basemapProps(locale)} /> 直接展開 */
export function basemapProps(locale = 'zh') {
  const key = locale === 'en' ? 'en' : 'zh';
  return {
    url: BASEMAP_URL[key],
    attribution: BASEMAP_ATTRIBUTION[key],
    maxNativeZoom: BASEMAP_MAX_NATIVE_ZOOM,
    maxZoom: 20,
  };
}
