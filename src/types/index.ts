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

export interface Invitation {
  id?: string;
  userId?: string;
  brideName: string;
  groomName: string;
  brideBio: string;
  groomBio: string;
  couplePhotoUrl: string;
  hashtag: string;
  slug: string;
  code?: string;
  welcomeMessage: string;
  musicUrl: string;
  musicName: string;
  showCountdown: boolean;
  weddingDate: string;
  templateId?: string;
  templateTheme: string;
  events: WeddingEvent[];
  galleryPhotos: string[];
  viewCount?: number;
  rsvpCount?: number;
  status?: 'DRAFT' | 'PUBLISHED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  theme: string;
  themeKey?: string; // Backend sends this for template component lookup
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
  defaultMusicUrl?: string;
  defaultMusicName?: string;
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
