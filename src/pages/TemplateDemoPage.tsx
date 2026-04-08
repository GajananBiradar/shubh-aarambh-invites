import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Sparkles } from "lucide-react";

const MOBILE_PREVIEW_WIDTH = 390;
const MOBILE_PREVIEW_HEIGHT = 844;
const SHARED_TEMPLATE_MUSIC_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/music/music.mp3?v=2026-04-08-2";

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
  const isMobileDevice = useIsMobile();
  const mobileStageRef = useRef<HTMLDivElement | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobilePreviewScale, setMobilePreviewScale] = useState(1);

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
  const shouldUseDirectMobileView = isMobileDevice && showPageChrome;
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

  useEffect(() => {
    if (!showPageChrome || shouldUseDirectMobileView || !showMobilePreview) {
      return;
    }

    const stage = mobileStageRef.current;
    if (!stage) {
      return;
    }

    const updateScale = () => {
      const widthScale = stage.clientWidth / MOBILE_PREVIEW_WIDTH;
      const heightScale = stage.clientHeight / MOBILE_PREVIEW_HEIGHT;
      setMobilePreviewScale(Math.min(widthScale, heightScale, 1));
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(stage);

    return () => resizeObserver.disconnect();
  }, [shouldUseDirectMobileView, showMobilePreview, showPageChrome]);

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

  const effectiveEvents = demoData?.events ||
    templateOverrides.events || [
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
    templateOverrides.musicUrl ||
    demoData?.musicUrl ||
    templateOverrides.templateDefaults?.defaultMusicUrl ||
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
      templateOverrides.footerNote || "Made with love on ShubhAarambh",
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

  const showWatermark =
    demoData?.showWatermark !== false && !isEmbeddedPreview;
  const isFree = template?.isFree ?? false;
  const priceInr = template?.priceInr ?? 0;
  const showPhoneFramePreview =
    showMobilePreview && !isFrameOnly && !shouldUseDirectMobileView;

  const ctaText = isFree
    ? "Start Free — No Payment Needed"
    : `Use This Template — ₹${priceInr}`;

  const previewContent = showPhoneFramePreview ? (
    <div
      ref={mobileStageRef}
      className="flex h-[calc(100dvh-8rem)] min-h-[20rem] w-full items-center justify-center overflow-hidden px-4 py-4 sm:px-6"
    >
      <div
        className="relative"
        style={{
          width: `${MOBILE_PREVIEW_WIDTH * mobilePreviewScale}px`,
          height: `${MOBILE_PREVIEW_HEIGHT * mobilePreviewScale}px`,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: `${MOBILE_PREVIEW_WIDTH}px`,
            height: `${MOBILE_PREVIEW_HEIGHT}px`,
            transform: `scale(${mobilePreviewScale})`,
          }}
        >
          <div className="relative h-full w-full rounded-[2.5rem] border-[4px] border-neutral-900 bg-neutral-950 p-[6px] shadow-[0_32px_90px_rgba(0,0,0,0.28)]">
            <div className="absolute left-1/2 top-[10px] z-20 h-[18px] w-[88px] -translate-x-1/2 rounded-full bg-neutral-900" />
            <div className="h-full overflow-hidden rounded-[2rem] bg-background">
              <iframe
                src={`/templates/${templateId}/demo?frame=1`}
                title="Mobile demo preview"
                className="block h-full w-full border-0"
              />
            </div>
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
      className={`${showPhoneFramePreview ? "h-dvh overflow-hidden" : "min-h-screen overflow-x-hidden"} bg-background text-foreground`}
    >
      {/* Top bar */}
      {showPageChrome && (
      <div className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xl">
        <span className="font-body text-sm text-foreground font-medium">
          {metadata?.name || "Template"} ·{" "}
          <span className="text-muted-foreground">DEMO PREVIEW</span>
        </span>
        <div className="flex items-center gap-2">
          {!isMobileDevice && (
            <button
              onClick={() => setShowMobilePreview((current) => !current)}
              className="rounded-lg border border-border bg-background/70 px-3 py-1.5 font-body text-xs text-foreground transition-colors hover:bg-background"
            >
              {showMobilePreview ? "Desktop View" : "Mobile View"}
            </button>
          )}
          <button
            onClick={() => triggerPaymentFlow(template?.id || "1")}
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

      <div
        className={
          showPageChrome
            ? showPhoneFramePreview
              ? "pt-12 pb-20"
              : "pt-12"
            : ""
        }
      >
        {previewContent}
      </div>

      {/* Bottom CTA bar */}
      {showPageChrome && !showPhoneFramePreview && !isMobileDevice && (
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-border bg-card/90 px-6 py-3 shadow-2xl backdrop-blur-xl">
          <span className="font-body text-sm text-muted-foreground hidden sm:inline">
            Like what you see?
          </span>
          <button
            onClick={() => triggerPaymentFlow(template?.id || "1")}
            className={`${isFree ? "btn-emerald" : "btn-gold"} rounded-full px-5 py-2 text-sm flex items-center gap-1.5`}
          >
            <Sparkles size={14} />
            {isFree ? "Start for Free →" : `Get This for ₹${priceInr} →`}
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default TemplateDemoPage;
