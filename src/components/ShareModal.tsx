import React, { useState } from 'react';
import { X, Copy, Check, Facebook, MessageSquare, ExternalLink, Share2, Sparkles } from 'lucide-react';
import { Song } from '../types/music';

interface ShareModalProps {
  song: Song | null;
  onClose: () => void;
  language: 'or' | 'en';
}

export const ShareModal: React.FC<ShareModalProps> = ({ song, onClose, language }) => {
  const [copied, setCopied] = useState(false);

  if (!song) return null;

  // Construct absolute target share URL with song parameter for Facebook & social media clickers
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?song=${song.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleFacebookShare = () => {
    // Facebook sharer URL
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=500');
  };

  const handleWhatsAppShare = () => {
    const text = language === 'or'
      ? `🎶 *${song.title}* (${song.artist})\n\nଏହି ଓଡ଼ିଆ ଗୀତ ଏବଂ ୧:୧ ଫୋଟୋ ପୋଷ୍ଟର ଦେଖିବା ଓ ଶୁଣିବା ପାଇଁ ଏଠାରେ କ୍ଲିକ କରନ୍ତୁ👇\n${shareUrl}`
      : `🎶 Listen to *${song.title}* by ${song.artist}\n\nClick link to stream on Odia Music Portal 👇\n${shareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {language === 'or' ? 'ଗୀତ ଶେୟାର କରନ୍ତୁ' : 'Share Song & 1:1 Poster'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'or' ? 'Facebook ରେ ଶେୟାର କଲେ ଫୋଟୋ ସହିତ Open ହେବ' : 'Facebook card includes 1:1 poster preview'}
            </p>
          </div>
        </div>

        {/* 1:1 Social Card Live Preview Box */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 mb-5">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'or' ? 'Facebook / Social Preview' : 'Facebook / Social Card Preview'}</span>
          </p>
          <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            {/* 1:1 Square Thumbnail */}
            <img
              src={song.posterUrl}
              alt={song.title}
              className="w-16 h-16 rounded-lg object-cover aspect-square border border-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-100 truncate">{song.title}</h4>
              <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
              <p className="text-[10px] text-amber-400/90 mt-1 font-mono truncate">
                {shareUrl}
              </p>
            </div>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-3">
          
          {/* Facebook Share Button */}
          <button
            onClick={handleFacebookShare}
            className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-lg shadow-blue-600/20"
          >
            <Facebook className="w-5 h-5 fill-white" />
            <span>{language === 'or' ? 'Facebook ରେ Share କରନ୍ତୁ' : 'Share to Facebook'}</span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-lg shadow-emerald-600/20"
          >
            <MessageSquare className="w-5 h-5 fill-white" />
            <span>{language === 'or' ? 'WhatsApp ରେ Share କରନ୍ତୁ' : 'Share to WhatsApp'}</span>
          </button>

          {/* Copy Direct Link Button */}
          <div className="pt-2">
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              {language === 'or' ? 'ସିଧାସଳଖ ଲିଙ୍କ କପି କରନ୍ତୁ:' : 'Direct Song Link:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'or' ? 'କପି ହେଲା' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{language === 'or' ? 'କପି' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
