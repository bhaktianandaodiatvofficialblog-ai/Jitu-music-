import React from 'react';
import { ExternalLink, Megaphone, Trash2 } from 'lucide-react';
import { Advertisement } from '../types/music';

interface AdBannerProps {
  ad: Advertisement;
  onAdClick: (ad: Advertisement) => void;
  onDeleteAd?: (adId: string) => void;
  isAdminLoggedIn: boolean;
  language: 'or' | 'en';
}

export const AdBanner: React.FC<AdBannerProps> = ({
  ad,
  onAdClick,
  onDeleteAd,
  isAdminLoggedIn,
  language,
}) => {
  return (
    <div className="relative group bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-amber-500/30 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/15 flex flex-col">
      
      {/* 1:1 Aspect Ratio Ad Poster */}
      <div 
        onClick={() => onAdClick(ad)}
        className="relative aspect-square w-full bg-slate-900 cursor-pointer overflow-hidden"
      >
        <img
          src={ad.posterUrl}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&h=600&q=80';
          }}
        />

        {/* Ad Badge */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md">
          <Megaphone className="w-3.5 h-3.5 fill-slate-950" />
          <span>{language === 'or' ? 'ବିଜ୍ଞାପନ (Ad)' : 'Sponsored 1:1 Ad'}</span>
        </div>

        {/* External Link Hover Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-full text-xs flex items-center gap-2 shadow-xl transform group-hover:scale-105 transition">
            <span>{language === 'or' ? 'ୱେବସାଇଟ୍ ଦେଖନ୍ତୁ' : 'Visit Website'}</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>

        {/* Admin Delete Ad button */}
        {isAdminLoggedIn && onDeleteAd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(language === 'or' ? 'ଆପଣ ଏହି ବିଜ୍ଞାପନଟିକୁ କାଢିବାକୁ (Delete) ଚାହୁଁଛନ୍ତି କି?' : 'Delete this ad banner?')) {
                onDeleteAd(ad.id);
              }
            }}
            className="absolute bottom-2.5 right-2.5 p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition"
            title="Delete Ad"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Ad Sponsor & Title Info */}
      <div className="p-3 flex items-center justify-between text-xs bg-slate-900/60">
        <div className="min-w-0 flex-1 pr-2">
          <h4 className="font-bold text-slate-200 truncate group-hover:text-amber-300">
            {ad.title}
          </h4>
          <p className="text-[10px] text-slate-400 truncate">
            {ad.sponsorName}
          </p>
        </div>
        <button
          onClick={() => onAdClick(ad)}
          className="shrink-0 p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
