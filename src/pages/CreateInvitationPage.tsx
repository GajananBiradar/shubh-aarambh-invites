import { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getTemplateComponent, getTemplateTheme, getTemplateMetadata } from '@/templates';
import { InvitationData, createEmptyInvitationData, TemplateComponent, EventData } from '@/templates/types';
import { useInvitationEditor } from '@/hooks/useInvitationEditor';
import { getTemplateById, getTemplateDemoData } from '@/api/templates';
import { checkPaymentStatus } from '@/api/payments';
import { Loader2, Heart, X, Copy, Check, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CreateInvitationPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(null);
  const [initialData, setInitialData] = useState<InvitationData | null>(null);
  const [showPaymentRequired, setShowPaymentRequired] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load template and initialize data
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) {
        setError('No template specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Load the template component
        const component = await getTemplateComponent(templateId);
        if (!component) {
          setError('Template not found');
          setLoading(false);
          return;
        }
        setTemplateComp(() => component);

        // 2. Get template metadata
        const metadata = getTemplateMetadata(templateId);
        const theme = getTemplateTheme(templateId);

        // 3. Fetch template data from API (defaults, music, etc.)
        let templateDefaults = {
          defaultPhotos: [] as { photoUrl: string; sortOrder: number }[],
          defaultMusicUrl: '',
          defaultMusicName: '',
          defaultVideoUrl: null as string | null,
        };

        try {
          const demoData = await getTemplateDemoData(templateId);
          templateDefaults = {
            defaultPhotos: demoData.defaultPhotos || [],
            defaultMusicUrl: demoData.musicUrl || '',
            defaultMusicName: demoData.templateName ? `${demoData.templateName} BGM` : 'Wedding BGM',
            defaultVideoUrl: demoData.videoUrl || null,
          };
        } catch (e) {
          // Use fallback defaults
          console.warn('Could not fetch template defaults:', e);
        }

        // 4. Check payment (unless dev mode)
        if (!isDevMode) {
          try {
            const paymentStatus = await checkPaymentStatus(templateId);
            if (paymentStatus.requiresPayment) {
              setShowPaymentRequired(true);
            }
          } catch (e) {
            console.warn('Payment check failed:', e);
          }
        }

        // 5. Initialize invitation data
        const numericTemplateId = parseInt(templateId) || 1;
        const data = createEmptyInvitationData(numericTemplateId, theme, templateDefaults);
        
        // Add a default event
        data.events = [{
          id: null,
          eventName: 'Wedding',
          eventDate: '',
          eventTime: '',
          venueName: '',
          venueAddress: '',
          mapsUrl: null,
        }];

        setInitialData(data);
        setLoading(false);
      } catch (e) {
        console.error('Failed to load template:', e);
        setError('Failed to load template');
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, isDevMode]);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="font-body text-sm text-muted-foreground">Loading template...</p>
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
          onClick={() => navigate('/templates')}
          className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  // Payment required modal
  if (showPaymentRequired) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold mb-2">Premium Template</h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            This template requires a one-time purchase to use.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/templates')}
              className="flex-1 btn-outline-accent px-4 py-2.5 rounded-xl text-sm"
            >
              Choose Another
            </button>
            <button
              onClick={() => {
                // TODO: Trigger payment flow
                setShowPaymentRequired(false);
              }}
              className="flex-1 btn-gold px-4 py-2.5 rounded-xl text-sm"
            >
              Purchase
            </button>
          </div>
        </div>
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

export default CreateInvitationPage;
