import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import InputStep from './components/InputStep';
import ScriptReviewStep from './components/ScriptReviewStep';
import VoiceStudioStep from './components/VoiceStudioStep';
import AudioResultStep from './components/AudioResultStep';
import SettingsModal from './components/SettingsModal';
import HistoryDrawer from './components/HistoryDrawer';
import { generateAdScript, generateTTSAudio, generateLocalAdScript, getStoredApiKey } from './services/geminiService';
import { saveAdToHistory, getAllAdsFromHistory, deleteAdFromHistory } from './services/storageService';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);

  // שלב 1: תוכן גולמי
  const [rawContent, setRawContent] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('energetic');
  const [selectedDuration, setSelectedDuration] = useState('30s');
  const [customInstructions, setCustomInstructions] = useState('');

  // שלב 2: ניסוח רדיו
  const [adResult, setAdResult] = useState(null);
  const [spokenScript, setSpokenScript] = useState('');

  // שלב 3: סטודיו קריין
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-preview-tts');

  // שלב 4: תוצאת שמע
  const [audioData, setAudioData] = useState(null);

  // מצבי טעינה ושגיאות
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null); // { message, isQuota }

  // מודאלים
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const items = await getAllAdsFromHistory();
    setHistoryItems(items);
  };

  const ensureApiKey = () => {
    const key = getStoredApiKey();
    if (!key) {
      setIsSettingsOpen(true);
      setErrorInfo({ message: 'יש להגדיר מפתח Google AI Studio בהגדרות', isQuota: false });
      return false;
    }
    return true;
  };

  // מעבר לתסריט מקומי מהיר (Fallback) ללא צורך בטוקנים
  const handleUseLocalFallback = () => {
    if (!rawContent.trim()) return;
    const localResult = generateLocalAdScript({
      rawContent,
      styleId: selectedStyle,
      durationId: selectedDuration
    });
    setAdResult(localResult);
    setSpokenScript(localResult.spokenScript);
    setErrorInfo(null);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. יצירת תסריט
  const handleGenerateScript = async () => {
    if (!ensureApiKey()) return;
    if (!rawContent.trim()) return;

    setLoading(true);
    setErrorInfo(null);

    try {
      const result = await generateAdScript({
        rawContent,
        styleId: selectedStyle,
        durationId: selectedDuration,
        customInstructions,
      });

      setAdResult(result);
      setSpokenScript(result.spokenScript);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const isQuota = err.code === 'QUOTA_EXHAUSTED' || (err.message && err.message.includes('429'));
      setErrorInfo({
        message: err.message || 'שגיאה ביצירת התסריט מול שרתי Google',
        isQuota
      });
    } finally {
      setLoading(false);
    }
  };

  // יצירה מחדש
  const handleRegenerateScript = async (extraFeedback = '') => {
    if (!ensureApiKey()) return;
    setLoading(true);
    setErrorInfo(null);

    try {
      const combinedInstructions = [customInstructions, extraFeedback]
        .filter(Boolean)
        .join('. ');

      const result = await generateAdScript({
        rawContent,
        styleId: selectedStyle,
        durationId: selectedDuration,
        customInstructions: combinedInstructions,
      });

      setAdResult(result);
      setSpokenScript(result.spokenScript);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const isQuota = err.code === 'QUOTA_EXHAUSTED' || (err.message && err.message.includes('429'));
      setErrorInfo({
        message: err.message || 'שגיאה בניסוח מחדש מול שרתי Google',
        isQuota
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. אישור תסריט
  const handleApproveScript = () => {
    if (!spokenScript.trim()) return;
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. הפקת שמע
  const handleGenerateAudio = async () => {
    if (!ensureApiKey()) return;
    if (!spokenScript.trim()) return;

    setLoading(true);
    setErrorInfo(null);

    try {
      const audioRes = await generateTTSAudio({
        scriptText: spokenScript,
        voiceName: selectedVoice,
        model: selectedModel,
      });

      setAudioData(audioRes);

      await saveAdToHistory({
        headline: adResult?.headline || 'פרסומת קולית',
        spokenScript,
        voiceName: selectedVoice,
        model: selectedModel,
        audioBlob: audioRes.blob,
      });

      await loadHistory();
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const isQuota = err.message && (err.message.includes('429') || err.message.includes('מכסה'));
      setErrorInfo({
        message: err.message || 'שגיאה בהפקת האודיו',
        isQuota
      });
    } finally {
      setLoading(false);
    }
  };

  // איפוס
  const handleReset = () => {
    setRawContent('');
    setAdResult(null);
    setSpokenScript('');
    setAudioData(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = async (id) => {
    await deleteAdFromHistory(id);
    await loadHistory();
  };

  const handleReuseHistoryItem = (item) => {
    setSpokenScript(item.spokenScript);
    if (item.voiceName) setSelectedVoice(item.voiceName);
    if (item.model) setSelectedModel(item.model);
    setAdResult({ headline: item.headline, spokenScript: item.spokenScript });
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#000000] flex flex-col font-sans selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
      {/* Apple Navigation Bar */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
      />

      {/* Segmented Control שלבים */}
      <StepIndicator
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* באנר התראה במקרה של שגיאה או מכסה */}
      {errorInfo && (
        <div className="w-full max-w-2xl mx-auto px-4 mt-2">
          <div className="rounded-[10px] p-3.5 bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#000000] text-[13px] space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-[#D70015]">
                {errorInfo.message}
              </span>
              <button
                onClick={() => setErrorInfo(null)}
                className="text-[#8E8E93] hover:text-[#000000] text-[12px] font-medium"
              >
                סגור
              </button>
            </div>

            {/* כפתורי פעולה יעילים במקרה של חריגת מכסה */}
            {errorInfo.isQuota && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#FF3B30]/15 text-[12px]">
                {rawContent.trim() && (
                  <button
                    onClick={handleUseLocalFallback}
                    className="px-2.5 py-1 rounded-[6px] bg-[#007AFF] text-white font-medium hover:opacity-80"
                  >
                    השתמש בניסוח מקומי מיידי (ללא טוקנים)
                  </button>
                )}
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2.5 py-1 rounded-[6px] bg-white text-[#007AFF] border border-[#C6C6C8] font-medium hover:bg-[#F2F2F7]"
                >
                  החלף מפתח API בהגדרות
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* תוכן ראשי */}
      <main className="flex-1 w-full pb-6">
        {currentStep === 1 && (
          <InputStep
            rawContent={rawContent}
            setRawContent={setRawContent}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            customInstructions={customInstructions}
            setCustomInstructions={setCustomInstructions}
            onSubmit={handleGenerateScript}
            loading={loading}
          />
        )}

        {currentStep === 2 && (
          <ScriptReviewStep
            adResult={adResult}
            spokenScript={spokenScript}
            setSpokenScript={setSpokenScript}
            onApprove={handleApproveScript}
            onRegenerate={handleRegenerateScript}
            onBack={() => setCurrentStep(1)}
            loading={loading}
          />
        )}

        {currentStep === 3 && (
          <VoiceStudioStep
            spokenScript={spokenScript}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onGenerateAudio={handleGenerateAudio}
            onBack={() => setCurrentStep(2)}
            loading={loading}
          />
        )}

        {currentStep === 4 && (
          <AudioResultStep
            audioData={audioData}
            spokenScript={spokenScript}
            adResult={adResult}
            selectedVoice={selectedVoice}
            selectedModel={selectedModel}
            onReset={handleReset}
            onChangeVoice={() => setCurrentStep(3)}
          />
        )}
      </main>

      {/* Home Indicator */}
      <div className="py-2">
        <div className="ios-home-bar" />
      </div>

      {/* Sheet הגדרות */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdated={() => setErrorInfo(null)}
      />

      {/* ארכיון והיסטוריה */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyItems={historyItems}
        onDeleteItem={handleDeleteHistoryItem}
        onSelectForReuse={handleReuseHistoryItem}
      />
    </div>
  );
}
