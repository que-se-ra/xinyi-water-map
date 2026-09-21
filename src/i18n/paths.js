// 中英路由對應。英文版一律掛在 /en 之下，中文版維持原網址不變。
//   /            <->  /en
//   /survey      <->  /en/survey
//   /privacy     <->  /en/privacy

export const EN_PREFIX = '/en';

/** 由 pathname 判斷目前語言 */
export function localeFromPathname(pathname = '/') {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'zh';
}

/** 把任一路徑換成指定語言的對應路徑 */
export function pathForLocale(pathname = '/', locale = 'zh') {
  const bare =
    pathname === EN_PREFIX
      ? '/'
      : pathname.startsWith(`${EN_PREFIX}/`)
        ? pathname.slice(EN_PREFIX.length) || '/'
        : pathname;
  if (locale === 'en') return bare === '/' ? EN_PREFIX : `${EN_PREFIX}${bare}`;
  return bare;
}
