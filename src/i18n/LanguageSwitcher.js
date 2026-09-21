'use client';

// 語言切換鈕。中／EN 兩段式藥丸，目前語言為實心。
// stateParams：切換時把畫面狀態（是否已離開 landing、目前分頁）帶去另一語言，
// 避免使用者在地圖看到一半按 EN，被丟回首頁動畫重來一次。

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from './LocaleProvider';
import { pathForLocale } from './paths';

export default function LanguageSwitcher({ variant = 'header', stateParams = null, className = '' }) {
  const pathname = usePathname() || '/';
  const { locale } = useLocale();

  const qs = stateParams
    ? `?${new URLSearchParams(
        Object.fromEntries(Object.entries(stateParams).filter(([, v]) => v != null && v !== ''))
      ).toString()}`
    : '';

  const sizes =
    variant === 'landing'
      ? { pad: 'px-3 py-1.5', text: 'text-xs md:text-sm', gap: 'gap-0.5' }
      : { pad: 'px-1.5 py-1 md:px-2.5', text: 'text-[11px] md:text-xs', gap: 'gap-0' };

  const base = `inline-flex items-center rounded-xl border overflow-hidden ${sizes.gap} ${className}`;
  // landing 底色是淺藍漸層（不是深底），所以兩個變體共用同一套淺色調，只差尺寸與陰影。
  const shell =
    variant === 'landing'
      ? 'border-sky-200/80 bg-white/85 backdrop-blur-sm shadow-md'
      : 'border-sky-200/70 bg-sky-50/80 shadow-sm';

  const seg = (code, label, title) => {
    const active = locale === code;
    const activeCls = 'bg-sky-600 text-white font-semibold';
    const idleCls = 'text-slate-500 hover:text-sky-700 hover:bg-sky-100';
    const cls = `${sizes.pad} ${sizes.text} tracking-wider transition-all duration-200 ${
      active ? activeCls : idleCls
    }`;
    if (active) {
      return (
        <span className={cls} aria-current="true" title={title}>
          {label}
        </span>
      );
    }
    return (
      <Link
        href={`${pathForLocale(pathname, code)}${qs}`}
        className={`${cls} cursor-pointer active:scale-95`}
        hrefLang={code === 'en' ? 'en' : 'zh-Hant'}
        title={title}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className={`${base} ${shell}`} role="group" aria-label="Language / 語言">
      {seg('zh', '中', '切換為中文')}
      {seg('en', 'EN', 'View in English')}
    </div>
  );
}
