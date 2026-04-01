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
    'We are so excited to make this day truly special and warmly invite you to share in our celebration of love and new beginnings!',
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
  musicUrl: `${R2_BASE}/templates/7/music/elegant-piano-bgm.mp3`,
  musicName: 'Elegant Piano BGM',
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i })),
    defaultMusicUrl: `${R2_BASE}/templates/7/music/elegant-piano-bgm.mp3`,
    defaultMusicName: 'Elegant Piano BGM',
    defaultVideoUrl: null,
  },
};

export default demoData;
