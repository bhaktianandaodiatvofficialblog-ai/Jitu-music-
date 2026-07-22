import { Song, Advertisement, SongComment } from '../types/music';
import { saveAudioTrack, deleteAudioTrack, getAudioTrack } from './audioStorage';

const SONGS_KEY = 'odia_music_app_songs_v2';
const ADS_KEY = 'odia_music_app_ads_v2';
const COMMENTS_KEY = 'odia_music_app_comments_v2';
const ADMIN_SESSION_KEY = 'odia_music_app_admin_auth';
const DELETED_SONGS_KEY = 'odia_music_app_deleted_songs_v2';
const DELETED_ADS_KEY = 'odia_music_app_deleted_ads_v2';

// Default backup initial songs
const INITIAL_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'ମନର ମଣିଷ (Manara Manisa - Romantic Melody)',
    artist: 'Human Sagar & Asima Panda',
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&h=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=sweet-ambient-acoustic-112347.mp3',
    category: 'Odia Modern',
    description: 'ସୁନ୍ଦର ଓଡ଼ିଆ ରୋମାଣ୍ଟିକ ସଙ୍ଗୀତ, ଶୁଣନ୍ତୁ ଏବଂ ଶେୟାର କରନ୍ତୁ।',
    viewsCount: 1420,
    playCount: 3890,
    likesCount: 520,
    sharesCount: 180,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'song-2',
    title: 'ଜଗନ୍ନାଥ ହେ କୃପାମୟ (Jagannath He Krupamaya)',
    artist: 'Namita Agrawal',
    posterUrl: 'https://images.unsplash.com/photo-1609102026400-3d0822648fb1?auto=format&fit=crop&w=600&h=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73562.mp3?filename=flute-meditation-10118.mp3',
    category: 'Bhajan',
    description: 'ଶ୍ରୀ ଜଗନ୍ନାଥଙ୍କ ଭକ୍ତିରସାମୃତ ଭଜନ, ଶ୍ରବଣ କରି ଆନନ୍ଦିତ ହୁଅନ୍ତୁ।',
    viewsCount: 2890,
    playCount: 6540,
    likesCount: 1120,
    sharesCount: 430,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'song-3',
    title: 'ସମ୍ବଲପୁରୀ ରସରକେଲି (Sambalpuri Rasarkeli Folk)',
    artist: 'Mantu Chhuria & Rehan',
    posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&h=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=folk-acoustic-guitar-13835.mp3',
    category: 'Sambalpuri',
    description: 'ମନଛୁଆଁ ସମ୍ବଲପୁରୀ ଲୋକଗୀତ ଏବଂ ତାଳ।',
    viewsCount: 1980,
    playCount: 4210,
    likesCount: 840,
    sharesCount: 290,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'song-4',
    title: 'ଜାତ୍ରା ଧମାକା Title Song (Jatra Superhit Melody)',
    artist: 'Satyajit & Diptirekha',
    posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=600&q=80',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_99392b6a95.mp3?filename=upbeat-energetic-pop-124388.mp3',
    category: 'Jatra',
    description: 'ସୁପରହିଟ୍ ଜାତ୍ରା ଗୀତ, ସମ୍ପୂର୍ଣ୍ଣ HD ସାଉଣ୍ଡ ସହିତ।',
    viewsCount: 950,
    playCount: 2100,
    likesCount: 310,
    sharesCount: 115,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad-1',
    title: 'Odia Cultural Event 2026 - Book Tickets Now',
    posterUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&h=600&q=80',
    targetUrl: 'https://bhaktianandaodiatv.com',
    sponsorName: 'Odia Cultural Samiti',
    active: true,
    clicksCount: 342,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ad-2',
    title: 'Best Odia Handloom & Saree Collection 50% Off',
    posterUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&h=600&q=80',
    targetUrl: 'https://bhaktianandaodiatv.com/store',
    sponsorName: 'Sambalpuri Crafts & Sarees',
    active: true,
    clicksCount: 512,
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_COMMENTS: SongComment[] = [
  {
    id: 'comm-1',
    songId: 'song-1',
    userName: 'ମାନସ କୁମାର (Manas)',
    text: 'ଖୁବ ସୁନ୍ଦର ଗୀତଟିଏ! ବହୁତ ବଢ଼ିଆ ହୋଇଛି।',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    likes: 12,
  },
  {
    id: 'comm-2',
    songId: 'song-2',
    userName: 'ସୁଚିତ୍ରା ମହାପାତ୍ର (Suchitra)',
    text: 'ଜୟ ଜଗନ୍ନାଥ! ଭଜନ ଶୁଣି ମନ ଶାନ୍ତି ହୋଇଗଲା।',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: 25,
  }
];

