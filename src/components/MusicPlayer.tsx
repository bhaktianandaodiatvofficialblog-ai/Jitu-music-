import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Eye, Sparkles } from 'lucide-react';
import { Song } from '../types/music';
import { getAudioTrack } from '../services/audioStorage';

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onViewCounted: (songId: string) => void;
  language: 'or' | 'en';
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPauseToggle,
  onNextSong,
  onPrevSong,
  onViewCounted,
  language,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // 3-minute view counting state
  const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(0);
  const [hasViewBeenCounted, setHasViewBeenCounted] = useState<boolean>(false);
  const [showViewToast, setShowViewToast] = useState<boolean>(false);

  // Reset or initialize player when song changes
  useEffect(() => {
    if (currentSong) {
      setAccumulatedSeconds(0);
      setHasViewBeenCounted(false);
      setShowViewToast(false);
      setCurrentTime(0);

      const loadAudio = async () => {
        let srcUrl = currentSong.audioUrl;
        if (srcUrl.startsWith('idb:')) {
          const idbTrack = await getAudioTrack(currentSong.id);
          if (idbTrack) {
            srcUrl = idbTrack;
          }
        }
        if (audioRef.current) {
          audioRef.current.src = srcUrl;
          audioRef.current.load();
          if (isPlaying) {
            audioRef.current.play().catch(err => {
              console.warn('Auto-play prevented by browser policy:', err);
            });
          }
        }
      };

      loadAudio();
    }
  }, [currentSong?.id]);

  // Handle play/pause commands from parent state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.warn('Play error:', err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Accumulated timer loop for 3-minute listen criteria (180s)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && currentSong && !hasViewBeenCounted) {
      interval = setInterval(() => {
        setAccumulatedSeconds((prev) => {
          const next = prev + 1;
          // Threshold: 3 minutes = 180 seconds
          if (next >= 180 && !hasViewBeenCounted) {
            setHasViewBeenCounted(true);
            onViewCounted(currentSong.id);
            setShowViewToast(true);
            setTimeout(() => setShowViewToast(false), 5000);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSong?.id, hasViewBeenCounted, onViewCounted]);

  if (!currentSong) return null;

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '0:00';
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      audioRef.current.muted = nextMute;
    }
  };

  // Calculate 3-minute progress percentage (180 seconds = 100%)
  const viewProgressPercent = Math.min(100, Math.floor((accumulatedSeconds / 180) * 100));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 text-white shadow-2xl pb-2 sm:pb-0">
      
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={onNextSong}
      />

      {/* 3-Minute View Toast Notification Popup */}
      {showViewToast && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full shadow-2xl border border-emerald-400/40 flex items-center gap-2 text-xs font-bold animate-bounce z-50">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>
            {language === 'or' 
              ? '🎉 ୩ ମିନିଟ ଗୀତ ଶୁଣିଲେ - ୧ଟି View Success!' 
              : '🎉 3 Minutes Listened - 1 View Recorded Successfully!'}
          </span>
        </div>
      )}

      {/* Main Player Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6">
        
        {/* 1:1 Song Poster & Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 shrink-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden aspect-square shrink-0 border border-slate-700 shadow-md">
            <img
              src={currentSong.posterUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
              {currentSong.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Player Controls & Scrubber */}
        <div className="flex-1 w-full max-w-xl flex flex-col items-center gap-1.5">
          
          {/* Action buttons row */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={onPrevSong}
              className="text-slate-400 hover:text-white transition p-1"
              title="Previous Song"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onPlayPauseToggle}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold flex items-center justify-center shadow-lg transition transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 ml-0.5 fill-slate-950" />
              )}
            </button>

            <button
              onClick={onNextSong}
              className="text-slate-400 hover:text-white transition p-1"
              title="Next Song"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="w-full flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 3-Minute View Timer Progress & Volume Controls */}
        <div className="flex items-center gap-4 w-full md:w-1/4 justify-between md:justify-end shrink-0">
          
          {/* 3-Minute Listen Progress Counter */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs">
            <Eye className={`w-4 h-4 ${hasViewBeenCounted ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-300 leading-tight">
                {hasViewBeenCounted
                  ? (language === 'or' ? '👁️ View ଯୋଡ଼ାଗଲା' : '👁️ View Counted')
                  : (language === 'or' ? `⏱️ ୩ମି listen: ${Math.floor(accumulatedSeconds / 60)}m ${accumulatedSeconds % 60}s` : `⏱️ 3m Listen: ${Math.floor(accumulatedSeconds / 60)}m ${accumulatedSeconds % 60}s`)}
              </span>
              <div className="w-20 bg-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`h-full transition-all duration-300 ${hasViewBeenCounted ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  style={{ width: `${viewProgressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

        </div>

      </div>
    </div>
  );
};
