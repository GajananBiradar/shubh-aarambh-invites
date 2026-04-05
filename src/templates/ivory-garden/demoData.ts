import { DemoDataOverrides } from "../demoData";

const galleryPhotos = [
  "https://images.pexels.com/photos/12165484/pexels-photo-12165484.jpeg?cs=srgb&dl=pexels-camera-treasure-928922-12165484.jpg&fm=jpg",
  "https://images.pexels.com/photos/32596493/pexels-photo-32596493.jpeg?cs=srgb&dl=pexels-amodita-s-frame-485464413-32596493.jpg&fm=jpg",
  "https://images.pexels.com/photos/29816041/pexels-photo-29816041.jpeg?cs=srgb&dl=pexels-luckydigital-29816041.jpg&fm=jpg",
  "https://images.pexels.com/photos/30685773/pexels-photo-30685773.jpeg?cs=srgb&dl=pexels-dream_-makkerzz-1603229-30685773.jpg&fm=jpg",
  "https://images.pexels.com/photos/19609198/pexels-photo-19609198.jpeg?cs=srgb&dl=pexels-fotographiya-wedding-photography-823737813-19609198.jpg&fm=jpg",
];

const demoData: DemoDataOverrides = {
  brideName: "Aarohi",
  groomName: "Vihaan",
  brideBio:
    "Interior stylist, detail lover, and the calm center of every family gathering. Aarohi brings warmth, elegance, and a thoughtful eye to every celebration.",
  groomBio:
    "Entrepreneur, music enthusiast, and the person who can turn any evening into a memorable one. Vihaan leads with heart, humor, and easy charm.",
  hashtag: "#AarohiFoundHerVihaan",
  welcomeMessage:
    "With immense joy and the blessings of our families, we invite you to celebrate our engagement evening. Join us for the ring ceremony, dinner, music, and the beginning of a beautiful new chapter in our lives.",
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
      eventName: "Welcome & High Tea",
      eventDate: "2027-02-14",
      eventTime: "16:30:00",
      venueName: "The Courtyard Pavilion",
      venueAddress: "Banjara Hills, Hyderabad",
      mapsUrl: "https://maps.google.com",
    },
    {
      id: 2,
      eventName: "Ring Ceremony",
      eventDate: "2027-02-14",
      eventTime: "18:30:00",
      venueName: "Jade Ballroom, Aurum Grand",
      venueAddress: "Road No. 12, Hyderabad",
      mapsUrl: "https://maps.google.com",
    },
    {
      id: 3,
      eventName: "Dinner & Toasts",
      eventDate: "2027-02-14",
      eventTime: "20:00:00",
      venueName: "Sky Garden Deck",
      venueAddress: "Banjara Hills, Hyderabad",
      mapsUrl: "https://maps.google.com",
    },
  ],
  templateDefaults: {
    defaultPhotos: galleryPhotos.map((photoUrl, sortOrder) => ({
      photoUrl,
      sortOrder,
    })),
    defaultMusicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    defaultMusicName: "Velvet Promise BGM",
    defaultVideoUrl: null,
  },
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  musicName: "Velvet Promise BGM",
};

export default demoData;
