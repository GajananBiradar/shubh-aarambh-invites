import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { SAMPLE_TEMPLATES } from "@/mock/sampleInvitation";
import PageWrapper from "@/components/layout/PageWrapper";
import { slugify } from "@/utils/slugify";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Check,
  Copy,
  ChevronRight,
  ChevronLeft,
  Music,
  Upload,
  Pencil,
  Loader2,
  Eye,
  Save,
  Sparkles,
  X,
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  User,
  Heart,
  MessageSquare,
  Timer,
} from "lucide-react";
import { WeddingEvent } from "@/types";
import {
  useFormPersistence,
  clearFormPersistence,
} from "@/hooks/useFormPersistence";
import api from "@/api/axios";

const PRESET_EVENTS = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"];

const step1Schema = z.object({
  brideName: z.string().min(2, "Required"),
  groomName: z.string().min(2, "Required"),
  brideBio: z.string().max(100).optional(),
  groomBio: z.string().max(100).optional(),
  hashtag: z.string().optional(),
  slug: z.string().min(2),
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "—";
  try {
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
};

interface CreateInvitationPageProps {
  editMode?: boolean;
  editData?: any;
  editInvitationId?: string;
}

const CreateInvitationPage = ({ editMode, editData, editInvitationId }: CreateInvitationPageProps = {}) => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const [step, setStep] = useState(1);
  const [events, setEvents] = useState<WeddingEvent[]>([
    {
      eventName: "Wedding",
      date: "",
      time: "",
      venueName: "",
      venueAddress: "",
      mapsUrl: "",
    },
  ]);
  // Track which events use custom name input
  const [customEventFlags, setCustomEventFlags] = useState<boolean[]>([false]);

  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [musicUrl, setMusicUrl] = useState("");
  const [musicName, setMusicName] = useState("");
  const [musicMode, setMusicMode] = useState<"upload" | "url">("url");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [showCountdown, setShowCountdown] = useState(true);
  const [weddingDate, setWeddingDate] = useState("");
  const [couplePhotoUrl, setCouplePhotoUrl] = useState("");

  const [invitationId, setInvitationId] = useState<string | null>(editInvitationId || null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingPreview, setSavingPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const effectiveTemplateId = editData?.template?.id?.toString() || templateId || "1";
  const template =
    SAMPLE_TEMPLATES.find((t) => t.id === effectiveTemplateId) || SAMPLE_TEMPLATES[0];
  const isDevMode = import.meta.env.VITE_DEV_MODE === "true";

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      brideName: "",
      groomName: "",
      brideBio: "",
      groomBio: "",
      hashtag: "",
      slug: "",
    },
  });

  const groomName = watch("groomName");
  const brideName = watch("brideName");
  const brideBio = watch("brideBio");
  const groomBio = watch("groomBio");
  const hashtag = watch("hashtag");
  const slug = watch("slug");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Pre-populate from editData
  useEffect(() => {
    if (editMode && editData) {
      setValue("brideName", editData.brideName || "");
      setValue("groomName", editData.groomName || "");
      setValue("brideBio", editData.invitationData?.bride_bio || "");
      setValue("groomBio", editData.invitationData?.groom_bio || "");
      setValue("hashtag", editData.invitationData?.hashtag || "");
      setValue("slug", editData.slug || "");
      setWeddingDate(editData.invitationData?.wedding_date || "");
      setCouplePhotoUrl(editData.couplePhotoUrl || "");
      setWelcomeMessage(editData.invitationData?.welcome_message || "");
      setShowCountdown(editData.invitationData?.show_countdown !== false);
      setMusicUrl(editData.musicUrl || "");
      setMusicName(editData.musicName || "");

      if (editData.events && Array.isArray(editData.events)) {
        const mappedEvents = editData.events.map((e: any) => ({
          eventName: e.eventName || "",
          date: e.eventDate || "",
          time: e.eventTime ? e.eventTime.substring(0, 5) : "",
          venueName: e.venueName || "",
          venueAddress: e.venueAddress || "",
          mapsUrl: e.mapsUrl || "",
        }));
        setEvents(mappedEvents.length > 0 ? mappedEvents : [{ eventName: "Wedding", date: "", time: "", venueName: "", venueAddress: "", mapsUrl: "" }]);
        
        // Set custom flags for non-preset event names
        const flags = mappedEvents.map((e: any) => !PRESET_EVENTS.includes(e.eventName) && e.eventName !== "");
        setCustomEventFlags(flags.length > 0 ? flags : [false]);
      }

      if (editData.galleryPhotos && Array.isArray(editData.galleryPhotos)) {
        setGalleryPhotos(editData.galleryPhotos.map((p: any) => p.photoUrl || p));
      }

      if (editInvitationId) {
        setInvitationId(editInvitationId);
      }
    }
  }, [editMode, editData, editInvitationId, setValue]);

  const formData = {
    step, brideName, groomName, brideBio, groomBio, hashtag, slug,
    events, galleryPhotos, musicUrl, musicName, musicMode,
    welcomeMessage, showCountdown, weddingDate, couplePhotoUrl, invitationId,
  };

  const handleRestoreFormData = useCallback(
    (data: any) => {
      try {
        if (data.step) setStep(data.step);
        if (data.brideName) setValue("brideName", data.brideName);
        if (data.groomName) setValue("groomName", data.groomName);
        if (data.brideBio) setValue("brideBio", data.brideBio);
        if (data.groomBio) setValue("groomBio", data.groomBio);
        if (data.hashtag) setValue("hashtag", data.hashtag);
        if (data.slug) setValue("slug", data.slug);
        if (data.events && Array.isArray(data.events)) setEvents(data.events);
        if (data.galleryPhotos && Array.isArray(data.galleryPhotos))
          setGalleryPhotos(data.galleryPhotos);
        if (data.musicUrl) setMusicUrl(data.musicUrl);
        if (data.musicName) setMusicName(data.musicName);
        if (data.musicMode) setMusicMode(data.musicMode);
        if (data.welcomeMessage) setWelcomeMessage(data.welcomeMessage);
        if (data.hasOwnProperty("showCountdown"))
          setShowCountdown(data.showCountdown);
        if (data.weddingDate) setWeddingDate(data.weddingDate);
        if (data.couplePhotoUrl) setCouplePhotoUrl(data.couplePhotoUrl);
        if (data.invitationId) setInvitationId(data.invitationId);
        toast.success("Form data restored!");
      } catch (error) {
        console.error("Failed to restore form data:", error);
      }
    },
    [setValue],
  );

  const STORAGE_KEY = `invitation_form_${editMode ? 'edit_' + editInvitationId : templateId}`;
  useFormPersistence({
    storageKey: STORAGE_KEY,
    data: formData,
    onRestore: editMode ? undefined : handleRestoreFormData,
  });

  // Auto-generate slug and hashtag
  useEffect(() => {
    if (!editMode && groomName && brideName) {
      const generatedSlug = slugify(groomName, brideName);
      setValue("slug", generatedSlug);
      setValue(
        "hashtag",
        `#${groomName.split(" ")[0]}Weds${brideName.split(" ")[0]}`,
      );
    }
  }, [groomName, brideName, setValue, editMode]);

  const addEvent = () => {
    if (events.length >= 8) {
      toast.error("Maximum 8 events");
      return;
    }
    setEvents([
      ...events,
      { eventName: "", date: "", time: "", venueName: "", venueAddress: "", mapsUrl: "" },
    ]);
    setCustomEventFlags([...customEventFlags, false]);
  };

  const removeEvent = (i: number) => {
    if (events.length <= 1) return;
    setEvents(events.filter((_, idx) => idx !== i));
    setCustomEventFlags(customEventFlags.filter((_, idx) => idx !== i));
  };

  const updateEvent = (i: number, field: keyof WeddingEvent, value: string) => {
    const updated = [...events];
    updated[i] = { ...updated[i], [field]: value };
    setEvents(updated);
  };

  const setCustomFlag = (i: number, isCustom: boolean) => {
    const flags = [...customEventFlags];
    flags[i] = isCustom;
    setCustomEventFlags(flags);
    if (!isCustom) {
      // Clear custom name, user will pick from dropdown
      updateEvent(i, "eventName", "");
    }
  };

  const handleEventTypeChange = (i: number, value: string) => {
    if (value === "Custom") {
      setCustomFlag(i, true);
      updateEvent(i, "eventName", "");
    } else {
      setCustomFlag(i, false);
      updateEvent(i, "eventName", value);
    }
  };

  const addMockPhotos = () => {
    setGalleryPhotos([
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600",
    ]);
    toast.success("Sample photos added (dev mode)");
  };

  const buildRequestBody = () => {
    const defaultWelcome = `Together with their families, ${groomName || "[Groom]"} & ${brideName || "[Bride]"} joyfully invite you to be part of their celebration of love.`;
    return {
      templateId: parseInt(effectiveTemplateId),
      locale: "en",
      brideName: brideName || "",
      groomName: groomName || "",
      couplePhotoUrl: couplePhotoUrl || null,
      musicUrl: musicUrl || null,
      musicName: musicName || null,
      invitationData: {
        bride_bio: brideBio || null,
        groom_bio: groomBio || null,
        hashtag: hashtag || null,
        welcome_message: welcomeMessage || defaultWelcome,
        show_countdown: showCountdown,
        slug: slug || null,
        wedding_date: weddingDate || null,
      },
      events: events
        .filter((e) => e.eventName)
        .map((e) => ({
          eventName: e.eventName,
          eventDate: e.date || null,
          eventTime: e.time ? (e.time.length === 5 ? `${e.time}:00` : e.time) : null,
          venueName: e.venueName || null,
          venueAddress: e.venueAddress || null,
          mapsUrl: e.mapsUrl || null,
        })),
      galleryPhotos: galleryPhotos.map((url, idx) => ({
        photoUrl: url,
        sortOrder: idx,
      })),
    };
  };

  const handleApiError = (error: any) => {
    setApiErrors([]);
    if (!error.response) {
      toast.error("Connection failed. Check your internet and try again.");
      return;
    }
    const status = error.response.status;
    switch (status) {
      case 401:
        logout();
        navigate("/login");
        toast.error("Session expired. Please login again.");
        break;
      case 402:
        if (invitationId) {
          window.open(`/invitations/${invitationId}/preview`, "_blank");
          toast.error("Please complete payment to publish.");
        }
        break;
      default:
        toast.error("Server error. Please try again in a moment.");
        break;
    }
  };

  const saveInvitation = async (): Promise<string | null> => {
    try {
      const body = buildRequestBody();
      if (invitationId) {
        const res = await api.put(`/api/invitations/${invitationId}`, body);
        return res.data.id?.toString() || invitationId;
      } else {
        const res = await api.post("/api/invitations", body);
        const newId = res.data.id?.toString();
        setInvitationId(newId);
        return newId;
      }
    } catch (error: any) {
      handleApiError(error);
      return null;
    }
  };

  const handleSaveDraft = async () => {
    setApiErrors([]);
    setSavingDraft(true);
    const savedId = await saveInvitation();
    setSavingDraft(false);
    if (savedId) {
      clearFormPersistence(STORAGE_KEY);
      toast.success(invitationId ? "Draft updated!" : "Draft saved! You can find it in your dashboard.");
      navigate("/dashboard");
    }
  };

  const handlePreview = async () => {
    setApiErrors([]);
    setSavingPreview(true);
    const savedId = await saveInvitation();
    setSavingPreview(false);
    if (savedId) {
      window.open(`/invitations/${savedId}/preview`, "_blank");
    }
  };

  const handlePublish = async () => {
    setApiErrors([]);
    setPublishing(true);

    const savedId = await saveInvitation();
    if (!savedId) {
      setPublishing(false);
      return;
    }

    try {
      const paymentCheck = await api.get(`/api/payments/check?templateId=${effectiveTemplateId}`);
      const { requiresPayment } = paymentCheck.data;

      if (requiresPayment === false) {
        const publishRes = await api.post(`/api/invitations/${savedId}/publish`);
        const publicUrl = publishRes.data.publicUrl || "";
        const fullUrl = publicUrl.startsWith("http") ? publicUrl : `${window.location.origin}${publicUrl}`;
        setPublishedUrl(fullUrl);
        setShowSuccessModal(true);
        clearFormPersistence(STORAGE_KEY);
        toast.success("Your invitation is now live!");
      } else {
        // Payment required - open preview in new tab
        window.open(`/invitations/${savedId}/preview`, "_blank");
        toast("Preview your invitation then complete payment to publish.", { icon: "💳" });
      }
    } catch (error: any) {
      // If payment check fails in dev mode, try direct publish
      if (isDevMode) {
        try {
          const publishRes = await api.post(`/api/invitations/${savedId}/publish`);
          const publicUrl = publishRes.data.publicUrl || "";
          const fullUrl = publicUrl.startsWith("http") ? publicUrl : `${window.location.origin}${publicUrl}`;
          setPublishedUrl(fullUrl);
          setShowSuccessModal(true);
          clearFormPersistence(STORAGE_KEY);
          toast.success("Your invitation is now live!");
        } catch (pubError: any) {
          handleApiError(pubError);
        }
      } else {
        handleApiError(error);
      }
    }
    setPublishing(false);
  };

  const handleCopyLink = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isAnyLoading = savingDraft || savingPreview || publishing;
  const steps = ["Couple Details", "Events", "Gallery & Music", "Review & Publish"];

  const SuccessModal = () => {
    const whatsappMsg = encodeURIComponent(
      `You're invited! Open our wedding invitation: ${publishedUrl}`,
    );
    return showSuccessModal ? (
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
            onClick={() => { setShowSuccessModal(false); navigate("/dashboard"); }}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
          <div className="text-6xl text-center mb-4 animate-bounce">🎉</div>
          <h2 className="font-heading text-2xl font-bold text-center mb-2">Your Invitation is LIVE!</h2>
          <p className="font-body text-sm text-muted-foreground text-center mb-6">Share it with your guests</p>

          <div className="bg-muted rounded-xl p-3 mb-6">
            <p className="font-body text-xs text-muted-foreground break-all select-all text-center">{publishedUrl}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={handleCopyLink} className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
              {copiedLink ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
            </button>
            <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
              className="bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] font-body font-medium px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
              <Heart size={16} /> Share on WhatsApp
            </a>
            <button onClick={() => window.open(publishedUrl, "_blank")}
              className="btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
              <Eye size={16} /> View My Invitation
            </button>
            <button onClick={() => { setShowSuccessModal(false); navigate("/dashboard"); }}
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null;
  };

  return (
    <PageWrapper>
      <SuccessModal />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {isDevMode && (
          <div className="bg-[hsl(45,100%,90%)] border border-[hsl(45,100%,70%)] text-[hsl(45,80%,20%)] font-body text-xs px-4 py-2 rounded-xl mb-6 text-center">
            DEV MODE — Payment check bypassed. Remove before going live.
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={i} className={`flex items-center gap-1.5 font-body text-xs ${i + 1 <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i + 1 <= step ? <Check size={12} /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <h2 className="font-heading text-xl font-bold">Couple Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Bride's Name *</label>
                <input {...register("brideName")} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Priya Sharma" />
                {errors.brideName && <p className="text-destructive text-xs mt-1 font-body">{errors.brideName.message}</p>}
              </div>
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Groom's Name *</label>
                <input {...register("groomName")} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Rahul Mehta" />
                {errors.groomName && <p className="text-destructive text-xs mt-1 font-body">{errors.groomName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Bride's Bio <span className="text-muted-foreground">({(brideBio || "").length}/100)</span></label>
                <input {...register("brideBio")} maxLength={100} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Software engineer & chai lover" />
              </div>
              <div>
                <label className="font-body text-sm font-medium block mb-1.5">Groom's Bio <span className="text-muted-foreground">({(groomBio || "").length}/100)</span></label>
                <input {...register("groomBio")} maxLength={100} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Architect who draws buildings & hearts" />
              </div>
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Wedding Date</label>
              <input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Hashtag</label>
              <input {...register("hashtag")} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">URL Slug</label>
              <input {...register("slug")} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p className="font-body text-xs text-muted-foreground mt-1">Preview: {window.location.origin}/XXXXX/invite/{slug || "your-slug"}</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(2)} className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2 - Events */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <h2 className="font-heading text-xl font-bold">Events</h2>
            {events.map((event, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-muted-foreground font-medium">Event {i + 1}</span>
                  {events.length > 1 && (
                    <button onClick={() => removeEvent(i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Event name: dropdown or custom text input */}
                {customEventFlags[i] ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        value={event.eventName}
                        onChange={(e) => updateEvent(i, "eventName", e.target.value)}
                        placeholder="Enter ceremony name (e.g. Baraat, Griha Pravesh...)"
                        maxLength={50}
                        className="flex-1 rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        onClick={() => setCustomFlag(i, false)}
                        className="font-body text-xs text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        <X size={12} /> Change
                      </button>
                    </div>
                    {event.eventName.length > 0 && event.eventName.length < 2 && (
                      <p className="text-destructive text-xs font-body">Please enter a ceremony name (min 2 characters)</p>
                    )}
                  </div>
                ) : (
                  <select
                    value={PRESET_EVENTS.includes(event.eventName) ? event.eventName : ""}
                    onChange={(e) => handleEventTypeChange(i, e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select event type</option>
                    {PRESET_EVENTS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                    <option value="Custom">Custom...</option>
                  </select>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={event.date} onChange={(e) => updateEvent(i, "date", e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input type="time" value={event.time} onChange={(e) => updateEvent(i, "time", e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <input value={event.venueName} onChange={(e) => updateEvent(i, "venueName", e.target.value)} placeholder="Venue name"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <textarea value={event.venueAddress} onChange={(e) => updateEvent(i, "venueAddress", e.target.value)} placeholder="Venue address" rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                <input value={event.mapsUrl} onChange={(e) => updateEvent(i, "mapsUrl", e.target.value)} placeholder="Google Maps URL"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            ))}
            <button onClick={addEvent} className="btn-outline-accent w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
              <Plus size={16} /> Add Event
            </button>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(3)} className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="font-heading text-xl font-bold">Gallery & Music</h2>
            <div>
              <h3 className="font-body text-sm font-medium mb-3">Photos</h3>
              {galleryPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {galleryPhotos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setGalleryPhotos(galleryPhotos.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-destructive/80 text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={addMockPhotos}
                className="w-full border-2 border-dashed border-border rounded-2xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors">
                <Upload size={24} />
                <span className="font-body text-sm">Drop photos here or click to browse</span>
                <span className="font-body text-xs">(Dev: click to add sample photos)</span>
              </button>
            </div>
            <div>
              <h3 className="font-body text-sm font-medium mb-3">Background Music</h3>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setMusicMode("url")}
                  className={`px-4 py-1.5 rounded-lg font-body text-xs border transition-colors ${musicMode === "url" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                  Paste URL
                </button>
                <button onClick={() => setMusicMode("upload")}
                  className={`px-4 py-1.5 rounded-lg font-body text-xs border transition-colors ${musicMode === "upload" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                  Upload MP3
                </button>
              </div>
              {musicMode === "url" ? (
                <input value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="Paste music URL"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              ) : (
                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center text-muted-foreground font-body text-sm">
                  <Music size={24} className="mx-auto mb-2" />
                  Upload MP3 (max 5MB) — coming in production
                </div>
              )}
              <input value={musicName} onChange={(e) => setMusicName(e.target.value)} placeholder="Song name (optional)"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mt-3" />
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(4)} className="btn-gold px-6 py-2.5 rounded-xl text-sm flex items-center gap-1.5">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4 - Review & Publish */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="font-heading text-xl font-bold">Review & Publish</h2>

            {apiErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                <p className="font-body text-sm text-destructive font-medium mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside font-body text-sm text-destructive space-y-1">
                  {apiErrors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Welcome Message <span className="text-muted-foreground">({welcomeMessage.length}/300)</span></label>
              <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value.slice(0, 300))}
                placeholder={`Together with their families, ${groomName || "[Groom]"} & ${brideName || "[Bride]"} joyfully invite you to be part of their celebration of love.`}
                rows={3} className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
              <span className="font-body text-sm">Show Countdown Timer</span>
              <button onClick={() => setShowCountdown(!showCountdown)}
                className={`w-12 h-6 rounded-full transition-colors relative ${showCountdown ? "bg-accent" : "bg-muted"}`}>
                <div className={`w-5 h-5 bg-card rounded-full absolute top-0.5 transition-all shadow-sm ${showCountdown ? "left-6" : "left-0.5"}`} />
              </button>
            </div>

            {/* Summary Cards */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  <h3 className="font-heading text-base font-semibold">Couple Details</h3>
                </div>
                <button onClick={() => setStep(1)} className="font-body text-xs text-primary hover:underline flex items-center gap-1"><Pencil size={12} /> Edit</button>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-body text-sm">
                  <span className="text-muted-foreground">Bride</span><span>{brideName || "—"}</span>
                  <span className="text-muted-foreground">Groom</span><span>{groomName || "—"}</span>
                  {brideBio && <><span className="text-muted-foreground">Bride's Bio</span><span className="text-muted-foreground italic">{brideBio}</span></>}
                  {groomBio && <><span className="text-muted-foreground">Groom's Bio</span><span className="text-muted-foreground italic">{groomBio}</span></>}
                  {hashtag && <><span className="text-muted-foreground">Hashtag</span><span className="text-primary">{hashtag}</span></>}
                  <span className="text-muted-foreground">URL Slug</span><span className="text-xs break-all">/.../{slug || "your-slug"}</span>
                </div>
                {couplePhotoUrl && <div className="mt-3"><img src={couplePhotoUrl} alt="Couple" className="w-20 h-20 rounded-xl object-cover" /></div>}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <h3 className="font-heading text-base font-semibold">Ceremonies</h3>
                  <span className="font-body text-xs text-muted-foreground">({events.filter((e) => e.eventName).length} added)</span>
                </div>
                <button onClick={() => setStep(2)} className="font-body text-xs text-primary hover:underline flex items-center gap-1"><Pencil size={12} /> Edit</button>
              </div>
              <div className="p-5 space-y-4">
                {events.filter((e) => e.eventName).length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No ceremonies added yet.</p>
                ) : (
                  events.filter((e) => e.eventName).map((event, i) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-4 space-y-1">
                      <p className="font-body text-sm font-medium">{event.eventName}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-muted-foreground">
                        {event.date && <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(event.date)}</span>}
                        {event.time && <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(event.time)}</span>}
                        {event.venueName && <span className="flex items-center gap-1"><MapPin size={12} /> {event.venueName}</span>}
                      </div>
                      {event.venueAddress && <p className="font-body text-xs text-muted-foreground">{event.venueAddress}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary" />
                  <h3 className="font-heading text-base font-semibold">Gallery & Music</h3>
                </div>
                <button onClick={() => setStep(3)} className="font-body text-xs text-primary hover:underline flex items-center gap-1"><Pencil size={12} /> Edit</button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-2">Photos ({galleryPhotos.length})</p>
                  {galleryPhotos.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {galleryPhotos.slice(0, 5).map((photo, i) => <img key={i} src={photo} alt="" className="w-14 h-14 rounded-lg object-cover" />)}
                      {galleryPhotos.length > 5 && <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center font-body text-xs text-muted-foreground">+{galleryPhotos.length - 5}</div>}
                    </div>
                  ) : <p className="font-body text-sm text-muted-foreground">No photos added yet.</p>}
                </div>
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">Music</p>
                  {musicName || musicUrl ? (
                    <div className="flex items-center gap-2"><Music size={14} className="text-primary" /><span className="font-body text-sm">{musicName || "Custom music"}</span></div>
                  ) : <p className="font-body text-sm text-muted-foreground italic">Default template music will be used</p>}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  <h3 className="font-heading text-base font-semibold">Additional Details</h3>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {welcomeMessage && (
                  <div className="bg-muted/50 rounded-xl p-4 border-l-2 border-primary/30">
                    <p className="font-body text-sm italic text-muted-foreground">"{welcomeMessage}"</p>
                  </div>
                )}
                <div className="flex items-center gap-2 font-body text-sm">
                  <Timer size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Countdown Timer:</span>
                  <span className={showCountdown ? "text-primary" : "text-muted-foreground"}>{showCountdown ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="flex items-center gap-2 font-body text-sm">
                  <span className="text-muted-foreground">Template:</span>
                  <span>{template.name}</span>
                </div>
              </div>
            </div>

            {/* Button Bar */}
            <div className="border-t border-border pt-6 mt-6">
              <div className="hidden sm:flex items-center justify-between gap-3">
                <button onClick={() => setStep(3)} disabled={isAnyLoading} className="btn-outline-accent px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 disabled:opacity-50">
                  <ChevronLeft size={16} /> Back
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveDraft} disabled={isAnyLoading} className="btn-outline-accent px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
                    {savingDraft ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Draft</>}
                  </button>
                  <button onClick={handlePreview} disabled={isAnyLoading}
                    className="bg-secondary text-secondary-foreground font-body font-medium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 hover:bg-secondary/80 transition-colors">
                    {savingPreview ? <><Loader2 size={16} className="animate-spin" /> Loading Preview...</> : <><Eye size={16} /> Preview</>}
                  </button>
                  <button onClick={handlePublish} disabled={isAnyLoading} className="btn-gold px-6 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
                    {publishing ? <><Loader2 size={16} className="animate-spin" /> Publishing...</> : <><Sparkles size={16} /> Publish</>}
                  </button>
                </div>
              </div>
              <div className="sm:hidden flex flex-col gap-3">
                <button onClick={handlePublish} disabled={isAnyLoading} className="btn-gold w-full px-6 py-3 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-50">
                  {publishing ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : <><Sparkles size={18} /> Publish</>}
                </button>
                <button onClick={handlePreview} disabled={isAnyLoading}
                  className="bg-secondary text-secondary-foreground font-body font-medium w-full px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-secondary/80 transition-colors">
                  {savingPreview ? <><Loader2 size={16} className="animate-spin" /> Loading Preview...</> : <><Eye size={16} /> Preview My Invitation</>}
                </button>
                <button onClick={handleSaveDraft} disabled={isAnyLoading} className="btn-outline-accent w-full px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {savingDraft ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save as Draft</>}
                </button>
                <button onClick={() => setStep(3)} disabled={isAnyLoading}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-2">
                  <ChevronLeft size={16} /> Back to Gallery & Music
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default CreateInvitationPage;
