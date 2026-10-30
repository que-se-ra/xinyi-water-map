// 國土測繪中心底圖上，松山文創園區一帶的地名修正（2026-10-30 依松山文創園區提供的修正建議）。
//
// 這些地名是印在圖磚裡的，不能直接改文字，所以分兩步：
//   1. CORRECTION_BOXES：標出每一級圖磚上要拿掉的文字與圖示（世界像素座標），
//      在瀏覽器裡用同一服務的「無文字版」（EMAPX99）當參考，把框內還原成沒有字的樣子。
//      只在使用者的瀏覽器裡即時處理，不重新發布圖磚（查不到允許改作後再發布的明確條款）。
//   2. CORRECTED_LABELS：由網站自己畫上正確名稱（BasemapTileLayer.js）。
//
// 圖磚內容若改版（標註位置移動），框可能對不上，舊字會重新出現；重新量框即可。
// 量框方式：下載 EMAP01／EMAP8 各級圖磚拼圖，框內座標加上拼圖原點 × 256。

const NLSC = 'https://wmts.nlsc.gov.tw/wmts';

export const CORRECTION_BOXES = {
  EMAP01: {
    14: [[3513377,1795588,3513479,1795620]],
    15: [[7026805,3591214,7026905,3591245]],
    16: [[14053659,7182434,14053760,7182470]],
    17: [[28107489,14364769,28107579,14364803],[28107337,14364880,28107403,14364914],[28107411,14364882,28107530,14364902],[28107613,14364898,28107655,14364916]],
    18: [[56215024,28729549,56215114,28729582],[56215110,28729568,56215199,28729602],[56214708,28729770,56214774,28729804],[56214790,28729774,56214892,28729808],[56215246,28729803,56215288,28729823]],
    19: [[112430092,57459104,112430183,57459141],[112430262,57459145,112430353,57459180],[112429448,57459548,112429514,57459584],[112429633,57459556,112429735,57459592],[112429857,57459627,112429959,57459653]],
  },
  EMAP8: {
    14: [[3513420,1795602,3513438,1795620],[3513437,1795588,3513522,1795634]],
    15: [[7026732,3591215,7026846,3591247],[7026847,3591215,7026864,3591233]],
    16: [[14053666,7182431,14053756,7182496]],
    17: [[28107479,14364769,28107590,14364818],[28107341,14364881,28107398,14364942],[28107411,14364868,28107515,14364915],[28107577,14364885,28107644,14364904]],
    18: [[56215012,28729549,56215124,28729597],[56215136,28729569,56215174,28729600],[56214713,28729770,56214768,28729832],[56214799,28729774,56214885,28729837],[56215233,28729803,56215301,28729822]],
    19: [[112430082,57459106,112430192,57459153],[112430290,57459147,112430329,57459179],[112429453,57459549,112429509,57459611],[112429643,57459558,112429726,57459620],[112429934,57459639,112430022,57459663]],
  },
};

/**
 * 網站自己畫的地名。誠品的兩個名稱照園區標註的位置：
 * 原本「松菸誠品表演廳」的位置標「誠品生活松菸」，原本「誠品生活松菸店」的位置標「誠品表演廳」。
 */
export const CORRECTED_LABELS = [
  {
    id: 'park',
    lat: 25.0435,
    lng: 121.5606,
    // 第 14 級會和「臺北大巨蛋」擠在一起，從第 15 級開始畫
    minZoom: 15,
    strong: true,
    zh: '松山文創園區（松山菸廠）',
    en: 'Songshan Cultural and Creative Park (Songshan Tobacco Factory)',
  },
  { id: 'eslite', lat: 25.04471, lng: 121.56113, minZoom: 17, zh: '誠品生活松菸', en: 'Eslite Spectrum Songyan' },
  { id: 'hall', lat: 25.04462, lng: 121.56159, minZoom: 18, zh: '誠品表演廳', en: 'Eslite Performance Hall' },
];

/** 底圖網址對應的修正資料（沒有修正的底圖回 null） */
export function correctionsForUrl(url) {
  const layer = Object.keys(CORRECTION_BOXES).find((k) => url?.includes(`/${k}/`));
  return layer ? CORRECTION_BOXES[layer] : null;
}

