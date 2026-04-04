import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
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
  Sparkle,
  Send,
  Sparkles,
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
import { createEmptyEvent, EventData, TemplateProps } from "@/templates/types";
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
    a: "Think regal, festive, and camera-ready. Jewel tones, embroidered looks, and soft glam fit the mood beautifully.",
  },
  {
    q: "Can I bring family?",
    a: "Yes, if your invitation mentions guest count. We want every seat, meal, and welcome prepared with care.",
  },
  {
    q: "Will accommodation details be shared?",
    a: "Yes. Nearby stay suggestions and travel pointers can be added here for guests coming from outside the city.",
  },
  {
    q: "Is there a gift option?",
    a: "Your blessings matter most, but a payment or bank transfer option is included below if you want to contribute with love.",
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
      <StorySection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
        photos={displayPhotos}
        templateId={templateId}
        sessionUUID={sessionUUID}
        uploadStage={uploadStage}
      />
      <EventsSection mode={mode} data={data} onUpdate={onUpdate} />
      <VenueSection event={data.events[0] ?? null} />
      <FaqSection />
      <GiftsSection />

      {mode === "edit" && (
        <section className="px-4 pb-12">
          <div
            className="mx-auto max-w-3xl rounded-[32px] border px-5 py-8 sm:px-8"
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
          <p
            className="mb-3 text-[11px] uppercase tracking-[0.45em]"
            style={{ color: C.gold, fontFamily: FONTS.sans }}
          >
            Made for Celebration
          </p>
          <h2
            className="text-4xl sm:text-5xl"
            style={{ color: C.ink, fontFamily: FONTS.display }}
          >
            {data.brideName || "Bride"} &amp; {data.groomName || "Groom"}
          </h2>
          <p
            className="mt-4 text-lg"
            style={{ color: C.inkMuted, fontFamily: FONTS.serif }}
          >
            {formatWeddingDate(data.weddingDate)}
          </p>
          <p
            className="mt-5 text-sm uppercase tracking-[0.25em]"
            style={{ color: "rgba(108,88,77,0.5)", fontFamily: FONTS.sans }}
          >
            Shubh Aarambh Invitation
          </p>
        </motion.div>
      </footer>

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
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 0.42], [1, 0.78]);
  const heroRadius = useTransform(scrollYProgress, [0, 0.42], [0, 42]);
  const namesOpacity = useTransform(scrollYProgress, [0, 0.18, 0.28], [1, 1, 0]);
  const detailsOpacity = useTransform(scrollYProgress, [0.2, 0.38], [0, 1]);
  const detailsY = useTransform(scrollYProgress, [0.2, 0.38], [24, 0]);
  const mainPhoto =
    data.couplePhotoUrl || photos[0]?.photoUrl || DEFAULT_COUPLE_PHOTO;
  const floatingPhotos = [
    photos[1]?.photoUrl,
    photos[2]?.photoUrl,
    photos[3]?.photoUrl,
    photos[4]?.photoUrl,
  ];

  return (
    <section ref={heroRef} className="relative h-[185vh]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-12%] top-10 h-64 w-64 rounded-full bg-[#dba35c]/15 blur-3xl" />
        <div className="absolute right-[-10%] top-40 h-80 w-80 rounded-full bg-[#7f2d2f]/10 blur-3xl" />
      </div>

      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative h-full">
          <motion.div
            style={{ scale: heroScale, borderRadius: heroRadius }}
            className="absolute inset-0 z-20 origin-center overflow-hidden border bg-white shadow-[0_35px_90px_rgba(43,23,24,0.18)]"
          >
            <div className="relative h-full w-full p-0 sm:p-3">
              <EditablePhoto
                photoUrl={mainPhoto}
                onSave={(url) => onUpdate({ couplePhotoUrl: url })}
                mode={mode}
                className="h-full w-full rounded-none sm:rounded-[32px]"
                alt="Couple intro"
                templateId={templateId}
                sessionUUID={sessionUUID}
                uploadStage={uploadStage}
                invitationId={data.invitationId ?? undefined}
                oldPublicUrl={data.couplePhotoUrl || undefined}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(24,9,10,0.7)] via-transparent to-transparent" />
              <motion.div
                style={{ opacity: namesOpacity }}
                className="absolute inset-x-0 bottom-0 z-10 px-8 pb-10 text-center sm:px-14"
              >
                <p
                  className="text-[11px] uppercase tracking-[0.45em]"
                  style={{
                    color: "rgba(255,241,219,0.76)",
                    fontFamily: FONTS.sans,
                  }}
                >
                  Save The Date
                </p>
                <div className="mt-3 flex flex-col items-center gap-1">
                  <EditableText
                    value={data.brideName}
                    onSave={(value) => onUpdate({ brideName: value })}
                    mode={mode}
                    className="block text-5xl leading-none text-white sm:text-7xl md:text-8xl"
                    inputClassName="text-5xl sm:text-7xl md:text-8xl text-white"
                    as="h1"
                    placeholder="Bride Name"
                  />
                  <p
                    className="text-3xl sm:text-4xl"
                    style={{ color: C.goldSoft, fontFamily: FONTS.script }}
                  >
                    &amp;
                  </p>
                  <EditableText
                    value={data.groomName}
                    onSave={(value) => onUpdate({ groomName: value })}
                    mode={mode}
                    className="block text-5xl leading-none text-white sm:text-7xl md:text-8xl"
                    inputClassName="text-5xl sm:text-7xl md:text-8xl text-white"
                    as="h1"
                    placeholder="Groom Name"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: detailsOpacity, y: detailsY }}
            className="pointer-events-none absolute inset-0 z-30"
          >
            <div className="mx-auto flex h-full w-full max-w-6xl items-start px-4 pt-10 sm:px-6 sm:pt-12">
              <div className="w-full">
                <div className="mb-6 flex items-center justify-center">
                  <div
                    className="rounded-full border px-5 py-2 text-[11px] uppercase tracking-[0.38em]"
                    style={{
                      borderColor: "rgba(255,247,233,0.34)",
                      backgroundColor: "rgba(27,12,13,0.45)",
                      color: "rgba(255,242,222,0.92)",
                      fontFamily: FONTS.sans,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    We're Getting Married
                  </div>
                </div>
                <p
                  className="text-center text-sm uppercase tracking-[0.44em]"
                  style={{ color: "rgba(255,241,219,0.88)", fontFamily: FONTS.sans }}
                >
                  {formatWeddingDate(data.weddingDate)}
                </p>
              </div>
            </div>
          </motion.div>

          {floatingPhotos.map((photoUrl, index) => {
            const positions = [
              "left-[4%] top-[8%] w-[22%] md:w-[18%]",
              "right-[4%] top-[10%] w-[18%] md:w-[14%]",
              "left-[8%] bottom-[9%] w-[20%] md:w-[16%]",
              "right-[6%] bottom-[8%] w-[19%] md:w-[15%]",
            ];
            const startTransforms = [
              { x: -180, y: -160, rotate: -14 },
              { x: 180, y: -160, rotate: 14 },
              { x: -180, y: 160, rotate: -14 },
              { x: 180, y: 160, rotate: 14 },
            ];
            return (
              <motion.div
                key={`${photoUrl || "empty"}-${index}`}
                initial={{ opacity: 0, scale: 0.72, ...startTransforms[index] }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: index % 2 === 0 ? -4 : 4 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{
                  duration: 0.85,
                  delay: 0.12 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn("pointer-events-auto absolute z-30 rounded-[24px] border bg-white p-2 shadow-[0_24px_48px_rgba(43,23,24,0.18)]", positions[index])}
                style={{ opacity: detailsOpacity, borderColor: C.border }}
              >
                <EditablePhoto
                  photoUrl={photoUrl || null}
                  onSave={(url) =>
                    onUpdate({
                      galleryPhotos: updateGalleryPhotoAtIndex(photos, index + 1, url),
                    })
                  }
                  mode={mode}
                  className="h-28 w-full rounded-[18px] sm:h-36 md:h-44"
                  alt={`Floating memory ${index + 1}`}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                  invitationId={data.invitationId ?? undefined}
                  oldPublicUrl={photoUrl || undefined}
                />
              </motion.div>
            );
          })}
        </div>
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const cards = [
    photos[1]?.photoUrl || photos[0]?.photoUrl || DEFAULT_COUPLE_PHOTO,
    photos[2]?.photoUrl || photos[1]?.photoUrl || DEFAULT_COUPLE_PHOTO,
    photos[3]?.photoUrl || photos[2]?.photoUrl || DEFAULT_COUPLE_PHOTO,
  ];
  const count = cards.length;

  const storyTexts = [
    "The first time we met, there was an unspoken warmth — like finding a melody you never knew you were humming.",
    "Through late-night conversations and shared silences, we discovered that love isn't just found — it grows, gently and deeply.",
    "And now, here we are — two stories becoming one, ready to write every chapter of forever together.",
  ];

  const rotations = [-3, 4, -2];
  const revealPoints =
    count <= 1
      ? [0]
      : Array.from({ length: count }, (_, index) => {
          if (index === 0) return 0;
          const spread = Math.max(count - 1, 1);
          return 0.46 + ((index - 1) / spread) * 0.42;
        });
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let idx = 0;
    for (let i = 0; i < revealPoints.length; i += 1) {
      if (v >= revealPoints[i]) idx = i;
    }
    setActiveIndex((prev) => Math.max(prev, idx));
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: `${100 + (count - 1) * 96}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center px-4 py-6">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[8%] top-[18%] h-48 w-48 rounded-full bg-[#b6813f]/8 blur-3xl" />
          <div className="absolute right-[10%] bottom-[14%] h-60 w-60 rounded-full bg-[#7e4740]/10 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl">
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

          {/* Main content: text + stacking image */}
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Text — alternates side */}
            <div className="flex min-h-[180px] items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-lg lg:text-left"
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

            {/* Image stack — in center / other side */}
            <div
              className="relative mx-auto"
              style={{ width: "min(420px, 80vw)", height: "min(520px, 72vw)" }}
            >
              {cards.map((photoUrl, index) => {
                const isVisible = index <= activeIndex;
                return (
                  <motion.div
                    key={`card-${index}`}
                    initial={false}
                    animate={{
                      opacity: isVisible ? 1 : 0,
                      scale: isVisible ? 1 : 0.75,
                      y: isVisible ? index * 16 : 320,
                      rotate: isVisible ? (rotations[index] ?? 0) : 0,
                    }}
                    transition={{
                      duration: 1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 rounded-[22px] bg-[#fffefb] p-3"
                    style={{
                      zIndex: 20 + index,
                      boxShadow: isVisible
                        ? `0 ${20 + index * 8}px ${60 + index * 20}px rgba(43,23,24,${0.12 + index * 0.04})`
                        : "none",
                      pointerEvents: index === activeIndex ? "auto" : "none",
                    }}
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
                );
              })}
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
          title="Every Function, Beautifully Framed"
          body="Refined event cards with real-looking copy, richer hierarchy, and softer motion so the section feels premium instead of generic."
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

        <motion.div {...sectionReveal} className="mt-6">
          <AddEventButton
            mode={mode}
            onAdd={() =>
              onUpdate({ events: [...data.events, createEmptyEvent()] })
            }
            currentCount={data.events.length}
            maxEvents={8}
            className="rounded-[24px] bg-[rgba(255,253,249,0.56)]"
          />
        </motion.div>
      </div>
    </section>
  );
};

const VenueSection = ({ event }: { event: EventData | null }) => {
  if (!event) return null;

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
            <h2
              className="text-5xl leading-[0.98] sm:text-6xl"
              style={{ color: C.ink, fontFamily: FONTS.display }}
            >
              {event.venueName}
            </h2>
            <p
              className="mt-5 max-w-xl text-lg leading-8"
              style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
            >
              {event.venueAddress}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
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
              <div
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                style={{
                  borderColor: C.border,
                  backgroundColor: "rgba(182,129,63,0.08)",
                  color: C.ink,
                  fontFamily: FONTS.sans,
                }}
              >
                <MapPin size={16} style={{ color: C.gold }} />
                <span>Location Ready</span>
              </div>
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
            {[
              {
                title: "Arrival",
                text: "Guests are requested by 4:45 PM so welcome drinks and seating can begin smoothly before the main ceremony.",
              },
              {
                title: "Photography",
                text: "Family portraits will be guided right after the varmala, followed by open candid coverage through the evening.",
              },
              {
                title: "Parking",
                text: "Valet will be available at the main gate, with overflow parking directed by the hospitality desk.",
              },
              {
                title: "Hospitality",
                text: "For stay support, transport help, or room assistance, our guest relations team will be available throughout the event.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -6 }}
                className="rounded-[28px] border p-6"
                style={{
                  borderColor: C.border,
                  backgroundColor: "rgba(255,253,249,0.8)",
                  boxShadow: "0 12px 40px rgba(43,23,24,0.06)",
                }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.34em]"
                  style={{ color: C.gold, fontFamily: FONTS.sans }}
                >
                  {item.title}
                </p>
                <p
                  className="mt-3 text-lg leading-7"
                  style={{ color: C.inkMuted }}
                >
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
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

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="px-4 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionIntro
            kicker="Questions"
            title="Questions and Answers"
            body="A section like the one in your screenshot, designed to stay airy and premium instead of looking cramped."
            align="left"
          />

          <motion.div {...sectionReveal} className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = index === openIndex;
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
                    <span
                      className="text-2xl sm:text-3xl"
                      style={{ fontFamily: FONTS.display }}
                    >
                      {item.q}
                    </span>
                    <ChevronDown
                      size={22}
                      className={cn(
                        "transition-transform",
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
                    <p
                      className="px-6 pb-6 text-base leading-8"
                      style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                    >
                      {item.a}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
const GiftsSection = () => {
  const [revealed, setRevealed] = useState(false);

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
            Your Presence Is The Real Gift
          </h2>
          <p
            className="mx-auto mt-5 max-w-3xl text-lg leading-8"
            style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
          >
            If you still wish to contribute to the couple's new beginning, this
            section gives you the same kind of payment reveal interaction you
            shared.
          </p>

          <div className="mt-10 flex justify-center">
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
                  <p className="text-2xl" style={{ fontFamily: FONTS.display }}>
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
                  <p className="text-2xl" style={{ fontFamily: FONTS.display }}>
                    UPI / Bank Transfer
                  </p>
                  <div
                    className="space-y-1 text-base"
                    style={{ color: C.inkMuted, fontFamily: FONTS.sans }}
                  >
                    <p>UPI ID: weddingfamily@okaxis</p>
                    <p>A/C Name: Shubh Aarambh Couple Fund</p>
                    <p>A/C No: 1234 5678 9012</p>
                    <p>IFSC: SBIN0001234</p>
                  </div>
                </motion.div>
              )}
            </motion.button>
          </div>
        </motion.div>
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
        guestCount,
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
              This keeps the existing RSVP flow but dresses it in the same
              editorial style as the rest of the invite.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Quick reply form",
                "Phone-based guest tracking",
                "Guest count and note support",
                "Works in demo and live mode",
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
