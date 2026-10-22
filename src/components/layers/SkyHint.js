import { useState } from 'react';
import { useT } from '@/i18n/LocaleProvider';

// 依目前天色給一個「情境建議」：下雨提醒開騎樓與積水圖層、天黑提醒開路燈、
// 大熱天提醒開日照陰影。按一下就把對應圖層打開；已經開了或按過「不用了」就不再出現。
// 判斷優先序：雨 > 夜 > 熱（雨夜時騎樓比路燈更要緊）。

export const HOT_FEELS_LIKE = 30; // 體感溫度達到這個值才提醒找陰影

export default function SkyHint({ sky, layers, enable }) {
  const t = useT();
  const [dismissed, setDismissed] = useState({});

  let hint = null;
  if (sky.isRainy && !(layers.arcades && layers.waterlog)) {
    hint = { key: 'rain', text: t('sky.hint.rain'), action: () => enable({ arcades: true, waterlog: true }) };
  } else if (sky.isNight && !layers.lamps) {
    hint = { key: 'night', text: t('sky.hint.night'), action: () => enable({ lamps: true }) };
  } else if (
    !sky.isNight &&
    !sky.isRainy &&
    (sky.wx?.apparent_temperature ?? 0) >= HOT_FEELS_LIKE &&
    !layers.shade
  ) {
    hint = { key: 'hot', text: t('sky.hint.hot'), action: () => enable({ shade: true }) };
  }
  if (!hint || dismissed[hint.key]) return null;

  return (
    <div className="flex items-center gap-2 bg-sky-900/90 text-white backdrop-blur-md rounded-2xl shadow-lg pl-3 pr-1.5 py-1.5 text-[11px]">
      <span className="leading-snug">{hint.text}</span>
      <button
        type="button"
        onClick={hint.action}
        className="shrink-0 px-2.5 py-1 rounded-xl bg-white text-sky-900 font-bold hover:bg-sky-50"
      >
        {t('sky.hint.apply')}
      </button>
      <button
        type="button"
        onClick={() => setDismissed((d) => ({ ...d, [hint.key]: true }))}
        className="shrink-0 px-1.5 text-sky-200 hover:text-white"
        aria-label={t('sky.hint.dismiss')}
      >
        ✕
      </button>
    </div>
  );
}
