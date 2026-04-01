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
    'With the blessings of our elders and the grace of the Almighty, we joyfully invite you to celebrate the sacred union of our families.',
  couplePhotoUrl: `${R2_BASE}/templates/7/photos/marriage.png`,
  weddingDate: '2027-03-15',
  events: [
    {
      id: 0,
      eventName: 'Haldi',
      eventDate: '2027-03-13',
      eventTime: '10:00:00',
      venueName: 'Sharma Residence',
      venueAddress: 'Banjara Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 1,
      eventName: 'Mehendi',
      eventDate: '2027-03-13',
      eventTime: '16:00:00',
      venueName: 'The Garden Club',
      venueAddress: 'Jubilee Hills, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 2,
      eventName: 'Sangeet',
      eventDate: '2027-03-14',
      eventTime: '19:00:00',
      venueName: 'Taj Falaknuma Palace',
      venueAddress: 'Engine Bowli, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
    {
      id: 3,
      eventName: 'Wedding',
      eventDate: '2027-03-15',
      eventTime: '09:00:00',
      venueName: 'Chowmahalla Palace',
      venueAddress: 'Motigalli, Hyderabad',
      mapsUrl: 'https://maps.google.com',
    },
  ],
  galleryPhotos: galleryPhotos.map((url, i) => ({
    photoUrl: url,
    sortOrder: i,
    isDefault: true,
  })),
  musicUrl: `${R2_BASE}/templates/7/music/elegant-piano-bgm.mp3`,
  musicName: 'Royal Haveli BGM',
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i })),
    defaultMusicUrl: `${R2_BASE}/templates/7/music/elegant-piano-bgm.mp3`,
    defaultMusicName: 'Royal Haveli BGM',
    defaultVideoUrl: null,
  },
};

export default demoData;
