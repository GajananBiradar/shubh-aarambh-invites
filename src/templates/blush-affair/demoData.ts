import { DemoDataOverrides } from "../demoData";

const galleryPhotos = [
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80",
];

const demoData: DemoDataOverrides = {
  brideName: "Isabella",
  groomName: "Aarav",
  brideBio: "Curator of beautiful details, linen stationery, and golden-hour plans.",
  groomBio: "Architect of calm spaces, long dinners, and a very good old-fashioned.",
  welcomeMessage:
    "Together with our families, we invite you to a wedding weekend of candlelight, conversation, vows, and dancing beneath the Tuscan sky.",
  hashtag: "#IsabellaAndAarav",
  weddingDate: "2027-06-14",
  couplePhotoUrl: galleryPhotos[0],
  bridePhotoUrl: galleryPhotos[1],
  groomPhotoUrl: galleryPhotos[2],
  events: [
    { id: 0, eventName: "Welcome Dinner", eventDate: "2027-06-13", eventTime: "19:30:00", venueName: "Villa Aurelia", venueAddress: "Florence, Italy", mapsUrl: "https://maps.google.com" },
    { id: 1, eventName: "Wedding Ceremony", eventDate: "2027-06-14", eventTime: "16:00:00", venueName: "San Galgano Abbey", venueAddress: "Tuscany, Italy", mapsUrl: "https://maps.google.com" },
    { id: 2, eventName: "Moonlight Reception", eventDate: "2027-06-14", eventTime: "20:30:00", venueName: "Cypress Courtyard", venueAddress: "Tuscany, Italy", mapsUrl: "https://maps.google.com" },
  ],
  galleryPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i, isDefault: true })),
  musicUrl: "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2",
  musicName: "Default Wedding BGM",
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i })),
    defaultMusicUrl: "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2",
    defaultMusicName: "Default Wedding BGM",
    defaultVideoUrl: null,
  },
};

export default demoData;
