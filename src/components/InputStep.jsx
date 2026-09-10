import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { AD_STYLES, AD_DURATIONS } from '../services/geminiService';
import { findRemainingPhoneNumbers, formatSinglePhoneNumberToWords } from '../utils/phoneToWords';

const SAMPLE_TEMPLATES = [
  {
    title: 'מבצע סוף שבוע',
    text: 'פיצה דלישס במבצע סוף שבוע מיוחד. מגש משפחתי ענק עם שתי תוספות ובקבוק שתיה ב-49 שקלים בלבד. להזמנות משלוחים חייגו עכשיו: 050-1234567'
  },
  {
    title: 'נדל"ן ומגורים',
    text: 'פרויקט מגדלי הפארק פותח שיווק. דירות ארבעה וחמישה חדרים עם מרפסת שמש לנוף פתוח. תנאי מימון חסרי תקדים. לתיאום פגישה: 03-6543210'
  },
  {
    title: 'רכב ושירות',
    text: 'החורף כאן והרכב חייב בדיקה. מוסך הצמרת מציע בדיקת חורף ללא עלות ו-20 אחוזי הנחה על כל הטיפולים. חייגו עכשיו: 054-9988776'
  },
  {
    title: 'חיוג כוכבית',
    text: 'רשת האופנה בסט-סטייל במבצע סוף עונה. אחד פלוס אחד על כל החנות. לפרטים וסניפים חייגו כוכבית 6050'
  }
];

export default function InputStep({
  rawContent,
  setRawContent,
  selectedStyle,
  setSelectedStyle,
  selectedDuration,
  setSelectedDuration,
  customInstructions,
  setCustomInstructions,
  onSubmit,
  loading,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // זיהוי דינמי של מספרי טלפון בזמן הקלדה
  const detectedPhones = useMemo(() => {
    return findRemainingPhoneNumbers(rawContent);
  }, [rawContent]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5">
      {/* סקשן 1: תוכן ההודעה (Apple Inset Grouped) */}
      <div>
        <div className="ios-section-title flex items-center justify-between">
          <span>הודעה מקורית</span>
          <span className="font-normal normal-case text-[#8E8E93] text-[12px]">{rawContent.length} תווים</span>
        </div>
        <div className="ios-group p-4 space-y-3">
          <textarea
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="הזן כאן את תוכן ההודעה הגולמית או המבצע...
לדוגמה: פיצה דלישס במבצע סוף שבוע! מגש משפחתי + שתיה ב-49 שקלים בלבד. להזמנות חייגו 050-1234567"
            rows={5}
            dir="rtl"
            className="w-full ios-text-input focus:outline-none resize-none"
          />

          {/* דוגמאות מהירות לבדיקה (טקסט בלבד) */}
          <div className="pt-2 border-t border-[#C6C6C8]/40 flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] text-[#8E8E93] pl-1">דוגמאות:</span>
            {SAMPLE_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRawContent(tpl.text)}
                className="text-[12px] font-medium px-2.5 py-1 rounded-[6px] bg-[#767680]/10 text-[#007AFF] hover:bg-[#767680]/15 active:opacity-60 transition-all"
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* סקשן 2: זיהוי מספרי טלפון והמרה למילים (אם זוהו) */}
      {detectedPhones.length > 0 && (
        <div>
          <div className="ios-section-title text-[#34C759]">זיהוי טלפון והמרה למילים</div>
          <div className="ios-group divide-y divide-[#C6C6C8]/40">
            {detectedPhones.map((phone, idx) => (
              <div key={idx} className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[13px]">
                <span className="font-mono text-[#8E8E93]">{phone}</span>
                <span className="text-[#000000] font-medium">
                  "{formatSinglePhoneNumberToWords(phone)}"
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* סקשן 3: סגנון הקריינות (Apple Table View Cells) */}
      <div>
        <div className="ios-section-title">סגנון הקריינות</div>
        <div className="ios-group divide-y divide-[#C6C6C8]/40">
          {AD_STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className="w-full px-4 py-3 text-right flex items-center justify-between hover:bg-[#F2F2F7]/50 active:bg-[#E5E5EA] transition-colors"
              >
                <div>
                  <div className="text-[16px] font-medium text-[#000000] leading-snug">{style.name}</div>
                  <div className="text-[13px] text-[#8E8E93] leading-snug">{style.promptDesc}</div>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-[#007AFF] stroke-[2.5] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* סקשן 4: משך התשדיר (Apple Segmented Bar) */}
      <div>
        <div className="ios-section-title">משך מבוקש</div>
        <div className="ios-group p-3">
          <div className="ios-segmented-bar flex items-center justify-between">
            {AD_DURATIONS.map((dur) => {
              const isSelected = selectedDuration === dur.id;
              return (
                <button
                  key={dur.id}
                  type="button"
                  onClick={() => setSelectedDuration(dur.id)}
                  className={`flex-1 h-7 text-center transition-all text-[13px] font-medium ${
                    isSelected ? 'ios-segmented-thumb' : 'text-[#8E8E93] hover:text-[#000000]'
                  }`}
                >
                  {dur.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* סקשן 5: הנחיות נוספות */}
      <div>
        <div className="ios-group p-3.5">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-[14px] font-normal text-[#007AFF]"
          >
            <span>הנחיות ניסוח נוספות (אופציונלי)</span>
            <span className="text-[12px] text-[#8E8E93]">{showAdvanced ? 'הסתר' : 'הצג'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 pt-3 border-t border-[#C6C6C8]/40">
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="למשל: להדגיש את המועד, נימה אישית..."
                className="w-full ios-text-input text-[14px] focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* כפתור ראשי - Filled Button */}
      <div className="pt-2 pb-8">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !rawContent.trim()}
          className="w-full ios-button-filled flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>מנסח תשדיר רדיו...</span>
          ) : (
            <span>שכתב לתסריט רדיו</span>
          )}
        </button>
      </div>
    </div>
  );
}
