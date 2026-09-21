'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useT, useLocalePath } from '@/i18n/LocaleProvider';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';

// 載入中畫面獨立成元件，才能在裡面呼叫 useT()
function SurveyLoading() {
  const t = useT();
  return (
    <div className="text-center py-16">
      <div className="inline-block w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-3" />
      <p className="text-slate-400 text-sm tracking-widest">{t('survey.page.loading')}</p>
    </div>
  );
}

// Leaflet 需要 window — 僅在客戶端載入
const ThermalSurveyForm = dynamic(() => import('@/components/forms/ThermalSurveyForm'), {
  ssr: false,
  loading: SurveyLoading,
});

export default function SurveyPage() {
  const t = useT();
  const lp = useLocalePath();
  return (
    // globals.css 將 html/body 鎖 overflow:hidden（全屏地圖需要），此頁必須自成滾動容器
    <div className="h-dvh overflow-y-auto bg-sky-50">
      {/* ── Top Header ── */}
      <header
        className="sticky top-0 z-[3000] w-full h-16 backdrop-blur-md border-b border-sky-200/60 flex items-center justify-between px-4 md:px-6 shadow-sm"
        style={{ background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)' }}
      >
        <div className="flex items-center">
          <h1
            className="text-slate-700 text-sm md:text-xl tracking-widest leading-none flex-shrink-0"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
          >
            {t('survey.page.title')}
          </h1>
          <span className="h-4 md:h-5 w-px bg-sky-200 mx-2 md:mx-3 flex-shrink-0" />
          <p className="text-slate-400 text-[10px] md:text-sm tracking-wider font-sans whitespace-nowrap">
            {t('survey.page.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher />
          <Link
            href={lp('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-500 bg-sky-50/80 border border-sky-200/70 hover:bg-sky-100 hover:text-sky-700 transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
          >
            <span>🗺️</span>
            <span>{t('survey.page.backToMap')}</span>
          </Link>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <header className="mb-8 text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs text-amber-700 bg-amber-50 border border-amber-200 shadow-sm tracking-widest">
            {t('survey.page.badge')}
          </span>
          <h2
            className="text-2xl md:text-3xl text-slate-700 tracking-[0.12em] leading-snug"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
          >
            {t('survey.page.heading')}
            {t('survey.page.headingSep')}
            <br className="md:hidden" />
            <span className="text-xl md:text-3xl">{t('survey.page.subtitle')}</span>
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md">
            {t('survey.page.intro')}
          </p>
          <div className="flex items-center gap-3 mt-1 opacity-50">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-amber-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-amber-400" />
          </div>
        </header>

        <ThermalSurveyForm />

        <footer className="text-center pb-10 flex flex-col items-center gap-2">
          <p className="text-[11px] text-slate-400 tracking-widest">
            {t('survey.page.orgFooter')}
          </p>
          <Link href={lp('/privacy')} className="text-sky-500 hover:text-sky-400 text-[11px] tracking-widest transition-colors">
            {t('survey.page.privacyLink')}
          </Link>
        </footer>
      </main>
    </div>
  );
}
