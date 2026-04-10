import { DemoDataOverrides } from '../demoData';

const R2_BASE = 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev';

const galleryPhotos = [
  `${R2_BASE}/templates/5/photos/couple1.jpg`,
  `${R2_BASE}/templates/5/photos/couple2.jpg`,
  `${R2_BASE}/templates/5/photos/couple3.jpg`,
  `${R2_BASE}/templates/5/photos/couple4.jpg`,
  `${R2_BASE}/templates/5/photos/couple5.jpg`,
  `${R2_BASE}/templates/5/photos/couple6.jpg`,
  `${R2_BASE}/templates/5/photos/couple7.jpg`,
  `${R2_BASE}/templates/5/photos/couple8.jpg`,
];

const demoData: DemoDataOverrides = {
  brideName: 'Aarohi',
  groomName: 'Vivaan',
  brideBio:
    'What began as one easy conversation slowly turned into the kind of love that made every ordinary day feel a little more luminous.',
  groomBio:
    'We wanted this invitation to feel like a moving album, where every scroll reveals another frame, another ritual, another part of our story.',
  hashtag: '#AarohiWedsVivaan',
  welcomeMessage:
    'Together with our families, we invite you to join us for a weekend of music, rituals, laughter, and a wedding celebration full of warmth, detail, and joy.',
  couplePhotoUrl: `${R2_BASE}/templates/5/photos/couple1.jpg`,
  weddingDate: '2026-12-09',
  events: [
    {
      id: 0,
      eventName: 'Haldi',
      eventDate: '2026-12-07',
      eventTime: '10:30:00',
      venueName: 'The Neem Courtyard',
      venueAddress: 'Plot 12, C-Scheme, Ashok Nagar, Jaipur, Rajasthan 302001',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Neem+Courtyard%2C+C-Scheme%2C+Jaipur',
    },
    {
      id: 1,
      eventName: 'Mehndi',
      eventDate: '2026-12-07',
      eventTime: '16:00:00',
      venueName: 'The Neem Courtyard',
      venueAddress: 'Plot 12, C-Scheme, Ashok Nagar, Jaipur, Rajasthan 302001',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Neem+Courtyard%2C+C-Scheme%2C+Jaipur',
    },
    {
      id: 2,
      eventName: 'Sangeet',
      eventDate: '2026-12-08',
      eventTime: '19:30:00',
      venueName: 'Amber Ballroom',
      venueAddress: '14, Rambagh Road, Raja Park, Jaipur, Rajasthan 302004',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Amber+Ballroom%2C+Rambagh+Road%2C+Jaipur',
    },
    {
      id: 3,
      eventName: 'Wedding',
      eventDate: '2026-12-09',
      eventTime: '17:45:00',
      venueName: 'Rajmahal Garden Palace',
      venueAddress: '22, MI Road, Panch Batti, Jaipur, Rajasthan 302001',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rajmahal+Garden+Palace%2C+MI+Road%2C+Jaipur',
    },
  ],
  galleryPhotos: galleryPhotos.map((url, i) => ({
    photoUrl: url,
    sortOrder: i,
    isDefault: true,
  })),
  musicUrl: 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2',
  musicName: 'Default Wedding BGM',
  customTexts: {
    heroPhoto0: `${R2_BASE}/templates/5/photos/couple1.jpg`,
    heroPhoto1: `${R2_BASE}/templates/5/photos/couple2.jpg`,
    heroPhoto2: `${R2_BASE}/templates/5/photos/couple3.jpg`,
    heroPhoto3: `${R2_BASE}/templates/5/photos/couple4.jpg`,
    heroPhoto4: `${R2_BASE}/templates/5/photos/couple5.jpg`,
    memoryPhoto0: `${R2_BASE}/templates/5/photos/couple6.jpg`,
    memoryPhoto1: `${R2_BASE}/templates/5/photos/couple7.jpg`,
    memoryPhoto2: `${R2_BASE}/templates/5/photos/couple8.jpg`,
  },
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i })),
    defaultMusicUrl: 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2',
    defaultMusicName: 'Default Wedding BGM',
    defaultVideoUrl: null,
  },
};

export default demoData;
