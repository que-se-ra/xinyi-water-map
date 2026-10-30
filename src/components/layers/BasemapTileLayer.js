import { useState } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import { createElementObject, createTileLayerComponent, updateGridLayer, withPane } from '@react-leaflet/core';
import L from 'leaflet';
import { boxesForTile, cleanTilePixels, correctionsForUrl, CORRECTED_LABELS, referenceTileUrl } from '@/lib/basemap-corrections';

// 底圖圖層：和一般 TileLayer 相同，只有地名需要修正的那幾張圖磚（見 lib/basemap-corrections.js）
// 改用 canvas，在瀏覽器裡把錯的字拿掉；處理失敗時仍顯示原圖磚，地圖不會開天窗。

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const CorrectedTileLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const boxes = boxesForTile(correctionsForUrl(this._url), coords);
    if (!boxes.length) return L.TileLayer.prototype.createTile.call(this, coords, done);

    const size = this.getTileSize().x;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    loadImage(this.getTileUrl(coords))
      .then(async (base) => {
        ctx.drawImage(base, 0, 0);
        try {
          const ref = await loadImage(referenceTileUrl(coords));
          const pixels = ctx.getImageData(0, 0, size, size);
          const refCanvas = document.createElement('canvas');
          refCanvas.width = size;
          refCanvas.height = size;
          const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
          refCtx.drawImage(ref, 0, 0);
          cleanTilePixels(pixels.data, refCtx.getImageData(0, 0, size, size).data, boxes, size);
          ctx.putImageData(pixels, 0, 0);
        } catch (err) {
          console.warn('底圖地名修正失敗，改顯示原圖磚:', err);
        }
        done(null, canvas);
      })
      .catch((err) => done(err, canvas));
    return canvas;
  },
});

const BasemapTiles = createTileLayerComponent(
  function createLayer({ url, ...options }, context) {
    return createElementObject(new CorrectedTileLayer(url, withPane(options, context)), context);
  },
  function updateLayer(layer, props, prevProps) {
    updateGridLayer(layer, props, prevProps);
    if (props.url != null && props.url !== prevProps.url) layer.setUrl(props.url);
  }
);

const labelIcon = (text, strong) =>
  L.divIcon({
    className: 'basemap-label-anchor',
    iconSize: [0, 0],
    html: `<span class="basemap-label${strong ? ' basemap-label-strong' : ''}">${text}</span>`,
  });

/** 網站自己畫的正確地名。不隨古地圖隱藏：預設開著的 1939 古地圖在園區放大後沒有圖磚，隱藏了就看不到園區名稱 */
function CorrectedLabels({ locale }) {
  const map = useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const [zoom, setZoom] = useState(() => map.getZoom());
  return CORRECTED_LABELS.filter((l) => zoom >= l.minZoom).map((l) => (
    <Marker
      key={`${l.id}-${locale}`}
      position={[l.lat, l.lng]}
      icon={labelIcon(locale === 'en' ? l.en : l.zh, l.strong)}
      interactive={false}
      keyboard={false}
    />
  ));
}

export default function BasemapTileLayer({ locale = 'zh', ...props }) {
  return (
    <>
      <BasemapTiles {...props} />
      <CorrectedLabels locale={locale} />
    </>
  );
}
