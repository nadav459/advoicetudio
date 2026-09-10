import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import { downloadBlob, shareAudioFile, openWhatsAppWeb, openTelegramWeb } from '../services/audioUtils';
import { GEMINI_VOICES, TTS_MODELS } from '../services/geminiService';

export default function AudioResultStep({
  audioData,
  spokenScript,
  adResult,
  selectedVoice,
  selectedModel,
  onReset,
  onChangeVoice,
}) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [showDesktopShareGuide, setShowDesktopShareGuide] = useState(false);

  const voiceObj = GEMINI_VOICES.find(v => v.id === selectedVoice) || { name: selectedVoice, style: 'מותאם' };
  const modelObj = TTS_MODELS.find(m => m.id === selectedModel) || { name: selectedModel };

  const handleDownloadMp3 = () => {
    if (!audioData?.blob) return;
    const safeName = (adResult?.headline || 'radio-ad').replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_');
    downloadBlob(audioData.blob, `${safeName}.mp3`);
  };

  const handleShare = async () => {
    if (!audioData?.blob) return;
    setSharing(true);
    setShareFeedback('');

    const filename = `${(adResult?.headline || 'radio-ad').replace(/\s+/g, '_')}.mp3`;
    const shareText = `פרסומת קולית:\n"${adResult?.headline || 'תשדיר שמע'}"\n\n${spokenScript}`;

    // ניסיון שיתוף קובץ ישיר באמצעות Web Share API של המערכת (פועל במובייל וב-macOS Safari)
    const res = await shareAudioFile(audioData.blob, filename, 'פרסומת קולית', shareText);

    if (res.success) {
      setShareFeedback('קובץ השמע שותף בהצלחה.');
      setShowDesktopShareGuide(false);
    } else if (res.method === 'unsupported') {
      // במחשב דסקטופ (אי אפשר להזריק אודיו אוטומטית לוואטסאפ ווב ללא גרירה)
      // מוריד את קובץ ה-MP3 ומציג כפתורי פתיחה ישירה
      handleDownloadMp3();
      setShowDesktopShareGuide(true);
    }
    setSharing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(spokenScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5">
      {/* סקשן 1: פרטי ההקלטה ונגן */}
      <div>
        <div className="ios-section-title">הקלטה סופית (MP3)</div>
        <div className="ios-group p-4 sm:p-5 space-y-4">
          <div className="text-center space-y-1">
            <div className="text-[13px] font-semibold text-[#34C759]">
              ההקלטה הושלמה – קובץ MP3 מוכן
            </div>
            <h2 className="text-[20px] font-bold text-[#000000] tracking-tight">
              {adResult?.headline || 'תשדיר מוכן'}
            </h2>
            <div className="text-[12px] text-[#8E8E93]">
              <span>קריין: <strong className="text-[#007AFF] font-medium">{voiceObj.name}</strong></span>
              <span className="mx-1.5">•</span>
              <span>פורמט: <strong>MP3 (128kbps)</strong></span>
            </div>
          </div>

          {/* נגן השמע */}
          {audioData?.audioUrl && (
            <AudioPlayer audioUrl={audioData.audioUrl} />
          )}

          {/* תסריט שהוקלט */}
          <div className="p-3.5 rounded-[8px] bg-[#F2F2F7] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
              <span>טקסט הקריינות:</span>
              <button
                onClick={handleCopy}
                className="text-[#007AFF] hover:underline font-medium"
              >
                {copied ? 'הועתק ללוח' : 'העתק'}
              </button>
            </div>
            <p className="text-[14px] text-[#3C3C43] leading-relaxed" dir="rtl">
              {spokenScript}
            </p>
          </div>
        </div>
      </div>

      {/* מדריך שיתוף במחשב (מופיע בלחיצה על שיתוף בדסקטופ) */}
      {showDesktopShareGuide && (
        <div className="ios-group p-4 space-y-3 border border-[#007AFF]/30 bg-[#007AFF]/5">
          <div className="space-y-1 text-right">
            <div className="text-[14px] font-semibold text-[#007AFF]">
              קובץ ה-MP3 הורד למחשבך
            </div>
            <p className="text-[13px] text-[#3C3C43] leading-normal">
              דפדפנים במחשב אינם מאפשרים שליחת קובץ אודיו ישירות לוואטסאפ ללא גרירה. פתח את השיחה הרצויה וגרור לתוכה את קובץ ה-MP3 שהורד:
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={openWhatsAppWeb}
              className="flex-1 h-9 rounded-[8px] bg-[#34C759] text-white font-medium text-[13px] active:opacity-80"
            >
              פתח WhatsApp Web
            </button>
            <button
              type="button"
              onClick={openTelegramWeb}
              className="flex-1 h-9 rounded-[8px] bg-[#007AFF] text-white font-medium text-[13px] active:opacity-80"
            >
              פתח Telegram Web
            </button>
          </div>
        </div>
      )}

      {/* כפתורי הפצה ופעולות */}
      <div className="space-y-2.5 pt-1 pb-8">
        {/* שיתוף ראשי (במובייל מעביר ישירות כקובץ שמע ל-WhatsApp/Telegram) */}
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="w-full ios-button-whatsapp flex items-center justify-center text-[17px]"
        >
          {sharing ? 'מכין שיתוף...' : 'שתף קובץ שמע (WhatsApp / מכשיר)'}
        </button>

        {shareFeedback && !showDesktopShareGuide && (
          <div className="text-center text-[13px] text-[#34C759] font-medium">
            {shareFeedback}
          </div>
        )}

        {/* הורדת MP3 והחלפת קול */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadMp3}
            className="ios-button-gray flex items-center justify-center text-[15px]"
          >
            הורד קובץ MP3
          </button>

          <button
            type="button"
            onClick={onChangeVoice}
            className="ios-button-tinted flex items-center justify-center text-[15px]"
          >
            החלף קול או מודל
          </button>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onReset}
            className="text-[14px] text-[#007AFF] hover:opacity-70 font-normal transition-opacity"
          >
            יצירת פרסומת חדשה
          </button>
        </div>
      </div>
    </div>
  );
}
