import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getTemplateComponent,
  getTemplateTheme,
  getTemplateMetadata,
} from "@/templates";
import { InvitationData, TemplateComponent } from "@/templates/types";
import { getTemplateById, getTemplateDemoData } from "@/api/templates";
import { loadTemplateDemoData, DemoDataOverrides } from "@/templates/demoData";
import { SAMPLE_TEMPLATES } from "@/mock/sampleInvitation";
import { usePayment } from "@/hooks/usePayment";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Sparkles } from "lucide-react";
import { formatTemplatePrice } from "@/lib/pricing";
import { isInvalidDefaultMusicUrl } from "@/lib/defaultMusic";

const MOBILE_PREVIEW_HEIGHT = 844;
const SHARED_TEMPLATE_MUSIC_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3";

const buildMapsUrl = (
  rawUrl: string | null | undefined,
  venueName?: string,
  venueAddress?: string,
) => {
  const normalizedUrl = rawUrl?.trim();
  if (
    normalizedUrl &&
    normalizedUrl !== "https://maps.google.com" &&
    normalizedUrl !== "http://maps.google.com"
  ) {
    return normalizedUrl;
  }

  const query = [venueName, venueAddress].filter(Boolean).join(", ").trim();
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null;
};

const TemplateDemoPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();
  const { triggerPaymentFlow } = usePayment();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [templateOverrides, setTemplateOverrides] = useState<DemoDataOverrides>(
    {},
  );
  const isEmbeddedPreview = searchParams.get("embed") === "1";
  const isFrameOnly = searchParams.get("frame") === "1";
  const showPageChrome = !isEmbeddedPreview && !isFrameOnly;
  const shouldMutePreviewMusic = isEmbeddedPreview;

  // Fetch real template data
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => getTemplateById(templateId || "1"),
    placeholderData: SAMPLE_TEMPLATES[0],
  });

  // Fetch real demo data
  const { data: demoData, isLoading: demoLoading } = useQuery({
    queryKey: ["template-demo", templateId],
    queryFn: () => getTemplateDemoData(templateId || "1"),
  });

  // Load template component + per-template demo data
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;

      setLoading(true);
      const [component, overrides] = await Promise.all([
        getTemplateComponent(templateId),
        loadTemplateDemoData(getTemplateTheme(templateId)),
      ]);
      if (component) {
        setTemplateComp(() => component);
      }
      setTemplateOverrides(overrides);
      setLoading(false);
    };

    loadTemplate();
  }, [templateId]);

  const isLoading = loading || templateLoading || demoLoading;

  // Build demo invitation data
  const theme = getTemplateTheme(templateId || "1");
  const metadata = getTemplateMetadata(templateId || "1");

  // Merge: API demoData > per-template overrides > generic defaults

  const effectiveGallery = demoData?.galleryPhotos ||
    demoData?.defaultPhotos ||
    templateOverrides.galleryPhotos || [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600",
    ];

  const effectiveEvents = templateOverrides.events ||
    demoData?.events || [
      {
        eventName: "Haldi",
        eventDate: "2027-02-11",
        eventTime: "10:00:00",
        venueName: "Sharma Residence",
        venueAddress: "Banjara Hills, Hyderabad",
        mapsUrl: "https://maps.google.com",
      },
      {
        eventName: "Mehendi",
        eventDate: "2027-02-12",
        eventTime: "17:00:00",
        venueName: "The Garden Club",
        venueAddress: "Jubilee Hills, Hyderabad",
        mapsUrl: "https://maps.google.com",
      },
      {
        eventName: "Sangeet",
        eventDate: "2027-02-13",
        eventTime: "19:00:00",
        venueName: "Taj Deccan",
        venueAddress: "Road No 1, Hyderabad",
        mapsUrl: "https://maps.google.com",
      },
      {
        eventName: "Wedding",
        eventDate: "2027-02-14",
        eventTime: "08:00:00",
        venueName: "Kalyana Mandapam",
        venueAddress: "Secunderabad, Hyderabad",
        mapsUrl: "https://maps.google.com",
      },
    ];

  const effectiveMusicUrl =
    (!isInvalidDefaultMusicUrl(demoData?.musicUrl) ? demoData?.musicUrl : null) ||
    (!isInvalidDefaultMusicUrl(templateOverrides.musicUrl) ? templateOverrides.musicUrl : null) ||
    (!isInvalidDefaultMusicUrl(templateOverrides.templateDefaults?.defaultMusicUrl) ? templateOverrides.templateDefaults?.defaultMusicUrl : null) ||
    SHARED_TEMPLATE_MUSIC_URL;
  const effectiveMusicName =
    templateOverrides.musicName ||
    (metadata?.name ? `${metadata.name} BGM` : "Wedding BGM");

  const defaultDefaults = templateOverrides.templateDefaults || {
    defaultPhotos: [] as { photoUrl: string; sortOrder: number }[],
    defaultMusicUrl: "",
    defaultMusicName: "",
    defaultVideoUrl: null,
  };

  const demoInvitationData: InvitationData = {
    invitationId: null,
    templateId: parseInt(templateId || "1"),
    templateSlug: theme,
    brideName: templateOverrides.brideName || "Ananya",
    groomName: templateOverrides.groomName || "Vikram",
    brideBio:
      templateOverrides.brideBio || "Designer who paints sunsets & dreams",
    groomBio:
      templateOverrides.groomBio || "Architect who builds worlds & love",
    brideFamilyNames: templateOverrides.brideFamilyNames || "Sharma Family",
    groomFamilyNames: templateOverrides.groomFamilyNames || "Mehta Family",
    footerNote:
      templateOverrides.footerNote || "Made with love on LuxEnvelope",
    storyMilestones: templateOverrides.storyMilestones || [],
    sectionVisibility: templateOverrides.sectionVisibility || {
      story: true,
      events: true,
      gallery: true,
      families: true,
      footer: true,
      music: !shouldMutePreviewMusic,
    },
    couplePhotoUrl:
      demoData?.couplePhotoUrl ?? templateOverrides.couplePhotoUrl ?? null,
    bridePhotoUrl: templateOverrides.bridePhotoUrl ?? null,
    groomPhotoUrl: templateOverrides.groomPhotoUrl ?? null,
    hashtag: templateOverrides.hashtag || "#AnanyaWedVikram",
    welcomeMessage:
      templateOverrides.welcomeMessage ||
      "Together with our families, Ananya & Vikram joyfully invite you to be part of our celebration of love and new beginnings.",
    showCountdown: true,
    weddingDate: templateOverrides.weddingDate || "2027-02-14",
    events: effectiveEvents.map((e: any, i: number) => ({
      id: e.id ?? i,
      eventName: e.eventName,
      eventDate: e.eventDate,
      eventTime: e.eventTime,
      venueName: e.venueName || "",
      venueAddress: e.venueAddress || "",
      mapsUrl: buildMapsUrl(e.mapsUrl, e.venueName, e.venueAddress),
    })),
    galleryPhotos: effectiveGallery.map((url: any, i: number) => ({
      photoUrl: typeof url === "string" ? url : url.photoUrl,
      sortOrder: typeof url === "string" ? i : (url.sortOrder ?? i),
      isDefault: true,
    })),
    customTexts: templateOverrides.customTexts || {},
    musicUrl: null,
    musicName: null,
    effectiveMusicUrl: shouldMutePreviewMusic ? "" : effectiveMusicUrl,
    effectiveMusicName: shouldMutePreviewMusic ? "" : effectiveMusicName,
    locale: "en",
    slug: "ananya-weds-vikram",
    accessCode: "DEMO",
    status: "PUBLISHED",
    rsvpEnabled: true,
    templateDefaults: {
      defaultPhotos: defaultDefaults.defaultPhotos || [],
      defaultMusicUrl: shouldMutePreviewMusic
        ? ""
        : defaultDefaults.defaultMusicUrl || "",
      defaultMusicName: shouldMutePreviewMusic
        ? ""
        : defaultDefaults.defaultMusicName || "",
      defaultVideoUrl: defaultDefaults.defaultVideoUrl || null,
    },
  };

  const showWatermark = demoData?.showWatermark !== false && !isEmbeddedPreview;
  const isFree = template?.isFree ?? false;
  const ctaText = isFree
    ? "Start Free — No Payment Needed"
    : `Use This Template — ${template ? formatTemplatePrice(template) : ""}`;

  const previewContent =
    showMobilePreview && !isFrameOnly ? (
      <div className="mx-auto flex h-[calc(100vh-3rem)] w-full items-center justify-center overflow-hidden px-4">
        <div className="relative w-full max-w-[280px] rounded-[2rem] border-[3px] border-neutral-900 bg-neutral-950 p-[4px] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div className="absolute left-1/2 top-[7px] z-20 h-[12px] w-[60px] -translate-x-1/2 rounded-full bg-neutral-900" />
          <div
            className="group relative overflow-hidden rounded-[1.7rem] bg-background"
            style={{ height: "calc(100vh - 7rem)" }}
          >
            <iframe
              src={`/templates/${templateId}/demo?frame=1`}
              title="Mobile demo preview"
              className="block border-0 origin-top-left"
              style={{
                width: "420px",
                height: "calc(100% / 0.648)",
                transform: "scale(0.648)",
                transformOrigin: "top left",
              }}
            />
            {/* Scroll hint overlay */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center gap-1 bg-gradient-to-t from-black/60 to-transparent pb-4 pt-10">
              <svg
                className="h-5 w-5 animate-bounce text-white/90"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span className="text-[10px] font-medium tracking-wide text-white/80">
                Scroll to explore
              </span>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <TemplateComp
        mode="demo"
        data={demoInvitationData}
        onUpdate={() => {}}
        onSaveDraft={() => {}}
        onPublish={() => {}}
        isSaving={false}
        isPublishing={false}
      />
    );

  if (isLoading || !TemplateComp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div
      data-theme={theme}
      className="min-h-screen overflow-x-hidden bg-background text-foreground"
    >
      {isFrameOnly && (
        <style>{`html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; } html, body { scrollbar-width: none; -ms-overflow-style: none; overflow-x: hidden; }`}</style>
      )}
      {/* Top bar */}
      {showPageChrome && (
        <div className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl">
          <span className="font-body text-sm text-foreground font-medium">
            {metadata?.name || "Template"} ·{" "}
            <span className="text-muted-foreground">DEMO PREVIEW</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobilePreview((current) => !current)}
              className="rounded-lg border border-border bg-background/70 px-3 py-1.5 font-body text-xs text-foreground transition-colors hover:bg-background"
            >
              {showMobilePreview ? "Desktop View" : "Mobile View"}
            </button>
            <button
              onClick={() => triggerPaymentFlow(template?.id || "1", template)}
              className={`${isFree ? "btn-emerald" : "btn-gold"} rounded-lg px-4 py-1.5 text-xs flex items-center gap-1.5`}
            >
              <Sparkles size={12} />
              {ctaText}
            </button>
          </div>
        </div>
      )}

      {/* Demo watermark */}
      {showWatermark && <div className="demo-watermark" />}

      <div className={showPageChrome ? "pt-12" : ""}>{previewContent}</div>

      {/* Bottom CTA bar */}
      {showPageChrome && (
        <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-card/90 px-6 py-3 shadow-2xl backdrop-blur-xl">
            <span className="font-body text-sm text-muted-foreground hidden sm:inline">
              Like what you see?
            </span>
            <button
              onClick={() => {
                const tid = template?.id || templateId || "1";
                if (!isAuthenticated) {
                  navigate("/login", { state: { redirectTo: `/create/${tid}` } });
                } else {
                  navigate(`/create/${tid}`);
                }
              }}
              className={`${isFree ? "btn-emerald" : "btn-gold"} rounded-full px-5 py-2 text-sm flex items-center gap-1.5`}
            >
              <Sparkles size={14} />
              Customize &amp; Make It Yours →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDemoPage;
