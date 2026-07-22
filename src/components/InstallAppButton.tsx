import React, { useEffect, useState } from 'react';
import { Download, Smartphone, Check, X } from 'lucide-react';

interface InstallAppButtonProps {
  language: 'or' | 'en';
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({ language }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-md border border-purple-400/40 transition active:scale-95 shrink-0"
        title={language === 'or' ? 'ଆପ୍ ମୋବାଇଲ୍ ରେ ଇନଷ୍ଟଲ୍ / ଡାଉନଲୋଡ୍ କରନ୍ତୁ' : 'Download / Install App'}
      >
        <Download className="w-3.5 h-3.5 animate-bounce text-amber-300" />
        <span className="hidden sm:inline">
          {language === 'or' ? 'ଆପ୍ ଡାଉନଲୋଡ୍' : 'Install App'}
        </span>
        <span className="sm:hidden">
          {language === 'or' ? 'App' : 'Install'}
        </span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-300">
                  {language === 'or' ? 'ଆପ୍ ମୋବାଇଲ୍ ରେ ଇନଷ୍ଟଲ କରନ୍ତୁ' : 'Install App on Mobile'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'or' ? 'Vercel ଲିଙ୍କ୍ ରୁ ଗୋଟିଏ କ୍ଲିକ୍ ରେ App' : 'Add to Home Screen directly'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 mb-4">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <p>
                  {language === 'or'
                    ? 'Chrome Browser ରେ ଉପରେ ଥିବା Triple Dot (⋮) ରେ କ୍ଲିକ୍ କରନ୍ତୁ।'
                    : 'Tap the Menu button (⋮ or Share) in Chrome/Safari.'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <p>
                  {language === 'or'
                    ? '"Add to Home Screen" କିମ୍ବା "Install app" ବିକଳ୍ପ ବାଛନ୍ତୁ।'
                    : 'Select "Add to Home Screen" or "Install App".'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <p>
                  {language === 'or'
                    ? 'ଏହା ଆପଣଙ୍କ ମୋବାଇଲ୍ ହୋମ୍ ସ୍କ୍ରିନ୍ ରେ App ଆକାରରେ ସେଭ୍ ହୋଇଯିବ।'
                    : 'The app icon will instantly appear on your home screen!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 shadow-md"
            >
              {language === 'or' ? 'ଠିକ୍ ଅଛି (Got it)' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
