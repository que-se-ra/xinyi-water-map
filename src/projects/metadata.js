// 專案頁的 SEO metadata（canonical + hreflang）。
// page: 'home' | 'survey'。metadataBase 在根 layout 設定，這裡只寫相對路徑。

export function projectMetadata(project, locale, page = 'home') {
  const m = project.meta[locale];
  const bare = page === 'home' ? `/${project.slug}` : `/${project.slug}/${page}`;
  const alternates = {
    canonical: locale === 'en' ? `/en${bare}` : bare,
    languages: { 'zh-Hant': bare, en: `/en${bare}` },
  };

  if (page === 'survey') {
    return { title: m.survey.title, description: m.survey.description, alternates };
  }
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    openGraph: {
      title: m.title,
      description: m.ogDescription,
      type: 'website',
      locale: locale === 'en' ? 'en' : 'zh_TW',
    },
    alternates,
  };
}
