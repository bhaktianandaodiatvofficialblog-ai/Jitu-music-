import React from 'react';
import { Play, Pause, Eye, Heart, Share2, MessageCircle, Volume2, Trash2 } from 'lucide-react';
import { Song } from '../types/music';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  isCurrentSong: boolean;
  onPlaySelect: (song: Song) => void;
  onOpenShare: (song: Song) => void;
  onOpenComments: (song: Song) => void;
  onLike: (songId: string) => void;
  onDeleteSong?: (songId: string) => void;
  isAdminLoggedIn: boolean;
  commentCount: number;
  language: 'or' | 'en';
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isPlaying,
  isCurrentSong,
  onPlaySelect,
  onOpenShare,
  onOpenComments,
  onLike,
  onDeleteSong,
  isAdminLoggedIn,
  commentCount,
  language,
}) => {
  return (
    <div className="group relative bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/60 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 flex flex-col">
      
      {/* 1:1 Square Poster Container - CLICKING PHOTO STARTS MUSIC */}
      <div 
        onClick={() => onPlaySelect(song)}
        className="relative aspect-square w-full bg-slate-900 cursor-pointer overflow-hidden group/poster"
        title={language === 'or' ? 'ଗୀତ ଶୁଣିବା ପାଇଁ ଫୋଟୋ ଉପରେ କ୍ଲିକ କରନ୍ତୁ' : 'Click photo to play music'}
      >
        <img
          src={song.posterUrl}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-105"
          onError={(e) => {
            // Fallback thumbnail if image fails to load
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&h=600&q=80';
          }}
        />

        {/* Category Badge Tag */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
          {song.category}
        </span>

        {/* Verified 3-Min View Count Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700/60">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>{song.viewsCount.toLocaleString()}</span>
        </div>

        {/* Play Overlay & Equalizer Indicator */}
        <div className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 flex flex-col items-center justify-center ${
          isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover/poster:opacity-100'
        }`}>
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-xl flex items-center justify-center transform transition group-hover/poster:scale-110">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white">
              {isCurrentSong && isPlaying ? (
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite_100ms] rounded-full h-full"></span>
                  <span className="w-1 bg-rose-400 animate-[bounce_0.6s_infinite_300ms] rounded-full h-3"></span>
                  <span className="w-1 bg-orange-400 animate-[bounce_0.6s_infinite_200ms] rounded-full h-5"></span>
                  <span className="w-1 bg-amber-400 animate-[bounce_0.6s_infinite_400ms] rounded-full h-2"></span>
                </div>
              ) : (
                <Play className="w-6 h-6 ml-1 text-amber-400 fill-amber-400" />
              )}
            </div>
          </div>
          
          <p className="mt-2 text-[11px] font-medium text-amber-200 bg-slate-900/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {isCurrentSong && isPlaying 
              ? (language === 'or' ? 'ଚାଲୁଛି...' : 'Playing Now') 
              : (language === 'or' ? 'ଶୁଣିବା ପାଇଁ କ୍ଲିକ କରନ୍ତୁ' : 'Click Photo to Play')}
          </p>
        </div>

        {/* Admin Delete Quick Button */}
        {isAdminLoggedIn && onDeleteSong && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(language === 'or' ? 'ଆପଣ ଏହି ଗୀତଟିକୁ କାଢିବାକୁ (Delete) ଚାହୁଁଛନ୍ତି କି?' : 'Are you sure you want to delete this song?')) {
                onDeleteSong(song.id);
              }
            }}
            className="absolute bottom-2.5 right-2.5 p-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg transition"
            title="Delete Song (Admin)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Song Details Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
            {song.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-medium">
            {song.artist}
          </p>
          {song.description && (
            <p className="text-[11px] text-slate-400/80 mt-1 line-clamp-2 italic">
              {song.description}
            </p>
          )}
        </div>

        {/* Action Row: Like, Comment, Share */}
        <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
          {/* Like Button */}
          <button
            onClick={() => onLike(song.id)}
            className="flex items-center gap-1 hover:text-rose-400 transition-colors py-1 px-1.5 rounded hover:bg-slate-700/50"
            title="Like"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20 hover:fill-rose-400" />
            <span className="font-semibold">{song.likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onOpenComments(song)}
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors py-1 px-1.5 rounded hover:bg-slate-700/50"
            title="Comments"
          >
            <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{commentCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => onOpenShare(song)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-semibold border border-amber-500/30 transition"
            title="Share with 1:1 Poster"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'or' ? 'ଶେୟାର' : 'Share'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
