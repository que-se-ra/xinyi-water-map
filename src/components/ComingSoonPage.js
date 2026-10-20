'use client';

// 尚未開放的專案頁：只說明「籌備中」，沒有地圖內容。

import Link from 'next/link';
import { useT, useLocalePath } from '@/i18n/LocaleProvider';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';

export default function ComingSoonPage({ card }) {
  const t = useT();
  const lp = useLocalePath();

  return (
    // 全站 html/body 是 overflow: hidden（給地圖頁用），這頁要自己當捲動容器，否則手機上超出畫面的卡片滑不到
    <div className="h-dvh overflow-y-auto bg-[#eff9ff]">
    <main
      className="min-h-full flex flex-col items-center justify-center px-4 py-16 relative"
      style={{ background: 'linear-gradient(180deg, #dbeafe 0%, #c7e9fc 40%, #eff9ff 100%)' }}
    >
      <div className="absolute top-4 right-4 md:top-6 md:right-8">
        <LanguageSwitcher variant="landing" />
      </div>
      <div className="max-w-xl w-full text-center flex flex-col items-center gap-5 rounded-2xl p-8 md:p-10 border border-amber-200/70 bg-[#fffaf0]/90 shadow-md shadow-sky-200/40">
        <span className="px-3 py-1 rounded-full text-[11px] tracking-widest border bg-amber-50 text-amber-800 border-amber-200">
          {t('platform.soon.title')}
        </span>
        <h1
          className="text-2xl md:text-3xl text-slate-700 tracking-widest leading-snug"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
        >
          {card.name}
        </h1>
        <p className="text-amber-800/80 text-xs tracking-wider">{t('platform.partner', { name: card.partner })}</p>
        <p className="text-slate-600 text-sm leading-relaxed">{t('platform.soon.body')}</p>
        <Link href={lp('/')} className="text-sky-600 hover:text-sky-500 text-sm tracking-widest transition-colors">
          {t('platform.back')}
        </Link>
      </div>
    </main>
    </div>
  );
}
