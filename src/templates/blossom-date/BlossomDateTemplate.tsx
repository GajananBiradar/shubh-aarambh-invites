/**
 * Blossom Date Template — "Sage Envelope" style
 * Inspired by click2invite.ru — Elegant envelope wedding invitation
 * Features: Envelope opening → Hand-drawn fonts → Inline music toggle →
 * Calendar with scribble circle → Animated S-curve heart timeline →
 * Venue with directions → Dress code palette → Gallery → Details → RSVP
 */
import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  MapPin,
  Heart,
  Calendar,
  Clock,
  Trash2,
  Check,
  Minus,
  Plus,
  Send,
  Volume2,
  VolumeX,
  ChevronDown,
} from "lucide-react";
import { TemplateProps, EventData } from "@/templates/types";
import {
  EditableText,
  EditablePhoto,
  EditableEventCard,
  AddEventButton,
  EditablePhotoGallery,
  EditableMusicPlayer,
  EditModeToolbar,
} from "@/components/inline-editor";
import {
  formatWeddingDate,
  formatEventDate,
  formatTime,
} from "@/utils/formatDate";
import { cn } from "@/lib/utils";
import { submitRsvp } from "@/api/rsvp";
import toast from "react-hot-toast";

/* ────────────────────────────────────────────
   Color Palette — Sage & Cream
   ──────────────────────────────────────────── */
const C = {
  sage: "#7a8c6e",
  sageDark: "#5d6b53",
  sageLight: "#95a685",
  sageMuted: "#a3b296",
  cream: "#faf6f0",
  creamDark: "#f0ebe2",
  warmWhite: "#fdfcf9",
  text: "#3a3632",
  textMuted: "#6b6460",
  textLight: "#9a9490",
  gold: "#c5a46d",
  waxSeal: "#c4956a",
  waxSealDark: "#a67c55",
  white: "#ffffff",
  heartGreen: "#6b7f5e",
};

const FONTS = {
  script: "'Great Vibes', cursive",
  heading: "'Cormorant Garamond', serif",
  body: "'Cormorant Garamond', serif",
};

const R2_BASE = "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev";
const DEFAULT_COUPLE_PHOTO = `${R2_BASE}/templates/3/photos/couple%20phto.jpg`;
const DEFAULT_VENUE_PHOTO = `${R2_BASE}/templates/3/photos/Dinner%20table.jpeg`;
const DEFAULT_DETAIL_PHOTO = `${R2_BASE}/templates/3/photos/Garden.jpeg`;

/* ────────────────────────────────────────────
   TORN PAPER EDGE SVG
   ──────────────────────────────────────────── */
const TornEdgeTop = ({
  color = C.cream,
  className = "",
}: {
  color?: string;
  className?: string;
}) => (
  <div className={cn("w-full overflow-hidden leading-[0] -mt-px", className)}>
    <svg
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      className="w-full h-[30px] md:h-[50px] block"
      style={{ color }}
    >
      <path
        d="M0,60 L0,25 Q30,20 60,28 Q90,35 120,22 Q150,10 180,25 Q210,38 240,20 Q270,5 300,22 Q330,38 360,18 Q390,0 420,20 Q450,38 480,15 Q510,0 540,22 Q570,40 600,18 Q630,0 660,25 Q690,42 720,15 Q750,0 780,20 Q810,35 840,12 Q870,0 900,25 Q930,42 960,18 Q990,0 1020,22 Q1050,38 1080,15 Q1110,0 1140,20 Q1170,35 1200,25 L1200,60 Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

const TornEdgeBottom = ({
  color = C.cream,
  className = "",
}: {
  color?: string;
  className?: string;
}) => (
  <div className={cn("w-full overflow-hidden leading-[0] -mb-px", className)}>
    <svg
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      className="w-full h-[30px] md:h-[50px] block"
      style={{ color }}
    >
      <path
        d="M0,0 L0,35 Q30,40 60,32 Q90,25 120,38 Q150,50 180,35 Q210,22 240,40 Q270,55 300,38 Q330,22 360,42 Q390,60 420,40 Q450,22 480,45 Q510,60 540,38 Q570,20 600,42 Q630,60 660,35 Q690,18 720,45 Q750,60 780,40 Q810,25 840,48 Q870,60 900,35 Q930,18 960,42 Q990,60 1020,38 Q1050,22 1080,45 Q1110,60 1140,40 Q1170,25 1200,35 L1200,0 Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

/* ════════════════════════════════════════════
   HAND-DRAWN CIRCLE SVG — imperfect, organic feel
   ════════════════════════════════════════════ */
const HandDrawnCircle = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 240 160"
    fill="none"
    className={className}
    style={{ color: C.textMuted }}
  >
    <motion.path
      d="M120 10 C180 8, 228 30, 232 75 C236 120, 195 148, 120 150 C45 152, 4 125, 8 78 C12 31, 60 12, 120 10 Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity="0.5"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    {/* Second imperfect stroke for hand-drawn feel */}
    <motion.path
      d="M118 14 C175 10, 224 35, 228 78 C232 118, 190 145, 122 147 C50 149, 10 120, 12 75 C14 35, 55 15, 118 14 Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.3"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }}
    />
  </svg>
);

const PaperDivider = ({
  flip = false,
  className = "",
}: {
  flip?: boolean;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: flip ? -12 : 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.6 }}
    transition={{ duration: 0.7 }}
    className={cn(
      "pointer-events-none relative h-20 w-full overflow-visible",
      className,
    )}
    style={{ transform: flip ? "scaleY(-1)" : undefined }}
  >
    <svg
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      fill="none"
    >
      <path
        d="M0 46L26 60L54 44L82 68L108 40L136 76L164 50L192 72L220 42L248 82L276 54L304 74L332 46L360 86L388 58L416 76L444 48L472 88L500 56L528 82L556 50L584 92L612 60L640 84L668 52L696 78L724 46L752 96L780 58L808 86L836 54L864 82L892 48L920 94L948 62L976 84L1004 56L1032 88L1060 52L1088 80L1116 46L1144 90L1172 60L1200 82L1228 54L1256 86L1284 50L1312 78L1340 44L1368 74L1396 52L1422 66L1440 58V160H0V46Z"
        fill={C.cream}
      />
      <path
        d="M0 44L26 58L54 42L82 66L108 38L136 74L164 48L192 70L220 40L248 80L276 52L304 72L332 44L360 84L388 56L416 74L444 46L472 86L500 54L528 80L556 48L584 90L612 58L640 82L668 50L696 76L724 44L752 94L780 56L808 84L836 52L864 80L892 46L920 92L948 60L976 82L1004 54L1032 86L1060 50L1088 78L1116 44L1144 88L1172 58L1200 80L1228 52L1256 84L1284 48L1312 76L1340 42L1368 72L1396 50L1422 64L1440 56"
        stroke="rgba(88, 94, 74, 0.18)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </motion.div>
);

