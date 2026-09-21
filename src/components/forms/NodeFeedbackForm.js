import { useState, useRef, useEffect } from 'react';
import exifr from 'exifr';
import { useT, useLocale } from '@/i18n/LocaleProvider';

// 顯示走 t()，送出仍用這裡的原始中文字串（value）——payload.tags 直接引用 value，
// 不可改成 key 或翻譯後的文字，否則會跟既有送出資料對不上。
const MEMORY_TAGS = [
  { value: '歷史', key: 'forms.node.tag.memory.history' },
  { value: '水源', key: 'forms.node.tag.memory.water' },
  { value: '生態', key: 'forms.node.tag.memory.ecology' },
  { value: '氣味', key: 'forms.node.tag.memory.smell' },
  { value: '地景', key: 'forms.node.tag.memory.landscape' },
  { value: '路況實境', key: 'forms.node.tag.memory.roadCondition' },
  { value: '熱成像', key: 'forms.node.tag.memory.thermal' },
  { value: '其他', key: 'forms.node.tag.other' },
];
const REPORT_TAGS = [
  { value: '積水', key: 'forms.node.tag.report.flooding' },
  { value: '異味', key: 'forms.node.tag.report.odor' },
  { value: '疑似污染排放', key: 'forms.node.tag.report.pollution' },
  { value: '缺遮蔭', key: 'forms.node.tag.report.noShade' },
  { value: '垃圾堆積', key: 'forms.node.tag.report.litter' },
  { value: '其他', key: 'forms.node.tag.other' },
];

const FEEDBACK_TYPES = [
  { id: 'memory', labelKey: 'forms.node.type.memory.label', hintKey: 'forms.node.type.memory.hint' },
  { id: 'report', labelKey: 'forms.node.type.report.label', hintKey: 'forms.node.type.report.hint' },
];

