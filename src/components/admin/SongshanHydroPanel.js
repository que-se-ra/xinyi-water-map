'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// 後台專題：松山文創園區生態水文導覽前置調查（2026 原創基地節）。
// 內容為計畫團隊研究草稿，只放後台、不對外公開。

const SongshanHydroMap = dynamic(() => import('./SongshanHydroMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full rounded-xl bg-slate-800 flex items-center justify-center text-sm text-slate-400">
      地圖載入中…
    </div>
  )
});

const YEARS = [
  {
    id: 'jm1904',
    label: '1904 臺灣堡圖',
    caption: '日治初期。園區範圍全是水田符號，地名「興雅」。西北角有一條雙線圳路沿鐵道南側往東北走，南側另有一條圳路斜穿今大巨蛋一帶。'
  },
  {
    id: 'jm1921',
    label: '1921 地形圖',
    caption: '仍是一片水田。園區範圍內有一條自然蜿蜒的溝渠由西北往東南流。這張圖的鐵道位置和其他年代對不太上，配準誤差較大，只作參考。'
  },
  {
    id: 'liugong1939',
    label: '1939 瑠公水利區域圖',
    caption: '關鍵圖資。西側粗紅線是瑠公圳第一幹線（今延吉街一線），在鐵道南側的「頂店仔汴」分出興雅派線，沿「專賣工場」（松山菸廠）北緣往東，流向「鐵道工場」（今臺北機廠）。工場東側的灰藍雙線是自然排水溝。'
  },
  {
    id: 'am1944',
    label: '1944 美軍地形圖',
    caption: '菸廠已建成。園區東、南側畫有多條藍色溪溝。這組圖磚只到第 15 級，放大後會變模糊。'
  },
  {
    id: 'tm1989',
    label: '1989 地形圖',
    caption: '圳路已從地圖上消失，周邊全面都市化。菸廠東側的藍色水池就是今天的生態景觀池。'
  },
  { id: null, label: '現況', caption: '現況底圖。編號是建議的導覽點位，虛線是建議的走法，第 0 站為選配。' }
];

const STOPS = [
  {
    n: '0', optional: true, position: [25.04433, 121.55385],
    title: '頂店仔汴舊址（延吉街 × 市民大道口）',
    meta: '選配 · 距園區西北角約 400 m · 步行約 6 分鐘',
    see: '今天只剩車流與高架橋。對照 1939 年地圖，這裡是第一幹線分水給興雅、中崙兩條派線的「汴」（分水閘）。',
    say: '瑠公圳從新店溪引水，一路流到這裡再分給各庄的田。松菸所在的興雅，就是靠這條派線灌溉的。',
    doIt: '沿市民大道南側往東走進園區，腳下大致就是當年派線的走向。'
  },
  {
    n: '1', position: [25.04501, 121.55964],
    title: '菸廠路・派線沿線（園區北緣）',
    meta: '1939 圖：派線緊貼「專賣工場」北界 · 對面是臺北機廠（今國家鐵道博物館園區）',
    see: '園區北界、鐵道與機廠。1939 年圖上，派線就夾在菸廠和鐵道工場之間。',
    say: '1930 年代松山被劃進臺北都市計畫，工廠和鐵道設施進駐原本的水田，圳路變成工業用地之間的一條邊界。',
    doIt: '找找路面的雨水溝蓋與排水方向，討論「圳」怎麼變成「排水溝」。'
  },
  {
    n: '2', position: [25.04348, 121.56233],
    title: '生態景觀池',
    meta: '建議主站 · 1989 地形圖已見此池',
    see: '池水高低（四季水滿水枯不一）、李氏禾草叢、水鳥。文化快遞提到白腹秧雞、紅冠水雞、黑冠麻鷺。',
    say: '原本是消防蓄水池，最初靠瑠公圳支流供水；圳停用後，現在主要靠雨水。這是瑠公圳在松菸最具體的遺緒。',
    doIt: '熱像儀比較水面、池邊草地、周邊鋪面的溫度，接上企劃書「水環境能降溫」的討論。'
  },
  {
    n: '3', position: [25.04362, 121.56147],
    title: '椰林大道',
    meta: '企劃原路線第 1 站 · 緊鄰生態池西側',
    see: '高大喬木下的遮蔭與通風。',
    say: '建廠前這裡是水田，今天的樹林是戰後大量植栽的結果。',
    doIt: '和第 2 站的讀數比較：遮蔭和水體，哪個降溫多？'
  },
  {
    n: '4', position: [25.04365, 121.56056],
    title: '巴洛克花園',
    meta: '製菸工廠中庭 · 四角三角形水池與中央噴泉',
    see: '設計過的幾何水景。',
    say: '對照前面的圳水與蓄水池：同一座工廠裡有灌溉水、防火水，也有觀賞用的水。',
    doIt: '請參與者依「用途」替園區裡的水分類。'
  },
  {
    n: '5', position: [25.04309, 121.55943],
    title: '楓香大道 → 大巨蛋側廣場',
    meta: '1904 堡圖：一條圳路斜穿今大巨蛋南側一帶（位置為概略判讀）',
    see: '從林蔭走到大面積鋪面的溫度轉換。',
    say: '一百多年前這裡是水田和圳溝，現在是不透水的鋪面。雨水去哪裡了？',
    doIt: '熱像儀量測鋪面溫度，和第 2、3 站對照。'
  },
  {
    n: '6', position: [25.04358, 121.55857],
    title: '製菸工廠周邊 → 室內工作坊',
    meta: '企劃原路線終點',
    doIt: '把各站溫度與觀察上傳到互動地圖，討論「在，不再？」：瑠公圳已經不在，它留下的水池、綠地和地名還在。'
  }
];