const HeartPin = ({ className = "" }: { className?: string }) => (
  <div
    className={cn(
      "flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[#8a9470]",
      className,
    )}
    style={{ boxShadow: "0 4px 20px rgba(82, 87, 66, 0.16)" }}
  >
    <Heart size={16} fill={C.cream} style={{ color: C.cream }} />
  </div>
);

/* ════════════════════════════════════════════
   INLINE MUSIC TOGGLE — circular button with rotating text
   ════════════════════════════════════════════ */
const InlineMusicToggle = ({ musicUrl }: { musicUrl: string | null }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!musicUrl) return;
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = 0.4;
    audio.autoplay = true;
    audioRef.current = audio;

    const timer = window.setTimeout(() => {
      audio
        .play()
        .then(() => {
          setPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {});
    }, 250);

    return () => {
      window.clearTimeout(timer);
      audio.pause();
      audio.src = "";
    };
  }, [musicUrl]);

  useEffect(() => {
    if (hasInteracted || !audioRef.current) return;

    const handleFirstInteraction = () => {
      audioRef.current
        ?.play()
        .then(() => {
          setPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {});
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [hasInteracted]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
      setHasInteracted(true);
    }
    setPlaying(!playing);
  };

  if (!musicUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative w-20 h-20 mx-auto cursor-pointer"
      onClick={toggle}
    >
      {/* Rotating text around circle */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: playing ? 360 : 0 }}
        transition={
          playing ? { duration: 8, repeat: Infinity, ease: "linear" } : {}
        }
      >
        <defs>
          <path
            id="circlePath"
            d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
          />
        </defs>
        <text fontSize="8" fill={C.textLight} letterSpacing="3">
          <textPath href="#circlePath">
            {playing
              ? "♪ TAP TO PAUSE ♪ TAP TO PAUSE"
              : "♪ TAP TO PLAY ♪ TAP TO PLAY"}
          </textPath>
        </text>
      </motion.svg>

      {/* Center icon */}
      <div
        className="absolute inset-0 flex items-center justify-center rounded-full border-2 m-3"
        style={{ borderColor: C.textLight }}
      >
        {playing ? (
          <VolumeX size={16} style={{ color: C.text }} />
        ) : (
          <Volume2 size={16} style={{ color: C.text }} />
        )}
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════
   MAIN TEMPLATE COMPONENT
   ════════════════════════════════════════════ */
const BlossomDateTemplate = ({
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
  const [envelopeOpen, setEnvelopeOpen] = useState(mode === "edit");
  const inviteRef = useRef<HTMLDivElement>(null);

  const effectiveMusicUrl =
    data.musicUrl ||
    data.effectiveMusicUrl ||
    data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName =
    data.musicName ||
    data.effectiveMusicName ||
    data.templateDefaults.defaultMusicName;

  const handleOpenEnvelope = () => {
    setEnvelopeOpen(true);
    setTimeout(() => {
      inviteRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 800);
  };

  return (
    <div
      data-theme="blossom"
      className="min-h-screen"
      style={{ backgroundColor: C.sage, fontFamily: FONTS.body }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Great+Vibes&display=swap');`}</style>

      {/* ═══════════ ENVELOPE SCREEN ═══════════ */}
      {!envelopeOpen && mode !== "edit" && (
        <EnvelopeScreen
          brideName={data.brideName}
          groomName={data.groomName}
          onOpen={handleOpenEnvelope}
        />
      )}

      {/* ═══════════ MAIN INVITE CONTENT ═══════════ */}
      <AnimatePresence>
        {(envelopeOpen || mode === "edit") && (
          <motion.div
            ref={inviteRef}
            initial={mode === "edit" ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Hero: Couple Photo */}
            <HeroSection
              mode={mode}
              data={data}
              onUpdate={onUpdate}
              templateId={templateId}
              sessionUUID={sessionUUID}
              uploadStage={uploadStage}
            />

            {/* Welcome + Inline Music Toggle */}
            <EditorialWelcomeSection
              mode={mode}
              data={data}
              onUpdate={onUpdate}
              effectiveMusicUrl={effectiveMusicUrl}
            />

            {/* Calendar Date with hand-drawn circle */}
            <EditorialCalendarDateSection
              mode={mode}
              weddingDate={data.weddingDate}
              onUpdate={onUpdate}
            />

            {/* Animated S-Curve Timeline */}
            <EditorialTimelineSection
              mode={mode}
              data={data}
              onUpdate={onUpdate}
            />

            {/* Venue */}
            {data.events[0] && (
              <EditorialVenueSection mode={mode} event={data.events[0]} />
            )}

            {/* Dress Code */}
            <EditorialDressCodeSection />

            {/* Gallery */}
            <GallerySection
              mode={mode}
              data={data}
              onUpdate={onUpdate}
              templateId={templateId}
              sessionUUID={sessionUUID}
              uploadStage={uploadStage}
            />

            {/* Details */}
            <EditorialDetailsSection />

            {/* Music Editor (edit only) */}
            {mode === "edit" && (
              <section className="py-16" style={{ backgroundColor: C.cream }}>
                <div className="max-w-xl mx-auto px-6">
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

            {/* RSVP */}
            {mode !== "edit" && data.rsvpEnabled !== false && (
              <RsvpSection
                invitationId={data.invitationId}
                isDemo={mode === "demo"}
              />
            )}

            {/* Footer */}
            <footer
              className={cn(
                "relative py-16 text-center overflow-hidden",
                mode === "edit" && "pb-32",
              )}
              style={{ backgroundColor: C.sage }}
            >
              <div className="max-w-md mx-auto px-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Heart
                    size={24}
                    className="mx-auto mb-4"
                    fill={C.cream}
                    style={{ color: C.cream }}
                  />
                  <p
                    className="text-3xl md:text-4xl mb-3"
                    style={{ fontFamily: FONTS.script, color: C.cream }}
                  >
                    {data.brideName?.split(" ")[0] || "Bride"} &amp;{" "}
                    {data.groomName?.split(" ")[0] || "Groom"}
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div
                      className="w-12 h-[1px]"
                      style={{ backgroundColor: `${C.cream}40` }}
                    />
                    <Heart
                      size={10}
                      fill={C.cream}
                      style={{ color: C.cream, opacity: 0.6 }}
                    />
                    <div
                      className="w-12 h-[1px]"
                      style={{ backgroundColor: `${C.cream}40` }}
                    />
                  </div>
                  <p
                    className="text-xs tracking-[0.2em] uppercase"
                    style={{ color: `${C.cream}99` }}
                  >
                    {formatWeddingDate(data.weddingDate)}
                  </p>
                  {data.hashtag && (
                    <p
                      className="text-sm mt-4 italic"
                      style={{ color: `${C.cream}80` }}
                    >
                      {data.hashtag}
                    </p>
                  )}
                  <p
                    className="text-[10px] mt-8"
                    style={{ color: `${C.cream}50` }}
                  >
                    Made with love on ShubhAarambh
                  </p>
                </motion.div>
              </div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ENVELOPE SCREEN
   ══════════════════════════════════════════════════════════ */
const EnvelopeScreen = ({
  brideName,
  groomName,
  onOpen,
}: {
  brideName: string;
  groomName: string;
  onOpen: () => void;
}) => {
  const [hovering, setHovering] = useState(false);

  return (
    <motion.section
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background:
          "radial-gradient(circle at top, rgba(238,236,225,0.12), transparent 28%), linear-gradient(180deg, #87906f 0%, #788260 52%, #6d7756 100%)",
      }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mb-8 text-center"
      >
        <p
          className="text-sm uppercase tracking-[0.42em]"
          style={{ color: `${C.cream}b0` }}
        >
          Invitation
        </p>
        <p
          className="mt-4 text-4xl leading-tight md:text-5xl"
          style={{ fontFamily: FONTS.script, color: C.cream }}
        >
          {brideName.split(" ")[0]} &amp; {groomName.split(" ")[0]}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 mx-auto h-[220px] w-[320px] max-w-full md:h-[260px] md:w-[390px]"
      >
        <div
          className="absolute inset-0 rounded-[24px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(140,150,112,0.95), rgba(115,124,91,0.98))",
            boxShadow:
              "0 30px 80px rgba(33,38,24,0.34), inset 0 0 0 1px rgba(255,255,255,0.18)",
          }}
        />
        <div
          className="absolute left-1/2 top-[18px] h-10 w-10 -translate-x-1/2 rounded-full border border-white/30"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        />
        <svg viewBox="0 0 390 260" className="absolute inset-0 h-full w-full">
          <path
            d="M16 16 L195 145 L374 16"
            fill="none"
            stroke="rgba(52,57,42,0.28)"
            strokeWidth="2.5"
          />
          <path
            d="M16 244 L195 118 L374 244"
            fill="none"
            stroke="rgba(52,57,42,0.2)"
            strokeWidth="2.5"
          />
          <path
            d="M16 16 L16 244"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />
          <path
            d="M374 16 L374 244"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />
        </svg>
        <motion.div
          animate={{ y: hovering ? -8 : [0, -5, 0] }}
          transition={
            hovering
              ? { duration: 0.2 }
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }
          className="absolute inset-x-[7%] top-[12%] rounded-[18px] border border-[#ebe4d4]/60 bg-[#f6efe2] px-8 py-8 text-center shadow-[0_24px_50px_rgba(72,78,55,0.2)]"
        >
          <p
            className="text-xs uppercase tracking-[0.38em]"
            style={{ color: C.sageDark }}
          >
            Wedding Day
          </p>
          <p
            className="mt-4 text-4xl leading-tight md:text-5xl"
            style={{ fontFamily: FONTS.script, color: C.text }}
          >
            Open Me
          </p>
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: C.textMuted }}
          >
            Tap the wax seal to unfold your invitation.
          </p>
        </motion.div>

        <motion.button
          onClick={onOpen}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          animate={{ scale: hovering ? 1.08 : [1, 1.04, 1] }}
          transition={
            hovering
              ? { duration: 0.2 }
              : { duration: 2.3, repeat: Infinity, ease: "easeInOut" }
          }
          className="absolute left-1/2 top-[66%] z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full md:h-24 md:w-24"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${C.waxSeal}, ${C.waxSealDark})`,
            boxShadow:
              "0 10px 26px rgba(123, 82, 50, 0.4), inset 0 2px 8px rgba(255,255,255,0.22)",
          }}
        >
          <span
            className="text-[11px] uppercase tracking-[0.18em] font-semibold"
            style={{ color: C.cream }}
          >
            Tap
          </span>
        </motion.button>
      </motion.div>
    </motion.section>
  );
};

/* ══════════════════════════════════════════════════════════
   HERO — Full-bleed couple photo with script names & date
   ══════════════════════════════════════════════════════════ */
const HeroSection = ({
  mode,
  data,
  onUpdate,
  templateId,
  sessionUUID,
  uploadStage,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  templateId?: number;
  sessionUUID?: string;
  uploadStage?: "temp" | "draft" | "published";
}) => {
  const couplePhoto = data.couplePhotoUrl || DEFAULT_COUPLE_PHOTO;
  const dateObj = data.weddingDate ? new Date(data.weddingDate) : null;
  const heroDate = dateObj
    ? `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}`
    : "";

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#20261a]">
      <motion.div
        animate={mode === "edit" ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {mode === "edit" ? (
          <EditablePhoto
            photoUrl={data.couplePhotoUrl}
            onSave={(url) => onUpdate({ couplePhotoUrl: url })}
            mode={mode}
            className="w-full h-full object-cover"
            alt="Couple Photo"
            placeholderText="Add Couple Photo"
            invitationId={data.invitationId ?? undefined}
            templateId={templateId}
            sessionUUID={sessionUUID}
            uploadStage={uploadStage}
            oldPublicUrl={data.couplePhotoUrl || undefined}
          />
        ) : (
          <img
            src={couplePhoto}
            alt={`${data.brideName} & ${data.groomName}`}
            className="w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(21,24,16,0.15) 0%, rgba(21,24,16,0.08) 38%, rgba(18,18,15,0.76) 100%)",
          }}
        />
      </motion.div>

      <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="rounded-full border border-white/15 bg-white/8 px-5 py-2 backdrop-blur-sm"
        >
          <p
            className="text-[11px] uppercase tracking-[0.35em]"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            Wedding Invitation
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 flex min-h-[100dvh] items-end">
        <div className="relative w-full px-6 pb-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-8">
              <div style={{ fontFamily: FONTS.script }}>
                <EditableText
                  value={data.brideName}
                  onSave={(val) => onUpdate({ brideName: val })}
                  mode={mode}
                  placeholder="Bride's Name"
                  className="block text-5xl leading-none text-white drop-shadow-[0_10px_26px_rgba(0,0,0,0.35)] sm:text-6xl md:text-7xl"
                  as="h1"
                />
              </div>
              <p
                className="my-1 text-2xl text-white/80 drop-shadow"
                style={{ fontFamily: FONTS.script }}
              >
                &amp;
              </p>
              <div style={{ fontFamily: FONTS.script }}>
                <EditableText
                  value={data.groomName}
                  onSave={(val) => onUpdate({ groomName: val })}
                  mode={mode}
                  placeholder="Groom's Name"
                  className="block text-5xl leading-none text-white drop-shadow-[0_10px_26px_rgba(0,0,0,0.35)] sm:text-6xl md:text-7xl"
                  as="h1"
                />
              </div>
            </div>

            {mode === "edit" ? (
              <div className="mb-10">
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/70">
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={data.weddingDate}
                  onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                  className="rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm text-white backdrop-blur"
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-8 inline-flex items-center gap-4 rounded-full border border-white/20 bg-black/15 px-5 py-3 backdrop-blur-sm"
              >
                <div className="h-[1px] w-10 bg-white/35" />
                <p
                  className="text-4xl leading-none text-white/95 drop-shadow-lg md:text-5xl"
                  style={{ fontFamily: FONTS.heading }}
                >
                  {heroDate}
                </p>
                <div className="h-[1px] w-10 bg-white/35" />
              </motion.div>
            )}
          </motion.div>
          {mode !== "edit" && (
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="pb-10"
            >
              <ChevronDown size={20} className="mx-auto text-white/60" />
            </motion.div>
          )}
          <PaperDivider className="absolute inset-x-0 -bottom-8 z-30" />
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   WELCOME — "Dear Guests!" + inline music toggle
   ══════════════════════════════════════════════════════════ */
const WelcomeSection = ({
  mode,
  data,
  onUpdate,
  effectiveMusicUrl,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  effectiveMusicUrl: string | null;
}) => (
  <section className="py-16 md:py-24" style={{ backgroundColor: C.cream }}>
    <div className="max-w-xl mx-auto px-6 text-center">
      {/* Inline music toggle — directly playable */}
      {mode !== "edit" && effectiveMusicUrl && (
        <div className="mb-10">
          <InlineMusicToggle musicUrl={effectiveMusicUrl} />
        </div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl mb-8"
        style={{ fontFamily: FONTS.script, color: C.text }}
      >
        Dear Guests!
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
      >
        <div style={{ color: C.textMuted, fontFamily: FONTS.body }}>
          <EditableText
            value={data.welcomeMessage}
            onSave={(val) => onUpdate({ welcomeMessage: val })}
            mode={mode}
            placeholder="We warmly invite you to share our joy on this special day..."
            className="text-base md:text-lg leading-relaxed"
            multiline
            as="p"
          />
        </div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   CALENDAR DATE — 3-day boxes with hand-drawn scribble circle
   ══════════════════════════════════════════════════════════ */
const CalendarDateSection = ({
  mode,
  weddingDate,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  weddingDate: string;
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const dateObj = weddingDate ? new Date(weddingDate) : null;
  const day = dateObj?.getDate();
  const dayBefore = dateObj
    ? new Date(dateObj.getTime() - 86400000).getDate()
    : null;
  const dayAfter = dateObj
    ? new Date(dateObj.getTime() + 86400000).getDate()
    : null;
  const monthName = dateObj?.toLocaleDateString("en", { month: "long" });
  const dayName = dateObj?.toLocaleDateString("en", { weekday: "long" });

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: C.cream }}>
      <div className="max-w-md mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative inline-block mb-6"
        >
          {/* Hand-drawn scribble circle around calendar */}
          <div className="absolute -inset-4 md:-inset-6 z-0">
            <HandDrawnCircle className="w-full h-full" />
          </div>

          {/* Calendar boxes */}
          <div className="relative z-10 flex items-end gap-2">
            {/* Day before */}
            <div
              className="text-center px-3 py-2 border opacity-40"
              style={{ borderColor: C.textLight }}
            >
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: C.textLight }}
              >
                {monthName || "Month"}
              </p>
              <p
                className="text-2xl font-light"
                style={{ color: C.text, fontFamily: FONTS.heading }}
              >
                {dayBefore ?? "—"}
              </p>
            </div>

            {/* Main day — larger, highlighted */}
            <div
              className="text-center px-5 py-4 border-2"
              style={{ borderColor: C.text }}
            >
              <p
                className="text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: C.text }}
              >
                {dayName || "Day"}
              </p>
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: C.textMuted }}
              >
                {monthName || "Month"}
              </p>
              <p
                className="text-5xl font-light"
                style={{ color: C.text, fontFamily: FONTS.heading }}
              >
                {day ?? "—"}
              </p>
            </div>

            {/* Day after */}
            <div
              className="text-center px-3 py-2 border opacity-40"
              style={{ borderColor: C.textLight }}
            >
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: C.textLight }}
              >
                {monthName || "Month"}
              </p>
              <p
                className="text-2xl font-light"
                style={{ color: C.text, fontFamily: FONTS.heading }}
              >
                {dayAfter ?? "—"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   ANIMATED S-CURVE TIMELINE — Hearts travel along the path
   ══════════════════════════════════════════════════════════ */
const TimelineSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const isEdit = mode === "edit";
  const updateEvent = (index: number, updates: Partial<EventData>) => {
    const newEvents = [...data.events];
    newEvents[index] = { ...newEvents[index], ...updates };
    onUpdate({ events: newEvents });
  };
  const deleteEvent = (index: number) => {
    onUpdate({ events: data.events.filter((_, idx) => idx !== index) });
  };

  return (
    <section
      className="py-16 md:py-24 overflow-hidden"
      style={{ backgroundColor: C.cream }}
    >
      <div className="max-w-md mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-5xl mb-16"
          style={{ fontFamily: FONTS.script, color: C.text }}
        >
          Programme
        </motion.h2>

        {isEdit ? (
          <div className="space-y-4">
            {data.events.map((event, i) => (
              <EditableEventCard
                key={event.id || i}
                event={event}
                onUpdate={(updates) => updateEvent(i, updates)}
                onDelete={() => deleteEvent(i)}
                mode={mode}
                index={i}
              />
            ))}
            <AddEventButton
              onAdd={() => {
                const newEvent: EventData = {
                  id: null,
                  eventName: "New Event",
                  eventDate: "",
                  eventTime: "",
                  venueName: "",
                  venueAddress: "",
                  mapsUrl: null,
                };
                onUpdate({ events: [...data.events, newEvent] });
              }}
              mode={mode}
              maxEvents={8}
              currentCount={data.events.length}
            />
          </div>
        ) : (
          <AnimatedSCurveTimeline events={data.events} />
        )}
      </div>
    </section>
  );
};

/** Animated S-Curve timeline — heart starts at top, travels to each event, stops at last */
const AnimatedSCurveTimeline = ({ events }: { events: EventData[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  if (events.length === 0) return null;

  const itemHeight = 180;
  const totalHeight = events.length * itemHeight + 60;

  const pathPoints = events.map((_, i) => {
    const y = i * itemHeight + 90;
    const x = i % 2 === 0 ? 70 : 280;
    return { x, y };
  });

  // Build S-curve SVG path
  let pathD = `M ${pathPoints[0]?.x ?? 175} 10`;
  pathPoints.forEach((pt, i) => {
    if (i === 0) {
      pathD += ` C ${pt.x} 40, ${pt.x} ${pt.y - 40}, ${pt.x} ${pt.y}`;
    } else {
      const prev = pathPoints[i - 1];
      const midY = (prev.y + pt.y) / 2;
      pathD += ` C ${prev.x} ${midY}, ${pt.x} ${midY}, ${pt.x} ${pt.y}`;
    }
  });
  // Extend path to bottom
  const lastPt = pathPoints[pathPoints.length - 1];
  pathD += ` L ${lastPt.x} ${totalHeight - 10}`;

  return (
    <div ref={ref} className="relative" style={{ minHeight: totalHeight }}>
      <svg
        className="absolute inset-0 w-full"
        style={{ height: totalHeight }}
        viewBox={`0 0 350 ${totalHeight}`}
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        {/* The S-curve path line */}
        <motion.path
          d={pathD}
          stroke={C.sageMuted}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />

        {/* Heart markers at each event node — appear sequentially */}
        {pathPoints.map((pt, i) => (
          <motion.g key={i}>
            {/* Filled heart */}
            <motion.path
              d={`M ${pt.x} ${pt.y - 5}
                  C ${pt.x - 5} ${pt.y - 12}, ${pt.x - 11} ${pt.y - 5}, ${pt.x} ${pt.y + 5}
                  C ${pt.x + 11} ${pt.y - 5}, ${pt.x + 5} ${pt.y - 12}, ${pt.x} ${pt.y - 5}Z`}
              fill={C.heartGreen}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                delay: 0.5 + i * 0.5,
                duration: 0.4,
                type: "spring",
                stiffness: 200,
              }}
            />
          </motion.g>
        ))}

        {/* Start heart at top */}
        <motion.path
          d={`M ${pathPoints[0]?.x ?? 175} 5
              C ${(pathPoints[0]?.x ?? 175) - 4} -2, ${(pathPoints[0]?.x ?? 175) - 8} 3, ${pathPoints[0]?.x ?? 175} 10
              C ${(pathPoints[0]?.x ?? 175) + 8} 3, ${(pathPoints[0]?.x ?? 175) + 4} -2, ${pathPoints[0]?.x ?? 175} 5Z`}
          fill={C.heartGreen}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        />

        {/* End heart at bottom */}
        <motion.path
          d={`M ${lastPt.x} ${totalHeight - 15}
              C ${lastPt.x - 5} ${totalHeight - 22}, ${lastPt.x - 11} ${totalHeight - 15}, ${lastPt.x} ${totalHeight - 5}
              C ${lastPt.x + 11} ${totalHeight - 15}, ${lastPt.x + 5} ${totalHeight - 22}, ${lastPt.x} ${totalHeight - 15}Z`}
          fill={C.heartGreen}
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{
            delay: 0.5 + events.length * 0.5,
            duration: 0.4,
            type: "spring",
          }}
        />
      </svg>

      {/* Event labels positioned beside each node */}
      {events.map((event, i) => {
        const isLeft = i % 2 === 0;
        const topOffset = i * itemHeight + 55;

        return (
          <motion.div
            key={event.id || i}
            initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.6 + i * 0.4, duration: 0.5 }}
            className="absolute w-[45%]"
            style={{
              top: topOffset,
              ...(isLeft ? { left: "2%" } : { right: "2%" }),
              textAlign: isLeft ? "left" : "right",
            }}
          >
            <h3
              className="text-2xl md:text-3xl"
              style={{ fontFamily: FONTS.script, color: C.text }}
            >
              {event.eventName}
            </h3>
            {event.eventTime && (
              <p
                className="text-xl font-light mt-1"
                style={{ color: C.text, fontFamily: FONTS.heading }}
              >
                {formatTime(event.eventTime)}
              </p>
            )}
            {event.venueName && (
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                {event.venueName}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   VENUE
   ══════════════════════════════════════════════════════════ */
const VenueSection = ({
  mode,
  event,
}: {
  mode: TemplateProps["mode"];
  event: EventData;
}) => (
  <section style={{ backgroundColor: C.cream }}>
    <div className="max-w-xl mx-auto px-6 text-center py-12 md:py-16">
      <Heart
        size={20}
        className="mx-auto mb-6"
        fill={C.heartGreen}
        style={{ color: C.heartGreen }}
      />
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl mb-4"
        style={{ fontFamily: FONTS.script, color: C.text }}
      >
        Venue
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
      >
        <p
          className="text-base md:text-lg mb-1"
          style={{ color: C.text, fontFamily: FONTS.body }}
        >
          {event.venueName || "Venue Name"}
        </p>
        <p className="text-sm mb-6" style={{ color: C.textMuted }}>
          {event.venueAddress || "Venue Address"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        {event.mapsUrl ? (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 transition-transform hover:scale-105"
            style={{
              backgroundColor: C.sage,
              borderColor: C.sageMuted,
              color: C.cream,
            }}
          >
            <div className="text-center">
              <MapPin size={18} className="mx-auto mb-1" />
              <span className="text-[10px] tracking-[0.1em] uppercase font-medium">
                Get
                <br />
                Directions
              </span>
            </div>
          </a>
        ) : (
          <div
            className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4"
            style={{
              backgroundColor: C.sage,
              borderColor: C.sageMuted,
              color: C.cream,
            }}
          >
            <div className="text-center">
              <MapPin size={18} className="mx-auto mb-1" />
              <span className="text-[10px] tracking-[0.1em] uppercase font-medium">
                Get
                <br />
                Directions
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>

    <div
      className="relative w-full overflow-hidden"
      style={{ maxHeight: "350px" }}
    >
      <img
        src={DEFAULT_VENUE_PHOTO}
        alt="Wedding Venue"
        className="w-full h-[350px] object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.15) 100%)",
        }}
      />
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   DRESS CODE
   ══════════════════════════════════════════════════════════ */
const DRESS_COLORS = [
  { hex: "#4a5e3a", name: "Forest" },
  { hex: "#6b7f5e", name: "Sage" },
  { hex: "#5d6b73", name: "Slate" },
  { hex: "#8a9aaa", name: "Steel Blue" },
  { hex: "#b8c4cc", name: "Ice" },
  { hex: "#f0ebe2", name: "Cream" },
];

const DressCodeSection = () => (
  <section className="py-16 md:py-20" style={{ backgroundColor: C.cream }}>
    <div className="max-w-md mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl mb-4"
        style={{ fontFamily: FONTS.script, color: C.text }}
      >
        Dress Code
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="text-sm mb-8 leading-relaxed"
        style={{ color: C.textMuted }}
      >
        We would be grateful if you could follow
        <br />
        the colour palette of our wedding.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25 }}
        className="flex justify-center gap-2 md:gap-3"
      >
        {DRESS_COLORS.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="w-11 h-14 md:w-14 md:h-[72px] rounded-sm shadow-sm"
            style={{
              backgroundColor: c.hex,
              border:
                c.hex === "#f0ebe2" ? `1px solid ${C.textLight}40` : "none",
            }}
            title={c.name}
          />
        ))}
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   GALLERY
   ══════════════════════════════════════════════════════════ */
const GallerySection = ({
  mode,
  data,
  onUpdate,
  templateId,
  sessionUUID,
  uploadStage,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  templateId?: number;
  sessionUUID?: string;
  uploadStage?: "temp" | "draft" | "published";
}) => {
  const displayPhotos =
    data.galleryPhotos.length > 0
      ? data.galleryPhotos
      : data.templateDefaults.defaultPhotos.map((p, i) => ({
          photoUrl: p.photoUrl,
          sortOrder: i,
          isDefault: true,
        }));

  if (mode !== "edit") return null;

  return (
    <section style={{ backgroundColor: C.cream }}>
      <div className="py-12 px-6 max-w-5xl mx-auto">
        <h2
          className="text-center text-3xl mb-8"
          style={{ fontFamily: FONTS.script, color: C.text }}
        >
          Photo Gallery
        </h2>
        <EditablePhotoGallery
          photos={data.galleryPhotos}
          defaultPhotos={data.templateDefaults.defaultPhotos}
          onUpdate={(photos) => onUpdate({ galleryPhotos: photos })}
          mode={mode}
          maxPhotos={10}
          invitationId={data.invitationId ?? undefined}
          templateId={templateId}
          sessionUUID={sessionUUID}
          uploadStage={uploadStage}
        />
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   DETAILS
   ══════════════════════════════════════════════════════════ */
const DetailsSection = () => (
  <section className="py-16 md:py-20" style={{ backgroundColor: C.cream }}>
    <div className="max-w-md mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl mb-6"
        style={{ fontFamily: FONTS.script, color: C.text }}
      >
        Details
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="text-sm leading-relaxed mb-4"
        style={{ color: C.textMuted }}
      >
        Please bring your warm wishes and love in your hearts.
        <br />
        If you wish to bless us with a gift, we would
        <br />
        be grateful for an envelope.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-sm italic leading-relaxed"
        style={{ color: C.textLight }}
      >
        <p>
          We would also be delighted to share
          <br />a bottle of wine that we will open
          <br />
          together one evening.
        </p>
      </motion.div>
      <Heart
        size={16}
        className="mx-auto mt-8"
        fill={C.heartGreen}
        style={{ color: C.heartGreen, opacity: 0.5 }}
      />
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   RSVP
   ══════════════════════════════════════════════════════════ */
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
      toast("This is a demo — create your invitation to receive real RSVPs", {
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

  const attendOptions = [
    { value: "yes" as const, label: "Joyfully Accept", icon: "🌿" },
    { value: "maybe" as const, label: "Yet to Decide", icon: "💭" },
    { value: "no" as const, label: "Regretfully Decline", icon: "🙏" },
  ];

  if (submitted) {
    return (
      <section className="py-20" style={{ backgroundColor: C.cream }}>
        <div className="max-w-md mx-auto px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center rounded-2xl p-10 border"
            style={{ backgroundColor: C.warmWhite, borderColor: `${C.sage}30` }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${C.sage}20` }}
            >
              <Check className="w-8 h-8" style={{ color: C.sage }} />
            </motion.div>
            <p
              className="text-2xl mb-2"
              style={{ fontFamily: FONTS.script, color: C.text }}
            >
              Thank you, {name}!
            </p>
            <p className="text-sm" style={{ color: C.textMuted }}>
              We can&apos;t wait to celebrate with you.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20" style={{ backgroundColor: C.cream }}>
      <div className="max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              className="w-16 h-[0.5px]"
              style={{ backgroundColor: C.sageMuted }}
            />
            <Heart
              size={14}
              fill={C.heartGreen}
              style={{ color: C.heartGreen }}
            />
            <div
              className="w-16 h-[0.5px]"
              style={{ backgroundColor: C.sageMuted }}
            />
          </div>
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: C.textMuted }}
          >
            Kindly Respond
          </p>
          <h2
            className="text-3xl md:text-4xl"
            style={{ fontFamily: FONTS.script, color: C.text }}
          >
            Will You Join Us?
          </h2>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 border space-y-6"
          style={{
            backgroundColor: C.warmWhite,
            borderColor: `${C.sage}25`,
            boxShadow: `0 4px 30px ${C.sage}08`,
          }}
        >
          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-2"
              style={{ color: C.textMuted }}
            >
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                color: C.text,
                backgroundColor: C.white,
                border: `1px solid ${C.sage}30`,
              }}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-2"
              style={{ color: C.textMuted }}
            >
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                color: C.text,
                backgroundColor: C.white,
                border: `1px solid ${C.sage}30`,
              }}
              placeholder="10-digit phone number"
              maxLength={10}
            />
          </div>

          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-3"
              style={{ color: C.textMuted }}
            >
              Your Response
            </label>
            <div className="grid grid-cols-3 gap-2">
              {attendOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAttending(opt.value)}
                  className={cn(
                    "rounded-xl py-3 text-center transition-all border",
                    attending === opt.value
                      ? "ring-2 shadow-md"
                      : "opacity-70 hover:opacity-100",
                  )}
                  style={{
                    borderColor:
                      attending === opt.value ? C.sage : `${C.sage}30`,
                    backgroundColor:
                      attending === opt.value ? `${C.sage}15` : C.white,
                    ["--tw-ring-color" as any]: C.sage,
                  }}
                >
                  <span className="block text-lg mb-1">{opt.icon}</span>
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: C.text }}
                  >
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {attending !== "no" && (
            <div>
              <label
                className="text-xs tracking-[0.15em] uppercase block mb-2"
                style={{ color: C.textMuted }}
              >
                Number of Guests
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center border"
                  style={{ borderColor: `${C.sage}40` }}
                >
                  <Minus size={14} style={{ color: C.text }} />
                </button>
                <span
                  className="text-2xl font-light w-12 text-center"
                  style={{ color: C.text, fontFamily: FONTS.heading }}
                >
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center border"
                  style={{ borderColor: `${C.sage}40` }}
                >
                  <Plus size={14} style={{ color: C.text }} />
                </button>
              </div>
            </div>
          )}

          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-2"
              style={{ color: C.textMuted }}
            >
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={{
                color: C.text,
                backgroundColor: C.white,
                border: `1px solid ${C.sage}30`,
              }}
              placeholder="Write a message for the couple..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-60"
            style={{ backgroundColor: C.sage, color: C.cream }}
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send size={16} />
            )}
            {loading ? "Sending..." : "Send RSVP"}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

