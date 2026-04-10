import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Gift,
  Heart,
  MapPin,
  Plus,
  Sparkle,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { submitRsvp } from "@/api/rsvp";
import {
  AddEventButton,
  EditableEventCard,
  EditableMusicPlayer,
  EditablePhoto,
  EditablePhotoGallery,
  EditableText,
  EditModeToolbar,
} from "@/components/inline-editor";
import FloatingMusicPlayer from "@/components/invitation/FloatingMusicPlayer";
import { cn } from "@/lib/utils";
import {
  formatEventDate,
  formatTime,
  formatWeddingDate,
} from "@/utils/formatDate";
import {
  createEmptyEvent,
  EventData,
  SectionVisibility,
  TemplateProps,
} from "@/templates/types";
import toast from "react-hot-toast";

const R2_BASE = "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev";
const DEFAULT_COUPLE_PHOTO = `${R2_BASE}/templates/7/photos/Pose.png`;

const C = {
  blush: "#f6eee5",
  paper: "#fffaf2",
  ink: "#241b17",
  inkMuted: "#6c584d",
  plum: "#381a1d",
  plumSoft: "#5b3230",
  plumDeep: "#241011",
  gold: "#b6813f",
  goldSoft: "#e6c48e",
  mist: "#efe2d3",
  border: "rgba(120, 87, 62, 0.17)",
  white: "#fffdf9",
  shadow: "0 28px 80px rgba(43, 23, 24, 0.14)",
};

const FONTS = {
  display: "'Bodoni Moda', serif",
  serif: "'Cormorant Garamond', serif",
  sans: "'Sora', sans-serif",
  script: "'Parisienne', cursive",
};

const sectionReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
} as const;

const faqItems = [
  {
    q: "What should I wear?",
    a: "We'd love to see you in festive traditional attire. Think elegant sarees, lehengas, sherwanis or suits in rich jewel tones that match the celebratory spirit.",
  },
  {
    q: "Can I bring family?",
    a: "Absolutely! Please RSVP with the total number of guests attending so we can ensure everyone is comfortably accommodated.",
  },
  {
    q: "Will accommodation details be shared?",
    a: "Yes, hotel recommendations and travel directions for outstation guests will be shared closer to the date. Feel free to reach out if you need any help.",
  },
  {
    q: "Is there a gift option?",
    a: "Your presence truly is the best gift. However, if you wish to bless us, a small section with payment details is included below.",
  },
];

const eventNotes: Record<string, string> = {
  Haldi:
    "Sunlit rituals, marigold tones, and joyful family chaos in the best way.",
  Mehndi: "Henna, laughter, chai, and a courtyard filled with music and color.",
  Mehendi:
    "Henna, laughter, chai, and a courtyard filled with music and color.",
  Sangeet:
    "An evening of dancing, live performances, and a room full of sparkle.",
  Wedding: "The vows, the pheras, and the moment everything becomes forever.",
  Reception:
    "A dressed-up dinner celebration to greet everyone with warmth and style.",
  Engagement:
    "A graceful beginning to the celebrations with the people closest to us.",
};

const getDisplayPhotos = (data: TemplateProps["data"]) =>
  (data.galleryPhotos.length > 0
    ? data.galleryPhotos
    : data.templateDefaults.defaultPhotos.map((photo, index) => ({
        photoUrl: photo.photoUrl,
        sortOrder: index,
        isDefault: true,
      }))
  ).sort((a, b) => a.sortOrder - b.sortOrder);

const updateGalleryPhotoAtIndex = (
  photos: ReturnType<typeof getDisplayPhotos>,
  index: number,
  url: string,
) => {
  const next = [...photos];
  if (next[index]) {
    next[index] = { ...next[index], photoUrl: url, isDefault: false };
  } else {
    next[index] = { photoUrl: url, sortOrder: index, isDefault: false };
  }
  return next.map((photo, sortOrder) => ({ ...photo, sortOrder }));
};

const SectionIntro = ({
  kicker,
  title,
  body,
  align = "center",
}: {
  kicker: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) => (
  <motion.div
    {...sectionReveal}
    className={cn(
      "mx-auto mb-12 max-w-3xl",
      align === "center" ? "text-center" : "text-left",
    )}
  >
    <p
      className="mb-3 text-[11px] uppercase tracking-[0.42em]"
      style={{ color: C.gold, fontFamily: FONTS.sans }}
    >
      {kicker}
    </p>
    <h2
      className="text-5xl leading-[0.95] sm:text-6xl md:text-7xl"
      style={{ color: C.ink, fontFamily: FONTS.display }}
    >
      {title}
    </h2>
    {body && (
      <p
        className="mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg"
        style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
      >
        {body}
      </p>
    )}
  </motion.div>
);

/* ── Section visibility ─────────────────────────────────── */
const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  story: true,
  events: true,
  gallery: true,
  families: true,
  footer: true,
  music: true,
  venue: true,
  faq: true,
  gifts: true,
  rsvp: true,
};

const getSectionVisibility = (data: TemplateProps["data"]) => ({
  ...DEFAULT_SECTION_VISIBILITY,
  ...(data.sectionVisibility || {}),
});

const SectionActionButton = ({
  label,
  onClick,
  variant = "remove",
}: {
  label: string;
  onClick: () => void;
  variant?: "remove" | "add";
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-all"
    style={{
      borderColor: variant === "add" ? `${C.gold}88` : "rgba(182,129,63,0.22)",
      background:
        variant === "add"
          ? "linear-gradient(135deg, rgba(182,129,63,0.16), rgba(182,129,63,0.06))"
          : "rgba(56,26,29,0.38)",
      color: variant === "add" ? C.gold : C.inkMuted,
    }}
  >
    {variant === "add" ? <Plus size={14} /> : <Trash2 size={14} />}
    {label}
  </button>
);

const HiddenSectionPlaceholder = ({
  title,
  onAdd,
}: {
  title: string;
  onAdd: () => void;
}) => (
  <section className="py-10 sm:py-12">
    <div className="mx-auto max-w-5xl px-6">
      <div
        className="rounded-[1.5rem] border px-6 py-8 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,253,249,0.6), rgba(247,238,224,0.8))",
          borderColor: C.border,
        }}
      >
        <p
          className="text-xs uppercase tracking-[0.32em]"
          style={{ color: C.inkMuted }}
        >
          {title} hidden
        </p>
        <div className="mt-4 flex justify-center">
          <SectionActionButton
            label={`Add ${title}`}
            onClick={onAdd}
            variant="add"
          />
        </div>
      </div>
    </div>
  </section>
);

/* ── 3D Curved-shelf card ───────────────────────────────── */
const CurvedCard = ({
  photoUrl,
  index,
  scrollX,
  step,
  containerCenter,
  cardW,
  cardH,
}: {
  photoUrl: string;
  index: number;
  scrollX: MotionValue<number>;
  step: number;
  containerCenter: number;
  cardW: number;
  cardH: number;
}) => {
  const rotateY = useTransform(scrollX, (x) => {
    const cardCenter = index * step + step / 2 + x;
    const offset = (cardCenter - containerCenter) / containerCenter;
    const clamped = Math.max(-1.4, Math.min(1.4, offset));
    return clamped * -45;
  });

  const scale = useTransform(scrollX, (x) => {
    const cardCenter = index * step + step / 2 + x;
    const offset = Math.abs(cardCenter - containerCenter) / containerCenter;
    return Math.max(0.78, 1 - offset * 0.18);
  });

  const translateZ = useTransform(scrollX, (x) => {
    const cardCenter = index * step + step / 2 + x;
    const offset = Math.abs(cardCenter - containerCenter) / containerCenter;
    return -offset * 120;
  });

  const opacity = useTransform(scrollX, (x) => {
    const cardCenter = index * step + step / 2 + x;
    const offset = Math.abs(cardCenter - containerCenter) / containerCenter;
    return Math.max(0.45, 1 - offset * 0.45);
  });

  return (
    <motion.div
      style={{
        rotateY,
        scale,
        z: translateZ,
        opacity,
        width: cardW,
        height: cardH,
        flexShrink: 0,
        borderColor: "rgba(182,129,63,0.18)",
        boxShadow:
          "0 18px 50px rgba(43,23,24,0.16), 0 4px 14px rgba(0,0,0,0.06)",
      }}
      className="overflow-hidden rounded-2xl border-2 bg-white/90 p-[5px] sm:rounded-3xl sm:p-[6px]"
    >
      <img
        src={photoUrl}
        alt={`Memory ${index + 1}`}
        className="h-full w-full rounded-xl object-cover sm:rounded-2xl"
        draggable={false}
      />
    </motion.div>
  );
};

