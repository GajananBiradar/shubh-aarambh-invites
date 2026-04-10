import { DemoDataOverrides } from "../demoData";

const R2_BASE = "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/6/photos";

// Header photos (used only in the hero section)
const heroPhoto = `${R2_BASE}/couple1.jpg`;
const detailPhoto = `${R2_BASE}/couple2.webp`;

// Gallery photos (separate from header — each image used only once)
const galleryPhotos = [
  `${R2_BASE}/couple3.jpg`,
  `${R2_BASE}/couple4.jpg`,
  `${R2_BASE}/couple5.jpg`,
  `${R2_BASE}/couple6.jpg`,
];

const demoData: DemoDataOverrides = {
  brideName: "Ananya",
  groomName: "Rohan",
  brideBio: "A lover of sunlit mornings, handwritten letters, and the kind of joy that fills a room without trying.",
  groomBio: "Someone who finds beauty in the quiet moments — long walks, good coffee, and conversations that never feel long enough.",
  welcomeMessage:
    "Together with our families, we joyfully invite you to celebrate our wedding — a weekend of warmth, laughter, rituals, and love shared with the people closest to our hearts.",
  hashtag: "#AnanyaWedsRohan",
  weddingDate: "2027-02-14",
  couplePhotoUrl: heroPhoto,
  bridePhotoUrl: detailPhoto,
  groomPhotoUrl: null,
  events: [
    { id: 0, eventName: "Mehndi", eventDate: "2027-02-12", eventTime: "16:00:00", venueName: "The Garden Pavilion", venueAddress: "Udaipur, Rajasthan", mapsUrl: "https://maps.google.com" },
    { id: 1, eventName: "Wedding Ceremony", eventDate: "2027-02-14", eventTime: "11:00:00", venueName: "Lakeside Lawns", venueAddress: "Udaipur, Rajasthan", mapsUrl: "https://maps.google.com" },
    { id: 2, eventName: "Reception", eventDate: "2027-02-14", eventTime: "19:30:00", venueName: "The Grand Ballroom", venueAddress: "Udaipur, Rajasthan", mapsUrl: "https://maps.google.com" },
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
