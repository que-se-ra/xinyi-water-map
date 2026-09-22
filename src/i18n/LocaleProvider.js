'use client';

// 語言環境：整個 App 只有一個 provider，locale 由路由決定（/ = zh，/en = en）。
// 不做自動偵測、不寫 cookie——使用者明確用切換鈕決定語言（2026-09-20 拍板）。

import { createContext, useContext, useMemo } from 'react';
import { dict } from './dict';
import { pathForLocale } from './paths';

export const LOCALES = ['zh', 'en'];
export const DEFAULT_LOCALE = 'zh';

// 預設值要跟 provider 提供的形狀一致（有 t、有 isEn）：後台等頁面沒有包 LocaleProvider，
// 少了 t 會讓任何呼叫 t(...) 的元件整頁炸掉（2026-09-23 後台問卷分析頁踩過）。
const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  isEn: false,
  t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
});

/**
 * 取字串。缺 key 或缺翻譯時 fallback 回中文，最後才回 key 本身，
 * 好讓漏譯在畫面上看得見（顯示中文），而不是整塊空白。
 * 支援 {name} 佔位符：t('foo.bar', { n: 3 })
 */
function translate(locale, key, vars) {
  const table = dict[locale] || dict[DEFAULT_LOCALE];
  let s = table[key];
  if (s === undefined) s = dict[DEFAULT_LOCALE][key];
  if (s === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] 缺少字串：${key}`);
    }
    return key;
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v));
    }
  }
  return s;
}

export function LocaleProvider({ locale = DEFAULT_LOCALE, children }) {
  const value = useMemo(
    () => ({
      locale,
      isEn: locale === 'en',
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale]
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** 只要 t() 時用這個，少寫一層解構 */
export function useT() {
  return useContext(LocaleContext).t;
}

/**
 * 站內連結一律經過這個：lp('/survey') 在中文版回 '/survey'，英文版回 '/en/survey'。
 * 直接寫死 href 會讓英文使用者一按就掉回中文站。
 */
export function useLocalePath() {
  const { locale } = useContext(LocaleContext);
  return (path) => pathForLocale(path, locale);
}
