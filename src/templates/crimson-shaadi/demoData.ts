const basePhotoUrl =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/1/photos";

const galleryPhotos = [
  `${basePhotoUrl}/couple1.webp`,
  `${basePhotoUrl}/couple2.webp`,
  `${basePhotoUrl}/couple3.webp`,
  `${basePhotoUrl}/couple4.webp`,
];

const defaultMaps = {
  haldi:
    "https://www.google.com/maps/search/?api=1&query=The+Westin+Pune+Koregaon+Park",
  mehendi:
    "https://www.google.com/maps/search/?api=1&query=JW+Marriott+Pune+Senapati+Bapat+Road",
  sangeet:
    "https://www.google.com/maps/search/?api=1&query=Conrad+Pune",
  wedding:
    "https://www.google.com/maps/search/?api=1&query=Amanora+The+Fern+Hotels+%26+Club+Pune",
  reception:
    "https://www.google.com/maps/search/?api=1&query=Sheraton+Grand+Pune+Bund+Garden+Hotel",
};

const crimsonDemoData = {
  brideName: "Ananya",
  groomName: "Vikram",
  brideBio:
    "Beloved daughter, dreamer, and the gentle heartbeat of every family celebration.",
  groomBio:
    "Beloved son, warm host, and the calm strength behind every joyful gathering.",
  brideFamilyNames: "Daughter of Smt. Kavita Sharma & Shri Rajesh Sharma",
  groomFamilyNames: "Son of Smt. Sunita Mehta & Shri Rakesh Mehta",
  footerNote: "Made with love on ShubhAarambh",
  couplePhotoUrl: `${basePhotoUrl}/couple.jpg`,
  bridePhotoUrl: `${basePhotoUrl}/couple.jpg`,
  galleryPhotos: galleryPhotos.map((photoUrl, sortOrder) => ({
    photoUrl,
    sortOrder,
    isDefault: true,
  })),
  storyMilestones: [
    {
      month: "March",
      year: "2018",
      title: "First Meet",
      venue: "Pune Riverside Cafe",
      iconKey: "Haldi",
    },
    {
      month: "December",
      year: "2021",
      title: "Engagement",
      venue: "Family Villa",
      iconKey: "Engagement",
    },
    {
      month: "February",
      year: "2027",
      title: "Wedding",
      venue: "Amanora, Pune",
      iconKey: "Wedding",
    },
  ],
  sectionVisibility: {
    story: true,
    events: true,
    gallery: true,
    families: true,
    footer: true,
    music: true,
  },
  events: [
    {
      eventName: "Haldi",
      eventDate: "2027-02-10",
      eventTime: "10:00:00",
      venueName: "The Westin Pune",
      venueAddress: "Koregaon Park, Pune",
      mapsUrl: defaultMaps.haldi,
    },
    {
      eventName: "Mehendi",
      eventDate: "2027-02-11",
      eventTime: "16:30:00",
      venueName: "JW Marriott Pune",
      venueAddress: "Senapati Bapat Road, Pune",
      mapsUrl: defaultMaps.mehendi,
    },
    {
      eventName: "Sangeet",
      eventDate: "2027-02-12",
      eventTime: "19:30:00",
      venueName: "Conrad Pune",
      venueAddress: "Mangaldas Road, Pune",
      mapsUrl: defaultMaps.sangeet,
    },
    {
      eventName: "Wedding",
      eventDate: "2027-02-13",
      eventTime: "11:00:00",
      venueName: "Amanora The Fern",
      venueAddress: "Hadapsar, Pune",
      mapsUrl: defaultMaps.wedding,
    },
  ],
  musicUrl:
    "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2",
  musicName: "Default Wedding BGM",
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
};

export default crimsonDemoData;
