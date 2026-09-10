import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, FastForward } from 'lucide-react';

export default function AudioPlayer({ audioUrl, onEnded }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, onEnded]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const cyclePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.2, 1.5, 0.8];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec)) return '0:00';
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-3.5">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* גלי קול בסגנון Apple Voice Memos */}
      <div className="h-14 w-full flex items-center justify-center gap-1 sm:gap-1.5 px-3 overflow-hidden bg-[#F2F2F7] rounded-[8px]">
        {Array.from({ length: 32 }).map((_, i) => {
          const heightFactor = Math.sin((i / 32) * Math.PI) * 0.85 + 0.15;
          return (
            <div
              key={i}
              className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
                isPlaying ? 'bg-[#007AFF]' : 'bg-[#C6C6C8]'
              }`}
              style={{
                height: isPlaying
                  ? `${Math.max(10, Math.random() * 46 * heightFactor)}px`
                  : `${12 + heightFactor * 16}px`
              }}
            />
          );
        })}
      </div>

      {/* סרגל התקדמות */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-[#E5E5EA] rounded-lg appearance-none cursor-pointer accent-[#007AFF] focus:outline-none"
        />
        <div className="flex justify-between text-[11px] text-[#8E8E93] font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* כפתורי שליטה */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={cyclePlaybackRate}
          className="h-7 px-2 rounded-[6px] bg-[#767680]/12 text-[#007AFF] text-[12px] font-semibold active:opacity-60 transition-opacity"
        >
          {playbackRate}x
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-[#007AFF] flex items-center justify-center text-white active:scale-95 transition-all shadow-sm"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }
          }}
          className="h-7 w-7 rounded-[6px] bg-[#767680]/12 text-[#8E8E93] hover:text-[#000000] flex items-center justify-center"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-[#FF3B30]" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
