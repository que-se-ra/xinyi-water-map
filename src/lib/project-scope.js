// 回饋資料的「專案」歸屬。試算表是單一份、多專案共用，靠 project_id 欄位區分。
// 加欄位之前就存在的舊資料（欄位不存在或空白）一律視為信水義河。

export const LEGACY_PROJECT_ID = 'xinyi';

export function recordProjectId(record) {
  const v = String(record?.project_id ?? '').trim();
  return v || LEGACY_PROJECT_ID;
}

/** 解析 ?project= 參數：只收小寫英數與連字號，其他一律當作沒帶（不過濾）。 */
export function parseProjectParam(raw) {
  return raw && /^[a-z0-9-]{1,40}$/.test(raw) ? raw : null;
}