/* ── 3D Curved carousel (horizontally-scrolling shelf) ─── */
const HeroCurvedCarousel = ({
  photos,
}: {
  photos: Array<string | null | undefined>;
}) => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const CARD_W = isMobile ? 140 : 210;
  const CARD_H = isMobile ? 200 : 310;
  const GAP = isMobile ? 12 : 22;
  const STEP = CARD_W + GAP;

  const uniquePhotos = useMemo(() => {
    const base = photos.filter(Boolean) as string[];
    const fallback = base.length > 0 ? base : [DEFAULT_COUPLE_PHOTO];
    const result: string[] = [];
    while (result.length < 7) {
      for (const p of fallback) {
        result.push(p);
        if (result.length >= 7) break;
      }
    }
    return result.slice(0, 7);
  }, [photos]);

  // Triple the set for seamless infinite scroll
  const carouselPhotos = useMemo(
    () => [...uniquePhotos, ...uniquePhotos, ...uniquePhotos],
    [uniquePhotos],
  );

  const setWidth = uniquePhotos.length * STEP;
  const scrollX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerCenter, setContainerCenter] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerCenter(containerRef.current.offsetWidth / 2);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame((_, delta) => {
    let curr = scrollX.get() - delta * 0.04;
    if (curr < -setWidth) curr += setWidth;
    scrollX.set(curr);
  });

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full overflow-hidden"
      style={{
        height: CARD_H + 60,
        perspective: isMobile ? "800px" : "1100px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* Edge fades matching page background */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24"
        style={{
          background:
            "linear-gradient(to right, rgba(248,241,231,1) 0%, rgba(248,241,231,0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24"
        style={{
          background:
            "linear-gradient(to left, rgba(248,241,231,1) 0%, rgba(248,241,231,0) 100%)",
        }}
      />

      <motion.div
        style={{
          x: scrollX,
          display: "flex",
          gap: GAP,
          alignItems: "center",
          height: "100%",
          transformStyle: "preserve-3d",
        }}
      >
        {carouselPhotos.map((photoUrl, index) => (
          <CurvedCard
            key={`hero-carousel-${index}`}
            photoUrl={photoUrl}
            index={index}
            scrollX={scrollX}
            step={STEP}
            containerCenter={containerCenter}
            cardW={CARD_W}
            cardH={CARD_H}
          />
        ))}
      </motion.div>
    </div>
  );
};

const GoldenMemoTemplate = ({
  mode,
  data,
  onUpdate,
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
  templateId,
  sessionUUID,
  uploadStage = "temp",
}: TemplateProps) => {
  const effectiveMusicUrl =
    data.musicUrl ||
    data.effectiveMusicUrl ||
    data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName =
    data.musicName ||
    data.effectiveMusicName ||
    data.templateDefaults.defaultMusicName;
  const displayPhotos = useMemo(() => getDisplayPhotos(data), [data]);
  const sectionVisibility = getSectionVisibility(data);

  return (
    <div
      data-theme="golden"
      className="min-h-screen overflow-x-hidden"
      style={{
        background:
          "radial-gradient(circle at top, rgba(255,252,247,0.96), rgba(248,241,231,1) 38%, rgba(242,232,218,1) 100%)",
        color: C.ink,
        fontFamily: FONTS.serif,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600;6..96,700&family=Cormorant+Garamond:wght@400;500;600;700&family=Parisienne&family=Sora:wght@300;400;500;600&display=swap');`}</style>

      {mode !== "edit" && effectiveMusicUrl && (
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}

      <HeroSection
        data={data}
        mode={mode}
        onUpdate={onUpdate}
        photos={displayPhotos}
        templateId={templateId}
        sessionUUID={sessionUUID}
        uploadStage={uploadStage}
      />
      {sectionVisibility.story && (
        <StoryMemorySection
          mode={mode}
          data={data}
          onUpdate={onUpdate}
          photos={displayPhotos}
          templateId={templateId}
          sessionUUID={sessionUUID}
          uploadStage={uploadStage}
        />
      )}
      {mode === "edit" && !sectionVisibility.story && (
        <HiddenSectionPlaceholder
          title="Our Story"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, story: true },
            })
          }
        />
      )}
      {sectionVisibility.events && (
        <EventsSection mode={mode} data={data} onUpdate={onUpdate} />
      )}
      {mode === "edit" && !sectionVisibility.events && (
        <HiddenSectionPlaceholder
          title="Events"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, events: true },
            })
          }
        />
      )}

      {sectionVisibility.venue !== false && (
        <VenueSection
          event={data.events[0] ?? null}
          mode={mode}
          data={data}
          onUpdate={onUpdate}
        />
      )}
      {mode === "edit" && sectionVisibility.venue === false && (
        <HiddenSectionPlaceholder
          title="Venue"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, venue: true },
            })
          }
        />
      )}

      {sectionVisibility.faq !== false && (
        <FaqSection mode={mode} data={data} onUpdate={onUpdate} />
      )}
      {mode === "edit" && sectionVisibility.faq === false && (
        <HiddenSectionPlaceholder
          title="FAQ"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, faq: true },
            })
          }
        />
      )}

      {sectionVisibility.gifts !== false && (
        <GiftsSection mode={mode} data={data} onUpdate={onUpdate} />
      )}
      {mode === "edit" && sectionVisibility.gifts === false && (
        <HiddenSectionPlaceholder
          title="Gifts"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, gifts: true },
            })
          }
        />
      )}

      {mode === "edit" && (
        <section className="px-4 pb-12">
          <div
            className="mx-auto max-w-3xl rounded-[32px] border px-5 py-8 sm:px-8 [&_.btn-outline-accent]:border [&_.btn-outline-accent]:border-[rgba(182,129,63,0.3)] [&_.btn-outline-accent]:text-[#6c584d] [&_button]:text-[#6c584d]"
            style={{
              backgroundColor: "rgba(255,253,249,0.86)",
              borderColor: C.border,
              boxShadow: C.shadow,
            }}
          >
            <SectionIntro
              kicker="Soundtrack"
              title="Set the Mood"
              body="Upload or switch the music that should start floating with the invitation."
            />
            <EditableMusicPlayer
              musicUrl={data.musicUrl}
              musicName={data.musicName}
              defaultMusicUrl={data.templateDefaults.defaultMusicUrl}
              defaultMusicName={data.templateDefaults.defaultMusicName}
              onUpdate={(url, name) =>
                onUpdate({ musicUrl: url, musicName: name })
              }
              mode={mode}
              templateId={templateId}
              sessionUUID={sessionUUID}
              uploadStage={uploadStage}
              invitationId={data.invitationId ?? undefined}
            />
          </div>
        </section>
      )}

      {mode !== "edit" && data.rsvpEnabled !== false && (
        <RsvpSection
          invitationId={data.invitationId}
          isDemo={mode === "demo"}
        />
      )}

      {sectionVisibility.footer && (
        <footer
          className={cn("px-4 pb-20 pt-16", mode === "edit" && "pb-36")}
          style={{
            background: `linear-gradient(180deg, rgba(247,238,224,1), rgba(237,224,206,1))`,
          }}
        >
          <motion.div
            {...sectionReveal}
            className="mx-auto max-w-5xl rounded-[36px] border px-6 py-12 text-center sm:px-10"
            style={{
              borderColor: C.border,
              background:
                "linear-gradient(180deg, rgba(255,253,249,0.96), rgba(249,241,230,0.88))",
              boxShadow: C.shadow,
            }}
          >
            <div style={{ color: C.gold, fontFamily: FONTS.sans }}>
              <EditableText
                value={data.customTexts?.footerKicker || "Made for Celebration"}
                onSave={(val) =>
                  onUpdate({
                    customTexts: {
                      ...data.customTexts,
                      footerKicker: val,
                    },
                  })
                }
                mode={mode}
                className="mb-3 text-[11px] uppercase tracking-[0.45em]"
                as="p"
                placeholder="Made for Celebration"
              />
            </div>
            <h2
              className="text-4xl sm:text-5xl"
              style={{ color: C.ink, fontFamily: FONTS.display }}
            >
              {data.brideName || "Bride"} &amp; {data.groomName || "Groom"}
            </h2>
            {mode === "edit" ? (
              <input
                type="date"
                value={data.weddingDate || ""}
                onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                className="mx-auto mt-4 block cursor-pointer rounded-full border px-5 py-2 text-center text-lg"
                style={{
                  borderColor: "rgba(182,129,63,0.3)",
                  backgroundColor: "rgba(255,253,249,0.72)",
                  color: C.inkMuted,
                  fontFamily: FONTS.serif,
                }}
              />
            ) : (
              <p
                className="mt-4 text-lg"
                style={{ color: C.inkMuted, fontFamily: FONTS.serif }}
              >
                {formatWeddingDate(data.weddingDate)}
              </p>
            )}
            {mode === "edit" && (
              <div className="mt-6 flex justify-center">
                <SectionActionButton
                  label="Remove Section"
                  onClick={() =>
                    onUpdate({
                      sectionVisibility: {
                        ...sectionVisibility,
                        footer: false,
                      },
                    })
                  }
                />
              </div>
            )}
          </motion.div>
        </footer>
      )}
      {mode === "edit" && !sectionVisibility.footer && (
        <HiddenSectionPlaceholder
          title="Footer"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, footer: true },
            })
          }
        />
      )}

      {mode === "edit" && (
        <EditModeToolbar
          onSaveDraft={onSaveDraft}
          onPublish={onPublish}
          isSaving={isSaving}
          isPublishing={isPublishing}
          invitationId={data.invitationId}
          hasUnsavedChanges={true}
        />
      )}
    </div>
  );
};
const HeroSection = ({
  data,
  mode,
  onUpdate,
  photos,
  templateId,
  sessionUUID,
  uploadStage,
}: {
  data: TemplateProps["data"];
  mode: TemplateProps["mode"];
  onUpdate: TemplateProps["onUpdate"];
  photos: ReturnType<typeof getDisplayPhotos>;
  templateId?: number;
  sessionUUID?: string;
  uploadStage: "temp" | "draft" | "published";
}) => {
  const heroPhotos = Array.from(
    { length: 6 },
    (_, i) =>
      data.customTexts?.[`heroPhoto${i}`] ||
      data.couplePhotoUrl ||
      photos[0]?.photoUrl ||
      DEFAULT_COUPLE_PHOTO,
  );
  const floatingPhotos = heroPhotos;

  const updateCustomText = (key: string, value: string) =>
    onUpdate({ customTexts: { ...data.customTexts, [key]: value } });

  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-6 sm:pb-10 sm:pt-8">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-12%] top-0 h-64 w-64 rounded-full bg-[#dba35c]/15 blur-3xl" />
        <div className="absolute right-[-10%] top-20 h-80 w-80 rounded-full bg-[#7f2d2f]/10 blur-3xl" />
      </div>

      <motion.div
        {...sectionReveal}
        className="relative mx-auto max-w-[1450px]"
      >
        <HeroCurvedCarousel photos={floatingPhotos} />

        {mode === "edit" && (
          <div className="mx-auto mt-6 max-w-4xl">
            <p
              className="mb-3 text-center text-[11px] uppercase tracking-[0.3em]"
              style={{ color: C.gold, fontFamily: FONTS.sans }}
            >
              Edit Carousel Photos (up to 6)
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {heroPhotos.map((photoUrl, i) => (
                <EditablePhoto
                  key={`hero-edit-${i}`}
                  photoUrl={photoUrl}
                  onSave={(url) => updateCustomText(`heroPhoto${i}`, url)}
                  mode={mode}
                  className="aspect-[3/4] w-full rounded-xl"
                  alt={`Hero photo ${i + 1}`}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                  invitationId={data.invitationId ?? undefined}
                  oldPublicUrl={
                    data.customTexts?.[`heroPhoto${i}`] || undefined
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 text-center sm:pt-8">
          <div
            className="mx-auto inline-flex rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.38em]"
            style={{
              borderColor: "rgba(182,129,63,0.22)",
              backgroundColor: "rgba(255,250,242,0.72)",
              color: C.gold,
              fontFamily: FONTS.sans,
            }}
          >
            We're Getting Married
          </div>
          <p
            className="mt-4 text-[11px] uppercase tracking-[0.45em] sm:text-xs"
            style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
          >
            Save The Date
          </p>
          <div className="mt-3 flex flex-col items-center gap-1">
            <EditableText
              value={data.brideName}
              onSave={(value) => onUpdate({ brideName: value })}
              mode={mode}
              className="block text-5xl leading-none sm:text-7xl md:text-8xl"
              inputClassName="text-5xl sm:text-7xl md:text-8xl"
              as="h1"
              placeholder="Bride Name"
            />
            <p
              className="text-3xl sm:text-4xl"
              style={{ color: C.gold, fontFamily: FONTS.script }}
            >
              &amp;
            </p>
            <EditableText
              value={data.groomName}
              onSave={(value) => onUpdate({ groomName: value })}
              mode={mode}
              className="block text-5xl leading-none sm:text-7xl md:text-8xl"
              inputClassName="text-5xl sm:text-7xl md:text-8xl"
              as="h1"
              placeholder="Groom Name"
            />
          </div>
          {mode === "edit" ? (
            <input
              type="date"
              value={data.weddingDate || ""}
              onChange={(e) => onUpdate({ weddingDate: e.target.value })}
              className="mx-auto mt-4 block cursor-pointer rounded-full border px-5 py-2 text-center text-sm uppercase tracking-[0.36em]"
              style={{
                borderColor: "rgba(182,129,63,0.3)",
                backgroundColor: "rgba(255,253,249,0.72)",
                color: C.inkMuted,
                fontFamily: FONTS.sans,
              }}
            />
          ) : (
            <p
              className="mt-4 text-sm uppercase tracking-[0.36em]"
              style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
            >
              {formatWeddingDate(data.weddingDate)}
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
};

const StoryMemorySection = ({
  mode,
  data,
  onUpdate,
  photos,
  templateId,
  sessionUUID,
  uploadStage,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  photos: ReturnType<typeof getDisplayPhotos>;
  templateId?: number;
  sessionUUID?: string;
  uploadStage: "temp" | "draft" | "published";
}) => {
  const defaultPhoto =
    photos[0]?.photoUrl || data.couplePhotoUrl || DEFAULT_COUPLE_PHOTO;
  const memoryPhotos = [
    data.customTexts?.memoryPhoto0 || photos[1]?.photoUrl || defaultPhoto,
    data.customTexts?.memoryPhoto1 || photos[2]?.photoUrl || defaultPhoto,
    data.customTexts?.memoryPhoto2 || photos[3]?.photoUrl || defaultPhoto,
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  const defaultStoryTexts = [
    "The first time we met, there was an unspoken warmth — like finding a melody you never knew you were humming.",
    "Through late-night conversations and shared silences, we discovered that love isn't just found — it grows, gently and deeply.",
    "And now, here we are — two stories becoming one, ready to write every chapter of forever together.",
  ];
  const storyTexts = defaultStoryTexts.map(
    (fallback, i) => data.customTexts?.[`storyText${i}`] || fallback,
  );

  const updateCustomText = (key: string, value: string) =>
    onUpdate({ customTexts: { ...data.customTexts, [key]: value } });

  return (
    <section className="relative px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[8%] top-[18%] h-48 w-48 rounded-full bg-[#b6813f]/8 blur-3xl" />
          <div className="absolute right-[10%] bottom-[14%] h-60 w-60 rounded-full bg-[#7e4740]/10 blur-3xl" />
        </div>

        <div className="relative">
          <motion.div {...sectionReveal} className="mb-8 text-center">
            <p
              className="mb-2 text-[11px] uppercase tracking-[0.42em]"
              style={{ color: C.gold, fontFamily: FONTS.sans }}
            >
              Our Love Story
            </p>
            <h2
              className="text-4xl leading-[0.95] sm:text-5xl md:text-6xl"
              style={{ color: C.ink, fontFamily: FONTS.display }}
            >
              {data.brideName || "Bride"}{" "}
              <span style={{ color: C.gold, fontFamily: FONTS.script }}>
                &amp;
              </span>{" "}
              {data.groomName || "Groom"}
            </h2>
          </motion.div>

          <div className="grid items-center gap-8 lg:grid-cols-[0.84fr_1.16fr]">
            <div className="space-y-4">
              {storyTexts.map((story, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={`story-tab-${index}`}
                    className="block w-full rounded-[28px] border px-6 py-5 text-left transition-all duration-300"
                    style={{
                      borderColor: isActive
                        ? "rgba(182,129,63,0.32)"
                        : C.border,
                      backgroundColor: isActive
                        ? "rgba(255,253,249,0.92)"
                        : "rgba(255,253,249,0.62)",
                      boxShadow: isActive
                        ? "0 24px 60px rgba(43,23,24,0.08)"
                        : "0 10px 30px rgba(43,23,24,0.03)",
                    }}
                  >
                    <div
                      className="mb-3 inline-flex cursor-pointer rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.3em]"
                      onClick={() => setActiveIndex(index)}
                      style={{
                        backgroundColor: "rgba(182,129,63,0.1)",
                        color: C.gold,
                        fontFamily: FONTS.sans,
                        border: "1px solid rgba(182,129,63,0.18)",
                      }}
                    >
                      Memory {String(index + 1).padStart(2, "0")}
                    </div>
                    {mode === "edit" ? (
                      <div style={{ color: C.ink, fontFamily: FONTS.serif }}>
                        <EditableText
                          value={story}
                          onSave={(val) =>
                            updateCustomText(`storyText${index}`, val)
                          }
                          mode={mode}
                          multiline
                          className="text-xl leading-9 sm:text-2xl"
                          as="p"
                          placeholder="Tell your love story"
                        />
                      </div>
                    ) : (
                      <p
                        className="cursor-pointer text-xl leading-9 sm:text-2xl"
                        onClick={() => setActiveIndex(index)}
                        style={{ color: C.ink, fontFamily: FONTS.serif }}
                      >
                        {story}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {mode === "edit" ? (
              <div className="space-y-4">
                {memoryPhotos.map((photoUrl, i) => (
                  <div
                    key={`memory-photo-edit-${i}`}
                    className="relative rounded-[30px] border bg-[#fffefb] p-3 sm:p-4"
                    style={{
                      borderColor: C.border,
                      boxShadow: "0 32px 80px rgba(43,23,24,0.12)",
                    }}
                  >
                    <EditablePhoto
                      photoUrl={photoUrl || null}
                      onSave={(url) => updateCustomText(`memoryPhoto${i}`, url)}
                      mode={mode}
                      className="aspect-[4/5] w-full rounded-[22px]"
                      alt={`Story frame ${i + 1}`}
                      templateId={templateId}
                      sessionUUID={sessionUUID}
                      uploadStage={uploadStage}
                      invitationId={data.invitationId ?? undefined}
                      oldPublicUrl={
                        data.customTexts?.[`memoryPhoto${i}`] || undefined
                      }
                    />
                    <div
                      className="absolute bottom-7 left-7 right-7 flex items-center justify-between rounded-full px-4 py-2"
                      style={{
                        backgroundColor: "rgba(255,254,251,0.9)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <p
                        className="text-xs uppercase tracking-[0.28em]"
                        style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                      >
                        Memory {String(i + 1).padStart(2, "0")} Photo
                      </p>
                      <Sparkle size={14} style={{ color: C.gold }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                key={`featured-memory-${activeIndex}`}
                initial={{ opacity: 0, y: 20, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto w-full max-w-[520px]"
              >
                <div
                  className="relative rounded-[30px] border bg-[#fffefb] p-3 sm:p-4"
                  style={{
                    borderColor: C.border,
                    boxShadow: "0 32px 80px rgba(43,23,24,0.12)",
                  }}
                >
                  <EditablePhoto
                    photoUrl={memoryPhotos[activeIndex] || null}
                    onSave={(url) =>
                      updateCustomText(`memoryPhoto${activeIndex}`, url)
                    }
                    mode={mode}
                    className="aspect-[4/5] w-full rounded-[22px]"
                    alt={`Story frame ${activeIndex + 1}`}
                    templateId={templateId}
                    sessionUUID={sessionUUID}
                    uploadStage={uploadStage}
                    invitationId={data.invitationId ?? undefined}
                    oldPublicUrl={
                      data.customTexts?.[`memoryPhoto${activeIndex}`] ||
                      undefined
                    }
                  />
                  <div
                    className="absolute bottom-7 left-7 right-7 flex items-center justify-between rounded-full px-4 py-2"
                    style={{
                      backgroundColor: "rgba(255,254,251,0.9)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <p
                      className="text-xs uppercase tracking-[0.28em]"
                      style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                    >
                      Chapter {activeIndex + 1}
                    </p>
                    <Sparkle size={14} style={{ color: C.gold }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {mode === "edit" && (
          <div className="mt-8 flex justify-center">
            <SectionActionButton
              label="Remove Section"
              onClick={() =>
                onUpdate({
                  sectionVisibility: {
                    ...getSectionVisibility(data),
                    story: false,
                  },
                })
              }
            />
          </div>
        )}
      </div>
    </section>
  );
};

const StorySection = ({
  mode,
  data,
  onUpdate,
  photos,
  templateId,
  sessionUUID,
  uploadStage,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  photos: ReturnType<typeof getDisplayPhotos>;
  templateId?: number;
  sessionUUID?: string;
  uploadStage: "temp" | "draft" | "published";
}) => {
  const cards = [
    photos[1]?.photoUrl || photos[0]?.photoUrl || DEFAULT_COUPLE_PHOTO,
    photos[2]?.photoUrl || photos[1]?.photoUrl || DEFAULT_COUPLE_PHOTO,
    photos[3]?.photoUrl || photos[2]?.photoUrl || DEFAULT_COUPLE_PHOTO,
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  const storyTexts = [
    "The first time we met, there was an unspoken warmth — like finding a melody you never knew you were humming.",
    "Through late-night conversations and shared silences, we discovered that love isn't just found — it grows, gently and deeply.",
    "And now, here we are — two stories becoming one, ready to write every chapter of forever together.",
  ];
  const rotations = [0, 0, 0];
  const cardTransforms = cards.map(() => ({
    opacity: 1,
    scale: 1,
    y: 0,
  }));

  return (
    <section className="relative px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[8%] top-[18%] h-48 w-48 rounded-full bg-[#b6813f]/8 blur-3xl" />
          <div className="absolute right-[10%] bottom-[14%] h-60 w-60 rounded-full bg-[#7e4740]/10 blur-3xl" />
        </div>

        <div className="relative">
          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 text-center"
          >
            <p
              className="mb-2 text-[11px] uppercase tracking-[0.42em]"
              style={{ color: C.gold, fontFamily: FONTS.sans }}
            >
              Our Love Story
            </p>
            <h2
              className="text-4xl leading-[0.95] sm:text-5xl md:text-6xl"
              style={{ color: C.ink, fontFamily: FONTS.display }}
            >
              {data.brideName || "Bride"}{" "}
              <span style={{ color: C.gold, fontFamily: FONTS.script }}>
                &amp;
              </span>{" "}
              {data.groomName || "Groom"}
            </h2>
          </motion.div>

          {/* Main content: text + stacking images */}
          <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-8">
            {/* Text — changes with active card */}
            <div className="flex min-h-[180px] items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-lg text-center lg:text-left"
                >
                  <div
                    className="mb-4 inline-flex rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.3em]"
                    style={{
                      backgroundColor: "rgba(182,129,63,0.1)",
                      color: C.gold,
                      fontFamily: FONTS.sans,
                      border: "1px solid rgba(182,129,63,0.18)",
                    }}
                  >
                    Memory {String(activeIndex + 1).padStart(2, "0")}
                  </div>
                  <p
                    className="text-xl leading-9 sm:text-2xl"
                    style={{ color: C.ink, fontFamily: FONTS.serif }}
                  >
                    {storyTexts[activeIndex] ||
                      "A moment that made everything feel right."}
                  </p>
                  {activeIndex === 0 && mode === "edit" && (
                    <EditableText
                      value={data.groomBio || ""}
                      onSave={(value) => onUpdate({ groomBio: value })}
                      mode={mode}
                      multiline
                      className="mt-4 block text-base leading-7"
                      inputClassName="mt-4 text-base"
                      as="p"
                      placeholder="Add more to your story"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Image stack — cards overlap on scroll */}
            <div
              className="relative mx-auto"
              style={{ width: "min(420px, 84vw)", height: "min(540px, 96vw)" }}
            >
              {cards.map((photoUrl, index) => (
                <motion.div
                  key={`card-${index}`}
                  style={{
                    opacity: cardTransforms[index].opacity,
                    scale: cardTransforms[index].scale,
                    y: cardTransforms[index].y,
                    rotate: rotations[index] ?? 0,
                    zIndex: 20 + index,
                    boxShadow: `0 ${20 + index * 8}px ${60 + index * 20}px rgba(43,23,24,${0.12 + index * 0.04})`,
                    pointerEvents: index === activeIndex ? "auto" : "none",
                  }}
                  className="absolute inset-0 rounded-[22px] bg-[#fffefb] p-3"
                >
                  <EditablePhoto
                    photoUrl={photoUrl || null}
                    onSave={(url) =>
                      onUpdate({
                        galleryPhotos: updateGalleryPhotoAtIndex(
                          photos,
                          index + 1,
                          url,
                        ),
                      })
                    }
                    mode={mode}
                    className="h-full w-full rounded-[14px]"
                    alt={`Story frame ${index + 1}`}
                    templateId={templateId}
                    sessionUUID={sessionUUID}
                    uploadStage={uploadStage}
                    invitationId={data.invitationId ?? undefined}
                    oldPublicUrl={photoUrl || undefined}
                  />
                  <div
                    className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-full px-4 py-2"
                    style={{
                      backgroundColor: "rgba(255,254,251,0.92)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <p
                      className="text-xs uppercase tracking-[0.28em]"
                      style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                    >
                      Chapter {index + 1}
                    </p>
                    <Sparkle size={14} style={{ color: C.gold }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
const ScrollGallerySection = ({
  mode,
  data,
  onUpdate,
  photos,
  templateId,
  sessionUUID,
  uploadStage,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  photos: ReturnType<typeof getDisplayPhotos>;
  templateId?: number;
  sessionUUID?: string;
  uploadStage: "temp" | "draft" | "published";
}) => {
  const galleryRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start 90%", "end 20%"],
  });
  const leadImageLift = useTransform(scrollYProgress, [0, 1], [80, -20]);
  const largePhoto =
    photos[0]?.photoUrl || data.couplePhotoUrl || DEFAULT_COUPLE_PHOTO;
  const smallPhotos = photos.slice(1, 7);

  return (
    <section
      ref={galleryRef}
      className="relative overflow-hidden px-4 py-24 sm:py-32"
      style={{
        background:
          "linear-gradient(180deg, rgba(247,240,228,0.22), rgba(255,250,242,0.72) 20%, rgba(240,228,214,0.85) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          kicker="Motion Gallery"
          title="Images Rise, Overlap, and Reveal"
          body="This section is built to echo the reference: a dominant image first, then surrounding frames and stacked overlaps appearing from below while you scroll."
          align="left"
        />

        <motion.div
          {...sectionReveal}
          className="relative overflow-hidden rounded-[36px] border p-4 sm:p-6"
          style={{
            borderColor: C.border,
            backgroundColor: "rgba(255,253,249,0.92)",
            boxShadow: C.shadow,
            y: leadImageLift,
          }}
        >
          <EditablePhoto
            photoUrl={largePhoto}
            onSave={(url) => onUpdate({ couplePhotoUrl: url })}
            mode={mode}
            className="h-[420px] w-full rounded-[28px] sm:h-[560px]"
            alt="Hero memory"
            templateId={templateId}
            sessionUUID={sessionUUID}
            uploadStage={uploadStage}
            invitationId={data.invitationId ?? undefined}
            oldPublicUrl={data.couplePhotoUrl || undefined}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center px-8">
            <div
              className="max-w-xl rounded-full px-6 py-3 text-center"
              style={{
                backgroundColor: "rgba(33,16,17,0.54)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="text-sm sm:text-base"
                style={{
                  fontFamily: FONTS.sans,
                  color: "rgba(255,250,242,0.88)",
                }}
              >
                One big frame to hold the moment, then smaller memories drifting
                in around it.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {smallPhotos.map((photo, index) => (
            <motion.div
              key={`${photo.photoUrl}-${index}`}
              initial={{ opacity: 0, y: 180, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.95,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "relative rounded-[30px] border bg-white p-3",
                index > 0 && "md:-mt-12",
                index % 2 === 1 && "md:translate-y-12",
              )}
              style={{
                borderColor: C.border,
                boxShadow: "0 28px 70px rgba(43, 23, 24, 0.13)",
                zIndex: smallPhotos.length - index,
              }}
            >
              <EditablePhoto
                photoUrl={photo.photoUrl}
                onSave={(url) =>
                  onUpdate({
                    galleryPhotos: updateGalleryPhotoAtIndex(
                      photos,
                      index + 1,
                      url,
                    ),
                  })
                }
                mode={mode}
                className="h-[260px] w-full rounded-[22px] sm:h-[320px]"
                alt={`Rising gallery ${index + 1}`}
                templateId={templateId}
                sessionUUID={sessionUUID}
                uploadStage={uploadStage}
                invitationId={data.invitationId ?? undefined}
                oldPublicUrl={photo.photoUrl}
              />
              <div className="px-3 pb-2 pt-4">
                <p
                  className="text-[11px] uppercase tracking-[0.36em]"
                  style={{ color: C.gold, fontFamily: FONTS.sans }}
                >
                  Memory {String(index + 1).padStart(2, "0")}
                </p>
                <p
                  className="mt-2 text-2xl"
                  style={{ fontFamily: FONTS.display }}
                >
                  {index % 2 === 0
                    ? "An in-between glance that said everything."
                    : "Laughter you could feel across the room."}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...sectionReveal} className="mt-14">
          <EditablePhotoGallery
            photos={data.galleryPhotos}
            defaultPhotos={data.templateDefaults.defaultPhotos}
            onUpdate={(galleryPhotos) => onUpdate({ galleryPhotos })}
            mode={mode}
            maxPhotos={10}
            invitationId={data.invitationId ?? undefined}
            templateId={templateId}
            sessionUUID={sessionUUID}
            uploadStage={uploadStage}
          />
        </motion.div>
      </div>
    </section>
  );
};

const EventsSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const events = data.events.length > 0 ? data.events : [createEmptyEvent()];

  return (
    <section className="px-4 pb-24 pt-0 sm:pb-28 sm:pt-0">
      <div className="mx-auto max-w-6xl">
        <SectionIntro
          kicker="Wedding Weekend"
          title="Celebrate With Us"
          body="Each ceremony has been planned with love. Here's everything you need to know about the celebrations."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {events.map((event, index) => (
            <motion.div
              key={`${event.id ?? "event"}-${index}`}
              initial={{ opacity: 0, y: 80, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {mode === "edit" ? (
                <EditableEventCard
                  event={event}
                  onUpdate={(updates) => {
                    const next = [...data.events];
                    next[index] = { ...event, ...updates };
                    onUpdate({ events: next });
                  }}
                  onDelete={() => {
                    const next = data.events.filter((_, i) => i !== index);
                    onUpdate({
                      events: next.length > 0 ? next : [createEmptyEvent()],
                    });
                  }}
                  mode={mode}
                  index={index}
                  className="h-full rounded-[28px] border-0 bg-[rgba(255,253,249,0.92)] p-7 shadow-[0_24px_70px_rgba(43,23,24,0.08)]"
                />
              ) : (
                <div
                  className="group relative h-full overflow-hidden rounded-[30px] border p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_34px_90px_rgba(43,23,24,0.14)]"
                  style={{
                    background:
                      "linear-gradient(168deg, rgba(255,253,249,0.98), rgba(249,241,230,0.92) 60%, rgba(240,228,210,0.85))",
                    borderColor: C.border,
                    boxShadow: "0 26px 70px rgba(43,23,24,0.08)",
                  }}
                >
                  {/* Decorative gold accent line at top */}
                  <div
                    className="absolute inset-x-0 top-0 h-[3px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
                    }}
                  />

                  {/* Subtle corner ornament */}
                  <div className="absolute right-5 top-5 opacity-[0.06]">
                    <Sparkle size={48} style={{ color: C.gold }} />
                  </div>

                  <div
                    className="mb-5 inline-flex rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.3em]"
                    style={{
                      backgroundColor: "rgba(182,129,63,0.12)",
                      color: C.gold,
                      fontFamily: FONTS.sans,
                      border: `1px solid rgba(182,129,63,0.18)`,
                    }}
                  >
                    Event {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3
                    className="text-4xl leading-none"
                    style={{ fontFamily: FONTS.display, color: C.ink }}
                  >
                    {event.eventName}
                  </h3>
                  <p
                    className="mt-4 text-base leading-7"
                    style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                  >
                    {eventNotes[event.eventName] ||
                      "A meaningful gathering with the people we love most."}
                  </p>

                  {/* Divider */}
                  <div
                    className="my-6 h-[1px]"
                    style={{
                      background: `linear-gradient(90deg, ${C.gold}33, ${C.gold}66, ${C.gold}33)`,
                    }}
                  />

                  <div className="space-y-3">
                    <div
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors"
                      style={{
                        color: C.inkMuted,
                        fontFamily: FONTS.sans,
                        backgroundColor: "rgba(182,129,63,0.04)",
                      }}
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: "rgba(182,129,63,0.1)" }}
                      >
                        <CalendarDays size={14} style={{ color: C.gold }} />
                      </div>
                      <span className="font-medium">
                        {formatEventDate(event.eventDate)}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors"
                      style={{
                        color: C.inkMuted,
                        fontFamily: FONTS.sans,
                        backgroundColor: "rgba(182,129,63,0.04)",
                      }}
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: "rgba(182,129,63,0.1)" }}
                      >
                        <Clock3 size={14} style={{ color: C.gold }} />
                      </div>
                      <span className="font-medium">
                        {formatTime(event.eventTime)}
                      </span>
                    </div>
                    {event.venueName && (
                      <div
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors"
                        style={{
                          color: C.inkMuted,
                          fontFamily: FONTS.sans,
                          backgroundColor: "rgba(182,129,63,0.04)",
                        }}
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: "rgba(182,129,63,0.1)" }}
                        >
                          <MapPin size={14} style={{ color: C.gold }} />
                        </div>
                        <span className="font-medium">{event.venueName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-6">
          <AddEventButton
            mode={mode}
            onAdd={() =>
              onUpdate({ events: [...data.events, createEmptyEvent()] })
            }
            currentCount={data.events.length}
            maxEvents={8}
            className="rounded-[24px] !border-[rgba(182,129,63,0.35)] !text-[#6c584d] bg-[rgba(255,253,249,0.72)] hover:!bg-[rgba(182,129,63,0.1)]"
          />
        </div>

        {mode === "edit" && (
          <div className="mt-6 flex justify-center">
            <SectionActionButton
              label="Remove Section"
              onClick={() =>
                onUpdate({
                  sectionVisibility: {
                    ...getSectionVisibility(data),
                    events: false,
                  },
                })
              }
            />
          </div>
        )}
      </div>
    </section>
  );
};

const DEFAULT_VENUE_CARDS = [
  {
    key: "venueCard1Title",
    defaultTitle: "Arrival",
    bodyKey: "venueCard1Body",
    defaultBody:
      "Please arrive by the time mentioned so seating and welcome drinks can be arranged smoothly before the ceremony begins.",
  },
  {
    key: "venueCard2Title",
    defaultTitle: "Photography",
    bodyKey: "venueCard2Body",
    defaultBody:
      "Family portraits will be taken right after the ceremony, followed by candid coverage through the evening.",
  },
  {
    key: "venueCard3Title",
    defaultTitle: "Parking",
    bodyKey: "venueCard3Body",
    defaultBody:
      "Valet parking will be available at the main gate. Overflow parking will be directed by the hospitality desk.",
  },
  {
    key: "venueCard4Title",
    defaultTitle: "Hospitality",
    bodyKey: "venueCard4Body",
    defaultBody:
      "For stay support, transport help, or room assistance, our guest relations team will be available throughout the event.",
  },
];

const VenueSection = ({
  event,
  mode,
  data,
  onUpdate,
}: {
  event: EventData | null;
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  if (!event) return null;

  const updateCustomText = (key: string, value: string) =>
    onUpdate({ customTexts: { ...data.customTexts, [key]: value } });

  const updateFirstEvent = (updates: Partial<EventData>) => {
    const next = [...data.events];
    next[0] = { ...next[0], ...updates };
    onUpdate({ events: next });
  };

  return (
    <section className="px-4 pb-24">
      <div
        className="mx-auto max-w-6xl overflow-hidden rounded-[38px] border"
        style={{
          borderColor: C.border,
          background:
            "linear-gradient(168deg, rgba(255,253,249,0.98), rgba(247,238,224,0.96) 50%, rgba(240,228,210,0.94))",
          boxShadow: C.shadow,
        }}
      >
        <div className="grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div {...sectionReveal}>
            <p
              className="mb-3 text-[11px] uppercase tracking-[0.45em]"
              style={{ color: C.gold, fontFamily: FONTS.sans }}
            >
              Venue Highlight
            </p>
            <div style={{ color: C.ink, fontFamily: FONTS.display }}>
              <EditableText
                value={event.venueName}
                onSave={(val) => updateFirstEvent({ venueName: val })}
                mode={mode}
                className="text-5xl leading-[0.98] sm:text-6xl"
                as="h2"
                placeholder="Venue Name"
              />
            </div>
            <div
              style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
              className="mt-5 max-w-xl"
            >
              <EditableText
                value={event.venueAddress}
                onSave={(val) => updateFirstEvent({ venueAddress: val })}
                mode={mode}
                className="text-lg leading-8"
                as="p"
                multiline
                placeholder="Venue address"
              />
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              {mode === "edit" ? (
                <>
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                    style={{
                      borderColor: C.border,
                      backgroundColor: "rgba(182,129,63,0.08)",
                      color: C.ink,
                      fontFamily: FONTS.sans,
                    }}
                  >
                    <CalendarDays size={16} style={{ color: C.gold }} />
                    <input
                      type="date"
                      value={event.eventDate || ""}
                      onChange={(e) =>
                        updateFirstEvent({ eventDate: e.target.value })
                      }
                      className="cursor-pointer border-none bg-transparent outline-none"
                      style={{ color: C.ink, fontFamily: FONTS.sans }}
                    />
                  </div>
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                    style={{
                      borderColor: C.border,
                      backgroundColor: "rgba(182,129,63,0.08)",
                      color: C.ink,
                      fontFamily: FONTS.sans,
                    }}
                  >
                    <Clock3 size={16} style={{ color: C.gold }} />
                    <input
                      type="time"
                      value={event.eventTime || ""}
                      onChange={(e) =>
                        updateFirstEvent({ eventTime: e.target.value })
                      }
                      className="cursor-pointer border-none bg-transparent outline-none"
                      style={{ color: C.ink, fontFamily: FONTS.sans }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                    style={{
                      borderColor: C.border,
                      backgroundColor: "rgba(182,129,63,0.08)",
                      color: C.ink,
                      fontFamily: FONTS.sans,
                    }}
                  >
                    <CalendarDays size={16} style={{ color: C.gold }} />
                    <span>{formatEventDate(event.eventDate)}</span>
                  </div>
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                    style={{
                      borderColor: C.border,
                      backgroundColor: "rgba(182,129,63,0.08)",
                      color: C.ink,
                      fontFamily: FONTS.sans,
                    }}
                  >
                    <Clock3 size={16} style={{ color: C.gold }} />
                    <span>{formatTime(event.eventTime)}</span>
                  </div>
                </>
              )}
            </div>
            {event.mapsUrl && (
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm"
                style={{
                  backgroundColor: C.gold,
                  color: C.white,
                  fontFamily: FONTS.sans,
                }}
              >
                <MapPin size={16} />
                Open in Maps
              </a>
            )}
          </motion.div>

          <motion.div {...sectionReveal} className="grid gap-4 sm:grid-cols-2">
            {DEFAULT_VENUE_CARDS.map((card) => (
              <motion.div
                key={card.key}
                whileHover={{ y: -6 }}
                className="rounded-[28px] border p-6"
                style={{
                  borderColor: C.border,
                  backgroundColor: "rgba(255,253,249,0.8)",
                  boxShadow: "0 12px 40px rgba(43,23,24,0.06)",
                }}
              >
                <div style={{ color: C.gold, fontFamily: FONTS.sans }}>
                  <EditableText
                    value={data.customTexts?.[card.key] || card.defaultTitle}
                    onSave={(val) => updateCustomText(card.key, val)}
                    mode={mode}
                    placeholder={card.defaultTitle}
                    className="text-[11px] uppercase tracking-[0.34em]"
                    as="p"
                  />
                </div>
                <div style={{ color: C.inkMuted }}>
                  <EditableText
                    value={data.customTexts?.[card.bodyKey] || card.defaultBody}
                    onSave={(val) => updateCustomText(card.bodyKey, val)}
                    mode={mode}
                    placeholder="Add details here"
                    className="mt-3 text-lg leading-7"
                    as="p"
                    multiline
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {mode === "edit" && (
        <div className="mt-6 flex justify-center">
          <SectionActionButton
            label="Remove Section"
            onClick={() =>
              onUpdate({
                sectionVisibility: {
                  ...getSectionVisibility(data),
                  venue: false,
                },
              })
            }
          />
        </div>
      )}
    </section>
  );
};

const InfoPill = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div
    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
    style={{
      backgroundColor: "rgba(255,255,255,0.08)",
      color: C.white,
      fontFamily: FONTS.sans,
    }}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const FaqSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const [openIndex, setOpenIndex] = useState(0);

  const updateCustomText = (key: string, value: string) =>
    onUpdate({ customTexts: { ...data.customTexts, [key]: value } });

  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionIntro
            kicker="Questions"
            title="Questions and Answers"
            body="Everything you might want to know before the big day — all in one place."
            align="left"
          />

          <motion.div {...sectionReveal} className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = index === openIndex;
              const qKey = `faqQ${index}`;
              const aKey = `faqA${index}`;
              return (
                <div
                  key={item.q}
                  className="overflow-hidden rounded-[28px] border"
                  style={{
                    borderColor: C.border,
                    backgroundColor: isOpen
                      ? "rgba(255,253,249,0.9)"
                      : "rgba(255,253,249,0.62)",
                    boxShadow: isOpen
                      ? "0 20px 50px rgba(43, 23, 24, 0.08)"
                      : "none",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    {mode === "edit" ? (
                      <span style={{ fontFamily: FONTS.display }}>
                        <EditableText
                          value={data.customTexts?.[qKey] || item.q}
                          onSave={(val) => updateCustomText(qKey, val)}
                          mode={mode}
                          placeholder="Question"
                          className="text-2xl sm:text-3xl"
                          as="span"
                        />
                      </span>
                    ) : (
                      <span
                        className="text-2xl sm:text-3xl"
                        style={{ fontFamily: FONTS.display }}
                      >
                        {data.customTexts?.[qKey] || item.q}
                      </span>
                    )}
                    <ChevronDown
                      size={22}
                      className={cn(
                        "shrink-0 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      {mode === "edit" ? (
                        <div
                          style={{
                            color: C.inkMuted,
                            fontFamily: FONTS.sans,
                          }}
                        >
                          <EditableText
                            value={data.customTexts?.[aKey] || item.a}
                            onSave={(val) => updateCustomText(aKey, val)}
                            mode={mode}
                            placeholder="Answer"
                            className="text-base leading-8"
                            as="p"
                            multiline
                          />
                        </div>
                      ) : (
                        <p
                          className="text-base leading-8"
                          style={{
                            color: C.inkMuted,
                            fontFamily: FONTS.sans,
                          }}
                        >
                          {data.customTexts?.[aKey] || item.a}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {mode === "edit" && (
          <div className="mt-8 flex justify-center">
            <SectionActionButton
              label="Remove Section"
              onClick={() =>
                onUpdate({
                  sectionVisibility: {
                    ...getSectionVisibility(data),
                    faq: false,
                  },
                })
              }
            />
          </div>
        )}
      </div>
    </section>
  );
};
const GiftsSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const [revealed, setRevealed] = useState(false);

  const updateCustomText = (key: string, value: string) =>
    onUpdate({ customTexts: { ...data.customTexts, [key]: value } });

  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          {...sectionReveal}
          className="overflow-hidden rounded-[40px] border px-6 py-12 text-center sm:px-10"
          style={{
            borderColor: C.border,
            background:
              "linear-gradient(180deg, rgba(255,253,249,0.96), rgba(249,241,230,0.86))",
            boxShadow: C.shadow,
          }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(184,138,65,0.12)" }}
          >
            <Gift size={28} style={{ color: C.gold }} />
          </div>
          <p
            className="text-[11px] uppercase tracking-[0.45em]"
            style={{ color: C.gold, fontFamily: FONTS.sans }}
          >
            Gifts & Blessings
          </p>
          <h2
            className="mt-4 text-5xl sm:text-6xl"
            style={{ fontFamily: FONTS.display }}
          >
            <EditableText
              value={
                data.customTexts?.giftsHeading ||
                "Your Presence Is The Real Gift"
              }
              onSave={(val) => updateCustomText("giftsHeading", val)}
              mode={mode}
              placeholder="Your Presence Is The Real Gift"
              as="span"
            />
          </h2>
          <p
            className="mx-auto mt-5 max-w-3xl text-lg leading-8"
            style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
          >
            <EditableText
              value={
                data.customTexts?.giftsBody ||
                "If you wish to bless the couple as they start their new journey together, you can use the details below."
              }
              onSave={(val) => updateCustomText("giftsBody", val)}
              mode={mode}
              placeholder="Add a message about gifts"
              as="span"
              multiline
            />
          </p>

          <div className="mt-10 flex justify-center">
            {mode === "edit" ? (
              <div
                className="w-full max-w-sm rounded-[28px] border px-6 py-10"
                style={{
                  borderColor: "rgba(184,138,65,0.4)",
                  backgroundColor: "rgba(184,138,65,0.08)",
                }}
              >
                <p
                  className="mb-4 text-[11px] uppercase tracking-[0.34em]"
                  style={{ color: C.gold, fontFamily: FONTS.sans }}
                >
                  Payment Details (editable)
                </p>
                <div
                  className="space-y-1 text-base"
                  style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                >
                  <p>
                    <EditableText
                      value={
                        data.customTexts?.giftsUpi || "UPI ID: yourname@upi"
                      }
                      onSave={(val) => updateCustomText("giftsUpi", val)}
                      mode={mode}
                      placeholder="UPI ID: yourname@upi"
                      as="span"
                    />
                  </p>
                  <p>
                    <EditableText
                      value={
                        data.customTexts?.giftsAccountName ||
                        "A/C Name: Account Holder Name"
                      }
                      onSave={(val) =>
                        updateCustomText("giftsAccountName", val)
                      }
                      mode={mode}
                      placeholder="A/C Name: Account Holder Name"
                      as="span"
                    />
                  </p>
                  <p>
                    <EditableText
                      value={
                        data.customTexts?.giftsAccountNo ||
                        "A/C No: XXXX XXXX XXXX"
                      }
                      onSave={(val) => updateCustomText("giftsAccountNo", val)}
                      mode={mode}
                      placeholder="A/C No: XXXX XXXX XXXX"
                      as="span"
                    />
                  </p>
                  <p>
                    <EditableText
                      value={data.customTexts?.giftsIfsc || "IFSC: XXXX0001234"}
                      onSave={(val) => updateCustomText("giftsIfsc", val)}
                      mode={mode}
                      placeholder="IFSC: XXXX0001234"
                      as="span"
                    />
                  </p>
                </div>
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setRevealed((prev) => !prev)}
                className="w-full max-w-sm rounded-[28px] border px-6 py-10"
                style={{
                  borderColor: revealed ? "rgba(184,138,65,0.4)" : C.border,
                  backgroundColor: revealed
                    ? "rgba(184,138,65,0.08)"
                    : "rgba(255,255,255,0.7)",
                }}
              >
                {!revealed ? (
                  <div className="space-y-4">
                    <Gift
                      className="mx-auto"
                      size={28}
                      style={{ color: C.gold }}
                    />
                    <p
                      className="text-[11px] uppercase tracking-[0.34em]"
                      style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                    >
                      Bank Details
                    </p>
                    <p
                      className="text-2xl"
                      style={{ fontFamily: FONTS.display }}
                    >
                      Tap to reveal
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <p
                      className="text-[11px] uppercase tracking-[0.34em]"
                      style={{ color: C.gold, fontFamily: FONTS.sans }}
                    >
                      Payment Option
                    </p>
                    <p
                      className="text-2xl"
                      style={{ fontFamily: FONTS.display }}
                    >
                      UPI / Bank Transfer
                    </p>
                    <div
                      className="space-y-1 text-base"
                      style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                    >
                      <p>
                        <EditableText
                          value={
                            data.customTexts?.giftsUpi || "UPI ID: yourname@upi"
                          }
                          onSave={(val) => updateCustomText("giftsUpi", val)}
                          mode={mode}
                          placeholder="UPI ID: yourname@upi"
                          as="span"
                        />
                      </p>
                      <p>
                        <EditableText
                          value={
                            data.customTexts?.giftsAccountName ||
                            "A/C Name: Account Holder Name"
                          }
                          onSave={(val) =>
                            updateCustomText("giftsAccountName", val)
                          }
                          mode={mode}
                          placeholder="A/C Name: Account Holder Name"
                          as="span"
                        />
                      </p>
                      <p>
                        <EditableText
                          value={
                            data.customTexts?.giftsAccountNo ||
                            "A/C No: XXXX XXXX XXXX"
                          }
                          onSave={(val) =>
                            updateCustomText("giftsAccountNo", val)
                          }
                          mode={mode}
                          placeholder="A/C No: XXXX XXXX XXXX"
                          as="span"
                        />
                      </p>
                      <p>
                        <EditableText
                          value={
                            data.customTexts?.giftsIfsc || "IFSC: XXXX0001234"
                          }
                          onSave={(val) => updateCustomText("giftsIfsc", val)}
                          mode={mode}
                          placeholder="IFSC: XXXX0001234"
                          as="span"
                        />
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {mode === "edit" && (
          <div className="mt-6 flex justify-center">
            <SectionActionButton
              label="Remove Section"
              onClick={() =>
                onUpdate({
                  sectionVisibility: {
                    ...getSectionVisibility(data),
                    gifts: false,
                  },
                })
              }
            />
          </div>
        )}
      </div>
    </section>
  );
};

const RsvpSection = ({
  invitationId,
  isDemo,
}: {
  invitationId: number | null;
  isDemo: boolean;
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "maybe" | "no">("yes");
  const [guestCount, setGuestCount] = useState(2);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (isDemo) {
      toast("This is a demo - create your invitation to receive real RSVPs", {
        icon: "✨",
      });
      return;
    }

    setLoading(true);
    try {
      await submitRsvp(String(invitationId || ""), {
        guestName: name,
        guestPhone: phone,
        attending:
          attending === "yes" ? "YES" : attending === "maybe" ? "MAYBE" : "NO",
        guestCount: attending === "no" ? 0 : guestCount,
        message: message || undefined,
      });
      setSubmitted(true);
    } catch {
      toast.error("Could not submit RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="px-4 pb-24">
        <div
          className="mx-auto max-w-3xl rounded-[40px] border px-6 py-16 text-center sm:px-10"
          style={{
            borderColor: C.border,
            backgroundColor: "rgba(255,253,249,0.88)",
            boxShadow: C.shadow,
          }}
        >
          <div className="mx-auto mb-6 flex items-center justify-center rounded-full bg-[rgba(184,138,65,0.12)] p-5">
            <Check size={30} style={{ color: C.gold }} />
          </div>
          <h2
            className="text-5xl sm:text-6xl"
            style={{ fontFamily: FONTS.display }}
          >
            Thank You, {name}
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-lg leading-8"
            style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
          >
            We're so happy you responded. Your RSVP has been received with love.
          </p>
        </div>
      </section>
    );
  }

  const options = [
    { value: "yes" as const, label: "Joyfully Accept" },
    { value: "maybe" as const, label: "Maybe" },
    { value: "no" as const, label: "Decline" },
  ];

  return (
    <section className="px-4 pb-24">
      <div
        className="mx-auto max-w-5xl overflow-hidden rounded-[42px] border"
        style={{
          borderColor: C.border,
          backgroundColor: "rgba(255,253,249,0.9)",
          boxShadow: C.shadow,
        }}
      >
        <div className="grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[0.82fr_1.18fr]">
          <motion.div {...sectionReveal}>
            <p
              className="text-[11px] uppercase tracking-[0.42em]"
              style={{ color: C.gold, fontFamily: FONTS.sans }}
            >
              Kindly Respond
            </p>
            <h2
              className="mt-4 text-5xl leading-[0.96] sm:text-6xl"
              style={{ fontFamily: FONTS.display }}
            >
              Will You Celebrate With Us?
            </h2>
            <p
              className="mt-5 max-w-md text-lg leading-8"
              style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
            >
              We'd love to know if you can make it. Please fill in your details
              so we can prepare everything just right for you.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Confirm your attendance",
                "Let us know your guest count",
                "Share any dietary or travel needs",
                "Leave a personal note for the couple",
              ].map((line) => (
                <div key={line} className="flex items-center gap-3">
                  <Heart size={16} style={{ color: C.gold }} />
                  <span style={{ color: C.inkMuted, fontFamily: FONTS.sans }}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form
            {...sectionReveal}
            onSubmit={handleSubmit}
            className="grid gap-5"
          >
            <label className="grid gap-2">
              <span
                className="text-[11px] uppercase tracking-[0.3em]"
                style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
              >
                Guest Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-[20px] border px-5 py-4 outline-none"
                style={{
                  borderColor: C.border,
                  backgroundColor: C.white,
                  fontFamily: FONTS.sans,
                }}
                placeholder="Your full name"
              />
            </label>
            <label className="grid gap-2">
              <span
                className="text-[11px] uppercase tracking-[0.3em]"
                style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
              >
                Phone Number
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
                maxLength={10}
                className="rounded-[20px] border px-5 py-4 outline-none"
                style={{
                  borderColor: C.border,
                  backgroundColor: C.white,
                  fontFamily: FONTS.sans,
                }}
                placeholder="10-digit mobile number"
              />
            </label>
            <div>
              <p
                className="mb-3 text-[11px] uppercase tracking-[0.3em]"
                style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
              >
                Response
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAttending(option.value)}
                    className="rounded-[18px] border px-4 py-4 text-sm transition-all"
                    style={{
                      borderColor:
                        attending === option.value ? C.gold : C.border,
                      backgroundColor:
                        attending === option.value
                          ? "rgba(184,138,65,0.08)"
                          : C.white,
                      fontFamily: FONTS.sans,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {attending !== "no" && (
              <label className="grid gap-2">
                <span
                  className="text-[11px] uppercase tracking-[0.3em]"
                  style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                >
                  Guest Count
                </span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="rounded-[20px] border px-5 py-4 outline-none"
                  style={{
                    borderColor: C.border,
                    backgroundColor: C.white,
                    fontFamily: FONTS.sans,
                  }}
                />
              </label>
            )}
            <label className="grid gap-2">
              <span
                className="text-[11px] uppercase tracking-[0.3em]"
                style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
              >
                Message
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="rounded-[20px] border px-5 py-4 outline-none"
                style={{
                  borderColor: C.border,
                  backgroundColor: C.white,
                  fontFamily: FONTS.sans,
                }}
                placeholder="Add a lovely note"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm uppercase tracking-[0.22em]"
              style={{
                backgroundColor: C.plum,
                color: C.white,
                fontFamily: FONTS.sans,
              }}
            >
              {loading ? (
                <Sparkles size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {loading ? "Sending..." : "Send RSVP"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default GoldenMemoTemplate;
