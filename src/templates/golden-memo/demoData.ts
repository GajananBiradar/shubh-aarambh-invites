import { DemoDataOverrides } from '../demoData';

const R2_BASE = 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev';

const galleryPhotos = [
  `${R2_BASE}/templates/5/photos/couple.jpg`,
  `${R2_BASE}/templates/5/photos/gallery1.jpg`,
  `${R2_BASE}/templates/5/photos/gallery2.jpg`,
];

const demoData: DemoDataOverrides = {
  welcomeMessage:
    'Together with our families, Ananya & Vikram joyfully invite you to be part of their celebration of love and new beginnings.',
  couplePhotoUrl: `${R2_BASE}/templates/5/photos/couple.jpg`,
  weddingDate: '2026-02-14',
  events: [
    {
      id: 0,
      eventName: 'Mehndi',
      eventDate: '2026-02-12',
      eventTime: '16:00:00',
      venueName: 'Sharma Residence',
      venueAddress: 'Banjara Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 1,
      eventName: 'Sangeet',
      eventDate: '2026-02-13',
      eventTime: '18:00:00',
      venueName: 'The Golden Hall',
      venueAddress: 'Jubilee Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 2,
      eventName: 'Wedding',
      eventDate: '2026-02-14',
      eventTime: '10:30:00',
      venueName: 'Taj Falaknuma Palace',
      venueAddress: 'Falaknuma, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 3,
      eventName: 'Reception',
      eventDate: '2026-02-14',
      eventTime: '19:00:00',
      venueName: 'Taj Falaknuma Palace',
      venueAddress: 'Falaknuma, Hyderabad',
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