// Helper to notify other components/tabs
export function triggerStorageEvent() {
  window.dispatchEvent(new Event('storage_custom_change'));
}

// Deleted items helpers
function getDeletedSongIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SONGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDeletedSongId(id: string) {
  const current = getDeletedSongIds();
  if (!current.includes(id)) {
    localStorage.setItem(DELETED_SONGS_KEY, JSON.stringify([...current, id]));
  }
}

function getDeletedAdIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_ADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDeletedAdId(id: string) {
  const current = getDeletedAdIds();
  if (!current.includes(id)) {
    localStorage.setItem(DELETED_ADS_KEY, JSON.stringify([...current, id]));
  }
}

// Global server fetch function to ensure all audience viewers see uploaded/deleted items
export async function syncServerData(): Promise<void> {
  try {
    const [resSongs, resAds, resComments, resDeleted] = await Promise.all([
      fetch('/api/songs').catch(() => null),
      fetch('/api/ads').catch(() => null),
      fetch('/api/comments').catch(() => null),
      fetch('/api/deleted').catch(() => null)
    ]);

    // 1. Sync server-side deletion records first so viewer client knows what was deleted
    if (resDeleted && resDeleted.ok && resDeleted.headers.get('content-type')?.includes('application/json')) {
      const serverDeleted = await resDeleted.json();
      if (Array.isArray(serverDeleted.deletedSongIds)) {
        serverDeleted.deletedSongIds.forEach((id: string) => addDeletedSongId(id));
      }
      if (Array.isArray(serverDeleted.deletedAdIds)) {
        serverDeleted.deletedAdIds.forEach((id: string) => addDeletedAdId(id));
      }
    }

    const deletedSongs = getDeletedSongIds();
    const deletedAds = getDeletedAdIds();

    if (resSongs && resSongs.ok && resSongs.headers.get('content-type')?.includes('application/json')) {
      const serverSongs: Song[] = await resSongs.json();
      const filtered = serverSongs.filter((s) => !deletedSongs.includes(s.id));
      saveSongs(filtered);
    } else {
      // Purge any local cached songs that have been marked deleted
      const currentLocal = getSongs();
      const filtered = currentLocal.filter((s) => !deletedSongs.includes(s.id));
      saveSongs(filtered);
    }

    if (resAds && resAds.ok && resAds.headers.get('content-type')?.includes('application/json')) {
      const serverAds: Advertisement[] = await resAds.json();
      const filtered = serverAds.filter((a) => !deletedAds.includes(a.id));
      saveAds(filtered);
    } else {
      const currentLocalAds = getAds();
      const filtered = currentLocalAds.filter((a) => !deletedAds.includes(a.id));
      saveAds(filtered);
    }

    if (resComments && resComments.ok && resComments.headers.get('content-type')?.includes('application/json')) {
      const serverComments = await resComments.json();
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(serverComments));
    }
    triggerStorageEvent();
  } catch (e) {
    console.warn('Backend server sync skipped or operating in offline fallback mode:', e);
  }
}


// SONGS
export function getSongs(): Song[] {
  try {
    const deletedSongs = getDeletedSongIds();
    const data = localStorage.getItem(SONGS_KEY);
    if (!data) {
      const initialFiltered = INITIAL_SONGS.filter((s) => !deletedSongs.includes(s.id));
      saveSongs(initialFiltered);
      return initialFiltered;
    }
    const parsed: Song[] = JSON.parse(data);
    return parsed.filter((s) => !deletedSongs.includes(s.id));
  } catch (err) {
    console.error('Error reading songs:', err);
    return INITIAL_SONGS;
  }
}

export function saveSongs(songs: Song[]): void {
  try {
    const deletedSongs = getDeletedSongIds();
    const filtered = songs.filter((s) => !deletedSongs.includes(s.id));

    // 1. Save base64 audio tracks into IndexedDB so audio can be retrieved anytime
    filtered.forEach((s) => {
      if (s.audioUrl && s.audioUrl.startsWith('data:')) {
        saveAudioTrack(s.id, s.audioUrl);
      }
    });

    // 2. Prepare lightweight song metadata for localStorage (converting heavy base64 audio to idb: references)
    const lightSongs = filtered.map((s) => ({
      ...s,
      audioUrl: s.audioUrl && s.audioUrl.startsWith('data:') ? `idb:${s.id}` : s.audioUrl,
    }));

    // 3. Save light metadata into localStorage without hitting quota limits
    localStorage.setItem(SONGS_KEY, JSON.stringify(lightSongs));
    triggerStorageEvent();
  } catch (err) {
    console.error('Error saving songs:', err);
  }
}