const VERDICTS = [
  {
    claim: '瑠公圳流經松菸',
    tag: '精確化後成立', tone: 'amber',
    basis: '1939 瑠公水利區域圖：頂店仔汴分出的紅色實線沿專賣工場北緣東行（圖面判讀）。維基百科〈瑠公圳〉：興雅派線自頂店仔汴分出，大致沿市民大道南側向東到臺鐵臺北機廠。兩者吻合。'
  },
  {
    claim: '生態池曾由瑠公圳供水',
    tag: '有出版品記載，缺一手文件', tone: 'amber',
    basis: '《文化快遞》〈認識生物多樣性 松菸散步森呼吸〉。1989 年地形圖已看得到這個池，位置和今天的生態景觀池吻合。建池年代和取水口位置未查證。'
  },
  {
    claim: '建廠前是農田水田',
    tag: '成立', tone: 'emerald',
    basis: '1904 臺灣堡圖、1921 地形圖上，園區範圍幾乎全是水田符號，地名為「興雅」。1937 年才在此興建松山菸草工場。'
  },
  {
    claim: '還有其他水系經過',
    tag: '圖上可見，名稱未查證', tone: 'slate',
    basis: '1939 圖園區東側有一條灰藍雙線的自然排水溝，由南往北。1944 美軍地圖在園區東、南側也畫了多條溪溝。1921 圖有一條蜿蜒溝渠穿過園區範圍，但這張圖的配準誤差較大。'
  }
];

const TONE = {
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  slate: 'bg-slate-500/10 text-slate-300 border-slate-500/30'
};

const TODO = [
  '1939 年《瑠公水利組合區域圖》的正式圖例：紅實線、紅虛線、灰藍雙線各代表什麼（本頁的判讀是依圖面慣例推斷）。',
  '生態景觀池的建造年代、原始取水口與停止引水的時間。可查臺北市文化局的松山菸廠古蹟調查研究或修復報告。',
  '園區東側那條自然排水溝的名稱。可查瑠公管理處出版品、《瑠公圳誌》或地方文史資料。',
  '興雅派線何時停用、改為加蓋或下水道。'
];

