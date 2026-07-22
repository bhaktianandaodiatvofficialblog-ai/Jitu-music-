import React, { useState } from 'react';
import { X, ShieldCheck, Upload, Music, Image as ImageIcon, Trash2, Key, Download, RefreshCw, FileText, CheckCircle2, Megaphone, PlusCircle, AlertCircle } from 'lucide-react';
import { Song, Advertisement } from '../types/music';
import { ADMIN_PIN, setAdminAuth, exportDatabaseJSON, importDatabaseJSON, resetToDefaults } from '../services/storage';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (auth: boolean) => void;
  songs: Song[];
  ads: Advertisement[];
  onAddSong: (song: Omit<Song, 'id' | 'viewsCount' | 'playCount' | 'likesCount' | 'sharesCount' | 'createdAt'>) => void;
  onDeleteSong: (songId: string) => void;
  onAddAd: (ad: Omit<Advertisement, 'id' | 'clicksCount' | 'createdAt'>) => void;
  onDeleteAd: (adId: string) => void;
  language: 'or' | 'en';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  songs,
  ads,
  onAddSong,
  onDeleteSong,
  onAddAd,
  onDeleteAd,
  language,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload_song' | 'upload_ad' | 'manage_songs' | 'manage_ads' | 'backup'>('upload_song');

  // Song Upload Form State
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songCategory, setSongCategory] = useState('Odia Modern');
  const [songDescription, setSongDescription] = useState('');
  const [songPosterUrl, setSongPosterUrl] = useState('');
  const [songAudioUrl, setSongAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [songSuccessMsg, setSongSuccessMsg] = useState('');

  // Ad Upload Form State
  const [adTitle, setAdTitle] = useState('');
  const [adSponsor, setAdSponsor] = useState('');
  const [adPosterUrl, setAdPosterUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [adSuccessMsg, setAdSuccessMsg] = useState('');

  // Delete Confirmation States (Inline, no browser confirm popups)
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Admin Auth Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsAdminLoggedIn(true);
      setAdminAuth(true);
      setLoginError('');
      setPinInput('');
    } else {
      setLoginError(language === 'or' ? 'ଭୁଲ ID/PIN! ଦୟାକରି ୫୪୩୨୧୩@ ଦିଅନ୍ତୁ' : 'Invalid Admin ID/PIN. Try 543213@');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminAuth(false);
  };

  // Process 1:1 Poster Image File Upload to DataURL (Compressed to 500x500 JPEG)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rawUrl = reader.result as string;
      if (!rawUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 500;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setUrl(compressedDataUrl);
        } else {
          setUrl(rawUrl);
        }
      };
      img.onerror = () => setUrl(rawUrl);
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  // Process Audio File Upload
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    setIsAudioUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSongAudioUrl(reader.result);
      }
      setIsAudioUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading audio file.');
      setIsAudioUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle Song Submit
  const handleSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !songPosterUrl || !songAudioUrl) {
      alert(language === 'or' ? 'ଦୟାକରି Title, 1:1 Poster, ଏବଂ Audio File upload କରନ୍ତୁ।' : 'Please provide Title, 1:1 Poster Image, and Audio File!');
      return;
    }

    onAddSong({
      title: songTitle.trim(),
      artist: songArtist.trim() || 'Unknown Artist',
      posterUrl: songPosterUrl,
      audioUrl: songAudioUrl,
      category: songCategory,
      description: songDescription.trim(),
    });

    setSongSuccessMsg(language === 'or' ? '🎉 ଗୀତ ସଫଳତାର ସହ Upload ହେଲା! ନୂଆ ଦର୍ଶକଙ୍କୁ ଦେଖାଯିବ।' : '🎉 Song uploaded successfully! Live for all visitors.');
    setSongTitle('');
    setSongArtist('');
    setSongPosterUrl('');
    setSongAudioUrl('');
    setSongDescription('');
    setTimeout(() => setSongSuccessMsg(''), 4000);
  };

  // Handle Ad Submit
  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adPosterUrl || !adTargetUrl) {
      alert(language === 'or' ? 'ଦୟାକରି Ad Title, 1:1 Poster, ଏବଂ Target Website URL ଦିଅନ୍ତୁ।' : 'Please provide Ad Title, 1:1 Poster Image, and Target URL!');
      return;
    }

    onAddAd({
      title: adTitle.trim(),
      sponsorName: adSponsor.trim() || 'Sponsor',
      posterUrl: adPosterUrl,
      targetUrl: adTargetUrl.startsWith('http') ? adTargetUrl : `https://${adTargetUrl}`,
      active: true,
    });

    setAdSuccessMsg(language === 'or' ? '🎉 ୧:୧ ବିଜ୍ଞାପନ ପୋଷ୍ଟର Upload ହେଲା!' : '🎉 1:1 Advertisement Poster Uploaded!');
    setAdTitle('');
    setAdSponsor('');
    setAdPosterUrl('');
    setAdTargetUrl('');
    setTimeout(() => setAdSuccessMsg(''), 4000);
  };

  // Handle JSON Import File
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const ok = importDatabaseJSON(reader.result);
          if (ok) {
            alert(language === 'or' ? 'ଡାଟାବେସ ସଫଳତାର ସହ Import ହେଲା!' : 'Database imported successfully!');
            window.location.reload();
          } else {
            alert('Import error: Invalid JSON file');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odia_music_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Admin Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>{language === 'or' ? 'ଅଡମିନ୍ କଣ୍ଟ୍ରୋଲ୍ ପ୍ୟାନେଲ୍' : 'Admin Control Panel'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  ID: 543213@
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'or' ? 'ଗୀତ Upload, ୧:୧ Ad Poster, Delete ଏବଂ Control କରନ୍ତୁ' : 'Upload 1:1 photos, audio songs, ad posters & manage content'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {language === 'or' ? 'ଲଗ୍ ଆଉଟ୍' : 'Logout'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOGIN FORM IF NOT AUTHENTICATED */}
        {!isAdminLoggedIn ? (
          <div className="p-8 flex flex-col items-center justify-center max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 shadow-xl">
              <Key className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold mb-1">
              {language === 'or' ? 'ଅଡମିନ୍ ଲଗଇନ୍ କରନ୍ତୁ' : 'Admin Login Required'}
            </h4>
            <p className="text-xs text-slate-400 mb-6">
              {language === 'or' ? 'ଆପଣଙ୍କ Admin ID / Password ଦିଅନ୍ତୁ: 543213@' : 'Enter Admin ID / Password: 543213@'}
            </p>

            <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="543213@"
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-center text-lg tracking-widest text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-sm shadow-xl transition"
              >
                {language === 'or' ? 'ଲଗଇନ୍ କରନ୍ତୁ (Login)' : 'Unlock Admin Panel'}
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Tabs Navigation Bar */}
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-950/80 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs">
              <button
                onClick={() => setActiveTab('upload_song')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  activeTab === 'upload_song'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>{language === 'or' ? 'ଗୀତ Upload' : 'Upload Song'}</span>
              </button>

              <button
                onClick={() => setActiveTab('upload_ad')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  activeTab === 'upload_ad'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>{language === 'or' ? '୧:୧ Ad Poster Upload' : 'Upload 1:1 Ad'}</span>
              </button>

              <button
                onClick={() => setActiveTab('manage_songs')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  activeTab === 'manage_songs'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'or' ? `ଗୀତ Manage (${songs.length})` : `Manage Songs (${songs.length})`}</span>
              </button>

              <button
                onClick={() => setActiveTab('manage_ads')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  activeTab === 'manage_ads'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>{language === 'or' ? `Ad Poster (${ads.length})` : `Manage Ads (${ads.length})`}</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  activeTab === 'backup'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{language === 'or' ? 'Backup & Vercel' : 'Backup & Vercel'}</span>
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* TAB 1: UPLOAD SONG */}
              {activeTab === 'upload_song' && (
                <form onSubmit={handleSongSubmit} className="space-y-4 max-w-xl mx-auto">
                  {songSuccessMsg && (
                    <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{songSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {language === 'or' ? 'ଗୀତର ନାମ (Song Title) *' : 'Song Title *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="e.g. ମନର ମଣିଷ"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {language === 'or' ? 'ଗାୟକ / ଗାୟିକା (Artist)' : 'Artist Name'}
                      </label>
                      <input
                        type="text"
                        value={songArtist}
                        onChange={(e) => setSongArtist(e.target.value)}
                        placeholder="e.g. Human Sagar"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {language === 'or' ? 'ଗୀତର ବର୍ଗ (Category)' : 'Song Category'}
                    </label>
                    <select
                      value={songCategory}
                      onChange={(e) => setSongCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Odia Modern">Odia Modern (ଆଧୁନିକ)</option>
                      <option value="Bhajan">Bhajan (ଭଜନ)</option>
                      <option value="Sambalpuri">Sambalpuri (ସମ୍ବଲପୁରୀ)</option>
                      <option value="Jatra">Jatra (ଜାତ୍ରା)</option>
                      <option value="Romantic">Romantic (ରୋମାଣ୍ଟିକ)</option>
                    </select>
                  </div>

                  {/* 1:1 Aspect Ratio Cover Photo Upload */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>{language === 'or' ? '୧:୧ ସାଇଜ Photo Upload (Square Poster Photo) *' : '1:1 Square Cover Photo *'}</span>
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, setSongPosterUrl)}
                        className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
                      />
                      <span className="text-xs text-slate-500">OR</span>
                      <input
                        type="url"
                        value={songPosterUrl}
                        onChange={(e) => setSongPosterUrl(e.target.value)}
                        placeholder="Image URL https://..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    {songPosterUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={songPosterUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover aspect-square border border-amber-500/50" />
                        <span className="text-[11px] text-emerald-400 font-semibold">✓ 1:1 Photo Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Song Audio File Upload */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Upload className="w-4 h-4" />
                      <span>{language === 'or' ? 'ଗୀତ Audio File Upload (MP3 / Audio) *' : 'Song Audio File (MP3) *'}</span>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileUpload}
                        className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
                      />
                      <span className="text-xs text-slate-500">OR</span>
                      <input
                        type="url"
                        value={songAudioUrl}
                        onChange={(e) => setSongAudioUrl(e.target.value)}
                        placeholder="Audio Stream URL https://..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    {songAudioUrl && (
                      <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                        ✓ Audio Track Attached
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {language === 'or' ? 'ବିବରଣୀ (Description)' : 'Song Description'}
                    </label>
                    <textarea
                      rows={2}
                      value={songDescription}
                      onChange={(e) => setSongDescription(e.target.value)}
                      placeholder="e.g. ନୂଆ ସୁପରହିଟ୍ ଓଡ଼ିଆ ଗୀତ"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{language === 'or' ? 'ଗୀତ Upload କରନ୍ତୁ' : 'Publish Song Live'}</span>
                  </button>
                </form>
              )}

              {/* TAB 2: UPLOAD 1:1 ADVERTISEMENT POSTER */}
              {activeTab === 'upload_ad' && (
                <form onSubmit={handleAdSubmit} className="space-y-4 max-w-xl mx-auto">
                  {adSuccessMsg && (
                    <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{adSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {language === 'or' ? 'ବିଜ୍ଞାପନର ନାମ (Ad Title) *' : 'Ad Title *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="e.g. Sambalpuri Sarees 50% Off"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {language === 'or' ? 'ପ୍ରୟୋଜକ / Sponsor Name' : 'Sponsor / Company'}
                      </label>
                      <input
                        type="text"
                        value={adSponsor}
                        onChange={(e) => setAdSponsor(e.target.value)}
                        placeholder="e.g. Odia Crafts"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 1:1 Poster Image for Advertisement */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>{language === 'or' ? 'Advertisement Poster Upload 1:1 *' : '1:1 Advertisement Square Poster *'}</span>
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, setAdPosterUrl)}
                        className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
                      />
                      <span className="text-xs text-slate-500">OR</span>
                      <input
                        type="url"
                        value={adPosterUrl}
                        onChange={(e) => setAdPosterUrl(e.target.value)}
                        placeholder="Ad Poster Image URL"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    {adPosterUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={adPosterUrl} alt="Ad Preview" className="w-16 h-16 rounded-xl object-cover aspect-square border border-amber-500/50" />
                        <span className="text-[11px] text-emerald-400 font-semibold">✓ 1:1 Ad Poster Attached</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {language === 'or' ? 'Target Website Link (ଦର୍ଶକ କ୍ଲିକ କଲେ ଏହି Website ଖୋଲିବ) *' : 'Target Website Link (Opened on click) *'}
                    </label>
                    <input
                      type="url"
                      required
                      value={adTargetUrl}
                      onChange={(e) => setAdTargetUrl(e.target.value)}
                      placeholder="https://bhaktianandaodiatv.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>{language === 'or' ? '1:1 Ad Poster Publish କରନ୍ତୁ' : 'Publish 1:1 Ad Banner'}</span>
                  </button>
                </form>
              )}

              {/* TAB 3: MANAGE SONGS */}
              {activeTab === 'manage_songs' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 mb-3">
                    {language === 'or'
                      ? 'ଆପଣ ଯେଉଁ ଗୀତ କାଢିଦେବେ (Delete), ତାହା ଦର୍ଶକଙ୍କୁ ଆଉ ଦେଖାଯିବ ନାହିଁ।'
                      : 'Deleting a song immediately removes it for all audience visitors.'}
                  </p>

                  {songs.length === 0 ? (
                    <p className="text-center py-8 text-slate-500 text-xs">No songs in database.</p>
                  ) : (
                    songs.map((song) => (
                      <div key={song.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 gap-3">
                        <img src={song.posterUrl} alt={song.title} className="w-12 h-12 rounded-xl object-cover aspect-square border border-slate-700 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-slate-200 truncate">{song.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{song.artist} • {song.category}</p>
                          <div className="flex items-center gap-3 text-[10px] text-amber-400/90 mt-1">
                            <span>👁️ {song.viewsCount} views (3m)</span>
                            <span>❤️ {song.likesCount}</span>
                            <span>🔁 {song.sharesCount} shares</span>
                          </div>
                        </div>

                        {deletingSongId === song.id ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                onDeleteSong(song.id);
                                setDeletingSongId(null);
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg hover:bg-rose-500 animate-pulse border border-rose-400"
                            >
                              {language === 'or' ? 'ହଁ, Delete' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeletingSongId(null)}
                              className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                            >
                              {language === 'or' ? 'ବାତିଲ' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingSongId(song.id)}
                            className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition shrink-0 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: MANAGE ADS */}
              {activeTab === 'manage_ads' && (
                <div className="space-y-3">
                  {ads.length === 0 ? (
                    <p className="text-center py-8 text-slate-500 text-xs">No advertisements uploaded.</p>
                  ) : (
                    ads.map((ad) => (
                      <div key={ad.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 gap-3">
                        <img src={ad.posterUrl} alt={ad.title} className="w-12 h-12 rounded-xl object-cover aspect-square border border-amber-500/40 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-slate-200 truncate">{ad.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate">Sponsor: {ad.sponsorName} • Clicks: {ad.clicksCount}</p>
                          <p className="text-[10px] text-amber-400 truncate font-mono mt-0.5">{ad.targetUrl}</p>
                        </div>

                        {deletingAdId === ad.id ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                onDeleteAd(ad.id);
                                setDeletingAdId(null);
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg hover:bg-rose-500 animate-pulse border border-rose-400"
                            >
                              {language === 'or' ? 'ହଁ, Delete' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setDeletingAdId(null)}
                              className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                            >
                              {language === 'or' ? 'ବାତିଲ' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingAdId(ad.id)}
                            className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition shrink-0 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: BACKUP & VERCEL IMPORT/EXPORT */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>{language === 'or' ? 'ଡାଟାବେସ Backup ଡାଉନଲୋଡ କରନ୍ତୁ (Export JSON)' : 'Export Database (JSON)'}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {language === 'or'
                        ? 'ସମସ୍ତ ଗୀତ, ୧:୧ Poster ଏବଂ Ads କୁ Vercel କିମ୍ବା ଅନ୍ୟ Domain କୁ ନେବା ପାଇଁ JSON File save କରନ୍ତୁ।'
                        : 'Download a full backup JSON file of all uploaded songs and ads for easy migration or Vercel deployment.'}
                    </p>
                    <button
                      onClick={handleDownloadBackup}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download JSON Backup File</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>{language === 'or' ? 'JSON Backup Restore / Import କରନ୍ତୁ' : 'Import Database (JSON)'}</span>
                    </h4>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJsonFile}
                      className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                    />
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>{language === 'or' ? 'Default Sample Content Restore' : 'Restore Default Content'}</span>
                    </h4>
                    <button
                      onClick={() => {
                        if (confirm('Reset database to default sample Odia songs?')) {
                          resetToDefaults();
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition"
                    >
                      Restore Defaults
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
