import { DemoDataOverrides } from "../demoData";

const galleryPhotos = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80",
];

const demoData: DemoDataOverrides = {
  brideName: "Lily",
  groomName: "James",
  brideBio: "We first met beneath a sky full of stars, and every year since has felt a little more magical.",
  groomBio: "From quiet candlelit dinners to a moonlit proposal, every chapter of our story brought us here.",
  welcomeMessage:
    "Together with our families, we invite you to a moonlit evening of love, candlelight, and celebration under the stars.",
  hashtag: "#LilyAndJamesAfterDark",
  weddingDate: "2026-08-22",
  couplePhotoUrl: galleryPhotos[0],
  bridePhotoUrl: galleryPhotos[1],
  groomPhotoUrl: galleryPhotos[2],
  events: [
    { id: 0, eventName: "Welcome Dinner", eventDate: "2026-08-21", eventTime: "19:30:00", venueName: "Moonstone Terrace", venueAddress: "Udaipur", mapsUrl: "https://maps.google.com" },
    { id: 1, eventName: "Haldi", eventDate: "2026-08-22", eventTime: "10:00:00", venueName: "Lake Courtyard", venueAddress: "Udaipur", mapsUrl: "https://maps.google.com" },
    { id: 2, eventName: "Wedding", eventDate: "2026-08-22", eventTime: "18:30:00", venueName: "Celestial Steps", venueAddress: "Udaipur", mapsUrl: "https://maps.google.com" },
    { id: 3, eventName: "Reception", eventDate: "2026-08-22", eventTime: "21:00:00", venueName: "Lantern Hall", venueAddress: "Udaipur", mapsUrl: "https://maps.google.com" },
  ],
  galleryPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i, isDefault: true })),
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  musicName: "Midnight Reverie BGM",
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i })),
    defaultMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    defaultMusicName: "Midnight Reverie BGM",
    defaultVideoUrl: "https://cdn.coverr.co/videos/coverr-a-toast-under-string-lights-1562569482304?download=1080p",
  },
};

export default demoData;