const SOURCES = [
  { text: '中央研究院人社中心 GIS 專題中心 歷史圖磚：1904 臺灣堡圖、1921 地形圖、1939 瑠公水利組合區域圖、1944 美軍地形圖、1989 地形圖（與本站古今地圖圖層相同）。' },
  { text: '維基百科〈瑠公圳〉：第一幹線路線、興雅派線與中崙派線、頂店仔汴。二手資料，已和 1939 圖面交叉比對。', href: 'https://zh.wikipedia.org/zh-tw/%E7%91%A0%E5%85%AC%E5%9C%B3' },
  { text: '臺北市政府文化局《文化快遞》〈認識生物多樣性 松菸散步森呼吸〉：生態景觀池原為消防蓄水池、最初由瑠公圳支流供水、園區鳥類與植物。', href: 'https://cultureexpress.taipei/PastTopic/C000004?ID=f175ff48-84ed-472e-9087-10411488d769&PageType=1' },
  { text: '維基百科〈松山文創園區〉：巴洛克花園水池與噴泉、戰後植栽、園區生物。', href: 'https://zh.wikipedia.org/zh-tw/%E6%9D%BE%E5%B1%B1%E6%96%87%E5%89%B5%E5%9C%92%E5%8D%80' },
  { text: '松山文創園區官網〈關於松菸〉：1937 年臺灣總督府專賣局松山菸草工場。官網沒有提到生態池或瑠公圳。', href: 'https://www.songshanculturalpark.org/about' },
  { text: '《2026 年原創基地節活動—工作坊座談會》活動規劃文件：建議路線（椰林大道 → 楓香大道 → 巴洛克花園 → 製菸工廠周邊 → 室內工作坊）。' }
];

function Section({ title, hint, children }) {
  return (
    <section className="bg-slate-900/40 rounded-2xl border border-white/5 p-4 sm:p-5">
      <h3 className="text-sm font-bold text-slate-100 mb-1">{title}</h3>
      {hint && <p className="text-xs text-slate-500 mb-3 leading-relaxed">{hint}</p>}
      {children}
    </section>
  );
}

