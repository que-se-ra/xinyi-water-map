'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useT, useLocalePath } from '@/i18n/LocaleProvider';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';

// ── Section data: id/icon 順序固定，label 需要 t()，改在元件內用 useMemo 組出 ──

// ── Sensitivity badge component ──────────────────────────────
function Badge({ level }) {
  const t = useT();
  const config = {
    low: { emoji: '🟢', text: t('privacy.badge.low'), bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    mid: { emoji: '🟡', text: t('privacy.badge.mid'), bg: 'bg-amber-100 text-amber-700 border-amber-200' },
    high: { emoji: '🔴', text: t('privacy.badge.high'), bg: 'bg-red-100 text-red-700 border-red-200' },
  };
  const c = config[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${c.bg}`}>
      {c.emoji} {c.text}
    </span>
  );
}

// ── Fade-in wrapper ──────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Glass card wrapper (moved to module scope: no closure over PrivacyPage's
//    state, so declaring it inside the component tripped react-hooks/static-components
//    even before this i18n pass — pre-existing issue, hoisted out while fixing lint here) ──
const Card = ({ children, className = '' }) => (
  <div className={`relative bg-white/70 backdrop-blur-md border border-white/60 shadow-lg shadow-slate-200/40 rounded-3xl p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

// ── Main privacy page component ──────────────────────────────
export default function PrivacyPage() {
  const t = useT();
  const lp = useLocalePath();
  const [activeSection, setActiveSection] = useState('intro');

  // Section nav data: id/icon 固定，label 隨語系變化
  const sections = useMemo(() => ([
    { id: 'intro', icon: '💧', label: t('privacy.s1.title') },
    { id: 'collected', icon: '📋', label: t('privacy.s2.navLabel') },
    { id: 'not-collected', icon: '🚫', label: t('privacy.s3.navLabel') },
    { id: 'ai', icon: '🤖', label: t('privacy.s4.navLabel') },
    { id: 'third-party', icon: '🔗', label: t('privacy.s5.navLabel') },
    { id: 'retention', icon: '🗄️', label: t('privacy.s6.navLabel') },
    { id: 'moderation', icon: '👁️', label: t('privacy.s7.title') },
    { id: 'rights', icon: '✊', label: t('privacy.s8.title') },
    { id: 'contact', icon: '📬', label: t('privacy.s9.title') },
  ]), [t]);

  // Set document title for SEO (since 'use client' cannot export metadata)
  useEffect(() => {
    document.title = t('privacy.docTitle');
  }, [t]);

  // Override the global overflow:hidden on html/body so this page can scroll
  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Track active section on scroll via IntersectionObserver
  useEffect(() => {
    const observerOptions = { rootMargin: '-20% 0px -60% 0px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  // Smooth-scroll helper
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="min-h-screen font-sans text-slate-800"
      style={{ background: 'linear-gradient(160deg, #EEF5FA 0%, #FAF8F4 40%, #F5EFE6 100%)' }}
    >
      {/* ── Ambient background decorations ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] left-[15%] w-[35vw] h-[35vw] rounded-full opacity-25 blur-[100px]" style={{ background: 'radial-gradient(circle, #C8E4F8 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #F0DFC4 0%, transparent 70%)' }} />
        <div className="absolute top-[50%] left-[60%] w-[25vw] h-[25vw] rounded-full opacity-15 blur-[80px]" style={{ background: 'radial-gradient(circle, #D6EAF8 0%, transparent 70%)' }} />
      </div>

      {/* ── Sticky top bar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Link
            href={lp('/')}
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-500 transition-colors"
          >
            <span>←</span>
            <span>{t('common.backToMap')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium tracking-wider hidden sm:block">
              {t('privacy.headerTag')}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ── Layout: sidebar + content ── */}
      <div className="relative z-10 max-w-6xl mx-auto flex gap-0 md:gap-10 px-4 md:px-8 py-8 md:py-14">

        {/* ── Sidebar nav (desktop only) ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-3 pl-3">
              {t('privacy.sidebar.toc')}
            </p>
            {sections.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                  activeSection === id
                    ? 'bg-sky-100/80 text-sky-800 shadow-sm border border-sky-200/50 font-bold'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                }`}
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <p className="text-[10px] text-slate-400 pl-3">{t('privacy.sidebar.lastUpdatedLabel')}</p>
              <p className="text-xs text-slate-500 font-semibold pl-3 mt-1">2026-06-03</p>
            </div>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 space-y-8 md:space-y-10">

          {/* ── Page title ── */}
          <FadeIn>
            <div className="text-center md:text-left mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-wide leading-snug">
                {t('privacy.title')}
              </h1>
              <p className="text-slate-500 text-sm md:text-base mt-3 leading-relaxed">
                {t('privacy.subtitle')}
              </p>
              <div className="h-1 w-20 bg-gradient-to-r from-sky-400 to-amber-300 rounded-full mt-4 mx-auto md:mx-0" />
            </div>
          </FadeIn>

          {/* ── § 1 專案簡介 ── */}
          <FadeIn delay={50}>
            <Card>
              <section id="intro" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">💧</span> {t('privacy.s1.title')}
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {t('privacy.s1.openQuote')}<strong className="text-sky-700">{t('site.title')}</strong>{t('privacy.s1.body1')}<strong>{t('privacy.s1.courseName')}</strong>{t('privacy.s1.body2')}<strong>{t('privacy.s1.orgName')}</strong>{t('privacy.s1.body3')}
                </p>
              </section>
            </Card>
          </FadeIn>

          {/* ── § 2 資料收集範圍 ── */}
          <FadeIn delay={100}>
            <Card>
              <section id="collected" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">📋</span> {t('privacy.s2.title')}
                </h2>
                <p className="text-slate-500 text-sm mb-5">
                  {t('privacy.s2.intro')}
                </p>

                {/* Responsive table */}
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-sky-50/80 text-left">
                        <th className="px-4 py-3 font-bold text-slate-700 rounded-tl-xl">{t('privacy.s2.colType')}</th>
                        <th className="px-4 py-3 font-bold text-slate-700">{t('privacy.s2.colMethod')}</th>
                        <th className="px-4 py-3 font-bold text-slate-700 rounded-tr-xl text-center">{t('privacy.s2.colSensitivity')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-sky-50/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">{t('privacy.s2.row1Type')}</td>
                        <td className="px-4 py-3 text-slate-500">{t('privacy.s2.row1Method')}</td>
                        <td className="px-4 py-3 text-center"><Badge level="low" /></td>
                      </tr>
                      <tr className="hover:bg-sky-50/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">{t('privacy.s2.row2Type')}</td>
                        <td className="px-4 py-3 text-slate-500">{t('privacy.s2.row2Method')}</td>
                        <td className="px-4 py-3 text-center"><Badge level="high" /></td>
                      </tr>
                      <tr className="hover:bg-sky-50/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">{t('privacy.s2.row3Type')}</td>
                        <td className="px-4 py-3 text-slate-500">{t('privacy.s2.row3Method')}</td>
                        <td className="px-4 py-3 text-center"><Badge level="mid" /></td>
                      </tr>
                      <tr className="hover:bg-sky-50/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">{t('privacy.s2.row4Type')}</td>
                        <td className="px-4 py-3 text-slate-500">{t('privacy.s2.row4Method')}</td>
                        <td className="px-4 py-3 text-center"><Badge level="low" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </Card>
          </FadeIn>

          {/* ── § 3 明確不收集的資料 ── */}
          <FadeIn delay={100}>
            <Card>
              <section id="not-collected" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">🚫</span> {t('privacy.s3.title')}
                </h2>
                <p className="text-slate-500 text-sm mb-5">
                  {t('privacy.s3.intro1')}<strong className="text-slate-700">{t('privacy.s3.intro2')}</strong>{t('privacy.s3.intro3')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: '👤', text: t('privacy.s3.item1') },
                    { icon: '🍪', text: t('privacy.s3.item2') },
                    { icon: '🌐', text: t('privacy.s3.item3') },
                    { icon: '🎙️', text: t('privacy.s3.item4') },
                    { icon: '📊', text: t('privacy.s3.item5') },
                  ].map(({ icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 bg-red-50/60 border border-red-100/80 rounded-xl px-4 py-3"
                    >
                      <span className="text-lg flex-shrink-0">{icon}</span>
                      <span className="text-sm text-slate-700 font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </section>
            </Card>
          </FadeIn>

          {/* ── § 4 AI 系統使用說明 ── */}
          <FadeIn delay={100}>
            <Card>
              <section id="ai" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">🤖</span> {t('privacy.s4.title')}
                </h2>

                <div className="mb-5 px-4 py-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-sm text-amber-800">
                  <strong>{t('privacy.s4.noticeLabel')}</strong>{t('privacy.s4.noticeBody1')} <strong>{t('privacy.s4.noticeOptIn')}</strong>{t('privacy.s4.noticeBody2')}
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: t('privacy.s4.item1Title'),
                      desc: t('privacy.s4.item1Desc'),
                      tag: t('privacy.s4.item1Tag'),
                    },
                    {
                      title: t('privacy.s4.item2Title'),
                      desc: t('privacy.s4.item2Desc'),
                      tag: t('privacy.s4.item2Tag'),
                    },
                    {
                      title: t('privacy.s4.item3Title'),
                      desc: t('privacy.s4.item3Desc'),
                      tag: t('privacy.s4.item3Tag'),
                    },
                  ].map(({ title, desc, tag }) => (
                    <div key={title} className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                          {tag}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Card>
          </FadeIn>

          {/* ── § 5 第三方資料傳輸 ── */}
          <FadeIn delay={100}>
            <Card>
              <section id="third-party" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔗</span> {t('privacy.s5.title')}
                </h2>
                <p className="text-slate-500 text-sm mb-5">
                  {t('privacy.s5.intro')}
                </p>

                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-indigo-50/80 text-left">
                        <th className="px-4 py-3 font-bold text-slate-700 rounded-tl-xl">{t('privacy.s5.colService')}</th>
                        <th className="px-4 py-3 font-bold text-slate-700">{t('privacy.s5.colData')}</th>
                        <th className="px-4 py-3 font-bold text-slate-700 rounded-tr-xl">{t('privacy.s5.colPurpose')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { service: 'Google Gemini API', data: t('privacy.s5.row1Data'), purpose: t('privacy.s5.row1Purpose') },
                        { service: 'Google Apps Script', data: t('privacy.s5.row2Data'), purpose: t('privacy.s5.row2Purpose') },
                        { service: 'Google Drive', data: t('privacy.s5.row3Data'), purpose: t('privacy.s5.row3Purpose') },
                        { service: 'Google Earth Engine', data: t('privacy.s5.row4Data'), purpose: t('privacy.s5.row4Purpose') },
                        { service: 'Web Speech API', data: t('privacy.s5.row5Data'), purpose: t('privacy.s5.row5Purpose') },
                      ].map(({ service, data, purpose }) => (
                        <tr key={service} className="hover:bg-indigo-50/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-700">{service}</td>
                          <td className="px-4 py-3 text-slate-500">{data}</td>
                          <td className="px-4 py-3 text-slate-500">{purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </Card>
          </FadeIn>

          {/* ── § 6 資料保留與刪除 ── */}
          <FadeIn delay={100}>
            <Card>
              <section id="retention" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">🗄️</span> {t('privacy.s6.title')}
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      item: t('privacy.s6.row1Item'),
                      policy: t('privacy.s6.row1Policy'),
                      icon: '💾',
                    },
                    {
                      item: t('privacy.s6.row2Item'),
                      policy: t('privacy.s6.row2Policy'),
                      icon: '🎙️',
                    },
                    {
                      item: t('privacy.s6.row3Item'),
                      policy: t('privacy.s6.row3Policy'),
                      icon: '📝',
                    },
                  ].map(({ item, policy, icon }) => (
                    <div key={item} className="flex items-start gap-3 bg-slate-50/80 border border-slate-200/60 rounded-xl px-4 py-3">
                      <span className="text-xl mt-0.5 flex-shrink-0">{icon}</span>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{item}</p>
                        <p className="text-slate-500 text-sm mt-0.5">{policy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Card>
          </FadeIn>

          {/* ── § 7 內容審核 ── */}
          <FadeIn delay={100}>
            <Card>
              <section id="moderation" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">👁️</span> {t('privacy.s7.title')}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-green-50/60 border border-green-200/60 rounded-xl px-4 py-4">
                    <span className="text-2xl flex-shrink-0">✅</span>
                    <div>
                      <p className="font-bold text-slate-700 text-sm mb-1">{t('privacy.s7.reviewTitle')}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {t('privacy.s7.reviewBody1')}<strong>{t('privacy.s7.reviewPending')}</strong>{t('privacy.s7.reviewBody2')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-sky-50/60 border border-sky-200/60 rounded-xl px-4 py-4">
                    <span className="text-2xl flex-shrink-0">🤖</span>
                    <div>
                      <p className="font-bold text-slate-700 text-sm mb-1">{t('privacy.s7.noAiTitle')}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {t('privacy.s7.noAiBody1')}<strong>{t('privacy.s7.noAiStrong')}</strong>{t('privacy.s7.noAiBody2')}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </Card>
          </FadeIn>

          {/* ── § 8 使用者權利 ── */}
          <FadeIn delay={100}>
            <Card>
              <section id="rights" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">✊</span> {t('privacy.s8.title')}
                </h2>
                <p className="text-slate-500 text-sm mb-5">
                  {t('privacy.s8.intro')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: '🤖', text: t('privacy.s8.item1') },
                    { icon: '📷', text: t('privacy.s8.item2') },
                    { icon: '📍', text: t('privacy.s8.item3') },
                    { icon: '👀', text: t('privacy.s8.item4') },
                  ].map(({ icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 bg-emerald-50/60 border border-emerald-100/80 rounded-xl px-4 py-3"
                    >
                      <span className="text-lg flex-shrink-0">{icon}</span>
                      <span className="text-sm text-slate-700 font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </section>
            </Card>
          </FadeIn>

          {/* ── § 9 聯絡方式 ── */}
          <FadeIn delay={100}>
            <Card>
              <section id="contact" className="scroll-mt-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <span className="text-2xl">📬</span> {t('privacy.s9.title')}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t('privacy.s9.intro')}
                </p>
                <div className="mt-4 bg-sky-50/80 border border-sky-200/60 rounded-xl px-5 py-4">
                  <p className="text-sky-800 font-bold text-sm">
                    {t('privacy.s9.orgLine1')}
                  </p>
                  <p className="text-sky-700 text-sm mt-1">
                    {t('privacy.s9.orgLine2')}
                  </p>
                </div>
              </section>
            </Card>
          </FadeIn>

          {/* ── Footer ── */}
          <FadeIn delay={100}>
            <div className="text-center pt-6 pb-12 space-y-3">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto" />
              <p className="text-xs text-slate-400">
                {t('privacy.footer.lastUpdatedLabel')}<strong>2026-06-03</strong>
              </p>
              <p className="text-[11px] text-slate-300">
                {t('privacy.footer.copyright')}
              </p>
              <Link
                href={lp('/')}
                className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 active:scale-95"
              >
                {t('privacy.footer.backToMap')}
              </Link>
            </div>
          </FadeIn>

        </main>
      </div>
    </div>
  );
}
