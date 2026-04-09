import { DemoDataOverrides } from "../demoData";

const R2 = "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/2";

const galleryPhotos = [
  `${R2}/couple1.jpg`,
  `${R2}/couple3.jpg`,
  `${R2}/couple4.jpg`,
  `${R2}/couple5.jpg`,
  `${R2}/couple6.jpg`,
];

const palaceMapsUrl =
  "https://www.google.com/maps/search/?api=1&query=The+Leela+Palace+Jaipur+Kukas";

const demoData: DemoDataOverrides = {
  brideName: "Aarohi",
  groomName: "Vihaan",
  brideBio:
    "Interior stylist, detail lover, and the calm center of every family gathering. Aarohi brings warmth, elegance, and a thoughtful eye to every celebration.",
  groomBio:
    "Entrepreneur, music enthusiast, and the person who can turn any evening into a memorable one. Vihaan leads with heart, humor, and easy charm.",
  welcomeMessage:
    "With immense joy and the blessings of our families, we invite you to celebrate our engagement evening. Join us for the ring ceremony, lunch, live music, dinner, and the beginning of a beautiful new chapter in our lives.",
  weddingDate: "2027-02-14",
  couplePhotoUrl: galleryPhotos[0],
  bridePhotoUrl: galleryPhotos[1],
  groomPhotoUrl: galleryPhotos[2],
  galleryPhotos: galleryPhotos.map((photoUrl, sortOrder) => ({
    photoUrl,
    sortOrder,
    isDefault: true,
  })),
  events: [
    {
      id: 1,
      eventName: "Welcome Lunch",
      eventDate: "2027-02-14",
      eventTime: "12:30:00",
      venueName: "The Leela Palace Jaipur",
      venueAddress: "Delhi Jaipur Highway, Kukas, Jaipur, Rajasthan",
      mapsUrl: palaceMapsUrl,
    },
    {
      id: 2,
      eventName: "Ring Ceremony",
      eventDate: "2027-02-14",
      eventTime: "16:30:00",
      venueName: "Sheesh Mahal Lawn, The Leela Palace Jaipur",
      venueAddress: "The Leela Palace Jaipur, Kukas, Jaipur, Rajasthan",
      mapsUrl: palaceMapsUrl,
    },
    {
      id: 3,
      eventName: "Music Sundowner",
      eventDate: "2027-02-14",
      eventTime: "18:00:00",
      venueName: "Terrace Courtyard, The Leela Palace Jaipur",
      venueAddress: "The Leela Palace Jaipur, Kukas, Jaipur, Rajasthan",
      mapsUrl: palaceMapsUrl,
    },
    {
      id: 4,
      eventName: "Dinner Celebration",
      eventDate: "2027-02-14",
      eventTime: "20:00:00",
      venueName: "Maharaja Ballroom, The Leela Palace Jaipur",
      venueAddress: "The Leela Palace Jaipur, Kukas, Jaipur, Rajasthan",
      mapsUrl: palaceMapsUrl,
    },
  ],
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((photoUrl, sortOrder) => ({
      photoUrl,
      sortOrder,
    })),
    defaultMusicUrl:
      "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2",
    defaultMusicName: "Default Wedding BGM",
    defaultVideoUrl: null,
  },
  musicUrl:
    "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2",
  musicName: "Default Wedding BGM",
};

export default demoData;
