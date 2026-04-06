import { useEffect, useState } from 'react';
import { InvitationData } from '@/templates/types';

interface SessionData {
  sessionUUID: string;
  templateId: number;
  brideName?: string;
  groomName?: string;
  weddingDate?: string;
  bridePhotoUrl?: string | null;
  groomPhotoUrl?: string | null;
  couplePhotoUrl?: string | null;
  events?: any[];
  galleryPhotos?: any[];
  musicUrl?: string | null;
  musicName?: string | null;
  effectiveMusicUrl?: string;
  effectiveMusicName?: string;
  hashtag?: string;
  welcomeMessage?: string;
  brideBio?: string;
  groomBio?: string;
  brideFamilyNames?: string;
  groomFamilyNames?: string;
  footerNote?: string;
  storyMilestones?: any[];
  sectionVisibility?: any;
  showCountdown?: boolean;
  invitationId?: number | null;
  templateDefaults?: any;
  rsvpEnabled?: boolean;
}

/**
 * Session-based state management for /create/:templateId
 * Stores form data in sessionStorage to survive page refresh
 * Generates sessionUUID on first visit, restores on revisit
 */
export const useSessionManager = (templateId: number) => {
  const sessionKey = `session_${templateId}`;
  const [sessionUUID, setSessionUUID] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(sessionKey);
    
    if (stored) {
      try {
        const data = JSON.parse(stored) as SessionData;
        setSessionUUID(data.sessionUUID);
      } catch (e) {
        console.error('Failed to parse session data:', e);
        // Generate new session if parsing fails
        const newUUID = crypto.randomUUID();
        setSessionUUID(newUUID);
        saveSessionData({ sessionUUID: newUUID, templateId } as SessionData);
      }
    } else {
      // First visit - generate new session
      const newUUID = crypto.randomUUID();
      setSessionUUID(newUUID);
      saveSessionData({ sessionUUID: newUUID, templateId } as SessionData);
    }
    
    setIsInitialized(true);
  }, [templateId, sessionKey]);

  /**
   * Save form data to sessionStorage
   */
  const saveSessionData = (data: Partial<SessionData>) => {
    const stored = sessionStorage.getItem(sessionKey);
    const existing = stored ? JSON.parse(stored) : { sessionUUID, templateId };
    
    const updated: SessionData = {
      ...existing,
      ...data,
      sessionUUID: existing.sessionUUID || sessionUUID,
      templateId,
    };
    
    sessionStorage.setItem(sessionKey, JSON.stringify(updated));
  };

  /**
   * Get all session data
   */
  const getSessionData = (): SessionData | null => {
    const stored = sessionStorage.getItem(sessionKey);
    return stored ? JSON.parse(stored) : null;
  };

  /**
   * Clear session (called after draft save or when leaving without saving)
   */
  const clearSession = () => {
    sessionStorage.removeItem(sessionKey);
    setSessionUUID('');
  };

  return {
    sessionUUID,
    isInitialized,
    saveSessionData,
    getSessionData,
    clearSession,
    sessionKey,
  };
};
