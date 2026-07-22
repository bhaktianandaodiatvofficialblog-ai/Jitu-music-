import React, { useState, useEffect } from 'react';
import { 
  getSongs, 
  saveSongs, 
  addSong, 
  deleteSong, 
  incrementViewCount, 
  incrementLikeCount, 
  incrementShareCount,
  getAds, 
  addAd, 
  deleteAd, 
  incrementAdClick, 
  getComments, 
  addComment, 
  checkAdminAuth,
  syncServerData
} from './services/storage';
import { Song, Advertisement, SongComment } from './types/music';
import { Navbar } from './components/Navbar';
import { SongCard } from './components/SongCard';
import { MusicPlayer } from './components/MusicPlayer';
import { AdBanner } from './components/AdBanner';
import { ShareModal } from './components/ShareModal';
import { CommentModal } from './components/CommentModal';
import { AdminPanel } from './components/AdminPanel';
import { Sparkles, Music, Megaphone, Flame, Radio, Heart, Share2, MessageCircle } from 'lucide-react';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [comments, setComments] = useState<SongComment[]>([]);
  
  // Audio Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ସବୁ (All)');
  const [language, setLanguage] = useState<'or' | 'en'>('or');

  // Modals & Active Selections
  const [shareSong, setShareSong] = useState<Song | null>(null);
  const [commentSong, setCommentSong] = useState<Song | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Categories List
  const categories = language === 'or'
    ? ['ସବୁ (All)', 'Odia Modern', 'Bhajan', 'Sambalpuri', 'Jatra', 'Romantic']
    : ['All', 'Odia Modern', 'Bhajan', 'Sambalpuri', 'Jatra', 'Romantic'];

  // Load initial data and subscribe to storage updates across tabs & polling server
  const refreshData = () => {
    const updatedSongs = getSongs();
    const updatedAds = getAds();
    const updatedComments = getComments();

    setSongs(updatedSongs);
    setAds(updatedAds);
    setComments(updatedComments);
    setIsAdminLoggedIn(checkAdminAuth());

    // If current playing song was deleted by admin, clear player
    setCurrentSong((prev) => {
      if (prev && !updatedSongs.some((s) => s.id === prev.id)) {
        setIsPlaying(false);
        return null;
      }
      return prev;
    });

    // If share/comment modal is active for a deleted song, close it
    setShareSong((prev) => (prev && !updatedSongs.some((s) => s.id === prev.id) ? null : prev));
    setCommentSong((prev) => (prev && !updatedSongs.some((s) => s.id === prev.id) ? null : prev));
  };

  useEffect(() => {
    // Initial fetch from backend API
    syncServerData().then(refreshData);

    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_custom_change', handleStorageChange);

    // Auto poll server every 5s so all audience viewers see admin uploads/deletions live
    const pollInterval = setInterval(() => {
      syncServerData().then(refreshData);
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_custom_change', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Direct Social Share Deep Link Handler (`?song=songId`)
  useEffect(() => {
    if (songs.length > 0 && !currentSong) {
      const params = new URLSearchParams(window.location.search);
      const sharedSongId = params.get('song');
      if (sharedSongId) {
        const found = songs.find((s) => s.id === sharedSongId);
        if (found) {
          setCurrentSong(found);
          setIsPlaying(true);
        }
      }
    }
  }, [songs]);

  // Audio Control Handlers
  const handlePlaySelect = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleNextSong = () => {
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  // Interaction Handlers
  const handleLikeSong = async (songId: string) => {
    const updated = await incrementLikeCount(songId);
    if (updated) {
      setSongs(getSongs());
      if (currentSong?.id === songId) {
        setCurrentSong(updated);
      }
    }
  };

  const handleViewCounted = async (songId: string) => {
    const updated = await incrementViewCount(songId);
    if (updated) {
      setSongs(getSongs());
      if (currentSong?.id === songId) {
        setCurrentSong(updated);
      }
    }
  };

  const handleAddComment = async (songId: string, userName: string, text: string) => {
    await addComment(songId, userName, text);
    setComments(getComments());
  };

  const handleAddSong = async (newSong: Omit<Song, 'id' | 'viewsCount' | 'playCount' | 'likesCount' | 'sharesCount' | 'createdAt'>) => {
    const added = await addSong(newSong);
    await syncServerData();
    refreshData();
    // Clear search and category filters so the newly uploaded song shows up immediately
    setSearchTerm('');
    setSelectedCategory(language === 'or' ? 'ସବୁ (All)' : 'All');
    // Set as current playing song
    setCurrentSong(added);
    setIsPlaying(true);
  };

  const handleDeleteSong = async (songId: string) => {
    await deleteSong(songId);
    await syncServerData();
    refreshData();
    if (currentSong?.id === songId) {
      setCurrentSong(null);
      setIsPlaying(false);
    }
  };

  const handleAddAd = async (newAd: Omit<Advertisement, 'id' | 'clicksCount' | 'createdAt'>) => {
    await addAd(newAd);
    await syncServerData();
    refreshData();
  };

  const handleDeleteAd = async (adId: string) => {
    await deleteAd(adId);
    await syncServerData();
    refreshData();
  };

  const handleAdClick = (ad: Advertisement) => {
    incrementAdClick(ad.id);
    refreshData();
    window.open(ad.targetUrl, '_blank');
  };

  // Filter songs by search term & category
  const filteredSongs = songs.filter((song) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      song.title.toLowerCase().includes(term) ||
      song.artist.toLowerCase().includes(term) ||
      song.category.toLowerCase().includes(term) ||
      (song.description && song.description.toLowerCase().includes(term));

    const isAllCategory =
      !selectedCategory ||
      selectedCategory === 'ସବୁ (All)' ||
      selectedCategory === 'All' ||
      selectedCategory.toLowerCase().includes('all') ||
      selectedCategory.toLowerCase().includes('ସବୁ');

    const matchesCategory =
      isAllCategory ||
      song.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const activeAds = ads.filter((a) => a.active !== false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 pb-28">
      
      {/* Top Header Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-8">
        
        {/* Hero Announcement & Featured 1:1 Player Banner */}
        {currentSong && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-amber-500/30 p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              
              {/* 1:1 Featured Square Poster (Clickable) */}
              <div 
                onClick={() => handlePlaySelect(currentSong)}
                className="relative aspect-square w-40 sm:w-48 rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border border-amber-500/40 shrink-0"
              >
                <img
                  src={currentSong.posterUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg transform group-hover:scale-110 transition">
                    {isPlaying ? '⏸' : '▶'}
                  </div>
                </div>
              </div>

              {/* Info Column */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  <span>{language === 'or' ? 'ବର୍ତ୍ତମାନ ଚାଲୁଅଛି' : 'Now Playing Track'}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                  {currentSong.title}
                </h2>
                <p className="text-sm text-slate-300 font-medium">
                  {currentSong.artist} • <span className="text-amber-400">{currentSong.category}</span>
                </p>

                {/* View counts & stats badge */}
                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-300">
                  <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-cyan-300">
                    👁️ {currentSong.viewsCount.toLocaleString()} {language === 'or' ? 'Verified 3m Views' : 'Verified Views'}
                  </span>
                  <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-rose-300">
                    ❤️ {currentSong.likesCount} {language === 'or' ? 'ଲାଇକ୍' : 'Likes'}
                  </span>
                  <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-amber-300">
                    🔁 {currentSong.sharesCount} {language === 'or' ? 'ଶେୟାର' : 'Shares'}
                  </span>
                </div>

                {/* Direct Action buttons */}
                <div className="pt-3 flex items-center justify-center md:justify-start gap-3">
                  <button
                    onClick={() => setShareSong(currentSong)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition hover:scale-105"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{language === 'or' ? 'Facebook ରେ Share କରନ୍ତୁ' : 'Share to Facebook'}</span>
                  </button>

                  <button
                    onClick={() => setCommentSong(currentSong)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'or' ? 'ମନ୍ତବ୍ୟ ଦିଅନ୍ତୁ (Comment)' : 'View Comments'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {language === 'or' ? 'ଲୋକପ୍ରିୟ ଓଡ଼ିଆ ଗୀତ (Popular Songs)' : 'Popular Odia Songs'}
            </h2>
            <span className="text-xs text-slate-400 font-mono">({filteredSongs.length})</span>
          </div>
          <p className="text-xs text-amber-400/90 hidden sm:block italic">
            {language === 'or' ? '💡 ଗୀତ ଶୁଣିବା ପାଇଁ ୧:୧ ଫୋଟୋ ଉପରେ କ୍ଲିକ କରନ୍ତୁ' : '💡 Click any 1:1 photo to play music'}
          </p>
        </div>

        {/* Music Catalog & 1:1 Ads Grid */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800/80">
            <Music className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-300">
              {language === 'or' ? 'କୌଣସି ଗୀତ ମିଳିଲା ନାହିଁ' : 'No songs found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'or' ? 'ଅନ୍ୟ ବର୍ଗ କିମ୍ବା ଗୀତର ନାମ ଖୋଜନ୍ତୁ' : 'Try searching another song or category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredSongs.map((song, index) => {
              const songCard = (
                <SongCard
                  key={song.id}
                  song={song}
                  isPlaying={isPlaying}
                  isCurrentSong={currentSong?.id === song.id}
                  onPlaySelect={handlePlaySelect}
                  onOpenShare={(s) => setShareSong(s)}
                  onOpenComments={(s) => setCommentSong(s)}
                  onLike={handleLikeSong}
                  onDeleteSong={isAdminLoggedIn ? handleDeleteSong : undefined}
                  isAdminLoggedIn={isAdminLoggedIn}
                  commentCount={getComments(song.id).length}
                  language={language}
                />
              );

              // Interleave 1:1 advertisement banner every 4th song if active ads exist
              if ((index + 1) % 4 === 0 && activeAds.length > 0) {
                const adIndex = Math.floor(index / 4) % activeAds.length;
                const ad = activeAds[adIndex];
                return (
                  <React.Fragment key={`group-${song.id}`}>
                    {songCard}
                    <AdBanner
                      key={`ad-${ad.id}-${index}`}
                      ad={ad}
                      onAdClick={handleAdClick}
                      onDeleteAd={isAdminLoggedIn ? handleDeleteAd : undefined}
                      isAdminLoggedIn={isAdminLoggedIn}
                      language={language}
                    />
                  </React.Fragment>
                );
              }

              return songCard;
            })}
          </div>
        )}

        {/* Featured Advertisements Banner Section */}
        {activeAds.length > 0 && (
          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-200">
                {language === 'or' ? '୧:୧ ବିଜ୍ଞାପନ ପୋଷ୍ଟର (Featured Advertisements)' : 'Featured 1:1 Advertisements'}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {activeAds.map((ad) => (
                <AdBanner
                  key={ad.id}
                  ad={ad}
                  onAdClick={handleAdClick}
                  onDeleteAd={isAdminLoggedIn ? handleDeleteAd : undefined}
                  isAdminLoggedIn={isAdminLoggedIn}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Music Player */}
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPauseToggle={() => setIsPlaying(!isPlaying)}
        onNextSong={handleNextSong}
        onPrevSong={handlePrevSong}
        onViewCounted={handleViewCounted}
        language={language}
      />

      {/* Share Sheet Modal */}
      <ShareModal
        song={shareSong}
        onClose={() => setShareSong(null)}
        language={language}
      />

      {/* Comment Sheet Modal */}
      <CommentModal
        song={commentSong}
        comments={comments}
        onAddComment={handleAddComment}
        onClose={() => setCommentSong(null)}
        language={language}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        isAdminLoggedIn={isAdminLoggedIn}
        setIsAdminLoggedIn={setIsAdminLoggedIn}
        songs={songs}
        ads={ads}
        onAddSong={handleAddSong}
        onDeleteSong={handleDeleteSong}
        onAddAd={handleAddAd}
        onDeleteAd={handleDeleteAd}
        language={language}
      />

    </div>
  );
}
