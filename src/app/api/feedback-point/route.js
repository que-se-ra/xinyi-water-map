import { NextResponse } from 'next/server';

// 地點熱舒適評分 → Google Apps Script（與路線評分同一個部署 SHEETS_API_URL）。
//
// 為什麼送出前要先問 GAS 支不支援：舊版 GAS 腳本不認得 formType: point_comfort，
// 會把它當成地景標記寫進「地景標記回饋」分頁（status=pending），後台審核佇列就多出空白垃圾列。
// 新版腳本的 doGet(?sheet=capabilities) 會回 { capabilities: [...] }；舊版會回地景標記陣列。
// 確認支援後記在模組變數裡，同一個 serverless 執行個體不再重問。

let pointSupported = false;

async function gasSupportsPoint(targetUrl) {
  if (pointSupported) return true;
  const url = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'sheet=capabilities';
  const res = await fetch(url, { method: 'GET', redirect: 'follow', cache: 'no-store' });
  if (!res.ok) return false;
  const data = await res.json().catch(() => null);
  pointSupported = !!(data && Array.isArray(data.capabilities) && data.capabilities.includes('point_comfort'));
  return pointSupported;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const targetUrl = process.env.SHEETS_API_URL;

    if (!targetUrl) {
      return NextResponse.json({ error: 'API URL not configured' }, { status: 503 });
    }

    const lat = num(body.lat);
    const lng = num(body.lng);
    const scores = body.scores || {};
    const validScore = (v) => Number.isInteger(v) && v >= 1 && v <= 5;
    if (lat === null || lng === null || !['shade', 'ventilation', 'surface', 'cooling', 'comfort'].every((k) => validScore(scores[k]))) {
      return NextResponse.json({ error: 'Invalid rating payload' }, { status: 400 });
    }

    if (!(await gasSupportsPoint(targetUrl))) {
      console.error('GAS script does not support point_comfort yet — update the Apps Script from src/lib/gas-template.js');
      return NextResponse.json({ error: 'Rating backend not updated yet' }, { status: 503 });
    }

    // 只轉送需要的欄位，避免任意內容寫進試算表
    const payload = {
      formType: 'point_comfort',
      project_id: typeof body.project_id === 'string' ? body.project_id.slice(0, 40) : '',
      timestamp: new Date().toISOString(),
      lat,
      lng,
      scores: {
        shade: scores.shade,
        ventilation: scores.ventilation,
        surface: scores.surface,
        cooling: scores.cooling,
        comfort: scores.comfort
      },
      reason: typeof body.reason === 'string' ? body.reason.slice(0, 1000) : '',
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    }
    const errorText = await response.text();
    console.error('GAS Error:', errorText);
    return NextResponse.json({ error: 'Failed to write to Google Sheets', details: errorText }, { status: response.status });
  } catch (error) {
    console.error('API feedback-point Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
