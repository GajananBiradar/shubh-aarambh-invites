import { DemoDataOverrides } from "../demoData";

const galleryPhotos = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80",
];

const demoData: DemoDataOverrides = {
  brideName: "Prajakta",
  groomName: "Shubham",
  brideBio: "A graceful soul with a love for family traditions, soft florals, and meaningful celebrations.",
  groomBio: "Warm, grounded, and joyful, with a heart set on creating a beautiful beginning together.",
  welcomeMessage:
    "With the blessings of our families, we request the pleasure of your presence as we gather for an elegant engagement evening filled with warmth, flowers, and heartfelt celebration.",
  hashtag: "#PrajaktaWedsShubham",
  weddingDate: "2026-11-08",
  couplePhotoUrl: galleryPhotos[0],
  bridePhotoUrl: galleryPhotos[1],
  groomPhotoUrl: galleryPhotos[2],
  events: [
    { id: 0, eventName: "Engagement Celebration", eventDate: "2026-11-08", eventTime: "18:30:00", venueName: "Maison Lumiere", venueAddress: "Bund Garden Road, Pune", mapsUrl: "https://maps.google.com" },
  ],
  galleryPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i, isDefault: true })),
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  musicName: "Sage Letter BGM",
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((url, i) => ({ photoUrl: url, sortOrder: i })),
    defaultMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    defaultMusicName: "Sage Letter BGM",
    defaultVideoUrl: "https://cdn.coverr.co/videos/coverr-a-toast-under-string-lights-1562569482304?download=1080p",
  },
};

export default demoData;
