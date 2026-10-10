import './globals.css';

// 這是「平台」層級的 metadata；各專案頁在自己的 generateMetadata 覆寫（見 src/projects/metadata.js）。
// 沒有 metadataBase 的話，alternates 裡的相對網址不會被解析，hreflang 標籤不會產出。
export const metadata = {
  metadataBase: new URL('https://xinyi-water-map-theta.vercel.app'),
  title: '社區文史與環境感知互動地圖',
  description:
    '用地圖走讀社區的歷史與環境，邀請居民一起觀察、標記與回饋。目前有「信水義河」（信義社大合作）與「城市裡的微氣候觀察」（松山文創園區合作）。',
  keywords: '社區文史,環境感知,互動地圖,走讀,信水義河,信義社大,微氣候,台北',
  openGraph: {
    title: '社區文史與環境感知互動地圖',
    description: '用地圖走讀社區的歷史與環境，邀請居民一起觀察、標記與回饋。',
    type: 'website',
    locale: 'zh_TW',
  },
  alternates: {
    canonical: '/',
    languages: { 'zh-Hant': '/', en: '/en' },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Noto+Serif+TC:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Viewer.js for image lightbox */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.6/viewer.min.js" async></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
