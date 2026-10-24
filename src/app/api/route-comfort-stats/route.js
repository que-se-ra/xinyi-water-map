import { NextResponse } from 'next/server';
import { parseProjectParam } from '@/lib/project-scope';
import { aggregateRouteComfort } from '@/lib/route-comfort';

/**
 * GET - 路線舒適度統計
 * 從 GAS 讀取所有評分原始列，按 route_id + segment_id 聚合平均分。
 * 回傳格式：
 * {
 *   stats: {
 *     "1": {
 *       "seg_1": { count, avg: { shade, surface, safety, comfort }, overall, dist: { shade: [n1..n5], … } }
 *     }
 *   },
 *   total: 57
 * }
 */
export async function GET(request) {
  try {
    // ?project=xinyi 只統計該專案的評分；沒帶參數維持舊行為（全部）
    const project = parseProjectParam(new URL(request.url).searchParams.get('project'));

    const targetUrl = process.env.SHEETS_API_URL;

    if (!targetUrl) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 503 });
    }

    // GAS 腳本現在是單一部署、多分頁：需明確指定要讀「路線舒適度評分」分頁
    const routeSheetUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}sheet=route`;

    const response = await fetch(routeSheetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      redirect: 'follow',
      // 評分資料變動不頻繁，快取 60 秒減少 GAS 負載
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GAS comfort-stats fetch error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from Google Sheets' }, { status: 502 });
    }

    let records;
    try {
      records = await response.json();
    } catch {
      // 舊版 GAS 腳本沒有 doGet，會回傳 HTML 錯誤頁
      return NextResponse.json(
        { error: 'GAS endpoint does not support GET — please update the deployed script with src/lib/gas-route-template.js' },
        { status: 502 }
      );
    }

    if (!Array.isArray(records)) {
      return NextResponse.json({ stats: {}, total: 0 });
    }

    // 聚合：route_id → segment_id → 平均分與 1～5 分的人數分布（見 src/lib/route-comfort.js）
    const { stats, total } = aggregateRouteComfort(records, project);

    return NextResponse.json({ stats, total });
  } catch (error) {
    console.error('API route-comfort-stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
