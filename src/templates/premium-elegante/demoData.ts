import { DemoDataOverrides } from '../demoData';

const R2_BASE = 'https://pub-ae188d768af94d25a7750692051dfeea.r2.dev';

const galleryPhotos = [
  `${R2_BASE}/templates/7/photos/Dance.png`,
  `${R2_BASE}/templates/7/photos/Phere.png`,
  `${R2_BASE}/templates/7/photos/Pose.png`,
  `${R2_BASE}/templates/7/photos/haldi.png`,
  `${R2_BASE}/templates/7/photos/marriage.png`,
  `${R2_BASE}/templates/7/photos/mehandi.png`,
];

const demoData: DemoDataOverrides = {
  welcomeMessage:
    'We warmly welcome you to celebrate the sacred union of Ananya & Vikram. Your presence will make this occasion truly special and fill our hearts with joy.',
  weddingDate: '2027-02-14',
  events: [
    {
      id: 0,
      eventName: 'Wedding',
      eventDate: '2027-02-14',
      eventTime: '08:00:00',
      venueName: 'Maharaja Palace',
      venueAddress: 'Jubilee Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 1,
      eventName: 'Haldi',
      eventDate: '2027-02-11',
      eventTime: '10:00:00',
      venueName: 'Sharma Residence',
      venueAddress: 'Banjara Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 2,
      eventName: 'Mehendi',
      eventDate: '2027-02-12',
      eventTime: '17:00:00',
      venueName: 'The Garden Club',
      venueAddress: 'Jubilee Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 3,
      eventName: 'Sangeet',
      eventDate: '2027-02-13',
      eventTime: '19:00:00',
      venueName: 'Taj Deccan',
      venueAddress: 'Road No 1, Hyderabad',
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
