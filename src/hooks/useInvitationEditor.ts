import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvitationData, createEmptyEvent } from '@/templates/types';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import toast from 'react-hot-toast';

interface UseInvitationEditorOptions {
  initialData: InvitationData;
  autosaveDelay?: number; // ms, 0 to disable
}

interface UseInvitationEditorReturn {
  data: InvitationData;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  hasError: boolean;
  errorMessages: string[];
  
  // Update data
  updateData: (updates: Partial<InvitationData>) => void;
  
  // Event helpers
  addEvent: () => void;
  updateEvent: (index: number, updates: Partial<InvitationData['events'][0]>) => void;
  removeEvent: (index: number) => void;
  
  // Actions
  saveDraft: () => Promise<string | null>;
  publish: () => Promise<boolean>;
  
  // Success state
  publishedUrl: string | null;
  showSuccessModal: boolean;
  closeSuccessModal: () => void;
}

export const useInvitationEditor = ({
  initialData,
  autosaveDelay = 0,
}: UseInvitationEditorOptions): UseInvitationEditorReturn => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const [data, setData] = useState<InvitationData>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Autosave effect
  useEffect(() => {
    if (autosaveDelay > 0 && isDirty) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      
      autosaveTimerRef.current = setTimeout(() => {
        saveDraftInternal(false); // Silent save
      }, autosaveDelay);
    }
    
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [isDirty, data, autosaveDelay]);

  // Persist to localStorage for page refresh recovery
  useEffect(() => {
    if (data) {
      localStorage.setItem(`invitation-draft-${data.templateId}-${data.invitationId || 'new'}`, JSON.stringify(data));
    }
  }, [data]);

  // Update data
  const updateData = useCallback((updates: Partial<InvitationData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setHasError(false);
    setErrorMessages([]);
  }, []);

  // Event helpers
  const addEvent = useCallback(() => {
    if (data.events.length >= 8) {
      toast.error('Maximum 8 events allowed');
      return;
    }
    const newEvent = createEmptyEvent();
    setData(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
    setIsDirty(true);
  }, [data.events.length]);

  const updateEvent = useCallback((index: number, updates: Partial<InvitationData['events'][0]>) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map((e, i) => i === index ? { ...e, ...updates } : e),
    }));
    setIsDirty(true);
  }, []);

  const removeEvent = useCallback((index: number) => {
    if (data.events.length <= 1) {
      toast.error('At least one event is required');
      return;
    }
    setData(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  }, [data.events.length]);

  // Build API request body
  const buildRequestBody = useCallback(() => {
    const defaultWelcome = `Together with their families, ${data.groomName || '[Groom]'} & ${data.brideName || '[Bride]'} joyfully invite you to be part of their celebration of love.`;

    return {
      templateId: data.templateId,
      locale: data.locale,
      brideName: data.brideName || '',
      groomName: data.groomName || '',
      couplePhotoUrl: data.couplePhotoUrl || null,
      musicUrl: data.musicUrl || null,
      musicName: data.musicName || null,
      invitationData: {
        bride_bio: data.brideBio || null,
        groom_bio: data.groomBio || null,
        hashtag: data.hashtag || null,
        welcome_message: data.welcomeMessage || defaultWelcome,
        show_countdown: data.showCountdown,
        slug: data.slug || null,
        wedding_date: data.weddingDate || null,
      },
      events: data.events
        .filter(e => e.eventName)
        .map(e => ({
          eventName: e.eventName,
          eventDate: e.eventDate || null,
          eventTime: e.eventTime || null,
          venueName: e.venueName || null,
          venueAddress: e.venueAddress || null,
          mapsUrl: e.mapsUrl || null,
        })),
      galleryPhotos: data.galleryPhotos
        .filter(p => !p.isDefault) // Only send non-default photos
        .map((p, idx) => ({
          photoUrl: p.photoUrl,
          sortOrder: idx,
        })),
    };
  }, [data]);

  // Handle API errors
  const handleApiError = useCallback((error: any) => {
    setHasError(true);
    
    if (!error.response) {
      toast.error('Connection failed. Check your internet and try again.');
      setErrorMessages(['Connection failed']);
      return;
    }

    const status = error.response.status;
    const errorData = error.response.data;

    switch (status) {
      case 401:
        logout();
        navigate('/login');
        toast.error('Session expired. Please login again.');
        break;
      case 402:
        // Payment required - handled by publish flow
        break;
      case 400:
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          setErrorMessages(errorData.errors);
          toast.error('Please fix the errors and try again');
        } else if (errorData?.message) {
          setErrorMessages([errorData.message]);
          toast.error(errorData.message);
        } else {
          toast.error('Invalid data. Please check your inputs.');
        }
        break;
      case 404:
        toast.error('Something went wrong. Please try again.');
        break;
      case 500:
      default:
        toast.error('Server error. Please try again in a moment.');
        break;
    }
  }, [logout, navigate]);

  // Internal save function
  const saveDraftInternal = async (showToast: boolean = true): Promise<string | null> => {
    try {
      const body = buildRequestBody();

      if (data.invitationId) {
        // Update existing
        const res = await api.put(`/api/invitations/${data.invitationId}`, body);
        if (showToast) toast.success('Draft updated!');
        setIsDirty(false);
        return String(res.data.id || data.invitationId);
      } else {
        // Create new
        const res = await api.post('/api/invitations', body);
        const newId = res.data.id;
        setData(prev => ({ ...prev, invitationId: newId }));
        
        // Clear localStorage draft after first save
        localStorage.removeItem(`invitation-draft-${data.templateId}-new`);
        
        if (showToast) toast.success('Draft saved!');
        setIsDirty(false);
        return String(newId);
      }
    } catch (error: any) {
      handleApiError(error);
      return null;
    }
  };

  // Save draft
  const saveDraft = useCallback(async (): Promise<string | null> => {
    setIsSaving(true);
    setHasError(false);
    setErrorMessages([]);

    const savedId = await saveDraftInternal(true);

    setIsSaving(false);
    return savedId;
  }, [saveDraftInternal]);

  // Publish
  const publish = useCallback(async (): Promise<boolean> => {
    setIsPublishing(true);
    setHasError(false);
    setErrorMessages([]);

    const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

    // First save the draft
    const savedId = await saveDraftInternal(false);
    
    if (!savedId) {
      setIsPublishing(false);
      return false;
    }

    try {
      // Check payment status
      const paymentCheck = await api.get(`/api/payments/check?templateId=${data.templateId}`);
      const { requiresPayment } = paymentCheck.data;

      if (requiresPayment === false || isDevMode) {
        // Free to publish
        const publishRes = await api.post(`/api/invitations/${savedId}/publish`);
        const publicUrl = publishRes.data.publicUrl || '';

        // Build full URL
        const fullUrl = publicUrl.startsWith('http')
          ? publicUrl
          : `${window.location.origin}${publicUrl}`;

        setPublishedUrl(fullUrl);
        setShowSuccessModal(true);
        setIsDirty(false);
        toast.success('Your invitation is now live!');
        setIsPublishing(false);
        return true;
      } else {
        // Payment required - redirect to payment flow
        // In production, you'd show a payment modal here
        navigate(`/invitations/${savedId}/preview`);
        toast.error('Review your invitation and complete payment to publish.');
        setIsPublishing(false);
        return false;
      }
    } catch (error: any) {
      handleApiError(error);
      setIsPublishing(false);
      return false;
    }
  }, [data.templateId, saveDraftInternal, handleApiError, navigate]);

  const closeSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  }, [navigate]);

  return {
    data,
    isDirty,
    isSaving,
    isPublishing,
    hasError,
    errorMessages,
    updateData,
    addEvent,
    updateEvent,
    removeEvent,
    saveDraft,
    publish,
    publishedUrl,
    showSuccessModal,
    closeSuccessModal,
  };
};

export default useInvitationEditor;
