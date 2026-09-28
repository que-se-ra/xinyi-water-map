'use client';

import { MapContainer, TileLayer, Polyline, CircleMarker, Rectangle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CARTO_LIGHT_URL, CARTO_ATTRIBUTION } from '@/lib/basemap';
import { HISTORICAL_MAPS } from '@/components/layers/HistoricalLayer';

// 松菸水文踏查專用的小地圖。
// 圳路、溝渠的座標是在中研院配準古地圖上目測判讀後換算的經緯度，誤差可能有數十公尺，
// 只作為「大約在這一帶」的導覽標示，不是測量成果。

const CANAL = '#e0301e';
const WATER = '#1b8fa6';

// 各年代圖上判讀出的水路（只在切到該年代時顯示）
export const TRACES = {
  jm1904: [
    { label: '圳路（雙線）', color: CANAL, positions: [[25.04387, 121.55449], [25.04426, 121.55557], [25.04392, 121.55685], [25.04382, 121.55782], [25.04484, 121.55964], [25.04533, 121.56082]] },
    { label: '圳路（雙線）', color: CANAL, positions: [[25.04008, 121.55557], [25.04085, 121.5575], [25.04212, 121.56115], [25.04256, 121.5619], [25.04256, 121.56318]] }
  ],
  jm1921: [
    { label: '自然溝渠（概略，此圖配準誤差大）', color: WATER, positions: [[25.04494, 121.55782], [25.04469, 121.55943], [25.04406, 121.56136], [25.04338, 121.5619], [25.04202, 121.56222]] }
  ],
  liugong1939: [
    { label: '瑠公圳第一幹線', color: CANAL, weight: 9, positions: [[25.05077, 121.5546], [25.04785, 121.55406], [25.04435, 121.5538], [25.04202, 121.55428], [25.03833, 121.55503]] },
    { label: '興雅派線', color: CANAL, positions: [[25.04396, 121.55396], [25.04392, 121.55771], [25.04479, 121.55782], [25.04465, 121.56265], [25.04406, 121.56351], [25.04547, 121.56705]] },
    { label: '自然排水溝', color: WATER, positions: [[25.04319, 121.56276], [25.04299, 121.56351], [25.04309, 121.56436], [25.04324, 121.56554]] },
    { label: '自然排水溝', color: WATER, positions: [[25.0429, 121.5634], [25.04153, 121.56353], [25.04095, 121.56404], [25.04037, 121.56447]] }
  ],
  am1944: [],
  tm1989: []
};

export const POINTS = {
  liugong1939: [{ label: '頂店仔汴', color: CANAL, position: [25.04399, 121.55396] }],
  tm1989: [{ label: '水池（今生態景觀池）', color: WATER, position: [25.04338, 121.56233] }]
};

export const ROUTE = [
  [25.04433, 121.55385], [25.04482, 121.55793], [25.04501, 121.55964], [25.04494, 121.56265],
  [25.04396, 121.56276], [25.04348, 121.56233], [25.04362, 121.56147], [25.04365, 121.56056],
  [25.04309, 121.55943], [25.04358, 121.55857]
];

// 今松菸＋大巨蛋一帶的約略範圍
const PARK_BOUNDS = [[25.0457, 121.55781], [25.04183, 121.56318]];

export default function SongshanHydroMap({ historyId, opacity, showTraces, showRoute, stops }) {
  const hist = HISTORICAL_MAPS.find((m) => m.id === historyId);
  return (
    <MapContainer
      center={[25.0438, 121.5595]}
      zoom={16}
      maxZoom={19}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={CARTO_LIGHT_URL} attribution={CARTO_ATTRIBUTION} maxZoom={19} />
      {hist && (
        <TileLayer
          key={hist.id}
          url={hist.url}
          opacity={opacity}
          maxZoom={19}
          maxNativeZoom={hist.maxNativeZoom ?? 18}
          attribution="歷史圖資 &copy; 中央研究院"
        />
      )}

      <Rectangle bounds={PARK_BOUNDS} pathOptions={{ color: '#dc2626', weight: 1.5, dashArray: '6 4', fill: false }} />

      {showTraces && hist &&
        (TRACES[hist.id] || []).map((t, i) => (
          <Polyline
            key={`${hist.id}-t${i}`}
            positions={t.positions}
            pathOptions={{ color: t.color, weight: t.weight || 12, opacity: 0.35, lineCap: 'round', lineJoin: 'round' }}
          >
            <Tooltip sticky>{t.label}（判讀標示）</Tooltip>
          </Polyline>
        ))}

      {showTraces && hist &&
        (POINTS[hist.id] || []).map((p) => (
          <CircleMarker key={p.label} center={p.position} radius={7} pathOptions={{ color: p.color, weight: 3, fillColor: '#fff', fillOpacity: 1 }}>
            <Tooltip permanent direction="right" offset={[8, 0]}>{p.label}</Tooltip>
          </CircleMarker>
        ))}

      {showRoute && (
        <>
          <Polyline positions={ROUTE} pathOptions={{ color: '#1e293b', weight: 3, dashArray: '8 6' }} />
          {stops.map((s) => (
            <CircleMarker
              key={s.n}
              center={s.position}
              radius={6}
              pathOptions={{
                color: '#1e293b',
                weight: 2,
                dashArray: s.optional ? '3 3' : null,
                fillColor: s.optional ? '#ffffff' : '#1e293b',
                fillOpacity: 1
              }}
            >
              {/* 園區內站點彼此很近，常駐標籤只放編號以免重疊；站名見下方路線清單。
                  Leaflet 一個圖徵只能綁一個 tooltip。 */}
              <Tooltip permanent direction="top" offset={[0, -6]}>
                {s.n}
              </Tooltip>
            </CircleMarker>
          ))}
        </>
      )}
    </MapContainer>
  );
}
