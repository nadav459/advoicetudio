import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { replacePhoneNumbersInText } from '../utils/phoneToWords';

export default function ScriptReviewStep({
  adResult,
  spokenScript,
  setSpokenScript,
  onApprove,
  onRegenerate,
  onBack,
  loading,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [feedbackPrompt, setFeedbackPrompt] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  const wordCount = spokenScript ? spokenScript.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(5, Math.round((wordCount / 130) * 60));

  const handleTextChange = (newVal) => {
    const converted = replacePhoneNumbersInText(newVal);
    setSpokenScript(converted);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5">
      {/* סקשן 1: תסריט הרדיו המוצע */}
      <div>
        <div className="ios-section-title flex items-center justify-between">
          <span>תסריט רדיו מוצע</span>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-[14px] font-normal text-[#007AFF] hover:opacity-70"
          >
            {isEditing ? 'סיום עריכה' : 'עריכת טקסט'}
          </button>
        </div>

        <div className="ios-group p-4 space-y-3.5">
          {/* כותרת התשדיר */}
          {adResult?.headline && (
            <div className="text-[14px] font-semibold text-[#007AFF]">
              {adResult.headline}
            </div>
          )}

          {/* תוכן התסריט */}
          <div>
            {isEditing ? (
              <textarea
                value={spokenScript}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={6}
                dir="rtl"
                className="w-full ios-text-input focus:outline-none resize-none"
                placeholder="ערוך כאן את הטקסט..."
              />
            ) : (
              <p className="text-[17px] text-[#000000] font-normal leading-relaxed select-text" dir="rtl">
                {spokenScript}
              </p>
            )}
          </div>

          {/* אימות המרת טלפונים */}
          <div className="pt-2 border-t border-[#C6C6C8]/40 flex items-center justify-between text-[13px]">
            <span className="text-[#34C759] font-medium flex items-center gap-1">
              <Check className="w-4 h-4 stroke-[2.5]" />
              מספרי הטלפון הומרו למילים מדוברות
            </span>
            <span className="text-[#8E8E93]">
              {wordCount} מילים • כ-{estimatedSeconds} שניות
            </span>
          </div>
        </div>
      </div>

      {/* בקשת שינוי ניסוח */}
      {showFeedbackInput && (
        <div>
          <div className="ios-section-title">הערות לעריכה מחדש</div>
          <div className="ios-group p-3.5 space-y-2.5">
            <input
              type="text"
              value={feedbackPrompt}
              onChange={(e) => setFeedbackPrompt(e.target.value)}
              placeholder="מה תרצה לשנות בניסוח (לדוגמה: לקצר, לשנות פתיח)..."
              className="w-full ios-text-input text-[14px] focus:outline-none"
            />
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowFeedbackInput(false)}
                className="px-3 py-1 text-[13px] text-[#8E8E93] hover:text-[#000000]"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  onRegenerate(feedbackPrompt);
                  setShowFeedbackInput(false);
                }}
                disabled={loading}
                className="px-3.5 py-1 rounded-[6px] bg-[#007AFF] text-white text-[13px] font-semibold"
              >
                נסח מחדש
              </button>
            </div>
          </div>
        </div>
      )}

      {/* כפתורי פעולה */}
      <div className="space-y-2.5 pt-2 pb-8">
        {/* כפתור אישור ראשי */}
        <button
          type="button"
          onClick={onApprove}
          disabled={loading || !spokenScript.trim()}
          className="w-full ios-button-filled flex items-center justify-center text-[17px]"
        >
          אישור – המשך לבחירת קריין
        </button>

        {/* כפתורים משניים */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onRegenerate('')}
            disabled={loading}
            className="ios-button-gray flex items-center justify-center text-[15px]"
          >
            {loading ? 'מנסח מחדש...' : 'צור מחדש'}
          </button>

          <button
            type="button"
            onClick={() => setShowFeedbackInput(true)}
            disabled={loading}
            className="ios-button-tinted flex items-center justify-center text-[15px]"
          >
            בקש שינוי ניסוח
          </button>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] text-[#007AFF] hover:opacity-70 transition-opacity"
          >
            חזרה לעריכת ההודעה
          </button>
        </div>
      </div>
    </div>
  );
}