export default function SongshanHydroPanel() {
  const [yearId, setYearId] = useState('liugong1939');
  const [opacity, setOpacity] = useState(0.85);
  const [showTraces, setShowTraces] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const year = YEARS.find((y) => y.id === yearId);

  return (
    <div className="space-y-4">
      {/* 標題與結論 */}
      <section className="bg-slate-900/40 rounded-2xl border border-white/5 p-4 sm:p-6 space-y-3">
        <p className="text-[11px] font-mono tracking-wider text-slate-500">
          原創基地節 · 松山文創園區 · 生態水文導覽前置調查 · 2026-09-28
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 leading-snug">
          松菸底下，曾有一條<span className="text-rose-400">瑠公圳</span>的派線
        </h2>
        <div className="border-l-4 border-rose-400/70 pl-4 space-y-2 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-rose-300">社大老師的說法大致成立，但要講得更精確。</strong>
            流經松菸的不是瑠公圳主幹，而是「第一幹線」在延吉街與市民大道口的<b>頂店仔汴</b>分出的<b>興雅派線</b>。1939 年《瑠公水利組合區域圖》上，這條派線沿「專賣工場」（松山菸廠）北緣往東流，位置大約是今天的菸廠路。第一幹線本身沿延吉街南北走，在園區西邊約 400 公尺，沒有穿過園區。
          </p>
          <p>
            園區的生態景觀池，臺北市政府文化局刊物寫到它「早期作為消防蓄水池」、「最初仰賴瑠公圳支流供水」，現在水源主要靠雨水。這是目前找到最直接把瑠公圳和松菸連在一起的文字來源。
          </p>
        </div>
      </section>

      <Section title="核實結果" hint="逐條對照社大老師的說法與可查到的圖資、文獻。">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[560px]">
            <thead>
              <tr className="text-slate-500 border-b border-white/10">
                <th className="text-left py-2 pr-3 font-medium w-40">說法</th>
                <th className="text-left px-2 font-medium w-44">判定</th>
                <th className="text-left pl-2 font-medium">依據</th>
              </tr>
            </thead>
            <tbody>
              {VERDICTS.map((v) => (
                <tr key={v.claim} className="border-b border-white/5 align-top">
                  <td className="py-2.5 pr-3 text-slate-200 font-medium">{v.claim}</td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold ${TONE[v.tone]}`}>{v.tag}</span>
                  </td>
                  <td className="py-2.5 pl-2 text-slate-400 leading-relaxed">{v.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="古今地圖對照"
        hint="切換年代，並用透明度拉桿把古地圖疊在現況底圖上。紅框是今天松菸與大巨蛋一帶的約略範圍；半透明色線是在古地圖上目測判讀後加的標示，誤差可能有數十公尺，不屬於原圖。"
      >
        <div className="flex flex-wrap gap-1 mb-3">
          {YEARS.map((y) => (
            <button
              key={y.label}
              onClick={() => setYearId(y.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                yearId === y.id
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-slate-400">
          <label className={`flex items-center gap-2 ${yearId ? '' : 'opacity-40'}`}>
            古地圖透明度
            <input
              type="range" min="0" max="1" step="0.05" value={opacity} disabled={!yearId}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-32 accent-sky-500"
            />
            <span className="font-mono w-9">{Math.round(opacity * 100)}%</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showTraces} onChange={(e) => setShowTraces(e.target.checked)} className="w-4 h-4 rounded" />
            顯示判讀標示
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showRoute} onChange={(e) => setShowRoute(e.target.checked)} className="w-4 h-4 rounded" />
            顯示建議路線
          </label>
        </div>
        <div className="h-[560px] rounded-xl overflow-hidden border border-white/10">
          <SongshanHydroMap
            historyId={yearId}
            opacity={opacity}
            showTraces={showTraces}
            showRoute={showRoute}
            stops={STOPS}
          />
        </div>
        <p className="mt-3 text-xs text-slate-300 bg-slate-800/60 rounded-lg p-3 leading-relaxed">{year.caption}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block w-5 h-1 rounded" style={{ background: '#e0301e', opacity: 0.7 }} />圳路（判讀）</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block w-5 h-1 rounded" style={{ background: '#1b8fa6', opacity: 0.7 }} />自然溝渠（判讀）</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block w-5 h-0 border-t border-dashed border-rose-500" />今松菸＋大巨蛋約略範圍</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block w-5 h-0 border-t-2 border-dashed border-slate-300" />建議路線</span>
        </div>
      </Section>

      <Section
        title="導覽路線建議"
        hint="以企劃書原本的路線（椰林大道 → 楓香大道 → 巴洛克花園 → 製菸工廠周邊 → 室內工作坊）為骨架，加入一段「沿派線走進園區」的前導，並把生態景觀池排進去。核心段落都在園區內，全程約 1 公里；想控制在 1 小時內，可以省略第 0 站。"
      >
        <ol className="divide-y divide-white/5">
          {STOPS.map((s) => (
            <li key={s.n} className="flex gap-3 py-3">
              <span
                className={`shrink-0 w-7 h-7 rounded-full grid place-items-center text-xs font-mono font-bold ${
                  s.optional ? 'border border-dashed border-slate-400 text-slate-300' : 'bg-slate-200 text-slate-900'
                }`}
              >
                {s.n}
              </span>
              <div className="space-y-1 text-xs leading-relaxed">
                <p className="text-sm font-bold text-slate-100">{s.title}</p>
                <p className="font-mono text-[11px] text-slate-500">{s.meta}</p>
                {s.see && <p className="text-slate-400"><b className="text-sky-300 mr-1.5">看</b>{s.see}</p>}
                {s.say && <p className="text-slate-400"><b className="text-sky-300 mr-1.5">說</b>{s.say}</p>}
                {s.doIt && <p className="text-slate-400"><b className="text-sky-300 mr-1.5">做</b>{s.doIt}</p>}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
          第 5 站所說 1904 年圳路的位置，是從配準過的舊圖目測判讀，誤差可能有數十公尺，導覽時請說「大約在這一帶」。
        </p>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="待查證" hint="以下項目目前沒有一手資料，導覽稿引用前請先確認。">
          <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
            {TODO.map((t) => (
              <li key={t} className="flex gap-2"><span className="shrink-0">·</span><span>{t}</span></li>
            ))}
          </ul>
        </Section>
        <Section title="與熱舒適問卷的連結" hint="問卷點位目前集中在信義計畫區與象山，松菸周邊很少。">
          <p className="text-xs text-slate-400 leading-relaxed">
            建議活動當天請參與者填 /survey 問卷，補上松菸園區內的「最熱／最涼爽／優先改善」點位，再到「📊 熱舒適問卷分析」分頁和熱像儀實測對照。
          </p>
        </Section>
      </div>

      <Section title="資料來源">
        <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-400 leading-relaxed">
          {SOURCES.map((s) => (
            <li key={s.text}>
              {s.href ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">{s.text}</a>
              ) : (
                s.text
              )}
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
