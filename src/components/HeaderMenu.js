'use client';

// 頁首右上角的「☰ 選單」：原本左側導覽欄的項目（圖層說明、回饋表單、歷史故事、更新日誌、
// 字體大小）、使用方法導覽與隱私聲明都收在這裡，地圖左右兩側留給搜尋與圖層。

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/LocaleProvider';

export default function HeaderMenu({ tabsOn, activeTab, onTab, onStartTour, fontSize, onFontSize, privacyHref }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // 點選單外面或按 Esc 就收起
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (tab) => {
    onTab(activeTab === tab ? 'map' : tab);
    setOpen(false);
  };

  const items = [
    ['layers', '📊', t('nav.layers')],
    ...(tabsOn.includes('form') ? [['form', '📝', t('nav.form')]] : []),
    ...(tabsOn.includes('history') ? [['history', '📚', t('nav.history')]] : []),
    ['changelog', '📜', t('nav.changelog')],
  ];

  const itemCls = (active) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
      active ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-sky-50'
    }`;

  return (
    <div ref={ref} className="relative">
      <button
        id="header-menu-button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all duration-300 cursor-pointer shadow-sm active:scale-95 ${
          open || activeTab !== 'map'
            ? 'bg-sky-600 text-white border-sky-600'
            : 'text-slate-500 bg-sky-50/80 border-sky-200/70 hover:bg-sky-100 hover:text-sky-700'
        }`}
        title={t('header.toggleMenu')}
      >
        <span aria-hidden>☰</span>
        <span className="hidden sm:inline">{t('header.menu')}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 bg-white/97 backdrop-blur-md border border-sky-100 rounded-2xl shadow-xl p-2 z-[3100]"
        >
          {activeTab !== 'map' && (
            <button type="button" role="menuitem" onClick={() => go('map')} className={itemCls(false)}>
              <span aria-hidden>🗺️</span>
              {t('header.backToMap')}
            </button>
          )}
          {items.map(([tab, icon, label]) => (
            <button key={tab} type="button" role="menuitem" onClick={() => go(tab)} className={itemCls(activeTab === tab)}>
              <span aria-hidden>{icon}</span>
              {label}
            </button>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onStartTour();
            }}
            className={itemCls(false)}
          >
            {/* 字典裡的文字已含 ❓ 圖示 */}
            {t('map.control.usageGuideLabel')}
          </button>
          <Link href={privacyHref} role="menuitem" className={itemCls(false)} onClick={() => setOpen(false)}>
            <span aria-hidden>🛡️</span>
            {t('header.privacy')}
          </Link>

          <div className="mt-1 pt-2 border-t border-slate-100 px-3 pb-1 flex items-center justify-between">
            <span className="text-xs text-slate-500">{t('nav.fontSize')}</span>
            <div className="flex gap-1" role="radiogroup" aria-label={t('nav.fontSize')}>
              {[
                ['small', 'text-xs', t('nav.fontSmall')],
                ['medium', 'text-sm', t('nav.fontMedium')],
                ['large', 'text-base', t('nav.fontLarge')],
              ].map(([v, size, label]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={fontSize === v}
                  aria-label={label}
                  title={label}
                  onClick={() => onFontSize(v)}
                  className={`w-8 h-8 rounded-lg font-semibold ${size} ${
                    fontSize === v ? 'bg-sky-500 text-white' : 'bg-sky-50 text-slate-500 border border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  A
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
