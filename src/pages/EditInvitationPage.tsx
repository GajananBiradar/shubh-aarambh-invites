import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import PageWrapper from '@/components/layout/PageWrapper';
import CreateInvitationPage from './CreateInvitationPage';
import { getInvitationById } from '@/api/invitations';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getTemplateComponent, getTemplateTheme } from '@/templates';
import { InvitationData, TemplateComponent, PhotoData, EventData } from '@/templates/types';
import { useInvitationEditor } from '@/hooks/useInvitationEditor';
import api from '@/api/axios';
import { Loader2, Heart, X, Copy, Check, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const EditInvitationPage = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(null);
  const [initialData, setInitialData] = useState<InvitationData | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadInvitation = async () => {
      try {
        const data = await getInvitationById(invitationId!);
        setInvitationData(data);
      } catch (err) {
        setError(true);
        toast.error('Could not load invitation');
      } finally {
        setLoading(false);
      }
    };

    if (invitationId) loadInvitation();
  }, [invitationId, isAuthenticated, navigate]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="font-body text-sm text-muted-foreground">Loading invitation...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !invitationData) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <p className="font-heading text-xl font-bold mb-2">Could not load invitation</p>
          <p className="font-body text-sm text-muted-foreground mb-6">The invitation may have been deleted or you don't have access.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <CreateInvitationPage
      editMode
      editData={invitationData}
      editInvitationId={invitationId}
    />
    }
  }, [isAuthenticated, navigate]);

  // Load invitation data
  useEffect(() => {
    const loadInvitation = async () => {
      if (!invitationId) {
        setError('No invitation specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Fetch invitation from API
        const { data: invitation } = await api.get(`/api/invitations/${invitationId}`);

        // 2. Determine template slug from invitation
        const templateSlug = invitation.template?.theme || invitation.templateTheme || 'crimson';
        const templateId = String(invitation.template?.id || invitation.templateId || '1');

        // 3. Load the template component
        const component = await getTemplateComponent(templateSlug);
        if (!component) {
          // Fallback to crimson
          const fallbackComponent = await getTemplateComponent('crimson');
          if (!fallbackComponent) {
            setError('Template not found');
            setLoading(false);
            return;
          }
          setTemplateComp(() => fallbackComponent);
        } else {
          setTemplateComp(() => component);
        }

        // 4. Map API response to InvitationData
        const invitationData = invitation.invitationData || {};
        
        // Map events
        const events: EventData[] = (invitation.events || []).map((e: any) => ({
          id: e.id || null,
          eventName: e.eventName || '',
          eventDate: e.eventDate || '',
          eventTime: e.eventTime || '',
          venueName: e.venueName || '',
          venueAddress: e.venueAddress || '',
          mapsUrl: e.mapsUrl || null,
        }));

        // Map gallery photos
        const galleryPhotos: PhotoData[] = (invitation.galleryPhotos || []).map((p: any, i: number) => ({
          photoUrl: p.photoUrl || p,
          sortOrder: p.sortOrder ?? i,
          isDefault: false,
        }));

        // Build template defaults
        const templateDefaults = {
          defaultPhotos: invitation.template?.defaultPhotos || [],
          defaultMusicUrl: invitation.template?.defaultMusicUrl || invitation.effectiveMusicUrl || '',
          defaultMusicName: invitation.template?.defaultMusicName || invitation.effectiveMusicName || 'Wedding BGM',
          defaultVideoUrl: invitation.template?.defaultVideoUrl || null,
        };

        const data: InvitationData = {
          invitationId: Number(invitationId),
          templateId: Number(templateId),
          templateSlug,
          brideName: invitation.brideName || '',
          groomName: invitation.groomName || '',
          brideBio: invitationData.bride_bio || invitation.brideBio || '',
          groomBio: invitationData.groom_bio || invitation.groomBio || '',
          couplePhotoUrl: invitation.couplePhotoUrl || null,
          hashtag: invitationData.hashtag || invitation.hashtag || '',
          welcomeMessage: invitationData.welcome_message || invitation.welcomeMessage || '',
          showCountdown: invitationData.show_countdown ?? invitation.showCountdown ?? true,
          weddingDate: invitationData.wedding_date || invitation.weddingDate || '',
          events,
          galleryPhotos,
          musicUrl: invitation.musicUrl || null,
          musicName: invitation.musicName || null,
          effectiveMusicUrl: invitation.effectiveMusicUrl || templateDefaults.defaultMusicUrl,
          effectiveMusicName: invitation.effectiveMusicName || templateDefaults.defaultMusicName,
          locale: invitation.locale || 'en',
          slug: invitationData.slug || invitation.slug || '',
          accessCode: invitation.accessCode || invitation.code || null,
          status: invitation.status || 'DRAFT',
          templateDefaults,
        };

        setInitialData(data);
        setLoading(false);
      } catch (e: any) {
        console.error('Failed to load invitation:', e);
        if (e.response?.status === 404) {
          setError('Invitation not found');
        } else if (e.response?.status === 401) {
          navigate('/login');
          return;
        } else {
          setError('Failed to load invitation');
        }
        setLoading(false);
      }
    };

    loadInvitation();
  }, [invitationId, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="font-body text-sm text-muted-foreground">Loading invitation...</p>
      </div>
    );
  }

  // Error state
  if (error || !TemplateComp || !initialData) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <Heart className="w-12 h-12 text-primary/30 mb-4" />
        <h1 className="font-heading text-xl font-semibold mb-2">Oops!</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">{error || 'Something went wrong'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Render the editor
  return <TemplateEditor TemplateComp={TemplateComp} initialData={initialData} />;
};

// Separate component for the editor to use the hook
const TemplateEditor = ({
  TemplateComp,
  initialData,
}: {
  TemplateComp: TemplateComponent;
  initialData: InvitationData;
}) => {
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  const {
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
  } = useInvitationEditor({
    initialData,
    autosaveDelay: 30000, // Autosave every 30 seconds
  });

  const handleCopyLink = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `You're invited! Open our wedding invitation: ${publishedUrl}`
  );

  return (
    <>
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={closeSuccessModal}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>

              <div className="text-6xl text-center mb-4 animate-bounce">
                🎉
              </div>

              <h2 className="font-heading text-2xl font-bold text-center mb-2">
                Your Invitation is LIVE!
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">
                Share it with your guests
              </p>

              {/* URL Box */}
              <div className="bg-muted rounded-xl p-3 mb-6">
                <p className="font-body text-xs text-muted-foreground break-all select-all text-center">
                  {publishedUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCopyLink}
                  className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  {copiedLink ? (
                    <>
                      <Check size={16} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy Link
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[hsl(142,70%,40%)] text-white font-body font-medium px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Heart size={16} /> Share on WhatsApp
                </a>

                <button
                  onClick={() => window.open(publishedUrl || '', '_blank')}
                  className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> View My Invitation
                </button>

                <button
                  onClick={closeSuccessModal}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error messages */}
      {hasError && errorMessages.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 border border-destructive/20 rounded-xl p-4 max-w-md">
          <p className="font-body text-sm text-destructive font-medium mb-2">Please fix the following:</p>
          <ul className="font-body text-xs text-destructive/80 list-disc list-inside">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Template in edit mode */}
      <TemplateComp
        mode="edit"
        data={data}
        onUpdate={updateData}
        onSaveDraft={saveDraft}
        onPublish={publish}
        isSaving={isSaving}
        isPublishing={isPublishing}
      />
    </>
  );
};

export default EditInvitationPage;
