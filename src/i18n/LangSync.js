'use client';

// 根 layout 是唯一擁有 <html> 的地方，巢狀 layout 改不到 lang 屬性。
// 這個元件掛在 /en 的 layout 內，於客戶端把 documentElement.lang 改成 en，
// 讓螢幕閱讀器與瀏覽器翻譯提示拿到正確語言。離開時還原。

import { useEffect } from 'react';

export default function LangSync({ lang = 'zh-Hant' }) {
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = prev;
    };
  }, [lang]);
  return null;
}
