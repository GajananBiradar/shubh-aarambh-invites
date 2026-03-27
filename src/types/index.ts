export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WeddingEvent {
  id?: string;
  eventName: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
}

export interface GalleryPhoto {
  photoUrl: string;
  sortOrder: number;
}

export interface DefaultPhoto {
  id: number;
  photoUrl: string;
  sortOrder: number;
  caption: string | null;
}

export interface Invitation {
  id?: string;
  userId?: string;
  brideName: string;
  groomName: string;
  brideBio: string;
  groomBio: string;
  couplePhotoUrl: string | null;
  hashtag: string;
  slug: string;
  code?: string;
  accessCode?: string;
  welcomeMessage: string;
  musicUrl: string | null;
  musicName: string | null;
  effectiveMusicUrl?: string | null;
  effectiveMusicName?: string | null;
  showCountdown: boolean;
  weddingDate: string;
  templateId?: string;
  templateTheme: string;
  events: WeddingEvent[];
  galleryPhotos: GalleryPhoto[] | string[];
  templateDefaultPhotos?: DefaultPhoto[];
  templateDefaultMusicUrl?: string | null;
  templateDefaultMusicName?: string | null;
  templateDefaultVideoUrl?: string | null;
  viewCount?: number;
  rsvpCount?: number;
  status?: 'DRAFT' | 'PUBLISHED';
  createdAt?: string;
  updatedAt?: string;
  invitationData?: Record<string, any>;
  template?: {
    id: number;
    name: string;
    themeKey: string;
    slug?: string;
    defaultPhotos?: DefaultPhoto[];
    defaultMusicUrl?: string | null;
    defaultMusicName?: string | null;
    defaultVideoUrl?: string | null;
  };
}

export interface Template {
  id: string;
  name: string;
  theme: string;
  themeKey?: string;
  slug?: string;
  category: string;
  description: string;
  shortDescription?: string;
  price: number;
  priceInr: number;
  priceUsd?: number;
  priceEur?: number;
  isFree: boolean;
  isPremium?: boolean;
  isActive?: boolean;
  tags: any[];
  previewImage: string;
  previewImageUrl?: string;
  thumbnailUrl?: string;
  defaultMusicUrl?: string | null;
  defaultMusicName?: string | null;
  defaultVideoUrl?: string | null;
  defaultPhotos?: DefaultPhoto[];
  sortOrder?: number;
}

export interface RsvpSubmission {
  name: string;
  phone: string;
  attending: 'yes' | 'maybe' | 'no';
  guestCount: number;
}

export interface PaymentOrder {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerification {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface QuoteRequest {
  name: string;
  email: string;
  phone?: string;
  vision: string;
  budget: string;
  eventDate?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
