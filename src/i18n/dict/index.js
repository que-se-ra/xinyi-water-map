// 字典索引：把各模組的 { key: { zh, en } } 攤平成 { zh: {key:…}, en: {key:…} }。
// 為什麼中英並列：翻譯與校對時原文譯文相鄰，漏譯一眼看得出來，
// 也方便把單一模組整檔交給人／agent 翻譯而不會改到別的地方。

import common from './common';
import home from './home';
import map from './map';
import layers from './layers';
import survey from './survey';
import privacy from './privacy';
import forms from './forms';

const MODULES = [common, home, map, layers, survey, privacy, forms];

function flatten(modules) {
  const zh = {};
  const en = {};
  for (const mod of modules) {
    for (const [key, val] of Object.entries(mod)) {
      if (process.env.NODE_ENV !== 'production' && key in zh) {
        console.warn(`[i18n] 重複的 key：${key}`);
      }
      zh[key] = val.zh;
      en[key] = val.en !== undefined && val.en !== '' ? val.en : val.zh;
    }
  }
  return { zh, en };
}

export const dict = flatten(MODULES);
