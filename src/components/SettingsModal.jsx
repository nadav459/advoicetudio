import React, { useState } from 'react';
import { Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiService';

export default function SettingsModal({ isOpen, onClose, onKeyUpdated }) {
  const existingKey = getStoredApiKey() || '';
  const [newApiKey, setNewApiKey] = useState('');
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'valid' | 'invalid'
  const [testMessage, setTestMessage] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (newApiKey.trim()) {
      setStoredApiKey(newApiKey.trim());
      if (onKeyUpdated) onKeyUpdated();
    }
    onClose();
  };

  const testApiKey = async () => {
    const keyToTest = newApiKey.trim() || existingKey;
    if (!keyToTest) {
      setTestStatus('invalid');
      setTestMessage('לא הוגדר מפתח API');
      return;
    }

    setTestStatus('testing');
    setTestMessage('בודק חיבור מול Google...');

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToTest}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'ping' }] }]
        })
      });

      if (res.ok) {
        setTestStatus('valid');
        setTestMessage('המפתח תקין ומחובר בהצלחה.');
      } else {
        const err = await res.json().catch(() => ({}));
        setTestStatus('invalid');
        setTestMessage(err?.error?.message || `שגיאה (${res.status})`);
      }
    } catch (e) {
      setTestStatus('invalid');
      setTestMessage('שגיאת תקשורת עם השרת');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-[2px] animate-fadeIn p-0 sm:p-4">
      {/* Official Apple HIG Sheet */}
      <div className="w-full max-w-md bg-[#F2F2F7] rounded-t-[14px] sm:rounded-[14px] shadow-2xl overflow-hidden pb-6 border border-[#C6C6C8]/50 max-h-[90vh] flex flex-col">
        {/* Grabber Handle */}
        <div className="w-9 h-1 bg-[#D1D1D6] rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Sheet Navigation Bar (44px) */}
        <div className="h-11 px-4 flex items-center justify-between border-b border-[#C6C6C8]/40 bg-white/60 shrink-0">
          <button
            onClick={onClose}
            className="text-[17px] text-[#007AFF] hover:opacity-70"
          >
            ביטול
          </button>
          <span className="text-[17px] font-semibold text-[#000000]">
            הגדרות
          </span>
          <button
            onClick={handleSave}
            className="text-[17px] font-semibold text-[#007AFF] hover:opacity-70"
          >
            סיום
          </button>
        </div>

        {/* Form Groups Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* סקשן 1: סטטוס מפתח (מוסתר לחלוטין) */}
          <div>
            <div className="ios-section-title">סטטוס מפתח Google AI Studio</div>
            <div className="ios-group divide-y divide-[#C6C6C8]/40">
              <div className="px-4 py-3 flex items-center justify-between text-[15px]">
                <span className="text-[#000000]">מצב חיבור</span>
                {existingKey ? (
                  <span className="text-[#34C759] font-medium flex items-center gap-1">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    מוגדר ומאומת
                  </span>
                ) : (
                  <span className="text-[#FF9500] font-medium">לא מוגדר</span>
                )}
              </div>

              <div className="px-4 py-3 flex items-center justify-between text-[15px]">
                <span className="text-[#000000]">מפתח שמור</span>
                <span className="font-mono text-[#8E8E93] tracking-widest select-none text-[13px]">
                  •••• •••• •••• ••••
                </span>
              </div>
            </div>
            <div className="text-[12px] text-[#8E8E93] px-4 pt-1.5 leading-normal">
              המפתח נשמר בדפדפן שלך בלבד ואינו משותף עם משתמשים אחרים.
            </div>
          </div>

          {/* סקשן 2: החלפת מפתח */}
          <div>
            <div className="ios-section-title">הזנת / החלפת מפתח API אישי</div>
            <div className="ios-group p-3">
              <input
                type="password"
                value={newApiKey}
                onChange={(e) => {
                  setNewApiKey(e.target.value);
                  setTestStatus(null);
                }}
                placeholder="הדבק כאן את מפתח ה-API שלך..."
                className="w-full ios-text-input text-[15px] focus:outline-none"
                dir="ltr"
                autoComplete="off"
              />
            </div>
          </div>

          {/* סקשן 3: קישור ובדיקת תקינות */}
          <div>
            <div className="ios-group divide-y divide-[#C6C6C8]/40">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 flex items-center justify-between text-[15px] text-[#007AFF] hover:bg-[#F2F2F7]/50 active:bg-[#E5E5EA] transition-colors"
              >
                <span>מעבר לאתר Google AI Studio להוצאת מפתח</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>

              <button
                type="button"
                onClick={testApiKey}
                disabled={testStatus === 'testing'}
                className="w-full px-4 py-3 text-right text-[15px] text-[#007AFF] hover:bg-[#F2F2F7]/50 active:bg-[#E5E5EA] transition-colors font-normal"
              >
                {testStatus === 'testing' ? 'בודק חיבור...' : 'בדוק תקינות חיבור למפתח'}
              </button>
            </div>

            {testStatus && (
              <div className={`px-4 pt-2 text-[13px] ${
                testStatus === 'valid' ? 'text-[#34C759]' : 'text-[#FF3B30]'
              }`}>
                {testMessage}
              </div>
            )}
          </div>

          {/* סקשן 4: מדריך קצר להוצאת מפתח חינם (מתקפל בסגנון Apple Inset) */}
          <div>
            <div className="ios-group overflow-hidden">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="w-full px-4 py-3 text-right flex items-center justify-between hover:bg-[#F2F2F7]/50 transition-colors"
              >
                <span className="text-[14px] font-medium text-[#000000]">
                  מדריך קצר: איך להוציא מפתח חינם בפחות מדקה
                </span>
                {showGuide ? (
                  <ChevronUp className="w-4 h-4 text-[#8E8E93]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
                )}
              </button>

              {showGuide && (
                <div className="px-4 pb-3.5 pt-1 text-[13px] text-[#3C3C43] space-y-2 border-t border-[#C6C6C8]/40 bg-[#F9F9FB] leading-relaxed">
                  <div className="flex gap-2">
                    <span className="font-bold text-[#007AFF] shrink-0">1.</span>
                    <span>לחץ על הקישור למעלה והתחבר עם חשבון Google הרגיל שלך.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#007AFF] shrink-0">2.</span>
                    <span>בדף שייפתח, לחץ על הכפתור הכחול <strong>Create API key</strong> (או Get API key).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#007AFF] shrink-0">3.</span>
                    <span>בחר פרויקט (או אשר יצירת פרויקט חדש בקליק), והעתק את מחרוזת המפתח שנוצרה.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-[#007AFF] shrink-0">4.</span>
                    <span>חזור לכאן, הדבק את המפתח בשדה שלמעלה ולחץ על <strong>סיום</strong>. זה הכל!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
