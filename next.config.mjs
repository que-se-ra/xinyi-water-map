/** @type {import('next').NextConfig} */
const nextConfig = {
  // 舊網址轉址：問卷頁搬進專案之下。已分享的 /survey 連結要能繼續使用。
  // 先用暫時轉址（307）：永久轉址會被瀏覽器長期快取，正式上線前再評估改成 permanent。
  async redirects() {
    return [
      // 舊版首頁連結：語言切換鈕與分享出去的網址帶有 ?landing= / ?tab=，這類連結一定是要看信義地圖。
      // 純 "/"（沒帶參數）現在是專案列表，不轉址。
      ...['landing', 'tab'].flatMap((key) => [
        { source: '/', has: [{ type: 'query', key }], destination: '/xinyi', permanent: false },
        { source: '/en', has: [{ type: 'query', key }], destination: '/en/xinyi', permanent: false },
      ]),
      { source: '/survey', destination: '/xinyi/survey', permanent: false },
      { source: '/en/survey', destination: '/en/xinyi/survey', permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/taipei-trees',
        destination: 'https://data.taipei/api/v1/dataset/7a49d00c-a5ff-4a6b-be9e-aaa6dc1ff7e8?scope=resourceAquire&limit=1000',
      },
      {
        source: '/api/taipei-sidewalks',
        destination: 'https://data.taipei/api/dataset/715d3a83-8445-4496-b6bf-b0900538b7e7/resource/b11d6142-1d71-41d5-a843-7b7cfcea61ef/download',
      },
    ];
  },
};

export default nextConfig;
