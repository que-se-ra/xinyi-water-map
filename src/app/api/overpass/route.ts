import { NextResponse, NextRequest } from 'next/server';

// 最壞情況三個鏡像各等 10 秒，預留到 40 秒，免得 Vercel 先一步中斷函式
export const maxDuration = 40;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // Overpass 公共鏡像，依序嘗試（逐個試而不是同時打，避免加重公共服務負擔）。
    // 2026-10-20 實測：overpass.nchc.org.tw 網域已不存在（ENOTFOUND）；
    // overpass-api.de 斷線、kumi.systems 逾時；overpass.private.coffee 正常且不限流，所以排第一。
    // 之後若又全部失敗，先查各鏡像的 /api/status，再調整這個清單。
    const mirrors = [
      'https://overpass.private.coffee/api/interpreter',
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];

    let lastError: string = 'Unknown error';
    for (const url of mirrors) {
      try {
        console.log(`Trying Overpass mirror: ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 每個鏡像最多等 10 秒

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'XinyiWaterMap/1.1 (https://xinyi-water-map.vercel.app; architecture/urban study)'
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        } else {
          const text = await res.text();
          console.warn(`Mirror ${url} returned status ${res.status}: ${text}`);
          lastError = `Status ${res.status}`;
        }
      } catch (err: any) {
        console.error(`Failed to fetch from Overpass mirror ${url}:`, err);
        lastError = err.message || String(err);
      }
    }

    return NextResponse.json({ error: `All Overpass mirrors failed. Last error: ${lastError}` }, { status: 502 });
  } catch (error: any) {
    console.error('Error in Overpass proxy route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
