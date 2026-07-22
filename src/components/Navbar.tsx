import React from 'react';
import { Music, ShieldCheck, Search, Sparkles, Globe } from 'lucide-react';
import { InstallAppButton } from './InstallAppButton';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  language: 'or' | 'en';
  setLanguage: (lang: 'or' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  onOpenAdmin,
  isAdminLoggedIn,
  language,
  setLanguage,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Music className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent leading-tight">
                {language === 'or' ? 'ଓଡ଼ିଆ ମ୍ୟୁଜିକ୍ ପୋର୍ଟାଲ୍' : 'Odia Music Portal'}
              </h1>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'or' ? 'ଗୀତ, ଗାୟକ କିମ୍ବା ବର୍ଗ ଖୋଜନ୍ତୁ...' : 'Search song, artist or category...'}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install / Download App Button */}
            <InstallAppButton language={language} />

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'or' ? 'en' : 'or')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'or' ? 'ଓଡ଼ିଆ' : 'English'}</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition shadow-sm ${
                isAdminLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30'
                  : 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isAdminLoggedIn
                  ? (language === 'or' ? 'ଅଡମିନ୍ (Active)' : 'Admin Active')
                  : (language === 'or' ? 'ଅଡମିନ୍ ପ୍ୟାନେଲ୍' : 'Admin Login')}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'or' ? 'ଗୀତ କିମ୍ବା ଗାୟକ ଖୋଜନ୍ତୁ...' : 'Search song or artist...'}
              className="w-full bg-slate-800 border border-slate-700 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs font-medium ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
