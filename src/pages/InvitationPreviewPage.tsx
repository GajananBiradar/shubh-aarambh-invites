import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getInvitationPreview } from "@/api/invitations";
import { SAMPLE_INVITATION } from "@/mock/sampleInvitation";
import {
  getTemplateComponent,
  getTemplateTheme,
  getTemplateMetadata,
} from "@/templates";
import { InvitationData, TemplateComponent } from "@/templates/types";
import FloatingMusicPlayer from "@/components/invitation/FloatingMusicPlayer";
import {
  Loader2,
  Pencil,
  Sparkles,
  Copy,
  Heart,
  Eye,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "@/api/axios";

const InvitationPreviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(
    null,
  );
  const isDevMode = import.meta.env.VITE_DEV_MODE === "true";

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInvitationPreview(id!);
        setInvitation(data);
      } catch {
        setInvitation(SAMPLE_INVITATION);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  // Load template component dynamically
  useEffect(() => {
    const loadTemplate = async () => {
      if (!invitation) return;
      setTemplateLoading(true);
      try {
        const templateId =
          invitation.template?.id?.toString() ||
          invitation.templateId?.toString() ||
          "1";
        const component = await getTemplateComponent(templateId);
        if (component) {
          setTemplateComp(() => component);
        } else {
          toast.error("Template not found");
          setTemplateComp(null);
        }
      } catch (error) {
        console.error("Failed to load template component:", error);
        toast.error("Failed to load template");
        setTemplateComp(null);
      } finally {
        setTemplateLoading(false);
      }
    };

    loadTemplate();
  }, [invitation]);

  const handlePublish = async () => {
    if (!invitation || !id) return;
    setPublishing(true);

    try {
      const templateId = invitation.template?.id || invitation.templateId;

      // Check payment
      const { data: payCheck } = await api.get(
        `/api/payments/check?templateId=${templateId}`,
      );

      if (!payCheck.requiresPayment) {
        // Free to publish
        const { data: pubRes } = await api.post(
          `/api/invitations/${id}/publish`,
        );
        const publicUrl = pubRes.publicUrl || "";
        const fullUrl = publicUrl.startsWith("http")
          ? publicUrl
          : `${window.location.origin}${publicUrl}`;
        setPublishedUrl(fullUrl);
        setShowSuccessModal(true);
        toast.success("Your invitation is now live!");
      } else {
        // Payment required
        toast("Payment is required to publish this template.", { icon: "💳" });
      }
    } catch (error: any) {
      // Dev mode fallback: try direct publish
      if (isDevMode) {
        try {
          // Dev bypass
          const templateId = invitation.template?.id || invitation.templateId;
          await api.post("/api/payments/dev-bypass", {
            templateId,
            bypassToken: import.meta.env.VITE_DEV_BYPASS_TOKEN,
          });
          const { data: pubRes } = await api.post(
            `/api/invitations/${id}/publish`,
          );
          const publicUrl = pubRes.publicUrl || "";
          const fullUrl = publicUrl.startsWith("http")
            ? publicUrl
            : `${window.location.origin}${publicUrl}`;
          setPublishedUrl(fullUrl);
          setShowSuccessModal(true);
          toast.success("Your invitation is now live! (Dev bypass)");
        } catch {
          toast.error("Could not publish. Please try again.");
        }
      } else {
        toast.error("Could not publish. Please try again.");
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publishedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading || templateLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!invitation || !TemplateComp) return null;

  const effectiveMusicUrl =
    (invitation as any).effectiveMusicUrl || invitation.musicUrl;

  // Build invitation data for template component
  const templateTheme = getTemplateTheme(
    (invitation.template?.id || invitation.templateId || 1).toString(),
  );

  // Build invitation data in the format expected by template components
  const invitationData: InvitationData = {
    invitationId: parseInt(id || "0") || null,
    templateId: invitation.template?.id || invitation.templateId || 1,
    templateSlug: templateTheme,
    brideName: invitation.brideName || "",
    groomName: invitation.groomName || "",
    brideBio: invitation.invitationData?.bride_bio || invitation.brideBio || "",
    groomBio: invitation.invitationData?.groom_bio || invitation.groomBio || "",
    couplePhotoUrl: invitation.couplePhotoUrl || null,
    hashtag: invitation.invitationData?.hashtag || invitation.hashtag || "",
    welcomeMessage:
      invitation.invitationData?.welcome_message ||
      invitation.welcomeMessage ||
      "",
    showCountdown: invitation.invitationData?.show_countdown !== false,
    weddingDate:
      invitation.invitationData?.wedding_date || invitation.weddingDate || "",
    events: (invitation.events || []).map((e: any, i: number) => ({
      id: e.id || i,
      eventName: e.eventName || "",
      eventDate: e.eventDate || e.date || "",
      eventTime: e.eventTime || e.time || "",
      venueName: e.venueName || "",
      venueAddress: e.venueAddress || "",
      mapsUrl: e.mapsUrl || null,
    })),
    galleryPhotos: (invitation.galleryPhotos || []).map((p: any, i: number) => ({
      photoUrl: typeof p === "string" ? p : p.photoUrl,
      sortOrder: i,
      isDefault: false,
    })),
    musicUrl: invitation.musicUrl || null,
    musicName: invitation.musicName || null,
    effectiveMusicUrl: effectiveMusicUrl,
    effectiveMusicName: invitation.musicName || "",
    locale: "en",
    slug: invitation.slug || "",
    accessCode: invitation.accessCode || invitation.code || null,
    status: invitation.status || "DRAFT",
    templateDefaults: {
      defaultPhotos: invitation.template?.defaultPhotos || [],
      defaultMusicUrl: invitation.template?.defaultMusicUrl || "",
      defaultMusicName: invitation.template?.defaultMusicName || "",
      defaultVideoUrl: null,
    },
  };

  const isFree = invitation.template?.isFree;
  const priceInr = invitation.template?.priceInr || 0;

  return (
    <div>
      {/* Dev mode banner */}
      {isDevMode && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[hsl(45,100%,50%)] text-[hsl(45,80%,15%)] font-body text-xs px-4 py-1.5 text-center font-medium">
          🛠 DEV MODE — Payment Bypassed
        </div>
      )}

      {/* Fixed Top bar overlay */}
      <div
        className={`fixed ${isDevMode ? "top-7" : "top-0"} left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border h-12 flex items-center justify-between px-4`}
      >
        <button
          onClick={() => navigate(`/edit/${id}`)}
          className="flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back to Edit
        </button>
        <span className="font-body text-sm text-foreground">
          ✦ Preview — This is exactly how your guests will see it
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="btn-outline-accent px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`${isFree ? "btn-emerald" : "btn-gold"} px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50`}
          >
            {publishing ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Sparkles size={12} />{" "}
                {isFree
                  ? "Publish Now — It's Free!"
                  : `Buy & Publish — ₹${priceInr}`}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render the dynamically loaded template component */}
      <div className={isDevMode ? "pt-7" : ""}>
        <TemplateComp
          mode="view"
          data={invitationData}
          onUpdate={() => {}} // No-op for preview mode
          onSaveDraft={async () => null} // No-op for preview mode
          onPublish={handlePublish}
          isSaving={false}
          isPublishing={publishing}
        />
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/dashboard");
                }}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
              <div className="text-6xl text-center mb-4 animate-bounce">🎉</div>
              <h2 className="font-heading text-2xl font-bold text-center mb-2">
                Your Invitation is LIVE!
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">
                Share it with your loved ones
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
                  className="bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] font-body font-medium px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Heart size={16} /> Share on WhatsApp
                </a>
                <button
                  onClick={() => window.open(publishedUrl, "_blank")}
                  className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> View Live Invitation
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate("/dashboard");
                  }}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvitationPreviewPage;
