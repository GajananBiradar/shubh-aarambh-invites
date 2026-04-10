// Template mode determines how the template renders
export type TemplateMode = 'demo' | 'edit' | 'view';

// Photo data structure
export interface PhotoData {
  photoUrl: string;
  sortOrder: number;
  isDefault: boolean;
}

// Event data structure
export interface EventData {
  id: number | null;
  eventName: string;
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // HH:mm:ss
  venueName: string;
  venueAddress: string;
  mapsUrl: string | null;
}

// Default photo from template
export interface DefaultPhoto {
  photoUrl: string;
  sortOrder: number;
}

// Template defaults
export interface TemplateDefaults {
  defaultPhotos: DefaultPhoto[];
  defaultMusicUrl: string;
  defaultMusicName: string;
  defaultVideoUrl: string | null;
}

export interface StoryMilestone {
  month: string;
  year: string;
  title: string;
  venue: string;
  iconKey: string;
}

export interface SectionVisibility {
  story: boolean;
  events: boolean;
  gallery: boolean;
  families: boolean;
  footer: boolean;
  music: boolean;
  venue?: boolean;
  dressCode?: boolean;
  details?: boolean;
  timeline?: boolean;
  faq?: boolean;
  gifts?: boolean;
  rsvp?: boolean;
  countdown?: boolean;
  welcome?: boolean;
}

// Main invitation data structure
export interface InvitationData {
  invitationId: number | null;
  templateId: number;
  templateSlug: string;
  brideName: string;
  groomName: string;
  brideBio: string;
  groomBio: string;
  couplePhotoUrl: string | null;
  bridePhotoUrl: string | null;
  groomPhotoUrl: string | null;
  hashtag: string;
  welcomeMessage: string;
  brideFamilyNames: string;
  groomFamilyNames: string;
  footerNote: string;
  customTexts: Record<string, string>;
  storyMilestones: StoryMilestone[];
  sectionVisibility: SectionVisibility;
  showCountdown: boolean;
  weddingDate: string;
  events: EventData[];
  galleryPhotos: PhotoData[];
  musicUrl: string | null;
  musicName: string | null;
  effectiveMusicUrl: string;
  effectiveMusicName: string;
  locale: string;
  slug: string;
  accessCode: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  rsvpEnabled: boolean;
  templateDefaults: TemplateDefaults;
}

// Props passed to every template component
export interface TemplateProps {
  mode: TemplateMode;
  data: InvitationData;
  onUpdate: (updates: Partial<InvitationData>) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  // Upload metadata for three-stage uploads
  templateId?: number;
  sessionUUID?: string;
  uploadStage?: 'temp' | 'draft' | 'published';
}

// Template component type
export type TemplateComponent = React.ComponentType<TemplateProps>;

// Template registry entry
export interface TemplateRegistryEntry {
  component: TemplateComponent;
  name: string;
  theme: string;
  category: string;
}

// Create empty invitation data with defaults
export const createEmptyInvitationData = (
  templateId: number,
  templateSlug: string,
  defaults: Partial<TemplateDefaults> = {}
): InvitationData => ({
  invitationId: null,
  templateId,
  templateSlug,
  brideName: "Bride's Name",
  groomName: "Groom's Name",
  brideBio: '',
  groomBio: '',
  couplePhotoUrl: null,
  bridePhotoUrl: null,
  groomPhotoUrl: null,
  hashtag: '#BrideWedGroom',
  welcomeMessage: 'Together with our families, we joyfully invite you to be part of our celebration of love and new beginnings.',
  brideFamilyNames: '',
  groomFamilyNames: '',
  footerNote: 'Made with love on ShubhAarambh',
  customTexts: {},
  storyMilestones: [
    {
      month: 'March',
      year: '2018',
      title: 'First Meet',
      venue: 'Royale Resort',
      iconKey: 'Haldi',
    },
    {
      month: 'December',
      year: '2021',
      title: 'Engagement',
      venue: 'Family Villa',
      iconKey: 'Engagement',
    },
    {
      month: '',
      year: '',
      title: 'Wedding',
      venue: 'Grand Ballroom',
      iconKey: 'Wedding',
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
  showCountdown: true,
  weddingDate: '',
  events: [
    {
      id: null,
      eventName: 'Wedding',
      eventDate: '',
      eventTime: '',
      venueName: 'Venue Name',
      venueAddress: 'City, State',
      mapsUrl: null,
    },
  ],
  galleryPhotos: (defaults.defaultPhotos || []).map((p, i) => ({
    photoUrl: p.photoUrl,
    sortOrder: i,
    isDefault: true,
  })),
  musicUrl: null,
  musicName: null,
  effectiveMusicUrl: defaults.defaultMusicUrl || '',
  effectiveMusicName: defaults.defaultMusicName || '',
  locale: 'en',
  slug: '',
  accessCode: null,
  status: 'DRAFT',
  rsvpEnabled: true,
  templateDefaults: {
    defaultPhotos: defaults.defaultPhotos || [],
    defaultMusicUrl: defaults.defaultMusicUrl || '',
    defaultMusicName: defaults.defaultMusicName || '',
    defaultVideoUrl: defaults.defaultVideoUrl || null,
  },
});

// Helper to create a new empty event
export const createEmptyEvent = (): EventData => ({
  id: null,
  eventName: 'New Event',
  eventDate: new Date().toISOString().split('T')[0],
  eventTime: '12:00:00',
  venueName: '',
  venueAddress: '',
  mapsUrl: null,
});
