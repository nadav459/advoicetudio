import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { GEMINI_VOICES, TTS_MODELS } from '../services/geminiService';

export default function VoiceStudioStep({
  spokenScript,
  selectedVoice,
  setSelectedVoice,
  selectedModel,
  setSelectedModel,
  onGenerateAudio,
  onBack,
  loading,
}) {
  const [filterGender, setFilterGender] = useState('all');

  const filteredVoices = GEMINI_VOICES.filter(v => {
    if (filterGender === 'all') return true;
    return v.gender === filterGender;
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5">
      {/* סקשן 1: בחירת מודל TTS */}
      <div>
        <div className="ios-section-title">מודל הפקת שמע</div>
        <div className="ios-group divide-y divide-[#C6C6C8]/40">
          {TTS_MODELS.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelectedModel(model.id)}
                className="w-full px-4 py-3 text-right flex items-center justify-between hover:bg-[#F2F2F7]/50 active:bg-[#E5E5EA] transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px] text-[#000000]">{model.name}</span>
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-[4px] font-medium ${
                      isSelected ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-[#767680]/10 text-[#8E8E93]'
                    }`}>
                      {model.badge}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#8E8E93] leading-snug">{model.desc}</p>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-[#007AFF] stroke-[2.5] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* סקשן 2: בחירת קול קריין (Apple Table View) */}
      <div>
        <div className="ios-section-title flex items-center justify-between">
          <span>קולות הקריין (Google AI Studio)</span>
          {/* Segmented Filter */}
          <div className="ios-segmented-bar flex items-center h-6 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setFilterGender('all')}
              className={`px-2 h-5 rounded-[6px] transition-all ${
                filterGender === 'all' ? 'ios-segmented-thumb' : 'text-[#8E8E93]'
              }`}
            >
              הכל
            </button>
            <button
              type="button"
              onClick={() => setFilterGender('גברי')}
              className={`px-2 h-5 rounded-[6px] transition-all ${
                filterGender === 'גברי' ? 'ios-segmented-thumb' : 'text-[#8E8E93]'
              }`}
            >
              גברי
            </button>
            <button
              type="button"
              onClick={() => setFilterGender('נשי')}
              className={`px-2 h-5 rounded-[6px] transition-all ${
                filterGender === 'נשי' ? 'ios-segmented-thumb' : 'text-[#8E8E93]'
              }`}
            >
              נשי
            </button>
          </div>
        </div>

        <div className="ios-group divide-y divide-[#C6C6C8]/40 max-h-[340px] overflow-y-auto">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoice === voice.id;

            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => setSelectedVoice(voice.id)}
                className="w-full px-4 py-2.5 text-right flex items-center justify-between hover:bg-[#F2F2F7]/50 active:bg-[#E5E5EA] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px] text-[#000000]">{voice.name}</span>
                    <span className="text-[12px] text-[#8E8E93]">({voice.gender})</span>
                    {voice.recommended && (
                      <span className="text-[10px] px-1.5 rounded-[4px] bg-[#007AFF]/10 text-[#007AFF] font-medium">
                        מומלץ
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#007AFF] font-medium">{voice.style}</div>
                  <div className="text-[11px] text-[#8E8E93] line-clamp-1">{voice.desc}</div>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-[#007AFF] stroke-[2.5] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* סקשן 3: טקסט מאושר */}
      <div>
        <div className="ios-section-title">טקסט מאושר להקראה</div>
        <div className="ios-group p-3.5">
          <p className="text-[14px] text-[#3C3C43] line-clamp-3 leading-relaxed" dir="rtl">
            {spokenScript}
          </p>
        </div>
      </div>

      {/* כפתורי פעולה */}
      <div className="space-y-2.5 pt-2 pb-8">
        <button
          type="button"
          onClick={onGenerateAudio}
          disabled={loading || !spokenScript.trim()}
          className="w-full ios-button-filled flex items-center justify-center text-[17px]"
        >
          {loading ? 'מפיק הקלטת שמע...' : 'הפק הקלטה קולית (Google TTS)'}
        </button>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onBack}
            className="text-[14px] text-[#007AFF] hover:opacity-70 transition-opacity"
          >
            חזרה לניסוח התסריט
          </button>
        </div>
      </div>
    </div>
  );
}