/** 這張圖磚要處理的範圍（圖磚內的像素座標）；不需要處理時回空陣列 */
export function boxesForTile(corrections, { x, y, z }, size = 256) {
  const left = x * size;
  const top = y * size;
  const out = [];
  for (const [x1, y1, x2, y2] of corrections?.[z] || []) {
    const b = [Math.max(x1 - left, 0), Math.max(y1 - top, 0), Math.min(x2 - left, size), Math.min(y2 - top, size)];
    if (b[0] < b[2] && b[1] < b[3]) out.push(b);
  }
  return out;
}

export function referenceTileUrl({ x, y, z }) {
  return `${NLSC}/EMAPX99/default/GoogleMapsCompatible/${z}/${y}/${x}`;
}

// 無文字版也留著圖示，圖示裡的白色會被當成道路顏色，所以框內面積太小的同色區塊一律不採用
const MIN_REGION_AREA = 150;
// 整張圖磚出現次數太少的顏色（反鋸齒、浮水印）不拿來對照
const MIN_COLOR_COUNT = 30;

/**
 * 把框內還原成沒有字的樣子（直接改 base 的像素）。
 * base、ref 是同一張圖磚的 RGBA 像素：base 是有字的底圖，ref 是無文字版。
 * 兩者配色不同但圖形相同，所以先從框外學「ref 的顏色 → base 的顏色」，再照 ref 把框內填回去；
 * 對不到的像素（圖示、反鋸齒）用最近的已知像素補。
 */
export function cleanTilePixels(base, ref, boxes, size = 256) {
  const n = size * size;
  const inBox = new Uint8Array(n);
  for (const [x1, y1, x2, y2] of boxes) {
    for (let y = y1; y < y2; y++) inBox.fill(1, y * size + x1, y * size + x2);
  }
  const refKey = new Int32Array(n);
  const baseKey = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    refKey[i] = (ref[p] << 16) | (ref[p + 1] << 8) | ref[p + 2];
    baseKey[i] = (base[p] << 16) | (base[p + 1] << 8) | base[p + 2];
  }

  // 1. 框外學對照表：每個 ref 顏色對應到最常出現的 base 顏色
  const tally = new Map();
  for (let i = 0; i < n; i++) {
    if (inBox[i]) continue;
    let t = tally.get(refKey[i]);
    if (!t) tally.set(refKey[i], (t = new Map()));
    t.set(baseKey[i], (t.get(baseKey[i]) || 0) + 1);
  }
  const lut = new Map();
  for (const [key, t] of tally) {
    let total = 0;
    let best = 0;
    let bestCount = 0;
    for (const [v, c] of t) {
      total += c;
      if (c > bestCount) [best, bestCount] = [v, c];
    }
    if (total >= MIN_COLOR_COUNT) lut.set(key, best);
  }

  // 2. 框內找出夠大的同色區塊，照對照表填色；太小的（圖示）先留白
  const known = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (!inBox[i]) known[i] = 1;
  const seen = new Uint8Array(n);
  const stack = [];
  for (let s = 0; s < n; s++) {
    if (!inBox[s] || seen[s]) continue;
    const key = refKey[s];
    const region = [];
    stack.push(s);
    seen[s] = 1;
    while (stack.length) {
      const i = stack.pop();
      region.push(i);
      const x = i % size;
      for (const j of [x > 0 ? i - 1 : -1, x < size - 1 ? i + 1 : -1, i - size, i + size]) {
        if (j >= 0 && j < n && inBox[j] && !seen[j] && refKey[j] === key) {
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
    if (region.length >= MIN_REGION_AREA && lut.has(key)) {
      const v = lut.get(key);
      for (const i of region) {
        baseKey[i] = v;
        known[i] = 1;
      }
    }
  }

  // 3. 其餘像素由已知像素往外擴散補滿（只補框內）
  let frontier = [];
  for (let i = 0; i < n; i++) if (known[i]) frontier.push(i);
  while (frontier.length) {
    const next = [];
    for (const i of frontier) {
      const x = i % size;
      for (const j of [x > 0 ? i - 1 : -1, x < size - 1 ? i + 1 : -1, i - size, i + size]) {
        if (j >= 0 && j < n && !known[j]) {
          known[j] = 1;
          baseKey[j] = baseKey[i];
          next.push(j);
        }
      }
    }
    frontier = next;
  }

  for (let i = 0; i < n; i++) {
    if (!inBox[i]) continue;
    const p = i * 4;
    base[p] = (baseKey[i] >> 16) & 255;
    base[p + 1] = (baseKey[i] >> 8) & 255;
    base[p + 2] = baseKey[i] & 255;
    base[p + 3] = 255;
  }
}
