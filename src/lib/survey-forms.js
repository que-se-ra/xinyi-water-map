// 熱舒適問卷對應的 Google 表單設定（前端送出、/api/survey-submit 代交、後台分析共用）。
//
// 每個專案可以有自己的表單；沒有自己表單的專案共用 default（信水義河），
// 回覆以地點答案前的【標註】區分（見 survey-tags.js）。
//
// 新增或換表單時要核對：
//   - entry ID：由公開表單網頁的 FB_PUBLIC_LOAD_DATA_ 抽取，表單增刪或重排題目後要重新抽。
//   - relationValues：表單第一題的選項文字，需與表單一字不差；不在清單內的答案以「其他」送出。
//   - sheetId：回覆試算表，需維持「知道連結的人可檢視」，後台才讀得到 CSV。
//   - 題目順序要維持：關係、整體感受、最熱地點、原因、最涼地點、原因、優先改善（後台依欄位順序解析）。

export const SURVEY_FORMS = {
  // 信義區「體感溫度」地圖：熱舒適經驗調查（entry ID 2026-08-21 抽取）
  default: {
    base: 'https://docs.google.com/forms/d/e/1FAIpQLSe8LxV5dtR5ZwsOOAY9dZfOFE_6E6tbKL_iAjAbO7I4BFcBDw',
    fallbackUrl: 'https://forms.gle/fxRK5CjhrTs3o1dY9',
    sheetId: '1z79y1UoKXO-RNJ5F0pTgOlRLISbXcg5pUOtwB616Bf8',
    entries: {
      relation: 'entry.132730628',
      comfort: 'entry.1113127977',
      hotPlace: 'entry.1026299941',
      hotWhy: 'entry.2006157600',
      coolPlace: 'entry.1501603056',
      coolWhy: 'entry.1815209056',
      improvePlace: 'entry.606398302',
    },
    relationValues: ['居住', '工作', '就學', '經常經過', '研究場域'],
  },
  // 松山文創園區「體感溫度」地圖：熱舒適經驗調查（2026-10-28 以 src/scripts/create_songshan_survey_form.gs 建立，
  // entry ID 取自建立時的預填網址，並已和公開表單的 FB_PUBLIC_LOAD_DATA_ 核對）
  songshan: {
    base: 'https://docs.google.com/forms/d/e/1FAIpQLSctG85HU5BavlHn42xpAjLMOsY_tBBGrAnw3f2xOs-HWvqqxA',
    fallbackUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSctG85HU5BavlHn42xpAjLMOsY_tBBGrAnw3f2xOs-HWvqqxA/viewform',
    sheetId: '1e7hCH53TBO-dFOkQ-_hzn4cPk_iCA0ENRAFWhq-kVqE',
    entries: {
      relation: 'entry.1339634328',
      comfort: 'entry.1392640063',
      hotPlace: 'entry.1039857928',
      hotWhy: 'entry.1514062775',
      coolPlace: 'entry.768975701',
      coolWhy: 'entry.309104142',
      improvePlace: 'entry.1947904737',
    },
    // 需與 src/projects/songshan/index.js 的 survey.relations 的 value 一致
    relationValues: [
      '在園區工作',
      '經常造訪（散步、休閒）',
      '偶爾來訪（看展、活動、市集）',
      '初次造訪（第一次來）',
      '經常經過（周邊通勤）',
      '研究場域／活動合作',
    ],
  },
};

/** 專案實際使用的表單（沒有自己的表單就用 default） */
export function surveyFormFor(projectId) {
  return SURVEY_FORMS[projectId] || SURVEY_FORMS.default;
}

/** 專案是否有自己的表單（有的話回覆不必加【標註】） */
export function hasOwnSurveyForm(projectId) {
  return projectId !== 'default' && Boolean(SURVEY_FORMS[projectId]);
}

/** 代交 API 只接受這些欄位，避免被當作開放代理 */
export function allowedEntryKeys(form) {
  return new Set([...Object.values(form.entries), `${form.entries.relation}.other_option_response`]);
}