export default function NodeFeedbackForm({ lat, lng, stationId, stationName, onClose }) {
  const t = useT();
  const { locale } = useLocale();
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [feedbackType, setFeedbackType] = useState('memory');

  // Leaflet popup rule: switching type swaps the tag chips (DOM unmount) —
  // delay the state change so the click event finishes bubbling first
  const handleSwitchType = (typeId) => {
    if (typeId === feedbackType) return;
    setTimeout(() => {
      setFeedbackType(typeId);
      setSelectedTags([]);
    }, 50);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 照片 ① 狀態
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoFilename, setPhotoFilename] = useState('');
  const [photoExif, setPhotoExif] = useState(null);
  const [stripExifGps, setStripExifGps] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDescribingImage, setIsDescribingImage] = useState(false);
  const [imageDescribeError, setImageDescribeError] = useState('');
  const [isDetectingFaces, setIsDetectingFaces] = useState(false);
  const [faceDetectionWarning, setFaceDetectionWarning] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const fileInputRef = useRef(null);

  // 照片 ② 狀態 (新增)
  const [photoBase64_2, setPhotoBase64_2] = useState(null);
  const [photoFilename_2, setPhotoFilename_2] = useState('');
  const [photoExif_2, setPhotoExif_2] = useState(null);
  const [stripExifGps_2, setStripExifGps_2] = useState(false);
  const [isDragOver_2, setIsDragOver_2] = useState(false);
  const [isDescribingImage_2, setIsDescribingImage_2] = useState(false);
  const [imageDescribeError_2, setImageDescribeError_2] = useState('');
  const [isDetectingFaces_2, setIsDetectingFaces_2] = useState(false);
  const [faceDetectionWarning_2, setFaceDetectionWarning_2] = useState(false);
  const [detectedFaces_2, setDetectedFaces_2] = useState([]);
  const fileInputRef_2 = useRef(null);

  // 語音與 AI 相關狀態
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isVoiceUsed, setIsVoiceUsed] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummaryCard, setShowSummaryCard] = useState(false);
  const [summarizeError, setSummarizeError] = useState('');
  const recognitionRef = useRef(null);

  // 偵測瀏覽器語音支援度（iOS Safari 在 HTTP 下不支援）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition && window.isSecureContext) {
        setIsVoiceSupported(true);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 啟動/停止語音辨識
  const handleToggleListen = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setTimeout(() => {
        setIsListening(false);
      }, 50);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      // 英文介面下要用英文辨識，否則使用者講英文會被當成中文硬套
      rec.lang = locale === 'en' ? 'en-US' : 'zh-TW';

      rec.onstart = () => {
        setIsListening(true);
        setIsVoiceUsed(true);
      };

      rec.onend = () => {
        setTimeout(() => {
          setIsListening(false);
        }, 50);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          alert(t('forms.node.alert.micPermission'));
        }
      };

      rec.onresult = (e) => {
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setDescription(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
          });
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // 呼叫 Gemini AI 整理摘要
  const handleAISummarize = async () => {
    if (!description.trim()) {
      alert(t('forms.node.alert.needTextForAi'));
      return;
    }

    setIsSummarizing(true);
    setSummarizeError('');
    setShowSummaryCard(true);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, feedbackType })
      });

      const resData = await response.json();
      if (!response.ok) {
        let detailsMsg = '';
        if (resData.details) {
          try {
            const parsed = JSON.parse(resData.details);
            detailsMsg = parsed.error?.message || resData.details;
          } catch (e) {
            detailsMsg = resData.details;
          }
        }
        const errorMsg = detailsMsg
          ? t('forms.node.ai.summarizeErrorWithDetail', { error: resData.error, detail: detailsMsg })
          : (resData.error || t('forms.node.ai.summarizeErrorFallback'));
        throw new Error(errorMsg);
      }

      setAiSummary(resData.summary);
    } catch (err) {
      console.error('Summarize error:', err);
      setSummarizeError(err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 擷取 EXIF
  const extractExif = async (file) => {
    try {
      const exifData = await exifr.parse(file);
      if (exifData) {
        const exifResult = {};
        if (exifData.latitude && exifData.longitude) {
          exifResult.latitude = Math.round(exifData.latitude * 1000000) / 1000000;
          exifResult.longitude = Math.round(exifData.longitude * 1000000) / 1000000;
        }
        const dateField = exifData.DateTimeOriginal || exifData.CreateDate;
        if (dateField) {
          exifResult.dateTime = dateField instanceof Date 
            ? dateField.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
            : String(dateField);
        }
        if (exifData.Make || exifData.Model) {
          exifResult.device = [exifData.Make, exifData.Model].filter(Boolean).join(' ');
        }
        if (Object.keys(exifResult).length > 0) {
          return exifResult;
        }
      }
    } catch (exifErr) {
      console.warn('EXIF extraction failed:', exifErr.message);
    }
    return null;
  };

  // 壓縮圖片
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // 照片 ① 處理
  const processFile = async (file) => {
    if (!file) return;
    setPhotoFilename(file.name);
    setPhotoExif(null);
    setImageDescribeError('');
    setIsDetectingFaces(false);
    setFaceDetectionWarning(false);
    setDetectedFaces([]);

    const exif = await extractExif(file);
    if (exif) setPhotoExif(exif);

    const base64 = await compressImage(file);
    setPhotoBase64(base64);
    detectFacesAndPrompt(base64, 1);
  };

  // 照片 ② 處理
  const processFile_2 = async (file) => {
    if (!file) return;
    setPhotoFilename_2(file.name);
    setPhotoExif_2(null);
    setImageDescribeError_2('');
    setIsDetectingFaces_2(false);
    setFaceDetectionWarning_2(false);
    setDetectedFaces_2([]);

    const exif = await extractExif(file);
    if (exif) setPhotoExif_2(exif);

    const base64 = await compressImage(file);
    setPhotoBase64_2(base64);
    detectFacesAndPrompt(base64, 2);
  };

  // 臉部偵測
  const detectFacesAndPrompt = async (dataUrl, photoIndex) => {
    if (photoIndex === 1) {
      setIsDetectingFaces(true);
      setFaceDetectionWarning(false);
      setDetectedFaces([]);
    } else {
      setIsDetectingFaces_2(true);
      setFaceDetectionWarning_2(false);
      setDetectedFaces_2([]);
    }

    try {
      const response = await fetch('/api/detect-faces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl })
      });
      const data = await response.json();
      if (data.success && data.hasFaces && data.faces && data.faces.length > 0) {
        if (photoIndex === 1) {
          setDetectedFaces(data.faces);
          setFaceDetectionWarning(true);
        } else {
          setDetectedFaces_2(data.faces);
          setFaceDetectionWarning_2(true);
        }
      }
    } catch (err) {
      console.warn('Face detection failed (non-critical):', err.message);
    } finally {
      if (photoIndex === 1) {
        setIsDetectingFaces(false);
      } else {
        setIsDetectingFaces_2(false);
      }
    }
  };

  // 套用馬賽克
  const applyBlur = (base64Url, facesList, photoIndex) => {
    if (!base64Url || facesList.length === 0) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      ctx.imageSmoothingEnabled = false;

      facesList.forEach(face => {
        if (!face.box_2d) return;
        const [ymin_raw, xmin_raw, ymax_raw, xmax_raw] = face.box_2d;
        
        const ymin = ymin_raw / 1000;
        const xmin = xmin_raw / 1000;
        const ymax = ymax_raw / 1000;
        const xmax = xmax_raw / 1000;

        const x = xmin * canvas.width;
        const y = ymin * canvas.height;
        const w = (xmax - xmin) * canvas.width;
        const h = (ymax - ymin) * canvas.height;

        const size = Math.max(4, Math.round(Math.min(w, h) / 14));
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.max(1, w / size);
        tempCanvas.height = Math.max(1, h / size);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;

        tempCtx.drawImage(canvas, x, y, w, h, 0, 0, tempCanvas.width, tempCanvas.height);
        
        ctx.save();
        ctx.beginPath();
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        const radiusX = w / 2;
        const radiusY = h / 2;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.clip();

        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, x, y, w, h);
        ctx.restore();
      });

      const blurredDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      if (photoIndex === 1) {
        setPhotoBase64(blurredDataUrl);
        setFaceDetectionWarning(false);
        setDetectedFaces([]);
      } else {
        setPhotoBase64_2(blurredDataUrl);
        setFaceDetectionWarning_2(false);
        setDetectedFaces_2([]);
      }
    };
    img.src = base64Url;
  };

  // AI 圖片轉譯
  const handleDescribeImage = async (base64Url, photoIndex) => {
    if (!base64Url) {
      alert(t('forms.node.alert.needPhoto'));
      return;
    }

    if (photoIndex === 1) {
      setIsDescribingImage(true);
      setImageDescribeError('');
    } else {
      setIsDescribingImage_2(true);
      setImageDescribeError_2('');
    }

    try {
      const response = await fetch('/api/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Url,
          mimeType: 'image/jpeg',
          feedbackType
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        let detailsMsg = '';
        if (resData.details) {
          try {
            const parsed = JSON.parse(resData.details);
            detailsMsg = parsed.error?.message || resData.details;
          } catch (e) {
            detailsMsg = resData.details;
          }
        }
        const errorMsg = detailsMsg
          ? `${resData.error} (${detailsMsg})`
          : (resData.error || t('forms.node.ai.describeErrorFallback'));
        throw new Error(errorMsg);
      }

      if (resData.description) {
        setDescription(prev => {
          const trimmed = prev.trim();
          const prefix = photoIndex === 1 ? t('forms.node.photoDescribe.prefix1') : t('forms.node.photoDescribe.prefix2');
          return trimmed 
            ? `${trimmed}\n\n${prefix}：${resData.description}` 
            : `${prefix}：${resData.description}`;
        });
      }
    } catch (err) {
      console.error('Describe image error:', err);
      if (photoIndex === 1) {
        setImageDescribeError(err.message);
      } else {
        setImageDescribeError_2(err.message);
      }
    } finally {
      if (photoIndex === 1) {
        setIsDescribingImage(false);
      } else {
        setIsDescribingImage_2(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!description.trim() && selectedTags.length === 0 && !photoBase64 && !photoBase64_2) {
      alert(t('forms.node.alert.emptySubmit'));
      return;
    }

    setIsSubmitting(true);

    const feedbackId = "node_" + new Date().getTime() + "_" + Math.random().toString(36).substr(2, 5);
    const payload = {
      id: feedbackId,
      formType: 'node_feedback',
      timestamp: new Date().toISOString(),
      lat,
      lng,
      station_id: stationId || '',
      feedback_type: feedbackType,
      description: description.trim(),
      tags: selectedTags,
      photo_base64: photoBase64,
      photo_filename: photoFilename,
      photo_base64_2: photoBase64_2,
      photo_filename_2: photoFilename_2,
      ai_summary: aiSummary.trim(),
      is_voice: isVoiceUsed,
      photo_exif: stripExifGps 
        ? (photoExif ? { ...photoExif, latitude: '[已移除]', longitude: '[已移除]', gps_stripped: true } : null)
        : (photoExif || null),
      photo_exif_2: stripExifGps_2
        ? (photoExif_2 ? { ...photoExif_2, latitude: '[已移除]', longitude: '[已移除]', gps_stripped: true } : null)
        : (photoExif_2 || null)
    };

    try {
      const response = await fetch('/api/feedback-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(t('forms.node.error.serverResponse'));
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      alert(t('forms.node.alert.submitFailed'));
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setDescription('');
    setSelectedTags([]);
    setPhotoBase64(null);
    setPhotoFilename('');
    setPhotoExif(null);
    setStripExifGps(false);
    setIsDragOver(false);
    setIsDescribingImage(false);
    setImageDescribeError('');
    setIsDetectingFaces(false);
    setFaceDetectionWarning(false);
    setDetectedFaces([]);

    setPhotoBase64_2(null);
    setPhotoFilename_2('');
    setPhotoExif_2(null);
    setStripExifGps_2(false);
    setIsDragOver_2(false);
    setIsDescribingImage_2(false);
    setImageDescribeError_2('');
    setIsDetectingFaces_2(false);
    setFaceDetectionWarning_2(false);
    setDetectedFaces_2([]);

    setIsListening(false);
    setIsVoiceUsed(false);
    setAiSummary('');
    setIsSummarizing(false);
    setShowSummaryCard(false);
    setSummarizeError('');
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="text-5xl animate-bounce">🎉</div>
        <div>
          <h4 className="text-xl font-black text-green-700">{t('forms.node.success.title')}</h4>
          <p className="text-sm text-slate-500 mt-2">{t('forms.node.success.body')}</p>
        </div>
        <div className="pt-4 flex flex-col gap-2 max-w-xs mx-auto">
          <button
            type="button"
            onClick={handleResetForm}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer"
          >
            {t('forms.node.success.resetButton')}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              {t('forms.node.success.closeButton')}
            </button>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="p-2 min-w-[280px]">
      <h3 className="font-bold text-lg text-blue-900 border-b pb-2 mb-3">
        {stationName || t('forms.node.title.defaultStation')} <span className="text-sm text-slate-500 font-normal ml-1">{t('forms.node.title.suffix')}</span>
      </h3>

      <div className="space-y-4 mb-4">
        {/* Feedback type selector */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('forms.node.type.label')}</label>
          <div className="grid grid-cols-2 gap-2">
            {FEEDBACK_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSwitchType(type.id); }}
                className={`
                  flex flex-col items-center py-2 px-1 rounded-xl border text-xs font-bold transition-all cursor-pointer
                  ${feedbackType === type.id
                    ? (type.id === 'report'
                        ? 'bg-orange-50 border-orange-400 text-orange-700 ring-1 ring-orange-300'
                        : 'bg-blue-50 border-blue-400 text-blue-700 ring-1 ring-blue-300')
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}
                `}
              >
                <span>{t(type.labelKey)}</span>
                <span className="text-[9px] font-normal mt-0.5 leading-tight">{t(type.hintKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {feedbackType === 'report' ? t('forms.node.tags.label.report') : t('forms.node.tags.label.memory')}
          </label>
          <div className="flex flex-wrap gap-2">
            {(feedbackType === 'report' ? REPORT_TAGS : MEMORY_TAGS).map(tag => (
              <button
                key={tag.value}
                onClick={() => handleToggleTag(tag.value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${selectedTags.includes(tag.value)
                    ? (feedbackType === 'report'
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-blue-600 text-white border-blue-600')
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}
                `}
              >
                {t(tag.key)}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              <label className="block text-sm font-bold text-slate-700">
                {feedbackType === 'report' ? t('forms.node.desc.labelReport') : t('forms.node.desc.labelMemory')}
              </label>
              {aiSummary && (
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 animate-bounce">
                  {t('forms.node.ai.polishedBadge')}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              {isVoiceSupported ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleToggleListen(); }}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-all cursor-pointer
                    ${isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}
                  `}
                  title={t('forms.node.voice.titleStart')}
                >
                  <span className="text-[10px]">🎙️</span>
                  <span>{isListening ? t('forms.node.voice.listening') : t('forms.node.voice.inputButton')}</span>
                </button>
              ) : (
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-slate-400 border border-slate-200 cursor-not-allowed"
                  title={t('forms.node.voice.httpsRequiredTitle')}
                >
                  <span>🎙️</span>
                  <span>{t('forms.node.voice.httpsRequiredLabel')}</span>
                </span>
              )}

              {description.trim() && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleAISummarize(); }}
                  disabled={isSummarizing}
                  className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-full text-[10px] font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  title={t('forms.node.ai.polishTitle')}
                >
                  <span>✨</span>
                  <span>{t('forms.node.ai.polishButton')}</span>
                </button>
              )}
            </div>
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={feedbackType === 'report'
                ? t('forms.node.desc.placeholderReport')
                : (isVoiceSupported ? t('forms.node.desc.placeholderMemoryVoice') : t('forms.node.desc.placeholderMemory'))}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm min-h-[85px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />

            {isListening && (
              <div 
                className="absolute inset-0 bg-blue-50/90 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center border border-blue-200 z-10 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative mb-2">
                  <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-70"></div>
                  <div className="relative bg-red-500 text-white rounded-full p-3.5 shadow-md flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <p className="text-blue-900 font-bold text-xs animate-pulse">{t('forms.node.voice.listeningPrompt')}</p>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleToggleListen(); }}
                  className="mt-2.5 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] rounded-full border border-red-200 transition-colors shadow-xs cursor-pointer"
                >
                  {t('forms.node.voice.stopButton')}
                </button>
              </div>
            )}
          </div>

          {showSummaryCard && (
            <div 
              className="bg-gradient-to-r from-violet-50/95 to-indigo-50/95 border border-indigo-200 rounded-lg p-3 mt-2 shadow-inner transition-all z-10 relative overflow-hidden animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-extrabold text-indigo-900 flex items-center gap-1 animate-pulse">
                  {t('forms.node.ai.cardTitle')}
                </span>
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setTimeout(() => {
                      setShowSummaryCard(false); 
                      setAiSummary(''); 
                    }, 50);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {isSummarizing ? (
                <div className="space-y-1.5 py-1">
                  <div className="h-3 bg-indigo-200 rounded-full w-full animate-pulse"></div>
                  <div className="h-3 bg-indigo-200 rounded-full w-11/12 animate-pulse"></div>
                  <div className="h-3 bg-indigo-200 rounded-full w-4/5 animate-pulse"></div>
                  <div className="text-[10px] text-indigo-500 animate-pulse text-center mt-1">{t('forms.node.ai.thinking')}</div>
                </div>
              ) : summarizeError ? (
                <div className="text-[11px] text-red-600 font-bold py-1">
                  ⚠️ {summarizeError}
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded border border-indigo-100 shadow-2xs max-h-[120px] overflow-y-auto font-normal">
                    {aiSummary}
                  </p>
                  
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDescription(aiSummary);
                        setTimeout(() => {
                          setShowSummaryCard(false);
                        }, 50);
                      }}
                      className="flex-1 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold py-1 rounded transition-colors shadow-2xs cursor-pointer"
                    >
                      {t('forms.node.ai.applyButton')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTimeout(() => {
                          setShowSummaryCard(false);
                        }, 50);
                      }}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-[10px] font-bold py-1 rounded transition-colors shadow-xs cursor-pointer"
                    >
                      {t('forms.node.ai.keepButton')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>


        {/* Photo Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
          {/* Photo ① */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">{t('forms.node.photo.label1')}</label>
            <div 
              className={`
                border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all
                ${isDragOver 
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                  : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) processFile(file);
              }}
            >
              {photoBase64 ? (
                <div className="relative inline-block w-full" onClick={(e) => e.stopPropagation()}>
                  <img src={photoBase64} alt="Preview 1" className="max-h-24 mx-auto rounded object-cover" />
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setTimeout(() => {
                        setPhotoBase64(null); 
                        setPhotoFilename(''); 
                        setPhotoExif(null);
                        setStripExifGps(false);
                        setImageDescribeError('');
                        setIsDetectingFaces(false);
                        setFaceDetectionWarning(false);
                        setDetectedFaces([]);
                      }, 50);
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 flex flex-col items-center pointer-events-none py-1">
                  <span className="text-lg">📷</span>
                  <span className="text-[10px] font-semibold">{t('forms.node.photo.empty1')}</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => processFile(e.target.files[0])}
              />
            </div>

            {/* Photo ① 敏感內容偵測 */}
            {isDetectingFaces && (
              <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-[9px] text-blue-700 flex items-center gap-1.5">
                <div className="inline-block w-2.5 h-2.5 border border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <span>{t('forms.node.face.detecting')}</span>
              </div>
            )}

            {faceDetectionWarning && detectedFaces.length > 0 && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[9px] text-rose-800 space-y-1">
                <p className="font-bold">{t('forms.node.face.warning', { n: detectedFaces.length })}</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyBlur(photoBase64, detectedFaces, 1)}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[9px] font-bold"
                  >
                    {t('forms.node.face.blurButton')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFaceDetectionWarning(false)}
                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px]"
                  >
                    {t('forms.node.face.ignoreButton')}
                  </button>
                </div>
              </div>
            )}

            {/* Photo ① EXIF GPS 隱私控制 */}
            {photoExif && photoExif.latitude && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[9px] text-amber-800 flex items-start gap-1.5">
                <input
                  type="checkbox"
                  checked={stripExifGps}
                  onChange={() => setStripExifGps(prev => !prev)}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-bold">{t('forms.node.exif.removeGps1', { lat: photoExif.latitude, lng: photoExif.longitude })}</p>
                </div>
              </div>
            )}

            {/* Photo ① AI 圖片轉譯 */}
            {photoBase64 && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => handleDescribeImage(photoBase64, 1)}
                  disabled={isDescribingImage}
                  className="w-full py-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded text-[9px] font-bold disabled:opacity-50"
                >
                  {isDescribingImage ? t('forms.node.ai.analyzing') : t('forms.node.ai.describeButton1')}
                </button>
                {imageDescribeError && (
                  <p className="text-[8px] text-red-600 font-bold mt-0.5">⚠️ {imageDescribeError}</p>
                )}
              </div>
            )}
          </div>

          {/* Photo ② */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">{t('forms.node.photo.label2')}</label>
            <div 
              className={`
                border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all
                ${isDragOver_2 
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                  : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}
              `}
              onClick={() => fileInputRef_2.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver_2(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver_2(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver_2(false); }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation(); setIsDragOver_2(false);
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) processFile_2(file);
              }}
            >
              {photoBase64_2 ? (
                <div className="relative inline-block w-full" onClick={(e) => e.stopPropagation()}>
                  <img src={photoBase64_2} alt="Preview 2" className="max-h-24 mx-auto rounded object-cover" />
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setTimeout(() => {
                        setPhotoBase64_2(null); 
                        setPhotoFilename_2(''); 
                        setPhotoExif_2(null);
                        setStripExifGps_2(false);
                        setImageDescribeError_2('');
                        setIsDetectingFaces_2(false);
                        setFaceDetectionWarning_2(false);
                        setDetectedFaces_2([]);
                      }, 50);
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 flex flex-col items-center pointer-events-none py-1">
                  <span className="text-lg">📷</span>
                  <span className="text-[10px] font-semibold">{t('forms.node.photo.empty2')}</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef_2}
                onChange={(e) => processFile_2(e.target.files[0])}
              />
            </div>

            {/* Photo ② 敏感內容偵測 */}
            {isDetectingFaces_2 && (
              <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-[9px] text-blue-700 flex items-center gap-1.5">
                <div className="inline-block w-2.5 h-2.5 border border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <span>{t('forms.node.face.detecting')}</span>
              </div>
            )}

            {faceDetectionWarning_2 && detectedFaces_2.length > 0 && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded text-[9px] text-rose-800 space-y-1">
                <p className="font-bold">{t('forms.node.face.warning', { n: detectedFaces_2.length })}</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyBlur(photoBase64_2, detectedFaces_2, 2)}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[9px] font-bold"
                  >
                    {t('forms.node.face.blurButton')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFaceDetectionWarning_2(false)}
                    className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[9px]"
                  >
                    {t('forms.node.face.ignoreButton')}
                  </button>
                </div>
              </div>
            )}

            {/* Photo ② EXIF GPS 隱私控制 */}
            {photoExif_2 && photoExif_2.latitude && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[9px] text-amber-800 flex items-start gap-1.5">
                <input
                  type="checkbox"
                  checked={stripExifGps_2}
                  onChange={() => setStripExifGps_2(prev => !prev)}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-bold">{t('forms.node.exif.removeGps2', { lat: photoExif_2.latitude, lng: photoExif_2.longitude })}</p>
                </div>
              </div>
            )}

            {/* Photo ② AI 圖片轉譯 */}
            {photoBase64_2 && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => handleDescribeImage(photoBase64_2, 2)}
                  disabled={isDescribingImage_2}
                  className="w-full py-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded text-[9px] font-bold disabled:opacity-50"
                >
                  {isDescribingImage_2 ? t('forms.node.ai.analyzing') : t('forms.node.ai.describeButton2')}
                </button>
                {imageDescribeError_2 && (
                  <p className="text-[8px] text-red-600 font-bold mt-0.5">⚠️ {imageDescribeError_2}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 flex justify-center items-center transition-colors"
        onClick={handleSubmit}
        disabled={isSubmitting || (!description.trim() && selectedTags.length === 0 && !photoBase64 && !photoBase64_2)}
      >
        {isSubmitting ? t('forms.node.submit.processing') : t('forms.node.submit.button')}
      </button>
    </div>
  );
}
