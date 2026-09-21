import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { useT } from '@/i18n/LocaleProvider';

const SCORES = [
  { value: 1, labelKey: 'forms.route.score.veryBad', emoji: '😣' },
  { value: 2, labelKey: 'forms.route.score.bad', emoji: '😕' },
  { value: 3, labelKey: 'forms.route.score.neutral', emoji: '😐' },
  { value: 4, labelKey: 'forms.route.score.good', emoji: '🙂' },
  { value: 5, labelKey: 'forms.route.score.veryGood', emoji: '😊' }
];

// FACTORS 有 export，被 src/components/layers/RouteLayer.js 的 ComfortStatsBlock
// FACTORS 同時被 RouteLayer.js 引用顯示。label 保留中文原值（若日後要落資料用得著），
// 顯示一律走 labelKey，兩個檔案都改成 t(f.labelKey)，不會有兩種叫法。
export const FACTORS = [
  { id: 'shade', label: '遮蔭程度', labelKey: 'forms.route.factor.shade' },
  { id: 'surface', label: '路面狀況', labelKey: 'forms.route.factor.surface' },
  { id: 'safety', label: '安全感', labelKey: 'forms.route.factor.safety' },
  { id: 'comfort', label: '整體舒適度', labelKey: 'forms.route.factor.comfort' }
];

export default function RouteFeedbackForm({ routeId, routeName, routeNameZh, segmentId }) {
  const t = useT();
  const map = useMap();
  const [scores, setScores] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleScoreChange = (factorId, value) => {
    setScores(prev => ({ ...prev, [factorId]: value }));
  };

  const handleSubmit = async () => {
    // Check if all factors are rated
    if (FACTORS.some(f => !scores[f.id])) {
      alert(t('forms.route.alert.incomplete'));
      return;
    }

    setIsSubmitting(true);

    const payload = {
      formType: 'route_comfort',
      timestamp: new Date().toISOString(),
      route_id: routeId,
      // 送出一律用中文原名：英文版的留言要跟中文版落在同一組路線名下才統計得了
      route_name: routeNameZh || routeName,
      segment_id: segmentId,
      scores: scores
    };

    try {
      const response = await fetch('/api/feedback-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(t('forms.route.error.serverResponse'));
      }

      setIsSuccess(true);
      setTimeout(() => {
        map.closePopup();
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      alert(t('forms.route.alert.submitFailed'));
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h4 className="text-lg font-bold text-green-700">{t('forms.route.success.title')}</h4>
        <p className="text-sm text-slate-500 mt-1">{t('forms.route.success.body')}</p>
      </div>
    );
  }

  return (
    <div className="p-2 min-w-[280px]">
      <h3 className="font-bold text-lg text-blue-900 border-b pb-2 mb-3">
        {routeName} <span className="text-sm text-slate-500 font-normal ml-1">{t('forms.route.title.suffix')}</span>
      </h3>

      <div className="space-y-4 mb-4">
        {FACTORS.map(factor => (
          <div key={factor.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <h4 className="font-bold text-sm text-blue-800 mb-2">{t(factor.labelKey)}</h4>
            <div className="flex justify-between gap-1">
              {SCORES.map(score => (
                <button
                  key={score.value}
                  onClick={() => handleScoreChange(factor.id, score.value)}
                  title={t(score.labelKey)}
                  className={`
                    flex flex-col items-center flex-1 py-1 rounded transition-colors
                    ${scores[factor.id] === score.value ? 'bg-blue-100 shadow-sm ring-1 ring-blue-300' : 'hover:bg-slate-200 opacity-60'}
                  `}
                >
                  <span className="text-xl leading-none mb-1">{score.emoji}</span>
                  <span className="text-[10px] text-slate-600 leading-tight hidden sm:block">{t(score.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex justify-center items-center transition-colors"
        onClick={handleSubmit}
        disabled={isSubmitting || FACTORS.some(f => !scores[f.id])}
      >
        {isSubmitting ? t('forms.route.submit.processing') : t('forms.route.submit.button')}
      </button>
    </div>
  );
}
