// 熱舒適問卷的「專案標註」。
// 各專案共用同一份 Google 表單（表單沒有專案欄位），所以非信義專案送出時，
// 會在三題地點答案的最前面加上【標註】，例如「【松菸】巴洛克花園（25.04366, 121.56057）」。
// 後台分析靠這個標註分辨是哪個專案的回覆；沒有標註的一律視為信水義河（含既有舊資料）。

export const SURVEY_TAGS = {
  songshan: '松菸',
};

const TAG_RE = /^【([^】]{1,10})】\s*/;

/** 依專案 id 取標註文字；信水義河（或沒設定的專案）回 null */
export function surveyTagFor(projectId) {
  return SURVEY_TAGS[projectId] || null;
}

/** 地點答案前面加上標註 */
export function withSurveyTag(text, tag) {
  return tag ? `【${tag}】${text}` : text;
}

/** 讀出答案前面的標註（沒有回 null），並回傳去掉標註後的文字 */
export function splitSurveyTag(text) {
  const m = TAG_RE.exec(text || '');
  return m ? { tag: m[1], text: (text || '').slice(m[0].length) } : { tag: null, text: text || '' };
}
