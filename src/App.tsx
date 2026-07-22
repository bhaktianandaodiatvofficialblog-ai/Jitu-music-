import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Play, Pause, Music } from 'lucide-react';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  plays?: number;
  created_at?: string;
}

export default function SongsList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Fetch Live Songs from Supabase
  const fetchLiveSongs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching songs from Supabase:', error);
      } else if (data) {
        setSongs(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSongs();

    // Real-time subscription for instant updates on new song uploads
    const channel = supabase
      .channel('songs-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'songs' },
        (payload) => {
          setSongs((prevSongs) => [payload.new as Song, ...prevSongs]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePlayToggle = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  if (loading) {
    return <p className="text-xs text-neutral-400 py-4">Loading songs...</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
        <Music className="w-5 h-5 text-amber-500" /> ଭକ୍ତି ସଙ୍ଗୀତ (Live Songs)
      </h3>

      {songs.length === 0 ? (
        <p className="text-xs text-neutral-500 py-4">No songs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {songs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => handlePlayToggle(song)}
                    className={`p-3 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-amber-500 text-black'
                        : 'bg-neutral-950 text-amber-500 border border-neutral-800'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-amber-500' : 'text-neutral-100'}`}>
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-500 font-mono">
                  {song.plays ? `${song.plays} plays` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