export async function addSong(newSong: Omit<Song, 'id' | 'viewsCount' | 'playCount' | 'likesCount' | 'sharesCount' | 'createdAt'>): Promise<Song> {
  try {
    const res = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSong),
    });
    if (res.ok) {
      const created: Song = await res.json();
      const current = getSongs();
      const updated = [created, ...current.filter((s) => s.id !== created.id)];
      saveSongs(updated);
      return created;
    }
  } catch (e) {
    console.warn('Fallback to local song storage:', e);
  }

  // Local fallback
  const songs = getSongs();
  const song: Song = {
    ...newSong,
    id: 'song-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    viewsCount: 0,
    playCount: 0,
    likesCount: 0,
    sharesCount: 0,
    createdAt: new Date().toISOString(),
  };
  const updated = [song, ...songs];
  saveSongs(updated);
  return song;
}

export async function deleteSong(songId: string): Promise<void> {
  // 1. Mark as deleted locally so syncServerData never brings it back
  addDeletedSongId(songId);

  // 2. Delete audio track from IndexedDB
  deleteAudioTrack(songId);

  // 3. Filter local storage immediately
  const songs = getSongs();
  const updated = songs.filter((s) => s.id !== songId);
  saveSongs(updated);

  // 4. Delete on backend server
  try {
    await fetch(`/api/songs/${encodeURIComponent(songId)}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Fallback deleting song on server:', e);
  }

  triggerStorageEvent();
}

export async function incrementViewCount(songId: string): Promise<Song | null> {
  try {
    fetch(`/api/songs/${encodeURIComponent(songId)}/view`, { method: 'POST' }).catch(() => {});
  } catch {}

  const songs = getSongs();
  let updatedSong: Song | null = null;
  const updated = songs.map((s) => {
    if (s.id === songId) {
      updatedSong = { ...s, viewsCount: s.viewsCount + 1 };
      return updatedSong;
    }
    return s;
  });
  saveSongs(updated);
  return updatedSong;
}

export async function incrementPlayCount(songId: string): Promise<void> {
  const songs = getSongs();
  const updated = songs.map((s) => {
    if (s.id === songId) {
      return { ...s, playCount: s.playCount + 1 };
    }
    return s;
  });
  saveSongs(updated);
}

export async function incrementLikeCount(songId: string): Promise<Song | null> {
  try {
    fetch(`/api/songs/${encodeURIComponent(songId)}/like`, { method: 'POST' }).catch(() => {});
  } catch {}

  const songs = getSongs();
  let updatedSong: Song | null = null;
  const updated = songs.map((s) => {
    if (s.id === songId) {
      updatedSong = { ...s, likesCount: s.likesCount + 1 };
      return updatedSong;
    }
    return s;
  });
  saveSongs(updated);
  return updatedSong;
}

export async function incrementShareCount(songId: string): Promise<void> {
  try {
    fetch(`/api/songs/${encodeURIComponent(songId)}/share`, { method: 'POST' }).catch(() => {});
  } catch {}

  const songs = getSongs();
  const updated = songs.map((s) => {
    if (s.id === songId) {
      return { ...s, sharesCount: s.sharesCount + 1 };
    }
    return s;
  });
  saveSongs(updated);
}

// ADVERTISEMENTS
export function getAds(): Advertisement[] {
  try {
    const deletedAds = getDeletedAdIds();
    const data = localStorage.getItem(ADS_KEY);
    if (!data) {
      const initialFiltered = INITIAL_ADS.filter((a) => !deletedAds.includes(a.id));
      localStorage.setItem(ADS_KEY, JSON.stringify(initialFiltered));
      return initialFiltered;
    }
    const parsed: Advertisement[] = JSON.parse(data);
    return parsed.filter((a) => !deletedAds.includes(a.id));
  } catch (err) {
    console.error('Error reading ads:', err);
    return INITIAL_ADS;
  }
}

export function saveAds(ads: Advertisement[]): void {
  try {
    const deletedAds = getDeletedAdIds();
    const filtered = ads.filter((a) => !deletedAds.includes(a.id));
    localStorage.setItem(ADS_KEY, JSON.stringify(filtered));
    triggerStorageEvent();
  } catch (err) {
    console.warn('Error saving ads to localStorage:', err);
    try {
      const deletedAds = getDeletedAdIds();
      const filtered = ads.filter((a) => !deletedAds.includes(a.id));
      // Fallback: trim image poster data length if quota exceeded
      const lightAds = filtered.map((a) => ({
        ...a,
        posterUrl: a.posterUrl || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&h=600&q=80',
      }));
      localStorage.setItem(ADS_KEY, JSON.stringify(lightAds));
      triggerStorageEvent();
    } catch (e2) {
      console.error('Failed fallback saving ads:', e2);
    }
  }
}

export async function addAd(newAd: Omit<Advertisement, 'id' | 'clicksCount' | 'createdAt'>): Promise<Advertisement> {
  try {
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAd),
    });
    if (res.ok) {
      const created: Advertisement = await res.json();
      const current = getAds();
      const updated = [created, ...current.filter((a) => a.id !== created.id)];
      saveAds(updated);
      return created;
    }
  } catch (e) {
    console.warn('Fallback adding ad locally:', e);
  }

  const ads = getAds();
  const ad: Advertisement = {
    ...newAd,
    id: 'ad-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    clicksCount: 0,
    createdAt: new Date().toISOString(),
  };
  const updated = [ad, ...ads];
  saveAds(updated);
  return ad;
}

export async function deleteAd(adId: string): Promise<void> {
  addDeletedAdId(adId);

  const ads = getAds();
  const updated = ads.filter((a) => a.id !== adId);
  saveAds(updated);

  try {
    await fetch(`/api/ads/${encodeURIComponent(adId)}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Fallback deleting ad on server:', e);
  }

  triggerStorageEvent();
}

export async function incrementAdClick(adId: string): Promise<void> {
  try {
    fetch(`/api/ads/${encodeURIComponent(adId)}/click`, { method: 'POST' }).catch(() => {});
  } catch {}

  const ads = getAds();
  const updated = ads.map((a) => {
    if (a.id === adId) {
      return { ...a, clicksCount: a.clicksCount + 1 };
    }
    return a;
  });
  saveAds(updated);
}

// COMMENTS
export function getComments(songId?: string): SongComment[] {
  try {
    const data = localStorage.getItem(COMMENTS_KEY);
    const allComments: SongComment[] = data ? JSON.parse(data) : INITIAL_COMMENTS;
    if (!data) {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
    }
    if (songId) {
      return allComments.filter((c) => c.songId === songId);
    }
    return allComments;
  } catch (err) {
    console.error('Error reading comments:', err);
    return INITIAL_COMMENTS;
  }
}

export async function addComment(songId: string, userName: string, text: string): Promise<SongComment> {
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId, userName, text }),
    });
    if (res.ok) {
      const comment: SongComment = await res.json();
      const allComments = getComments();
      const updated = [comment, ...allComments.filter((c) => c.id !== comment.id)];
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
      triggerStorageEvent();
      return comment;
    }
  } catch (e) {
    console.warn('Fallback adding comment locally:', e);
  }

  const allComments = getComments();
  const newComment: SongComment = {
    id: 'comm-' + Date.now(),
    songId,
    userName: userName.trim() || 'ଦର୍ଶକ (Audience)',
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
  };
  const updated = [newComment, ...allComments];
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
  triggerStorageEvent();
  return newComment;
}