const EditorialWelcomeSection = ({
  mode,
  data,
  onUpdate,
  effectiveMusicUrl,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  effectiveMusicUrl: string | null;
}) => (
  <section
    className="relative z-20 -mt-10 overflow-hidden px-0 pt-28 pb-16 md:-mt-12 md:pt-32 md:pb-24"
    style={{ backgroundColor: C.cream }}
  >
    <div className="absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-[#e8dfcb]/70 blur-3xl" />
    <div className="mx-auto max-w-xl px-6 text-center">
      {mode !== "edit" && effectiveMusicUrl && (
        <div className="mb-8">
          <InlineMusicToggle musicUrl={effectiveMusicUrl} />
        </div>
      )}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-3 text-xs uppercase tracking-[0.38em]"
        style={{ color: C.sageDark }}
      >
        Dear Guests
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6 text-5xl md:text-6xl"
        style={{ fontFamily: FONTS.script, color: C.text }}
      >
        Dear Guests!
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="rounded-[2rem] border border-[#d6ccbb] bg-[#f8f1e6]/90 px-7 py-8 shadow-[0_24px_40px_rgba(122,140,110,0.08)]"
      >
        <div style={{ color: C.textMuted, fontFamily: FONTS.body }}>
          <EditableText
            value={data.welcomeMessage}
            onSave={(val) => onUpdate({ welcomeMessage: val })}
            mode={mode}
            placeholder="We warmly invite you to share our joy on this special day..."
            className="text-lg leading-relaxed md:text-[1.35rem]"
            multiline
            as="p"
          />
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-[#b7b099]" />
          <Heart
            size={12}
            fill={C.heartGreen}
            style={{ color: C.heartGreen }}
          />
          <div className="h-px w-10 bg-[#b7b099]" />
        </div>
      </motion.div>
    </div>
  </section>
);

const EditorialCalendarDateSection = ({
  mode,
  weddingDate,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  weddingDate: string;
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const dateObj = weddingDate ? new Date(weddingDate) : null;
  const day = dateObj?.getDate();
  const dayBefore = dateObj
    ? new Date(dateObj.getTime() - 86400000).getDate()
    : null;
  const dayAfter = dateObj
    ? new Date(dateObj.getTime() + 86400000).getDate()
    : null;
  const monthName = dateObj?.toLocaleDateString("en", { month: "long" });
  const dayName = dateObj?.toLocaleDateString("en", { weekday: "long" });

  return (
    <section
      className="pb-14 pt-4 md:pb-16"
      style={{ backgroundColor: C.cream }}
    >
      <div className="mx-auto max-w-md px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative mb-2 inline-block"
        >
          <div className="absolute -inset-4 z-0 md:-inset-6">
            <HandDrawnCircle className="h-full w-full" />
          </div>
          <div className="relative z-10 flex items-end gap-2">
            <div
              className="min-w-[74px] border bg-[#faf3e8]/80 px-3 py-2 text-center opacity-45"
              style={{ borderColor: C.textLight }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.22em]"
                style={{ color: C.textLight }}
              >
                {monthName || "Month"}
              </p>
              <p
                className="text-2xl font-light"
                style={{ color: C.text, fontFamily: FONTS.heading }}
              >
                {dayBefore ?? "-"}
              </p>
            </div>
            <div
              className="min-w-[110px] border-2 bg-[#fff8ef] px-5 py-4 text-center shadow-[0_12px_30px_rgba(107,100,96,0.08)]"
              style={{ borderColor: C.text }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.24em] font-semibold"
                style={{ color: C.text }}
              >
                {dayName || "Day"}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.22em]"
                style={{ color: C.textMuted }}
              >
                {monthName || "Month"}
              </p>
              <p
                className="text-5xl font-light"
                style={{ color: C.text, fontFamily: FONTS.heading }}
              >
                {day ?? "-"}
              </p>
            </div>
            <div
              className="min-w-[74px] border bg-[#faf3e8]/80 px-3 py-2 text-center opacity-45"
              style={{ borderColor: C.textLight }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.22em]"
                style={{ color: C.textLight }}
              >
                {monthName || "Month"}
              </p>
              <p
                className="text-2xl font-light"
                style={{ color: C.text, fontFamily: FONTS.heading }}
              >
                {dayAfter ?? "-"}
              </p>
            </div>
          </div>
        </motion.div>
        {mode === "edit" && (
          <div className="mt-8">
            <label
              className="mb-2 block text-xs uppercase tracking-[0.25em]"
              style={{ color: C.sageDark }}
            >
              Wedding Date
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => onUpdate({ weddingDate: e.target.value })}
              className="rounded-full border px-5 py-3 text-sm"
              style={{
                borderColor: `${C.sage}55`,
                backgroundColor: "#fff8ef",
                color: C.text,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

const EditorialTimelineSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const isEdit = mode === "edit";
  const updateEvent = (index: number, updates: Partial<EventData>) => {
    const newEvents = [...data.events];
    newEvents[index] = { ...newEvents[index], ...updates };
    onUpdate({ events: newEvents });
  };

  return (
    <section
      className="overflow-hidden py-14 md:py-16"
      style={{ backgroundColor: C.cream }}
    >
      <div className="mx-auto max-w-4xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-4xl md:text-5xl"
          style={{ fontFamily: FONTS.script, color: C.text }}
        >
          Programme
        </motion.h2>
        {isEdit ? (
          <div className="mx-auto max-w-md space-y-4">
            {data.events.map((event, i) => (
              <EditableEventCard
                key={event.id || i}
                event={event}
                onUpdate={(updates) => updateEvent(i, updates)}
                onDelete={() =>
                  onUpdate({
                    events: data.events.filter((_, idx) => idx !== i),
                  })
                }
                mode={mode}
                index={i}
              />
            ))}
            <AddEventButton
              onAdd={() =>
                onUpdate({
                  events: [
                    ...data.events,
                    {
                      id: null,
                      eventName: "New Event",
                      eventDate: "",
                      eventTime: "",
                      venueName: "",
                      venueAddress: "",
                      mapsUrl: null,
                    },
                  ],
                })
              }
              mode={mode}
              maxEvents={8}
              currentCount={data.events.length}
            />
          </div>
        ) : (
          <EditorialSCurveTimeline events={data.events} />
        )}
      </div>
    </section>
  );
};

const EditorialSCurveTimeline = ({ events }: { events: EventData[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  if (events.length === 0) return null;

  const itemHeight = 170;
  const totalHeight = Math.max(events.length * itemHeight + 40, 430);
  const pathPoints = events.map((_, i) => {
    const y = i * itemHeight + 88;
    const x = i % 2 === 0 ? 246 : 134;
    return { x, y };
  });

  const firstPoint = pathPoints[0];
  let pathD = `M ${firstPoint?.x ?? 246} ${firstPoint?.y ?? 88}`;
  pathPoints.forEach((pt, i) => {
    if (i === 0) return;
    const prev = pathPoints[i - 1];
    const midY = (prev.y + pt.y) / 2;
    pathD += ` C ${prev.x} ${midY - 26}, ${pt.x} ${midY + 26}, ${pt.x} ${pt.y}`;
  });
  pathD += ` C ${pathPoints[pathPoints.length - 1].x} ${totalHeight - 44}, ${pathPoints[pathPoints.length - 1].x - 6} ${totalHeight - 20}, ${pathPoints[pathPoints.length - 1].x - 8} ${totalHeight}`;

  const progressLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heartOffset = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  return (
    <div
      ref={ref}
      className="relative mx-auto max-w-[460px]"
      style={{ minHeight: totalHeight }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 380 ${totalHeight}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d={pathD}
          stroke="rgba(112, 109, 101, 0.32)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.path
          d={pathD}
          stroke={C.sageDark}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: progressLength }}
        />
        <motion.g
          style={{
            offsetPath: `path('${pathD}')`,
            offsetDistance: heartOffset,
            offsetRotate: "0deg",
          }}
        >
          <path
            d="M 0 -9 C -9 -19, -18 -8, 0 8 C 18 -8, 9 -19, 0 -9 Z"
            fill={C.heartGreen}
            stroke="#eef0e5"
            strokeWidth="1.5"
            transform="translate(0 2)"
          />
        </motion.g>
      </svg>
      {events.map((event, i) => {
        const isLeft = i % 2 !== 0;
        const top = i * itemHeight + 6;
        return (
          <motion.div
            key={event.id || i}
            initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.35 + i * 0.28, duration: 0.45 }}
            className="absolute w-[34%] max-w-[145px] sm:max-w-[160px]"
            style={{
              top,
              ...(isLeft
                ? { right: 36, textAlign: "right" as const }
                : { left: 36, textAlign: "left" as const }),
            }}
          >
            <p
              className="text-[2.2rem] leading-[0.95] md:text-[3rem]"
              style={{ fontFamily: FONTS.script, color: C.text }}
            >
              {event.eventName}
            </p>
            {event.eventTime && (
              <p
                className="mt-3 text-[1.9rem] leading-none md:text-[2.6rem]"
                style={{ color: C.text, fontFamily: FONTS.heading }}
              >
                {formatTime(event.eventTime)}
              </p>
            )}
            {event.venueName && (
              <p
                className="mt-3 text-[11px] uppercase tracking-[0.22em]"
                style={{ color: C.textMuted }}
              >
                {event.venueName}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const EditorialVenueSection = ({
  event,
}: {
  mode: TemplateProps["mode"];
  event: EventData;
}) => (
  <section style={{ backgroundColor: C.cream }}>
    <div className="mx-auto max-w-xl px-6 py-14 text-center md:py-16">
      <HeartPin className="mx-auto mb-5" />
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 text-5xl md:text-6xl"
        style={{ fontFamily: FONTS.script, color: C.text }}
      >
        Venue
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
      >
        <p
          className="text-2xl md:text-[2rem]"
          style={{ color: C.text, fontFamily: FONTS.heading }}
        >
          {event.venueName || "Venue Name"}
        </p>
        <p
          className="mx-auto mt-3 max-w-md text-base leading-relaxed"
          style={{ color: C.textMuted }}
        >
          {event.venueAddress || "Venue Address"}
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25 }}
        className="mt-8"
      >
        {event.mapsUrl ? (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-32 w-32 items-center justify-center rounded-full border-[10px] text-center transition-transform hover:scale-105"
            style={{
              backgroundColor: C.sage,
              borderColor: "#d6d0bf",
              color: C.cream,
            }}
          >
            <div>
              <MapPin size={18} className="mx-auto mb-2" />
              <span className="text-[11px] uppercase tracking-[0.16em]">
                Plan Route
              </span>
            </div>
          </a>
        ) : (
          <div
            className="inline-flex h-32 w-32 items-center justify-center rounded-full border-[10px] text-center"
            style={{
              backgroundColor: C.sage,
              borderColor: "#d6d0bf",
              color: C.cream,
            }}
          >
            <div>
              <MapPin size={18} className="mx-auto mb-2" />
              <span className="text-[11px] uppercase tracking-[0.16em]">
                Plan Route
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
    <motion.div
      initial={{ opacity: 0, scale: 1.04 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9 }}
      className="relative overflow-hidden"
    >
      <img
        src={DEFAULT_VENUE_PHOTO}
        alt="Wedding Venue"
        className="h-[360px] w-full object-cover md:h-[460px]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      <PaperDivider className="absolute inset-x-0 -bottom-8 z-20" />
    </motion.div>
  </section>
);

const EditorialDressCodeSection = () => (
  <section
    className="relative z-20 -mt-10 overflow-hidden px-0 pt-28 pb-16 md:-mt-12 md:pt-32 md:pb-20"
    style={{ backgroundColor: C.cream }}
  >
    <div className="mx-auto max-w-md px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 text-5xl md:text-6xl"
        style={{ fontFamily: FONTS.script, color: C.text }}
      >
        Dress Code
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="mb-8 text-lg leading-relaxed"
        style={{ color: C.textMuted }}
      >
        We would be grateful if you could follow the colour palette of our
        wedding.
      </motion.p>
      <div className="flex justify-center gap-2 md:gap-3">
        {DRESS_COLORS.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18, rotate: -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            whileHover={{ y: -6, scale: 1.04 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22 + i * 0.08, duration: 0.45 }}
            className="h-14 w-11 rounded-sm shadow-[0_10px_20px_rgba(64,68,49,0.12)] md:h-[76px] md:w-14"
            style={{
              backgroundColor: c.hex,
              border:
                c.hex === "#f0ebe2" ? `1px solid ${C.textLight}40` : "none",
            }}
            title={c.name}
          />
        ))}
      </div>
    </div>
  </section>
);

const EditorialDetailsSection = () => (
  <section style={{ backgroundColor: C.cream }}>
    <PaperDivider flip />
    <motion.div
      initial={{ opacity: 0, scale: 1.03 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden"
    >
      <img
        src={DEFAULT_DETAIL_PHOTO}
        alt="Wedding Details"
        className="h-[420px] w-full object-cover md:h-[520px]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,31,24,0.08),rgba(31,31,24,0.48))]" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-md rounded-[2rem] border border-white/20 bg-black/20 px-8 py-10 text-center backdrop-blur-sm"
        >
          <h2
            className="mb-4 text-5xl text-white md:text-6xl"
            style={{ fontFamily: FONTS.script }}
          >
            Details
          </h2>
          <p className="text-lg leading-relaxed text-white/90">
            Please bring your warm wishes and love in your hearts. If you wish
            to bless us with a gift, we would be grateful for an envelope.
          </p>
          <p className="mt-5 text-sm uppercase tracking-[0.24em] text-white/75">
            Your presence will mean the most
          </p>
        </motion.div>
      </div>
    </motion.div>
  </section>
);

export default BlossomDateTemplate;
