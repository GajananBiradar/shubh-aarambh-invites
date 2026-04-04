import { DemoDataOverrides } from '../demoData';

const R2_BASE = 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev';

const galleryPhotos = [
  `${R2_BASE}/templates/7/photos/Pose.png`,
  `${R2_BASE}/templates/7/photos/Dance.png`,
  `${R2_BASE}/templates/7/photos/Phere.png`,
  `${R2_BASE}/templates/7/photos/haldi.png`,
  `${R2_BASE}/templates/7/photos/marriage.png`,
  `${R2_BASE}/templates/7/photos/mehandi.png`,
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
  couplePhotoUrl: `${R2_BASE}/templates/7/photos/Pose.png`,
  weddingDate: '2026-12-09',
  events: [
    {
      id: 0,
      eventName: 'Haldi',
      eventDate: '2026-12-07',
      eventTime: '10:30:00',
      venueName: 'The Neem Courtyard',
      venueAddress: 'C-Scheme, Jaipur',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 1,
      eventName: 'Mehndi',
      eventDate: '2026-12-07',
      eventTime: '16:00:00',
      venueName: 'The Neem Courtyard',
      venueAddress: 'C-Scheme, Jaipur',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 2,
      eventName: 'Sangeet',
      eventDate: '2026-12-08',
      eventTime: '19:30:00',
      venueName: 'Amber Ballroom',
      venueAddress: 'Rambagh Road, Jaipur',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 3,
      eventName: 'Wedding',
      eventDate: '2026-12-09',
      eventTime: '17:45:00',
      venueName: 'Rajmahal Garden Palace',
      venueAddress: 'MI Road, Jaipur',
      mapsUrl: 'https://maps.google.com',
    },
    {
      eventName: 'Reception',
      id: 4,
      eventDate: '2026-12-10',
      eventTime: '20:00:00',
      venueName: 'Sheesh Mahal Pavilion',
      venueAddress: 'Narain Niwas Road, Jaipur',
      mapsUrl: 'https://maps.google.com',
    },
  ],
  galleryPhotos: galleryPhotos.map((url, i) => ({
    photoUrl: url,
    sortOrder: i,
    isDefault: true,
  })),
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i })),
    defaultMusicUrl: `${R2_BASE}/templates/7/music/elegant-piano-bgm.mp3`,
    defaultMusicName: 'Elegant Piano BGM',
    defaultVideoUrl: null,
  },
};

export default demoData;
