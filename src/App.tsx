import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'; // ଯଦି Supabase ବ୍ୟବହାର କରୁଛନ୍ତି

// Supabase Client (ଆପଣଙ୍କ API URL ଓ Key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SongsHomePage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // ୧. Supabase / Live API ରୁ ଗୀତ Fetch କରିବା
  const fetchLiveSongs = async () => {
    try {
      setLoading(true);

      // (Option A) Supabase ରୁ Fetch କଲେ:
      let { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('createdAt', { ascending: false });

      // (Option B) REST API / Express Server ରୁ Fetch କଲେ:
      if (!data || error) {
        const res = await fetch('/api/songs');
        if (res.ok) {
          data = await res.json();
        }
      }

      if (data) {
        setSongs(data);
      }
    } catch (err) {
      console.error('Error fetching live songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSongs();

    // ୫ ସେକେଣ୍ଡରେ ଥରେ ଅଟୋ-ସିଙ୍କ୍
    const interval = setInterval(() => {
      fetchLiveSongs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ୨. Category ଓ Search Filter Logic
  const filteredSongs = songs.filter((song) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      song.title?.toLowerCase().includes(term) ||
      song.artist?.toLowerCase().includes(term) ||
      song.category?.toLowerCase().includes(term);

    const isAll =
      !selectedCategory ||
      selectedCategory === 'All' ||
      selectedCategory === 'ସବୁ (All)' ||
      selectedCategory.toLowerCase().includes('all');

    const matchesCategory =
      isAll ||
      song.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold text-amber-400 mb-4">
        🎵 ଲାଇଭ୍ ଓଡ଼ିଆ ଗୀତ ତାଲିକା ({filteredSongs.length})
      </h1>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4">
        {['All', 'Odia Modern', 'Bhajan', 'Sambalpuri', 'Jatra', 'Romantic'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              selectedCategory === cat ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Songs Grid */}
      {loading && songs.length === 0 ? (
        <p className="text-slate-400">ଗୀତ ଲୋଡ୍ ହେଉଛି...</p>
      ) : filteredSongs.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800">
          <p className="text-slate-400">କୌଣସି ଗୀତ ମିଳିଲା ନାହିଁ।</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
            className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
          >
            ସବୁ ଗୀତ ଦେଖନ୍ତୁ (Show All Songs)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col hover:border-amber-500/50 transition"
            >
              {/* 1:1 Poster Image */}
              <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-slate-800">
                <img
                  src={song.posterUrl || 'https://via.placeholder.com/300'}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded w-fit mb-1">
                {song.category}
              </span>
              <h3 className="text-xs font-bold text-slate-100 truncate">{song.title}</h3>
              <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
