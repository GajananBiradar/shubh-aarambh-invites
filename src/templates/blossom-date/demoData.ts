import { DemoDataOverrides } from '../demoData';

const R2_BASE = 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev';

const galleryPhotos = [
  `${R2_BASE}/templates/3/photos/Garden.jpeg`,
  `${R2_BASE}/templates/3/photos/Dinner%20table.jpeg`,
  `${R2_BASE}/templates/3/photos/couple%20phto.jpg`,
];

const demoData: DemoDataOverrides = {
  welcomeMessage:
    'We are so excited to make this day truly special and warmly invite you to share in our celebration of love and new beginnings!',
  couplePhotoUrl: `${R2_BASE}/templates/3/photos/couple%20phto.jpg`,
  weddingDate: '2027-08-12',
  events: [
    {
      id: 0,
      eventName: 'Welcome',
      eventDate: '2027-08-12',
      eventTime: '16:00:00',
      venueName: 'The Grand Estate',
      venueAddress: 'Jubilee Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 1,
      eventName: 'Ceremony',
      eventDate: '2027-08-12',
      eventTime: '17:30:00',
      venueName: 'The Grand Estate',
      venueAddress: 'Jubilee Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 2,
      eventName: 'Banquet',
      eventDate: '2027-08-12',
      eventTime: '18:00:00',
      venueName: 'The Grand Estate',
      venueAddress: 'Jubilee Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 3,
      eventName: 'Cake',
      eventDate: '2027-08-12',
      eventTime: '20:00:00',
      venueName: 'The Grand Estate',
      venueAddress: 'Jubilee Hills, Hyderabad',
      mapsUrl: null,
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
