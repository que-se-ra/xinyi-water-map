import { useState } from 'react';
import { useMap } from 'react-leaflet';
import { useT } from '@/i18n/LocaleProvider';
import { useProject } from '@/projects/ProjectProvider';
import { FACTORS, SCORES } from './RouteFeedbackForm';

// 地點熱舒適評分：使用者在地圖任意點放標記後填寫。
// 評分面向與路線評分相同（FACTORS），可與路段評分直接對照；另加一題開放填答（選填）。
// 資料只寫進試算表「地點熱舒適評分」分頁，不在地圖上公開顯示。

const REASON_MAX = 1000;

export default function PointComfortForm({ lat, lng, onClose }) {
  const t = useT();
  const { feedbackProjectId } = useProject();
  const map = useMap();
  const [scores, setScores] = useState({});
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const incomplete = FACTORS.some((f) => !scores[f.id]);

  const handleSubmit = async () => {
    if (incomplete) {
      alert(t('forms.route.alert.incomplete'));
      return;
    }
    setIsSubmitting(true);

    const payload = {
      formType: 'point_comfort',
      project_id: feedbackProjectId,
      timestamp: new Date().toISOString(),
      lat,
      lng,
      scores,
      reason: reason.trim().slice(0, REASON_MAX),
    };

    try {
      const response = await fetch('/api/feedback-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(t('forms.route.error.serverResponse'));

      setIsSuccess(true);
      setTimeout(() => {
        map.closePopup();
        onClose?.();
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
      <h3 className="font-bold text-lg text-orange-800 border-b pb-2 mb-1">{t('forms.point.title')}</h3>
      <p className="text-[11px] text-slate-500 mb-3">{t('forms.point.privacyNote')}</p>

      <div className="space-y-3 mb-3">
        {FACTORS.map((factor) => (
          <div key={factor.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <h4 className="font-bold text-sm text-orange-800 mb-2">{t(factor.labelKey)}</h4>
            <div className="flex justify-between gap-1">
              {SCORES.map((score) => (
                <button
                  key={score.value}
                  type="button"
                  onClick={() => setScores((prev) => ({ ...prev, [factor.id]: score.value }))}
                  title={t(score.labelKey)}
                  className={`
                    flex flex-col items-center flex-1 py-1 rounded transition-colors
                    ${scores[factor.id] === score.value ? 'bg-orange-100 shadow-sm ring-1 ring-orange-300' : 'hover:bg-slate-200 opacity-60'}
                  `}
                >
                  <span className="text-xl leading-none mb-1">{score.emoji}</span>
                  <span className="text-[10px] text-slate-600 leading-tight hidden sm:block">{t(score.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <label htmlFor="point-comfort-reason" className="font-bold text-sm text-orange-800 mb-1 block">
            {t('forms.point.reason.label')} <span className="text-xs font-normal text-slate-400">{t('forms.point.reason.optional')}</span>
          </label>
          <textarea
            id="point-comfort-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={REASON_MAX}
            rows={3}
            placeholder={t('forms.point.reason.placeholder')}
            className="w-full text-sm p-2 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
          />
        </div>
      </div>

      <button
        type="button"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex justify-center items-center transition-colors"
        onClick={handleSubmit}
        disabled={isSubmitting || incomplete}
      >
        {isSubmitting ? t('forms.route.submit.processing') : t('forms.point.submit')}
      </button>
    </div>
  );
}