// ADMIN AUTH
export const ADMIN_PIN = '543213@';

export function checkAdminAuth(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function setAdminAuth(authenticated: boolean): void {
  if (authenticated) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
  triggerStorageEvent();
}

// DB JSON EXPORT & IMPORT
export function exportDatabaseJSON(): string {
  return JSON.stringify(
    {
      songs: getSongs(),
      ads: getAds(),
      comments: getComments(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function importDatabaseJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.songs && Array.isArray(parsed.songs)) {
      saveSongs(parsed.songs);
    }
    if (parsed.ads && Array.isArray(parsed.ads)) {
      saveAds(parsed.ads);
    }
    if (parsed.comments && Array.isArray(parsed.comments)) {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(parsed.comments));
    }
    triggerStorageEvent();
    return true;
  } catch (e) {
    console.error('Invalid JSON import:', e);
    return false;
  }
}

export function resetToDefaults(): void {
  localStorage.removeItem(DELETED_SONGS_KEY);
  localStorage.removeItem(DELETED_ADS_KEY);
  localStorage.setItem(SONGS_KEY, JSON.stringify(INITIAL_SONGS));
  localStorage.setItem(ADS_KEY, JSON.stringify(INITIAL_ADS));
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
  fetch('/api/reset', { method: 'POST' }).catch(() => {});
  triggerStorageEvent();
}
