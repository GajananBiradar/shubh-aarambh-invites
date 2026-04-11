import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  getTemplateComponent,
  getTemplateTheme,
  getTemplateMetadata,
} from "@/templates";
import { loadTemplateDemoData } from "@/templates/demoData";
import {
  InvitationData,
  TemplateComponent,
  createEmptyInvitationData,
} from "@/templates/types";
import { getTemplateById, getTemplateDemoData } from "@/api/templates";
import { useInvitationEditor } from "@/hooks/useInvitationEditor";
import { useSessionManager } from "@/hooks/useSessionManager";
import { usePayment } from "@/hooks/usePayment";
import { EditModeToolbar } from "@/components/inline-editor";
import { resolveWorkingMusic } from "@/lib/defaultMusic";
import { Loader2, X, Copy, Check, Eye, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface CreateInvitationPageProps {
  editMode?: boolean;
  editData?: any;
  editInvitationId?: string;
}

const buildDemoDataUpdates = (
  demoData: any,
  currentData?: InvitationData,
): Partial<InvitationData> => {
  if (!demoData) return {};

  const updates: Partial<InvitationData> = {};

  const maybeAssignString = (key: keyof InvitationData) => {
    const incoming = demoData[key];
    const current = currentData ? String(currentData[key] || "").trim() : "";

    if (typeof incoming === "string" && incoming.trim() && !current) {
      (updates as any)[key] = incoming;
    }
  };

  maybeAssignString("brideName");
  maybeAssignString("groomName");
  maybeAssignString("brideBio");
  maybeAssignString("groomBio");
  maybeAssignString("brideFamilyNames");
  maybeAssignString("groomFamilyNames");
  maybeAssignString("footerNote");
  maybeAssignString("hashtag");
  maybeAssignString("welcomeMessage");
  maybeAssignString("weddingDate");

  if (
    Array.isArray(demoData.storyMilestones) &&
    demoData.storyMilestones.length > 0 &&
    (!currentData || currentData.storyMilestones.length === 0)
  ) {
    updates.storyMilestones = demoData.storyMilestones;
  }

  if (
    demoData.sectionVisibility &&
    (!currentData || !currentData.sectionVisibility)
  ) {
    updates.sectionVisibility = demoData.sectionVisibility;
  }

  if (
    typeof demoData.couplePhotoUrl === "string" &&
    demoData.couplePhotoUrl &&
    (!currentData || !currentData.couplePhotoUrl)
  ) {
    updates.couplePhotoUrl = demoData.couplePhotoUrl;
  }

  if (
    typeof demoData.bridePhotoUrl === "string" &&
    demoData.bridePhotoUrl &&
    (!currentData || !currentData.bridePhotoUrl)
  ) {
    updates.bridePhotoUrl = demoData.bridePhotoUrl;
  }

  if (
    typeof demoData.groomPhotoUrl === "string" &&
    demoData.groomPhotoUrl &&
    (!currentData || !currentData.groomPhotoUrl)
  ) {
    updates.groomPhotoUrl = demoData.groomPhotoUrl;
  }

  if (
    Array.isArray(demoData.events) &&
    demoData.events.length > 0 &&
    (!currentData ||
      currentData.events.length === 0 ||
      currentData.events.every((event) => !event.eventName))
  ) {
    updates.events = demoData.events.map((event: any, index: number) => ({
      id: event.id ?? index,
      eventName: event.eventName || "",
      eventDate: event.eventDate || "",
      eventTime: event.eventTime || "",
      venueName: event.venueName || "",
      venueAddress: event.venueAddress || "",
      mapsUrl: event.mapsUrl || null,
    }));
  }

  if (
    Array.isArray(demoData.galleryPhotos) &&
    demoData.galleryPhotos.length > 0 &&
    (!currentData || currentData.galleryPhotos.length === 0)
  ) {
    updates.galleryPhotos = demoData.galleryPhotos.map(
      (photo: any, index: number) => ({
        photoUrl: typeof photo === "string" ? photo : photo.photoUrl || "",
        sortOrder:
          typeof photo === "string" ? index : (photo.sortOrder ?? index),
        isDefault: true,
      }),
    );
  }

  if (demoData.musicUrl && (!currentData || !currentData.musicUrl)) {
    updates.musicUrl = demoData.musicUrl;
  }

  if (demoData.musicName && (!currentData || !currentData.musicName)) {
    updates.musicName = demoData.musicName;
  }

  if (
    demoData.customTexts &&
    typeof demoData.customTexts === "object" &&
    Object.keys(demoData.customTexts).length > 0 &&
    (!currentData ||
      !currentData.customTexts ||
      Object.keys(currentData.customTexts).length === 0)
  ) {
    updates.customTexts = demoData.customTexts;
  }

  return updates;
};

const CreateInvitationPage = ({
  editMode = false,
  editData,
  editInvitationId,
}: CreateInvitationPageProps) => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { triggerPaymentFlow } = usePayment();

  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const isDevMode = import.meta.env.VITE_DEV_MODE === "true";

  // Session management for three-stage upload flow
  const numTemplateId = parseInt(templateId || "1");
  const {
    sessionUUID,
    isInitialized: sessionInitialized,
    saveSessionData,
    getSessionData,
    clearSession,
  } = useSessionManager(numTemplateId);

  // Determine effective template ID
  const effectiveTemplateId = editMode
    ? editData?.template?.id?.toString() ||
      editData?.templateId?.toString() ||
      "1"
    : templateId || "1";

  // Fetch template data
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ["template", effectiveTemplateId],
    queryFn: () => getTemplateById(effectiveTemplateId),
    enabled: !editMode, // Only fetch if not in edit mode
  });

  // Fetch template demo data (with defaults, photos, events)
  // Falls back to frontend per-template demo data when backend has no photos
  const { data: demoData, isLoading: demoDataLoading } = useQuery({
    queryKey: ["templateDemoData", effectiveTemplateId],
    queryFn: async () => {
      const backendData = await getTemplateDemoData(effectiveTemplateId);
      const slug = getTemplateTheme(effectiveTemplateId);
      const frontendData = await loadTemplateDemoData(slug);

      const mergedData = {
        ...backendData,
        ...frontendData,
        events: frontendData?.events?.length
          ? frontendData.events
          : backendData?.events,
        defaultPhotos: frontendData?.galleryPhotos?.length
          ? frontendData.galleryPhotos
          : backendData?.defaultPhotos,
        galleryPhotos: frontendData?.galleryPhotos?.length
          ? frontendData.galleryPhotos
          : backendData?.galleryPhotos,
        musicUrl: frontendData?.musicUrl || backendData?.musicUrl,
        musicName: frontendData?.musicName || backendData?.musicName,
        couplePhotoUrl:
          frontendData?.couplePhotoUrl || backendData?.couplePhotoUrl || null,
        bridePhotoUrl:
          frontendData?.bridePhotoUrl || backendData?.bridePhotoUrl || null,
        groomPhotoUrl:
          frontendData?.groomPhotoUrl || backendData?.groomPhotoUrl || null,
      };

      return mergedData;
    },
    enabled: !editMode, // Only fetch if not in edit mode
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load template component
  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      const component = await getTemplateComponent(effectiveTemplateId);
      if (component) {
        setTemplateComp(() => component);
      } else {
        toast.error("Template not found");
        navigate("/templates");
      }
      setLoading(false);
    };

    loadTemplate();
  }, [effectiveTemplateId, navigate]);

  // Build initial invitation data
  const buildInitialData = (): InvitationData => {
    const theme = getTemplateTheme(effectiveTemplateId);
    const metadata = getTemplateMetadata(effectiveTemplateId);

    // Check localStorage for unsaved draft (for new invitations only)
    if (!editMode) {
      const cacheKey = `invitation-draft-${effectiveTemplateId}-new`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached) as InvitationData;
          // Only restore if it's from the same template
          if (cachedData.templateId === parseInt(effectiveTemplateId)) {
            // Clear stale default photo URLs so demo data can provide fresh ones
            const isStaleUrl = (url: string | null) =>
              url?.includes("unsplash.com") || false;
            if (isStaleUrl(cachedData.couplePhotoUrl))
              cachedData.couplePhotoUrl = null;
            if (isStaleUrl(cachedData.bridePhotoUrl))
              cachedData.bridePhotoUrl = null;
            if (isStaleUrl(cachedData.groomPhotoUrl))
              cachedData.groomPhotoUrl = null;
            // Clear default gallery photos so fresh demo data can repopulate
            if (
              cachedData.galleryPhotos?.every((p) => p.isDefault) ||
              cachedData.galleryPhotos?.some((p) => isStaleUrl(p.photoUrl))
            ) {
              cachedData.galleryPhotos = [];
            }
            if (
              cachedData.templateDefaults?.defaultPhotos?.some(
                (p: any) => p.isDefault !== false,
              )
            ) {
              cachedData.templateDefaults.defaultPhotos = [];
            }
            // Clear stale customTexts so demo data can provide fresh ones
            if (
              cachedData.customTexts &&
              Object.keys(cachedData.customTexts).length > 0
            ) {
              const hasOnlyDefaultPhotoKeys = Object.keys(
                cachedData.customTexts,
              ).every(
                (k) => k.startsWith("heroPhoto") || k.startsWith("memoryPhoto"),
              );
              if (hasOnlyDefaultPhotoKeys) {
                cachedData.customTexts = {};
              }
            }
            return cachedData;
          }
        } catch (e) {
          // Invalid cache, ignore
        }
      }
    }

    if (editMode && editData) {
      // Map existing invitation data
      return {
        invitationId: parseInt(editInvitationId || "0") || null,
        templateId: parseInt(effectiveTemplateId),
        templateSlug: theme,
        brideName: editData.brideName || "",
        groomName: editData.groomName || "",
        brideBio: editData.invitationData?.bride_bio || "",
        groomBio: editData.invitationData?.groom_bio || "",
        brideFamilyNames: editData.invitationData?.bride_family_names || "",
        groomFamilyNames: editData.invitationData?.groom_family_names || "",
        footerNote:
          editData.invitationData?.footer_note ||
          "Made with love on ShubhAarambh",
        customTexts: editData.invitationData?.custom_texts || {},
        storyMilestones: editData.invitationData?.story_milestones || [
          {
            month: "March",
            year: "2018",
            title: "First Meet",
            venue: "Royale Resort",
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
            month: "",
            year: "",
            title: "Wedding",
            venue: "Grand Ballroom",
            iconKey: "Wedding",
          },
        ],
        sectionVisibility: editData.invitationData?.section_visibility || {
          story: true,
          events: true,
          gallery: true,
          families: true,
          footer: true,
          music: true,
        },
        couplePhotoUrl: editData.couplePhotoUrl || null,
        bridePhotoUrl: editData.bridePhotoUrl || null,
        groomPhotoUrl: editData.groomPhotoUrl || null,
        hashtag: editData.invitationData?.hashtag || "",
        welcomeMessage: editData.invitationData?.welcome_message || "",
        showCountdown: editData.invitationData?.show_countdown !== false,
        weddingDate: editData.invitationData?.wedding_date || "",
        events: (editData.events || []).map((e: any, i: number) => ({
          id: e.id || i,
          eventName: e.eventName || "",
          eventDate: e.eventDate || "",
          eventTime: e.eventTime || "",
          venueName: e.venueName || "",
          venueAddress: e.venueAddress || "",
          mapsUrl: e.mapsUrl || null,
        })),
        galleryPhotos: (editData.galleryPhotos || []).map(
          (p: any, i: number) => ({
            photoUrl: typeof p === "string" ? p : p.photoUrl,
            sortOrder: i,
            isDefault: false,
          }),
        ),
        musicUrl: editData.musicUrl || null,
        musicName: editData.musicName || null,
        effectiveMusicUrl: resolveWorkingMusic(
          editData.musicUrl || template?.defaultMusicUrl || "",
          editData.musicName || template?.defaultMusicName || "",
        ).url,
        effectiveMusicName: resolveWorkingMusic(
          editData.musicUrl || template?.defaultMusicUrl || "",
          editData.musicName || template?.defaultMusicName || "",
        ).name,
        locale: "en",
        slug: editData.slug || "",
        accessCode: editData.accessCode || editData.code || null,
        status: editData.status || "DRAFT",
        rsvpEnabled: editData.invitationData?.rsvp_enabled !== false,
        templateDefaults: {
          defaultPhotos: [],
          defaultMusicUrl: resolveWorkingMusic(
            template?.defaultMusicUrl || "",
            template?.defaultMusicName || "",
          ).url,
          defaultMusicName: resolveWorkingMusic(
            template?.defaultMusicUrl || "",
            template?.defaultMusicName || "",
          ).name,
          defaultVideoUrl: null,
        },
      };
    }

    // New invitation - use empty data with template defaults from demo data
    const demoEvents = demoData?.events || [];
    const demoPhotos = demoData?.defaultPhotos || [];
    const resolvedDefaultMusic = resolveWorkingMusic(
      demoData?.musicUrl || template?.defaultMusicUrl || "",
      demoData?.musicName || template?.defaultMusicName || "",
    );
    const defaultVideoUrl = demoData?.defaultVideoUrl || null;

    const initialData = createEmptyInvitationData(
      parseInt(effectiveTemplateId),
      theme,
      {
        defaultPhotos: demoPhotos,
        defaultMusicUrl: resolvedDefaultMusic.url,
        defaultMusicName: resolvedDefaultMusic.name,
      },
    );

    Object.assign(initialData, buildDemoDataUpdates(demoData));

    // Set music from demo data
    initialData.effectiveMusicUrl = resolvedDefaultMusic.url;
    initialData.effectiveMusicName = resolvedDefaultMusic.name;

    return initialData;
  };

  // Initialize the editor hook
  const {
    data,
    isDirty,
    isSaving,
    isPublishing,
    updateData,
    saveDraft,
    publish,
    publishedUrl,
    showSuccessModal,
    closeSuccessModal,
  } = useInvitationEditor({
    initialData: buildInitialData(),
    autosaveDelay: 30000, // Autosave every 30 seconds
  });

  // Populate form with demo data once it's available (for new invitations only)
  useEffect(() => {
    if (!editMode && demoData && !data.invitationId) {
      const resolvedDefaultMusic = resolveWorkingMusic(
        demoData?.musicUrl || template?.defaultMusicUrl || "",
        demoData?.musicName || template?.defaultMusicName || "",
      );
      const defaultVideoUrl = demoData?.defaultVideoUrl || null;

      const updates: Partial<InvitationData> = buildDemoDataUpdates(
        demoData,
        data,
      );

      // Set music from demo data
      updates.effectiveMusicUrl = resolvedDefaultMusic.url;
      updates.effectiveMusicName = resolvedDefaultMusic.name;

      if (Object.keys(updates).length > 0) {
        updateData(updates);
      }
    }
  }, [
    demoData,
    editMode,
    data.invitationId,
    template?.defaultMusicUrl,
    template?.defaultMusicName,
    updateData,
  ]);

  // Add beforeunload listener for unsaved changes (fresh create flow only)
  useEffect(() => {
    if (!editMode && isDirty && !data.invitationId) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () =>
        window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [isDirty, data.invitationId, editMode]);

  // Handle copy link
  const handleCopyLink = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Handle preview - opens preview in new tab WITHOUT saving to draft
  const handlePreview = () => {
    // Save current form data to sessionStorage so preview can read it
    const previewData = {
      sessionUUID,
      templateId: numTemplateId,
      brideName: data.brideName,
      groomName: data.groomName,
      brideBio: data.brideBio,
      groomBio: data.groomBio,
      weddingDate: data.weddingDate,
      bridePhotoUrl: data.bridePhotoUrl,
      groomPhotoUrl: data.groomPhotoUrl,
      couplePhotoUrl: data.couplePhotoUrl,
      events: data.events,
      galleryPhotos: data.galleryPhotos,
      brideFamilyNames: data.brideFamilyNames,
      groomFamilyNames: data.groomFamilyNames,
      footerNote: data.footerNote,
      customTexts: data.customTexts,
      storyMilestones: data.storyMilestones,
      sectionVisibility: data.sectionVisibility,
      musicUrl: data.musicUrl,
      musicName: data.musicName,
      effectiveMusicUrl: data.effectiveMusicUrl,
      effectiveMusicName: data.effectiveMusicName,
      templateDefaults: data.templateDefaults,
      hashtag: data.hashtag,
      welcomeMessage: data.welcomeMessage,
      showCountdown: data.showCountdown,
      rsvpEnabled: data.rsvpEnabled,
      invitationId: data.invitationId || null,
    };

    // Always save to sessionStorage (for same-tab and cloned-tab scenarios)
    saveSessionData(previewData);

    // Also save to localStorage as fallback (shared across all tabs reliably)
    localStorage.setItem(
      `invitation-draft-${numTemplateId}-new`,
      JSON.stringify({ ...data, ...previewData }),
    );

    // Navigate to preview in same tab
    navigate(`/create/${numTemplateId}/preview`);
  };

  // Get template theme for styling
  const theme = getTemplateTheme(effectiveTemplateId);
  const metadata = getTemplateMetadata(effectiveTemplateId);

  const isLoading =
    loading ||
    (!editMode && (templateLoading || demoDataLoading)) ||
    (!editMode && !sessionInitialized);

  // Loading state
  if (isLoading || !TemplateComp) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="font-body text-sm text-muted-foreground">
          {editMode ? "Loading your invitation..." : "Loading template..."}
        </p>
      </div>
    );
  }

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Dev mode indicator */}
      {isDevMode && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 text-amber-950 text-center font-body text-xs py-1">
          DEV MODE - Payment checks bypassed
        </div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && publishedUrl && (
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

              <div className="text-6xl text-center mb-4 animate-bounce">🎉</div>
              <h2 className="font-heading text-2xl font-bold text-center mb-2">
                Your Invitation is LIVE!
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">
                Share it with your guests
              </p>

              <div className="bg-muted rounded-xl p-3 mb-6">
                <p className="font-body text-xs text-muted-foreground break-all select-all text-center">
                  {publishedUrl}
                </p>
              </div>

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
                  href={`https://wa.me/?text=${encodeURIComponent(`You're invited! Open our wedding invitation: ${publishedUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 text-white font-body font-medium px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                >
                  <Heart size={16} /> Share on WhatsApp
                </a>

                <button
                  onClick={() => window.open(publishedUrl, "_blank")}
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

      {/* Template in Edit Mode */}
      <div className={isDevMode ? "pt-6" : ""}>
        <TemplateComp
          mode="edit"
          data={data}
          onUpdate={updateData}
          onSaveDraft={saveDraft}
          onPublish={publish}
          isSaving={isSaving}
          isPublishing={isPublishing}
          templateId={numTemplateId}
          sessionUUID={sessionUUID}
          uploadStage={
            !data.invitationId
              ? "temp"
              : data.status === "PUBLISHED"
                ? "published"
                : "draft"
          }
        />
      </div>

      {/* Edit Mode Toolbar */}
      <EditModeToolbar
        onSaveDraft={saveDraft}
        onPublish={publish}
        onPreview={handlePreview}
        isSaving={isSaving}
        isPublishing={isPublishing}
        invitationId={data.invitationId}
        hasUnsavedChanges={isDirty}
        showPreviewMode={!publishedUrl}
      />
    </div>
  );
};

export default CreateInvitationPage;
