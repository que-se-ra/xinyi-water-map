// 圖層說明 tooltip 的英文版，key 與 tooltipData.js 一一對應。
// 缺的 key／空字串會自動退回中文（見 InfoTooltip.js）。

export const TOOLTIP_DATA_EN = {
  // ── Guide Routes ──────────────────────────────────────────
  'route-0': {
    title: '🔵 Route 1: Liu-kong-tsun Canal',
    badge: 'Walking route',
    desc: 'Follows the course of the Liu-kong-tsun Canal (officially romanised Liugong)’s first main channel through Xinyi District, including the Wufenpu branch line, tracing an old waterway and the farming society it once watered.',
  },
  'route-1': {
    title: '🟢 Route 2: The Source of Xinyi',
    badge: 'Walking route',
    desc: 'Explores the early landscape of Xinyi District and the sources of its main ponds (永春陂 Pond, 沈祖厝陂 Pond and others), looking at how those ponds once served both irrigation and flood storage — and at the restoration of today’s 永春陂 Wetland Park.',
  },
  'route-2': {
    title: '🟠 Route 3: Wufenpu Branch Line',
    badge: 'Walking route',
    desc: 'Walks the former watercourses running from Songshan (historically Xikou) into the Wufenpu area, where railways, garment workshops and irrigation canals wove together into a working-class industrial landscape.',
  },
  'route-3': {
    title: '🟣 Route 4: The Three Main Drains',
    badge: 'Walking route',
    desc: 'Surveys the three main modern drainage systems of Xinyi District (廍後 Drain, Xingya Drain, No. 1 Special Drain), showing how meandering natural channels were absorbed into the city’s flood-control trunk drains and sewer network.',
  },

  // ── Open Data Layers ──────────────────────────────────────
  trees: {
    title: '\U0001F333 Street tree shade',
    badge: 'Urban open data',
    desc: 'From the Taipei City Government open data platform. Maps the extent and distribution of street trees in Xinyi District. This matters for identifying where the urban heat island is eased, for green cover ratios, and for the quality of shade over pavements.',
  },
  green: {
    title: '\U0001F332 Parks and woodland',
    badge: 'OpenStreetMap',
    desc: 'Park, garden, grassland and woodland polygons from OpenStreetMap. The street tree data covers only trees lining roads, so Xiangshan and the district’s parks appear empty in it; this layer fills that gap and completes the picture of green cover in Xinyi. Note that it shows green-space extent, not actual canopy — read it alongside the street tree layer when judging shade.',
  },
  sidewalks: {
    title: '\U0001F6B6 Pavement extent',
    badge: 'Urban open data',
    desc: 'From the Taipei City Government open data platform. Maps where pedestrians can walk safely in Xinyi District. Combine it with the street tree shade layer to assess how walkable and how comfortable a route is.',
  },
  zoning: {
    title: '\U0001F3D8️ Urban planning zones',
    badge: 'Urban open data',
    desc: 'From the Taipei City Government open data platform. Shows land use zoning across Xinyi District (residential, commercial, industrial, administrative, parkland and so on). It helps show how planning decisions shape natural hydrology and the proportion of impervious ground.',
  },
  temperature: {
    title: '\U0001F321️ Land surface temperature (Landsat 8)',
    badge: 'Live analysis via GEE',
    desc: 'Streams and analyses Landsat 8’s ST_B10 thermal infrared band (summer 2024/2025) through Google Earth Engine. The colour scale shows the surface heat island: red marks extreme heat (unshaded concrete and asphalt), blue-green marks cooler ground (green space and water such as Daan Forest Park, 永春陂 Pond or Xiangshan).',
  },

  // ── Historical Maps ───────────────────────────────────────
  jm1904: {
    title: '\U0001F5FA️ 1904 Taiwan Baotu (cadastral survey)',
    badge: 'Historical map (Academia Sinica)',
    desc: 'A precise survey from the early Japanese colonial period combining cadastral and topographic data — the single most important source for the historical geography of Taiwan. On it you can clearly read the Qing-era Liu-kong-tsun Canal and other meandering irrigation channels, along with the ponds and paddy fields once scattered across the area.',
  },
  jm1921: {
    title: '\U0001F5FA️ 1921 Topographic Map',
    badge: 'Historical map (Academia Sinica)',
    desc: 'A topographic survey from the tenth year of Taishō, mid-colonial period. By this point the Taipei Basin was undergoing urban rectification and systematic drainage works: watercourses were being straightened and regulated, and the Liu-kong-tsun irrigation network was at its most complete.',
  },
  liugong1939: {
    title: '\U0001F5FA️ 1939 Liu-kong-tsun Irrigation District Map',
    badge: 'Historical map (Academia Sinica)',
    desc: 'A late-colonial record of the irrigation district of the Liu-kong Irrigation Association (the predecessor of today’s Liu-kong Irrigation Association), mapping in detail how water was distributed across Xinyi District, where the sluice gates stood and how far the irrigated fields reached. It is exceptional evidence of the “paddy-field Xinyi” that once existed.',
  },
  am1944: {
    title: '\U0001F5FA️ 1944 US Military Topographic Map',
    badge: 'Historical map (Academia Sinica)',
    desc: 'A tactical map drawn from aerial reconnaissance and Japanese colonial survey data as US forces prepared bombing raids and a possible landing at the end of the Second World War. It records the natural hydrology, ponds and settlement pattern of Xinyi District before heavy urbanisation.',
  },
  tm1989: {
    title: '\U0001F5FA️ 1989 Topographic Map',
    badge: 'Historical map (Academia Sinica)',
    desc: 'A topographic map from the early years of modern urbanisation. Large-scale land readjustment was under way in the Xinyi Planning District, and most of the old watercourses and ponds had already been culverted into storm sewers or filled in to become the foundations of today’s commercial towers and housing.',
  },

  // ── Satellite and Indices ─────────────────────────────────
  'esri-satellite': {
    title: '\U0001F6F0️ Esri satellite imagery',
    badge: 'Live satellite',
    desc: 'Very high resolution global satellite imagery from Esri. It gives the most direct view of the present-day surface, useful for matching historic watercourses against the buildings and landforms that now occupy them.',
  },
  'sentinel2-natural': {
    title: '\U0001F6F0️ Sentinel-2 true colour',
    badge: 'Live satellite (Copernicus)',
    desc: 'Live imagery from the European Union’s Copernicus Sentinel-2 mission. Composited from the red, green and blue visible bands, it shows the surface much as the eye would see it, and is commonly used to compare current atmospheric and surface colour.',
  },
  'sentinel2-ndvi': {
    title: '\U0001F331 Sentinel-2 vegetation index (NDVI)',
    badge: 'Environmental index (Copernicus)',
    desc: 'The Normalised Difference Vegetation Index, used to estimate how healthy and how dense vegetation is. \U0001F7E2 Green marks dense forest, parks or grassland; \U0001F7E1 yellow marks moderate cover; \U0001F534 red marks unvegetated ground such as concrete buildings, wide roads or bare earth.',
  },
  'sentinel2-moisture': {
    title: '\U0001F4A7 Sentinel-2 moisture index',
    badge: 'Environmental index (Copernicus)',
    desc: 'The Normalised Difference Water Index (NDWI), which measures water content in soil and in plant leaves. \U0001F535 Deep blue indicates high water content (ponds, channels, standing water); \U0001FA75 cyan indicates humid conditions; \U0001F7E1 yellow is moderate; \U0001F7E0 orange-red marks very dry, impervious paving.',
  },

  // ── Community ─────────────────────────────────────────────
  'community-markers': {
    title: '\U0001F9E1 Community feedback',
    badge: 'Co-created landscape',
    desc: 'Landscape markers contributed by the public and approved by a moderator. Tap an amber heart to read a resident’s or participant’s story, see their photographs, and read the AI-drafted summary of the place.',
  },
  shademap: {
    title: '☀️ Live sun and shadow',
    badge: 'ShadeMap simulation',
    desc: 'Combines a global digital elevation model with the sun’s azimuth to simulate, in real time, the shadows cast by terrain and tall buildings around Xiangshan, 永春陂 Pond and elsewhere. Drag the time slider to watch shadows move between 06:00 and 18:00, and to study how tree shade and direct sun interact.',
  },
};
