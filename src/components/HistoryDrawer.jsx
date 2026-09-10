import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { downloadBlob, shareAudioFile, openWhatsAppWeb } from '../services/audioUtils';

export default function HistoryDrawer({ isOpen, onClose, historyItems, onDeleteItem, onSelectForReuse }) {
  const [activeAudioId, setActiveAudioId] = useState(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);

  if (!isOpen) return null;

  const handlePlay = (item) => {
    if (activeAudioId === item.id) {
      setActiveAudioId(null);
      setActiveAudioUrl(null);
    } else {
      if (item.audioBlob) {
        const url = URL.createObjectURL(item.audioBlob);
        setActiveAudioUrl(url);
        setActiveAudioId(item.id);
      }
    }
  };

  const handleShare = async (item) => {
    if (!item.audioBlob) return;
    const filename = `${(item.headline || 'ad').replace(/\s+/g, '_')}.mp3`;
    const shareText = `פרסומת קולית:\n"${item.headline}"\n\n${item.spokenScript}`;
    const res = await shareAudioFile(item.audioBlob, filename, item.headline, shareText);
    if (res.method === 'unsupported') {
      downloadBlob(item.audioBlob, filename);
      openWhatsAppWeb();
    }
  };

  const handleDownloadMp3 = (item) => {
    if (!item.audioBlob) return;
    const filename = `${(item.headline || 'ad').replace(/\s+/g, '_')}.mp3`;
    downloadBlob(item.audioBlob, filename);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px] animate-fadeIn">
      {activeAudioUrl && (
        <audio
          src={activeAudioUrl}
          autoPlay
          onEnded={() => {
            setActiveAudioId(null);
            setActiveAudioUrl(null);
          }}
        />
      )}

      {/* Slide-over Apple Sheet */}
      <div className="w-full max-w-md h-full bg-[#F2F2F7] flex flex-col border-r border-[#C6C6C8]/50 shadow-2xl overflow-hidden">
        {/* Navigation Bar (44px) */}
        <div className="h-11 px-4 flex items-center justify-between border-b border-[#C6C6C8]/40 bg-white/70">
          <span className="text-[17px] font-semibold text-[#000000]">
            ארכיון פרסומות (נשמר במכשיר)
          </span>
          <button
            onClick={onClose}
            className="text-[17px] font-semibold text-[#007AFF] hover:opacity-70"
          >
            סיום
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {historyItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8E8E93] space-y-1.5">
              <p className="text-[15px] font-medium text-[#000000]">אין עדיין פרסומות שמורות</p>
              <p className="text-[13px]">כל פרסומת שתפיק תישמר במכשירך באופן קבוע</p>
            </div>
          ) : (
            historyItems.map((item) => {
              const isPlaying = activeAudioId === item.id;

              return (
                <div
                  key={item.id}
                  className="ios-group p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-[15px] text-[#000000] line-clamp-1">
                        {item.headline || 'פרסומת קולית'}
                      </h4>
                      <div className="text-[12px] text-[#8E8E93] mt-0.5">
                        <span>{formatDate(item.createdAt)}</span>
                        <span className="mx-1">•</span>
                        <span>קריין: {item.voiceName || 'ברירת מחדל'}</span>
                        <span className="mx-1">•</span>
                        <span className="font-mono">MP3</span>
                      </div>
                    </div>

                    {item.audioBlob && (
                      <button
                        onClick={() => handlePlay(item)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all shrink-0 ${
                          isPlaying ? 'bg-[#FF3B30]' : 'bg-[#007AFF]'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                      </button>
                    )}
                  </div>

                  <p className="text-[13px] text-[#3C3C43] line-clamp-2 bg-[#F2F2F7] p-2.5 rounded-[6px] leading-relaxed">
                    {item.spokenScript}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#C6C6C8]/40 text-[13px]">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleShare(item)}
                        className="text-[#34C759] hover:opacity-70 font-medium"
                      >
                        וואטסאפ
                      </button>

                      <button
                        onClick={() => handleDownloadMp3(item)}
                        className="text-[#007AFF] hover:opacity-70 font-medium"
                      >
                        הורד MP3
                      </button>

                      {onSelectForReuse && (
                        <button
                          onClick={() => {
                            onSelectForReuse(item);
                            onClose();
                          }}
                          className="text-[#007AFF] hover:opacity-70 font-medium"
                        >
                          טען
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-[#FF3B30] hover:opacity-70 text-[12px]"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
