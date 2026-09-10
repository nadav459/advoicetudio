import React from 'react';
import { getStoredApiKey } from '../services/geminiService';

export default function Header({ onOpenSettings, onOpenHistory, historyCount = 0 }) {
  const hasKey = Boolean(getStoredApiKey());

  return (
    <header className="sticky top-0 z-40 w-full ios-nav-bar">
      {/* iOS Navigation Bar - 44px Height */}
      <div className="max-w-2xl mx-auto px-4 h-11 flex items-center justify-between">
        {/* כפתור הגדרות - בסגנון כפתור ניווט טקסטואלי של אפל */}
        <button
          onClick={onOpenSettings}
          className="text-[#007AFF] text-[17px] font-normal hover:opacity-70 active:opacity-40 transition-opacity flex items-center gap-1"
        >
          <span>הגדרות</span>
          {!hasKey && (
            <span className="w-2 h-2 rounded-full bg-[#FF9500]" />
          )}
        </button>

        {/* כותרת מרכזית בבר הניווט */}
        <div className="text-center">
          <span className="text-[17px] font-semibold text-[#000000] tracking-tight">
            AdVoice Studio
          </span>
        </div>

        {/* כפתור היסטוריה */}
        <button
          onClick={onOpenHistory}
          className="text-[#007AFF] text-[17px] font-normal hover:opacity-70 active:opacity-40 transition-opacity flex items-center gap-1.5"
        >
          <span>היסטוריה</span>
          {historyCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#007AFF] text-white text-[11px] font-semibold flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>
      </div>

      {/* כותרת ראשית גדולה בסגנון Apple Large Title */}
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-3">
        <h1 className="text-[32px] sm:text-[34px] font-bold text-[#000000] tracking-tight leading-none">
          פרסומות קוליות
        </h1>
        <p className="text-[13px] text-[#8E8E93] mt-1 font-normal">
          יצירת תשדירי רדיו ושמע לקווי התראות
        </p>
      </div>
    </header>
  );
}
