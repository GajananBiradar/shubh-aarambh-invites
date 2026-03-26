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
  hashtag: string;
  welcomeMessage: string;
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
  brideName: '',
  groomName: '',
  brideBio: '',
  groomBio: '',
  couplePhotoUrl: null,
  hashtag: '',
  welcomeMessage: '',
  showCountdown: true,
  weddingDate: '',
  events: [],
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
