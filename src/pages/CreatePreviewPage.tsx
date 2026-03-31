/**
 * CreatePreviewPage — Preview tab for create flow
 * Reads data from sessionStorage, shows invitation in view mode
 * User can "Save as Draft" or go back to editing
 * NO database API calls until "Save as Draft" is clicked
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  getTemplateComponent,
  getTemplateTheme,
  getTemplateMetadata,
} from "@/templates";
import {
  InvitationData,
  TemplateComponent,
  createEmptyInvitationData,
} from "@/templates/types";
import { Loader2, X, Check, Copy, Heart, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "@/api/axios";

interface SaveDraftResponse {
  id: number;
  accessCode: string;
  slug: string;
  publicUrl: string;
  status: string;
}

const CreatePreviewPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [data, setData] = useState<InvitationData | null>(null);
  const [invitationId, setInvitationId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const numTemplateId = parseInt(templateId || "1");
  const sessionKey = `session_${numTemplateId}`;

  // Load template component on mount
  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      try {
        const component = await getTemplateComponent(templateId);
        if (component) {
          setTemplateComp(() => component);
        } else {
          toast.error("Template not found");
          window.close();
        }
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  // Load form data from sessionStorage on mount
  useEffect(() => {
    const sessionData = sessionStorage.getItem(sessionKey);
    if (!sessionData) {
      toast.error("No form data found. Going back to editor...");
      setTimeout(() => window.close(), 2000);
      return;
    }

    try {
      const parsed = JSON.parse(sessionData);
      const theme = getTemplateTheme(templateId);
      const metadata = getTemplateMetadata(templateId);

      // Build invitation data from sessionStorage
      const invitationData: InvitationData = {
        invitationId: parsed.invitationId || null,
        templateId: numTemplateId,
        templateSlug: theme,
        brideName: parsed.brideName || "",
        groomName: parsed.groomName || "",
        brideBio: parsed.brideBio || "",
        groomBio: parsed.groomBio || "",
        couplePhotoUrl: parsed.couplePhotoUrl || null,
        bridePhotoUrl: parsed.bridePhotoUrl || null,
        groomPhotoUrl: parsed.groomPhotoUrl || null,
        hashtag: parsed.hashtag || "",
        welcomeMessage: parsed.welcomeMessage || "",
        showCountdown: parsed.showCountdown !== false,
        weddingDate: parsed.weddingDate || "",
        events: parsed.events || [],
        galleryPhotos: parsed.galleryPhotos || [],
        musicUrl: parsed.musicUrl || null,
        musicName: parsed.musicName || null,
        effectiveMusicUrl: parsed.musicUrl || parsed.effectiveMusicUrl || "",
        effectiveMusicName: parsed.musicName || parsed.effectiveMusicName || "",
        locale: "en",
        slug: "",
        accessCode: null,
        status: "DRAFT",
        templateDefaults: {
          defaultPhotos: parsed.templateDefaults?.defaultPhotos || [],
          defaultMusicUrl: parsed.templateDefaults?.defaultMusicUrl || "",
          defaultMusicName: parsed.templateDefaults?.defaultMusicName || "",
          defaultVideoUrl: parsed.templateDefaults?.defaultVideoUrl || null,
        },
      };

      setData(invitationData);
      setInvitationId(parsed.invitationId || null);
    } catch (error) {
      console.error("Failed to parse session data:", error);
      toast.error("Failed to load preview");
      window.close();
    }
  }, [sessionKey, numTemplateId, templateId]);

  // Handle Save as Draft
  const handleSaveDraft = async () => {
    if (!data) return;

    setSaving(true);
    try {
      // POST /api/invitations with all form data
      const payload: any = {
        templateId: data.templateId,
        brideName: data.brideName,
        groomName: data.groomName,
        bridePhotoUrl: data.bridePhotoUrl,
        groomPhotoUrl: data.groomPhotoUrl,
        couplePhotoUrl: data.couplePhotoUrl,
        events: data.events,
        galleryPhotos: data.galleryPhotos,
        musicUrl: data.musicUrl,
        musicName: data.musicName,
        invitationData: {
          hashtag: data.hashtag,
          welcome_message: data.welcomeMessage,
          wedding_date: data.weddingDate,
          show_countdown: data.showCountdown,
          bride_bio: data.brideBio,
          groom_bio: data.groomBio,
        },
      };

      const res = await api.post<SaveDraftResponse>(
        "/api/invitations",
        payload,
      );
      const newInvitationId = res.data.id;

      // Store invitationId in sessionStorage
      const sessionData = sessionStorage.getItem(sessionKey);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        parsed.invitationId = newInvitationId;
        sessionStorage.setItem(sessionKey, JSON.stringify(parsed));
      }

      // Clear the temp session entry and update state
      setInvitationId(newInvitationId);
      setShowSuccessModal(true);
      toast.success("Draft saved! 🎉");
    } catch (error: any) {
      console.error("Failed to save draft:", error);
      toast.error(
        error?.response?.data?.error || "Failed to save draft. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Back to Editing
  const handleBackToEditing = () => {
    window.close();
  };

  const theme = getTemplateTheme(templateId);

  if (loading || !TemplateComp || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="font-body text-sm text-muted-foreground">
          Loading preview...
        </p>
      </div>
    );
  }

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-background text-foreground preview-page-wrapper"
    >
      {/* Bump music player above the bottom toolbar */}
      <style>{`.preview-page-wrapper .fixed.bottom-6.right-6 { bottom: 5rem !important; }`}</style>

      {/* Preview Template in VIEW mode */}
      <div>
        <TemplateComp
          mode="view"
          data={data}
          onUpdate={() => {}} // No updates in view mode
          onSaveDraft={() => {}} // This shouldn't be called
          onPublish={() => {}} // This shouldn't be called
          isSaving={false}
          isPublishing={false}
        />
      </div>

      {/* Preview Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 max-w-4xl">
          <button
            onClick={handleBackToEditing}
            className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
            Back to Editing
          </button>

          {!showSuccessModal && (
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ✨
                  </motion.span>
                  Save as Draft
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && invitationId && (
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
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-6xl text-center mb-4 animate-bounce">🎉</div>
              <h2 className="font-heading text-2xl font-bold text-center mb-2">
                Draft Saved!
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">
                Your invitation has been saved as a draft. You can continue
                editing or publish when ready.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/edit/${invitationId}`)}
                  className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>✏️</span> Edit Invitation
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <span>📋</span> Go to Dashboard
                </button>

                <button
                  onClick={() => window.close()}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close This Tab
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreatePreviewPage;
