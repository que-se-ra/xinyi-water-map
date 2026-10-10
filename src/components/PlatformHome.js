'use client';

// 多專案平台首頁：專案卡片列表。配色沿用站內「淺藍＋暖淺棕＋奶油」。
// cards 由 server 端依語言整理好（src/projects/cards.js），這裡只負責排版。

import Link from 'next/link';
import { useT, useLocalePath } from '@/i18n/LocaleProvider';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';

export default function PlatformHome({ cards }) {
  const t = useT();
  const lp = useLocalePath();

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 md:px-8 py-14 md:py-20 relative"
      style={{ background: 'linear-gradient(180deg, #dbeafe 0%, #c7e9fc 38%, #ddf4fd 70%, #eff9ff 100%)' }}
    >
      <div className="absolute top-4 right-4 md:top-6 md:right-8">
        <LanguageSwitcher variant="landing" />
      </div>

      <div className="max-w-4xl w-full flex flex-col items-center gap-10">
        <header className="text-center flex flex-col items-center gap-4 max-w-2xl">
          <h1
            className="text-3xl md:text-5xl text-slate-700 tracking-[0.12em] leading-snug"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
          >
            {t('platform.title')}
          </h1>
          <p
            className="text-slate-500 text-sm md:text-base tracking-[0.08em] leading-loose"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('platform.intro')}
          </p>
          <div className="flex items-center gap-3 mt-1 opacity-50">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-sky-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-sky-400" />
          </div>
        </header>

        <section className="w-full" aria-labelledby="platform-projects">
          <h2
            id="platform-projects"
            className="text-xs text-slate-500 tracking-[0.3em] mb-4 text-center"
          >
            {t('platform.projects')}
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {cards.map((c) => {
              const open = c.status === 'active';
              return (
                <li key={c.slug}>
                  <Link
                    href={lp(`/${c.slug}`)}
                    className="group h-full flex flex-col gap-3 rounded-2xl p-6 border border-amber-200/70 bg-[#fffaf0]/90 shadow-md shadow-sky-200/40 hover:-translate-y-0.5 hover:shadow-lg hover:border-sky-300 transition-all duration-300"
                  >
                    <span
                      className={`self-start px-3 py-1 rounded-full text-[11px] tracking-widest border ${
                        open
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {open ? t('platform.status.open') : t('platform.status.soon')}
                    </span>
                    <div>
                      <h3
                        className="text-xl md:text-2xl text-slate-700 tracking-widest leading-snug"
                        style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
                      >
                        {c.name}
                      </h3>
                      {c.subtitle && (
                        <p className="text-slate-400 text-xs md:text-sm tracking-wider mt-1">{c.subtitle}</p>
                      )}
                    </div>
                    {c.summary && (
                      <p className="text-slate-600 text-sm leading-relaxed">{c.summary}</p>
                    )}
                    <p className="text-amber-800/80 text-xs tracking-wider mt-auto pt-2">
                      {t('platform.partner', { name: c.partner })}
                    </p>
                    <span className="text-sky-600 text-sm tracking-widest flex items-center gap-1.5">
                      {open ? t('platform.cta.open') : t('platform.cta.soon')}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="text-center">
          <Link
            href={lp('/privacy')}
            className="text-sky-600 hover:text-sky-500 text-xs tracking-widest transition-colors"
          >
            🛡️ {t('header.privacy')}
          </Link>
        </footer>
      </div>
    </main>
  );
}
