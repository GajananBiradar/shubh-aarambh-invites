import { DemoDataOverrides } from '../demoData';

const R2_BASE = 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev';

const galleryPhotos = [
  `${R2_BASE}/templates/7/photos/couple1.jpg`,
  `${R2_BASE}/templates/7/photos/couple2.jpg`,
  `${R2_BASE}/templates/7/photos/couple3.jpg`,
  `${R2_BASE}/templates/7/photos/couple4.jpg`,
  `${R2_BASE}/templates/7/photos/couple5.jpg`,
];

const demoData: DemoDataOverrides = {
  brideName: 'Charlotte',
  groomName: 'James',
  brideBio: 'Artist who captures light & beauty',
  groomBio: 'Writer who weaves stories & love',
  brideFamilyNames: 'Dubois Family',
  groomFamilyNames: 'Whitfield Family',
  hashtag: '#CharlotteAndJames',
  welcomeMessage:
    'We joyfully invite you to celebrate the union of Charlotte & James. Your presence would mean the world to us on this beautiful day.',
  weddingDate: '2027-06-21',
  events: [
    {
      id: 0,
      eventName: 'Ceremony',
      eventDate: '2027-06-21',
      eventTime: '14:00:00',
      venueName: 'St Martins Chapel',
      venueAddress: '12 Rue de Rivoli, Paris',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 1,
      eventName: 'Cocktail Hour',
      eventDate: '2027-06-21',
      eventTime: '16:00:00',
      venueName: 'Chateau de Fontainebleau',
      venueAddress: 'Place du General de Gaulle, Fontainebleau',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 2,
      eventName: 'Reception',
      eventDate: '2027-06-21',
      eventTime: '18:30:00',
      venueName: 'The Grand Ballroom',
      venueAddress: '5 Avenue Montaigne, Paris',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 3,
      eventName: 'After Party',
      eventDate: '2027-06-21',
      eventTime: '22:00:00',
      venueName: 'Le Jardin Secret',
      venueAddress: '8 Rue Saint Honore, Paris',
      mapsUrl: 'https://maps.google.com',
    },
  ],
  galleryPhotos: galleryPhotos.map((url, i) => ({
    photoUrl: url,
    sortOrder: i,
    isDefault: true,
  })),
  musicUrl: 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2',
  musicName: 'Default Wedding BGM',
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i })),
    defaultMusicUrl: 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2',
    defaultMusicName: 'Default Wedding BGM',
    defaultVideoUrl: null,
  },
};

export default demoData;
