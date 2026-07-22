import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Enable JSON body parsing with large payload limit for 1:1 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initial default database state
const DEFAULT_SONGS = [
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

const DEFAULT_ADS = [
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

const DEFAULT_COMMENTS = [
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

let songs = [...DEFAULT_SONGS];
let ads = [...DEFAULT_ADS];
let comments = [...DEFAULT_COMMENTS];

function loadDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.songs)) songs = data.songs;
      if (Array.isArray(data.ads)) ads = data.ads;
      if (Array.isArray(data.comments)) comments = data.comments;
    } else {
      saveDB();
    }
  } catch (err) {
    console.warn('Could not read persistent db file:', err);
  }
}

function saveDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify({ songs, ads, comments }, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write persistent db file:', err);
  }
}

loadDB();

const ADMIN_PIN = '543213@';

// API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), totalSongs: songs.length });
});

// Admin Authentication Check
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.json({ success: true, message: 'Admin authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
  }
});

// Reset Database
app.post('/api/reset', (req, res) => {
  songs = [...DEFAULT_SONGS];
  ads = [...DEFAULT_ADS];
  comments = [...DEFAULT_COMMENTS];
  saveDB();
  res.json({ success: true, message: 'Reset database to defaults' });
});

// Songs Endpoints
app.get('/api/songs', (req, res) => {
  res.json(songs);
});

app.post('/api/songs', (req, res) => {
  const newSong = req.body;
  if (!newSong.title || !newSong.posterUrl || !newSong.audioUrl) {
    return res.status(400).json({ error: 'Missing required song fields' });
  }

  const song = {
    ...newSong,
    id: 'song-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    viewsCount: 0,
    playCount: 0,
    likesCount: 0,
    sharesCount: 0,
    createdAt: new Date().toISOString(),
  };

  songs.unshift(song);
  saveDB();
  res.status(201).json(song);
});

app.delete('/api/songs/:id', (req, res) => {
  const { id } = req.params;
  const decoded = decodeURIComponent(id);
  songs = songs.filter((s) => s.id !== id && s.id !== decoded);
  saveDB();
  res.json({ success: true, id });
});

app.post('/api/songs/:id/view', (req, res) => {
  const { id } = req.params;
  const song = songs.find((s) => s.id === id);
  if (song) {
    song.viewsCount += 1;
    saveDB();
    return res.json(song);
  }
  res.status(404).json({ error: 'Song not found' });
});

app.post('/api/songs/:id/like', (req, res) => {
  const { id } = req.params;
  const song = songs.find((s) => s.id === id);
  if (song) {
    song.likesCount += 1;
    saveDB();
    return res.json(song);
  }
  res.status(404).json({ error: 'Song not found' });
});

app.post('/api/songs/:id/share', (req, res) => {
  const { id } = req.params;
  const song = songs.find((s) => s.id === id);
  if (song) {
    song.sharesCount += 1;
    saveDB();
    return res.json(song);
  }
  res.status(404).json({ error: 'Song not found' });
});

// Advertisements Endpoints
app.get('/api/ads', (req, res) => {
  res.json(ads);
});

app.post('/api/ads', (req, res) => {
  const newAd = req.body;
  if (!newAd.title || !newAd.posterUrl || !newAd.targetUrl) {
    return res.status(400).json({ error: 'Missing required ad fields' });
  }

  const ad = {
    ...newAd,
    id: 'ad-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    clicksCount: 0,
    active: true,
    createdAt: new Date().toISOString(),
  };

  ads.unshift(ad);
  saveDB();
  res.status(201).json(ad);
});

app.delete('/api/ads/:id', (req, res) => {
  const { id } = req.params;
  const decoded = decodeURIComponent(id);
  ads = ads.filter((a) => a.id !== id && a.id !== decoded);
  saveDB();
  res.json({ success: true, id });
});

app.post('/api/ads/:id/click', (req, res) => {
  const { id } = req.params;
  const ad = ads.find((a) => a.id === id);
  if (ad) {
    ad.clicksCount += 1;
    saveDB();
    return res.json(ad);
  }
  res.status(404).json({ error: 'Ad not found' });
});

// Comments Endpoints
app.get('/api/comments', (req, res) => {
  const { songId } = req.query;
  if (songId) {
    return res.json(comments.filter((c) => c.songId === songId));
  }
  res.json(comments);
});

app.post('/api/comments', (req, res) => {
  const { songId, userName, text } = req.body;
  if (!songId || !text) {
    return res.status(400).json({ error: 'Missing songId or text' });
  }

  const comment = {
    id: 'comm-' + Date.now(),
    songId,
    userName: (userName || 'ଦର୍ଶକ (Audience)').trim(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  comments.unshift(comment);
  saveDB();
  res.status(201).json(comment);
});

// Start Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
