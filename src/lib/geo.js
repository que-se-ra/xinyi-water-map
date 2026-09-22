// 服務範圍判斷：本站的路線、站點與圖層都在台北，GPS 定位若落在台北都會區以外
// （例如在國外開這個網站），顯示使用者位置只會把地圖拉離信義區，讓人看不到內容。
// 因此定位結果先經這裡檢查，不在範圍內就不顯示位置、也不移動地圖。

// 約略涵蓋台北市、新北市與基隆一帶（南北約 65 公里、東西約 60 公里）。
export const TAIPEI_BOUNDS = {
  minLat: 24.75,
  maxLat: 25.35,
  minLng: 121.25,
  maxLng: 121.85,
};

export function isNearTaipei(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return (
    lat >= TAIPEI_BOUNDS.minLat &&
    lat <= TAIPEI_BOUNDS.maxLat &&
    lng >= TAIPEI_BOUNDS.minLng &&
    lng <= TAIPEI_BOUNDS.maxLng
  );
}
