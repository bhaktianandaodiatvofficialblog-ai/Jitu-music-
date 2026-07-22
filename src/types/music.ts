export interface Song {
  id: string;
  title: string;
  artist: string;
  posterUrl: string; // 1:1 aspect ratio image
  audioUrl: string; // MP3 / Audio file URL or DataURL
  category: string; // e.g. "Bhajan", "Sambalpuri", "Odia Modern", "Jatra", "Romantic"
  description?: string;
  viewsCount: number; // Incrementable only when listened for 3 minutes (180 seconds)
  playCount: number; // Total play button triggers
  likesCount: number;
  sharesCount: number;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  posterUrl: string; // 1:1 aspect ratio banner photo
  targetUrl: string; // Website link opened when clicked
  sponsorName: string;
  active: boolean;
  clicksCount: number;
  createdAt: string;
}

export interface SongComment {
  id: string;
  songId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  accumulatedListenTime: number; // Tracked continuous/cumulative playback seconds for active song
  hasCountedViewForCurrentSession: boolean; // Flag to avoid double counting same playback session
}
