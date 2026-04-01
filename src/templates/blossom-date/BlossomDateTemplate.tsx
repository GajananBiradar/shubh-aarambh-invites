/**
 * Blossom Date Template — "Sage Envelope" style
 * Inspired by click2invite.ru — Elegant envelope wedding invitation
 * Features: Envelope opening → Hand-drawn fonts → Inline music toggle →
 * Calendar with scribble circle → Animated S-curve heart timeline →
 * Venue with directions → Dress code palette → Gallery → Details → RSVP
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
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

/* ────────────────────────────────────────────
   TORN PAPER EDGE SVG
   ──────────────────────────────────────────── */
const TornEdgeTop = ({ color = C.cream, className = "" }: { color?: string; className?: string }) => (
  <div className={cn("w-full overflow-hidden leading-[0] -mt-px", className)}>
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-[30px] md:h-[50px] block" style={{ color }}>
      <path d="M0,60 L0,25 Q30,20 60,28 Q90,35 120,22 Q150,10 180,25 Q210,38 240,20 Q270,5 300,22 Q330,38 360,18 Q390,0 420,20 Q450,38 480,15 Q510,0 540,22 Q570,40 600,18 Q630,0 660,25 Q690,42 720,15 Q750,0 780,20 Q810,35 840,12 Q870,0 900,25 Q930,42 960,18 Q990,0 1020,22 Q1050,38 1080,15 Q1110,0 1140,20 Q1170,35 1200,25 L1200,60 Z" fill="currentColor" />
    </svg>
  </div>
);

const TornEdgeBottom = ({ color = C.cream, className = "" }: { color?: string; className?: string }) => (
  <div className={cn("w-full overflow-hidden leading-[0] -mb-px", className)}>
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-[30px] md:h-[50px] block" style={{ color }}>
      <path d="M0,0 L0,35 Q30,40 60,32 Q90,25 120,38 Q150,50 180,35 Q210,22 240,40 Q270,55 300,38 Q330,22 360,42 Q390,60 420,40 Q450,22 480,45 Q510,60 540,38 Q570,20 600,42 Q630,60 660,35 Q690,18 720,45 Q750,60 780,40 Q810,25 840,48 Q870,60 900,35 Q930,18 960,42 Q990,60 1020,38 Q1050,22 1080,45 Q1110,60 1140,40 Q1170,25 1200,35 L1200,0 Z" fill="currentColor" />
    </svg>
  </div>
);

/* ════════════════════════════════════════════
   HAND-DRAWN CIRCLE SVG — imperfect, organic feel
   ════════════════════════════════════════════ */
const HandDrawnCircle = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 240 160" fill="none" className={className} style={{ color: C.textMuted }}>
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

/* ════════════════════════════════════════════
   INLINE MUSIC TOGGLE — circular button with rotating text
   ════════════════════════════════════════════ */
const InlineMusicToggle = ({ musicUrl }: { musicUrl: string | null }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!musicUrl) return;
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [musicUrl]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
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
        transition={playing ? { duration: 8, repeat: Infinity, ease: "linear" } : {}}
      >
        <defs>
          <path id="circlePath" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
        </defs>
        <text fontSize="8" fill={C.textLight} letterSpacing="3">
          <textPath href="#circlePath">
            {playing ? "♪ TAP TO PAUSE ♪ TAP TO PAUSE" : "♪ TAP TO PLAY ♪ TAP TO PLAY"}
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

  const effectiveMusicUrl = data.musicUrl || data.effectiveMusicUrl || data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName = data.musicName || data.effectiveMusicName || data.templateDefaults.defaultMusicName;

  const handleOpenEnvelope = () => {
    setEnvelopeOpen(true);
    setTimeout(() => {
      inviteRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 800);
  };

  return (
    <div data-theme="blossom" className="min-h-screen" style={{ backgroundColor: C.sage, fontFamily: FONTS.body }}>
      {/* Google Fonts for Great Vibes */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}</style>

      {/* ═══════════ ENVELOPE SCREEN ═══════════ */}
      {!envelopeOpen && mode !== "edit" && (
        <EnvelopeScreen brideName={data.brideName} groomName={data.groomName} onOpen={handleOpenEnvelope} />
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
            <HeroSection mode={mode} data={data} onUpdate={onUpdate} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />

            <TornEdgeTop color={C.cream} />

            {/* Welcome + Inline Music Toggle */}
            <WelcomeSection mode={mode} data={data} onUpdate={onUpdate} effectiveMusicUrl={effectiveMusicUrl} />

            {/* Calendar Date with hand-drawn circle */}
            <CalendarDateSection mode={mode} weddingDate={data.weddingDate} onUpdate={onUpdate} />

            {/* Animated S-Curve Timeline */}
            <TimelineSection mode={mode} data={data} onUpdate={onUpdate} />

            {/* Venue */}
            {data.events[0] && <VenueSection mode={mode} event={data.events[0]} />}

            <TornEdgeTop color={C.cream} />

            {/* Dress Code */}
            <DressCodeSection />

            {/* Gallery */}
            <GallerySection mode={mode} data={data} onUpdate={onUpdate} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />

            {/* Details */}
            <DetailsSection />

            {/* Music Editor (edit only) */}
            {mode === "edit" && (
              <section className="py-16" style={{ backgroundColor: C.cream }}>
                <div className="max-w-xl mx-auto px-6">
                  <EditableMusicPlayer
                    musicUrl={data.musicUrl}
                    musicName={data.musicName}
                    defaultMusicUrl={data.templateDefaults.defaultMusicUrl}
                    defaultMusicName={data.templateDefaults.defaultMusicName}
                    onUpdate={(url, name) => onUpdate({ musicUrl: url, musicName: name })}
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
              <RsvpSection invitationId={data.invitationId} isDemo={mode === "demo"} />
            )}

            {/* Footer */}
            <footer className={cn("relative py-16 text-center overflow-hidden", mode === "edit" && "pb-32")} style={{ backgroundColor: C.sage }}>
              <div className="max-w-md mx-auto px-6 relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <Heart size={24} className="mx-auto mb-4" fill={C.cream} style={{ color: C.cream }} />
                  <p className="text-3xl md:text-4xl mb-3" style={{ fontFamily: FONTS.script, color: C.cream }}>
                    {data.brideName?.split(" ")[0] || "Bride"} &amp; {data.groomName?.split(" ")[0] || "Groom"}
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-[1px]" style={{ backgroundColor: `${C.cream}40` }} />
                    <Heart size={10} fill={C.cream} style={{ color: C.cream, opacity: 0.6 }} />
                    <div className="w-12 h-[1px]" style={{ backgroundColor: `${C.cream}40` }} />
                  </div>
                  <p className="text-xs tracking-[0.2em] uppercase" style={{ color: `${C.cream}99` }}>
                    {formatWeddingDate(data.weddingDate)}
                  </p>
                  {data.hashtag && <p className="text-sm mt-4 italic" style={{ color: `${C.cream}80` }}>{data.hashtag}</p>}
                  <p className="text-[10px] mt-8" style={{ color: `${C.cream}50` }}>Made with love on ShubhAarambh</p>
                </motion.div>
              </div>
            </footer>

            {mode === "edit" && (
              <EditModeToolbar onSaveDraft={onSaveDraft} onPublish={onPublish} isSaving={isSaving} isPublishing={isPublishing} invitationId={data.invitationId} hasUnsavedChanges={true} />
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
const EnvelopeScreen = ({ brideName, groomName, onOpen }: { brideName: string; groomName: string; onOpen: () => void }) => {
  const [hovering, setHovering] = useState(false);

  return (
    <motion.section className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: C.sage }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.6 }}>
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)" }} />

      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-10 relative z-10">
        <p className="text-4xl md:text-5xl leading-relaxed" style={{ fontFamily: FONTS.script, color: C.cream }}>
          Wedding Invitation
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative w-[300px] h-[200px] md:w-[380px] md:h-[240px] mx-auto">
        <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: C.sageDark }} />
        <svg viewBox="0 0 380 120" className="absolute -top-[1px] left-0 w-full" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>
          <path d="M0,0 L190,100 L380,0 L380,0 L0,0Z" fill={C.sageDark} opacity="0.8" />
          <path d="M0,0 L190,100 L380,0" fill="none" stroke={C.sageLight} strokeWidth="0.5" opacity="0.4" />
        </svg>
        <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: C.sage }}>
          <svg viewBox="0 0 380 240" className="absolute inset-0 w-full h-full">
            <path d="M0,240 L190,130 L380,240" fill="none" stroke={C.sageLight} strokeWidth="0.8" opacity="0.3" />
            <path d="M0,0 L190,130 L380,0" fill="none" stroke={C.sageLight} strokeWidth="0.5" opacity="0.2" />
          </svg>
        </div>

        <motion.button
          onClick={onOpen}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          animate={{ scale: hovering ? 1.08 : [1, 1.04, 1] }}
          transition={hovering ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: `radial-gradient(circle at 35% 35%, ${C.waxSeal}, ${C.waxSealDark})`, boxShadow: `0 4px 20px rgba(164,124,85,0.5), inset 0 1px 3px rgba(255,255,255,0.2)` }}
        >
          <span className="text-[10px] md:text-xs tracking-[0.15em] uppercase font-semibold" style={{ color: C.cream }}>Open</span>
        </motion.button>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-8 text-xs tracking-[0.2em] uppercase" style={{ color: `${C.cream}70` }}>
        Tap the seal to open
      </motion.p>
    </motion.section>
  );
};

/* ══════════════════════════════════════════════════════════
   HERO — Full-bleed couple photo with script names & date
   ══════════════════════════════════════════════════════════ */
const HeroSection = ({ mode, data, onUpdate, templateId, sessionUUID, uploadStage }: {
  mode: TemplateProps["mode"]; data: TemplateProps["data"]; onUpdate: TemplateProps["onUpdate"];
  templateId?: number; sessionUUID?: string; uploadStage?: "temp" | "draft" | "published";
}) => {
  const couplePhoto = data.couplePhotoUrl || DEFAULT_COUPLE_PHOTO;

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-end overflow-hidden">
      <div className="absolute inset-0">
        {mode === "edit" ? (
          <EditablePhoto photoUrl={data.couplePhotoUrl} onSave={(url) => onUpdate({ couplePhotoUrl: url })} mode={mode} className="w-full h-full object-cover" alt="Couple Photo" placeholderText="Add Couple Photo" invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} oldPublicUrl={data.couplePhotoUrl || undefined} />
        ) : (
          <img src={couplePhoto} alt={`${data.brideName} & ${data.groomName}`} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.65) 100%)" }} />
      </div>

      <div className="relative z-10 text-center px-6 pb-12 w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div style={{ fontFamily: FONTS.script }}>
            <EditableText value={data.brideName} onSave={(val) => onUpdate({ brideName: val })} mode={mode} placeholder="Bride's Name" className="block text-5xl sm:text-6xl md:text-7xl text-white drop-shadow-lg" as="h1" />
          </div>
          <p className="text-2xl my-1 text-white/80 drop-shadow" style={{ fontFamily: FONTS.script }}>&amp;</p>
          <div style={{ fontFamily: FONTS.script }}>
            <EditableText value={data.groomName} onSave={(val) => onUpdate({ groomName: val })} mode={mode} placeholder="Groom's Name" className="block text-5xl sm:text-6xl md:text-7xl text-white drop-shadow-lg" as="h1" />
          </div>
        </motion.div>

        {mode === "edit" ? (
          <div className="mt-6">
            <label className="text-xs block mb-2 tracking-wider uppercase text-white/70">Wedding Date</label>
            <input type="date" value={data.weddingDate} onChange={(e) => onUpdate({ weddingDate: e.target.value })} className="bg-white/20 backdrop-blur border border-white/30 rounded-lg px-4 py-2 text-sm text-white" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4">
            <p className="text-4xl md:text-5xl text-white/95 drop-shadow-lg" style={{ fontFamily: FONTS.script }}>
              {data.weddingDate ? `${new Date(data.weddingDate).getDate()}/${String(new Date(data.weddingDate).getMonth() + 1).padStart(2, "0")}` : ""}
            </p>
          </motion.div>
        )}

        {mode !== "edit" && (
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="mt-8">
            <ChevronDown size={20} className="mx-auto text-white/60" />
          </motion.div>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   WELCOME — "Dear Guests!" + inline music toggle
   ══════════════════════════════════════════════════════════ */
const WelcomeSection = ({ mode, data, onUpdate, effectiveMusicUrl }: {
  mode: TemplateProps["mode"]; data: TemplateProps["data"]; onUpdate: TemplateProps["onUpdate"]; effectiveMusicUrl: string | null;
}) => (
  <section className="py-16 md:py-24" style={{ backgroundColor: C.cream }}>
    <div className="max-w-xl mx-auto px-6 text-center">
      {/* Inline music toggle — directly playable */}
      {mode !== "edit" && effectiveMusicUrl && (
        <div className="mb-10">
          <InlineMusicToggle musicUrl={effectiveMusicUrl} />
        </div>
      )}

      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl mb-8" style={{ fontFamily: FONTS.script, color: C.text }}>
        Dear Guests!
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
        <div style={{ color: C.textMuted, fontFamily: FONTS.body }}>
          <EditableText value={data.welcomeMessage} onSave={(val) => onUpdate({ welcomeMessage: val })} mode={mode} placeholder="We warmly invite you to share our joy on this special day..." className="text-base md:text-lg leading-relaxed" multiline as="p" />
        </div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   CALENDAR DATE — 3-day boxes with hand-drawn scribble circle
   ══════════════════════════════════════════════════════════ */
const CalendarDateSection = ({ mode, weddingDate, onUpdate }: {
  mode: TemplateProps["mode"]; weddingDate: string; onUpdate: TemplateProps["onUpdate"];
}) => {
  const dateObj = weddingDate ? new Date(weddingDate) : null;
  const day = dateObj?.getDate();
  const dayBefore = dateObj ? new Date(dateObj.getTime() - 86400000).getDate() : null;
  const dayAfter = dateObj ? new Date(dateObj.getTime() + 86400000).getDate() : null;
  const monthName = dateObj?.toLocaleDateString("en", { month: "long" });
  const dayName = dateObj?.toLocaleDateString("en", { weekday: "long" });

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: C.cream }}>
      <div className="max-w-md mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative inline-block mb-6">
          {/* Hand-drawn scribble circle around calendar */}
          <div className="absolute -inset-4 md:-inset-6 z-0">
            <HandDrawnCircle className="w-full h-full" />
          </div>

          {/* Calendar boxes */}
          <div className="relative z-10 flex items-end gap-2">
            {/* Day before */}
            <div className="text-center px-3 py-2 border opacity-40" style={{ borderColor: C.textLight }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: C.textLight }}>{monthName || "Month"}</p>
              <p className="text-2xl font-light" style={{ color: C.text, fontFamily: FONTS.heading }}>{dayBefore ?? "—"}</p>
            </div>

            {/* Main day — larger, highlighted */}
            <div className="text-center px-5 py-4 border-2" style={{ borderColor: C.text }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.text }}>{dayName || "Day"}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>{monthName || "Month"}</p>
              <p className="text-5xl font-light" style={{ color: C.text, fontFamily: FONTS.heading }}>{day ?? "—"}</p>
            </div>

            {/* Day after */}
            <div className="text-center px-3 py-2 border opacity-40" style={{ borderColor: C.textLight }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: C.textLight }}>{monthName || "Month"}</p>
              <p className="text-2xl font-light" style={{ color: C.text, fontFamily: FONTS.heading }}>{dayAfter ?? "—"}</p>
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
const TimelineSection = ({ mode, data, onUpdate }: {
  mode: TemplateProps["mode"]; data: TemplateProps["data"]; onUpdate: TemplateProps["onUpdate"];
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
    <section className="py-16 md:py-24 overflow-hidden" style={{ backgroundColor: C.cream }}>
      <div className="max-w-md mx-auto px-6">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center text-4xl md:text-5xl mb-16" style={{ fontFamily: FONTS.script, color: C.text }}>
          Programme
        </motion.h2>

        {isEdit ? (
          <div className="space-y-4">
            {data.events.map((event, i) => (
              <EditableEventCard key={event.id || i} event={event} onUpdate={(updates) => updateEvent(i, updates)} onDelete={() => deleteEvent(i)} mode={mode} index={i} />
            ))}
            <AddEventButton
              onAdd={() => {
                const newEvent: EventData = { id: null, eventName: "New Event", eventDate: "", eventTime: "", venueName: "", venueAddress: "", mapsUrl: null };
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
      <svg className="absolute inset-0 w-full" style={{ height: totalHeight }} viewBox={`0 0 350 ${totalHeight}`} preserveAspectRatio="xMidYMid meet" fill="none">
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
              transition={{ delay: 0.5 + i * 0.5, duration: 0.4, type: "spring", stiffness: 200 }}
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
          transition={{ delay: 0.5 + events.length * 0.5, duration: 0.4, type: "spring" }}
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
            style={{ top: topOffset, ...(isLeft ? { left: "2%" } : { right: "2%" }), textAlign: isLeft ? "left" : "right" }}
          >
            <h3 className="text-2xl md:text-3xl" style={{ fontFamily: FONTS.script, color: C.text }}>
              {event.eventName}
            </h3>
            {event.eventTime && (
              <p className="text-xl font-light mt-1" style={{ color: C.text, fontFamily: FONTS.heading }}>
                {formatTime(event.eventTime)}
              </p>
            )}
            {event.venueName && (
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>{event.venueName}</p>
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
const VenueSection = ({ mode, event }: { mode: TemplateProps["mode"]; event: EventData }) => (
  <section style={{ backgroundColor: C.cream }}>
    <div className="max-w-xl mx-auto px-6 text-center py-12 md:py-16">
      <Heart size={20} className="mx-auto mb-6" fill={C.heartGreen} style={{ color: C.heartGreen }} />
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl mb-4" style={{ fontFamily: FONTS.script, color: C.text }}>
        Venue
      </motion.h2>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
        <p className="text-base md:text-lg mb-1" style={{ color: C.text, fontFamily: FONTS.body }}>{event.venueName || "Venue Name"}</p>
        <p className="text-sm mb-6" style={{ color: C.textMuted }}>{event.venueAddress || "Venue Address"}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="mb-8">
        {event.mapsUrl ? (
          <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 transition-transform hover:scale-105" style={{ backgroundColor: C.sage, borderColor: C.sageMuted, color: C.cream }}>
            <div className="text-center">
              <MapPin size={18} className="mx-auto mb-1" />
              <span className="text-[10px] tracking-[0.1em] uppercase font-medium">Get<br />Directions</span>
            </div>
          </a>
        ) : (
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4" style={{ backgroundColor: C.sage, borderColor: C.sageMuted, color: C.cream }}>
            <div className="text-center">
              <MapPin size={18} className="mx-auto mb-1" />
              <span className="text-[10px] tracking-[0.1em] uppercase font-medium">Get<br />Directions</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>

    <div className="relative w-full overflow-hidden" style={{ maxHeight: "350px" }}>
      <img src={DEFAULT_VENUE_PHOTO} alt="Wedding Venue" className="w-full h-[350px] object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.15) 100%)" }} />
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
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl mb-4" style={{ fontFamily: FONTS.script, color: C.text }}>
        Dress Code
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-sm mb-8 leading-relaxed" style={{ color: C.textMuted }}>
        We would be grateful if you could follow<br />the colour palette of our wedding.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="flex justify-center gap-2 md:gap-3">
        {DRESS_COLORS.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08 }} className="w-11 h-14 md:w-14 md:h-[72px] rounded-sm shadow-sm" style={{ backgroundColor: c.hex, border: c.hex === "#f0ebe2" ? `1px solid ${C.textLight}40` : "none" }} title={c.name} />
        ))}
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   GALLERY
   ══════════════════════════════════════════════════════════ */
const GallerySection = ({ mode, data, onUpdate, templateId, sessionUUID, uploadStage }: {
  mode: TemplateProps["mode"]; data: TemplateProps["data"]; onUpdate: TemplateProps["onUpdate"];
  templateId?: number; sessionUUID?: string; uploadStage?: "temp" | "draft" | "published";
}) => {
  const displayPhotos = data.galleryPhotos.length > 0 ? data.galleryPhotos : data.templateDefaults.defaultPhotos.map((p, i) => ({ photoUrl: p.photoUrl, sortOrder: i, isDefault: true }));

  return (
    <section style={{ backgroundColor: C.cream }}>
      {mode !== "edit" ? (
        <>
          <TornEdgeBottom color={C.cream} />
          <div className="relative w-full overflow-hidden" style={{ maxHeight: "300px" }}>
            {displayPhotos[0] && <img src={displayPhotos[0].photoUrl} alt="Gallery" className="w-full h-[300px] object-cover" />}
          </div>
          <TornEdgeTop color={C.cream} />
        </>
      ) : (
        <div className="py-12 px-6 max-w-5xl mx-auto">
          <h2 className="text-center text-3xl mb-8" style={{ fontFamily: FONTS.script, color: C.text }}>Photo Gallery</h2>
          <EditablePhotoGallery photos={data.galleryPhotos} defaultPhotos={data.templateDefaults.defaultPhotos} onUpdate={(photos) => onUpdate({ galleryPhotos: photos })} mode={mode} maxPhotos={10} invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />
        </div>
      )}
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   DETAILS
   ══════════════════════════════════════════════════════════ */
const DetailsSection = () => (
  <section className="py-16 md:py-20" style={{ backgroundColor: C.cream }}>
    <div className="max-w-md mx-auto px-6 text-center">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl mb-6" style={{ fontFamily: FONTS.script, color: C.text }}>
        Details
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="text-sm leading-relaxed mb-4" style={{ color: C.textMuted }}>
        Please bring your warm wishes and love in your hearts.<br />If you wish to bless us with a gift, we would<br />be grateful for an envelope.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-sm italic leading-relaxed" style={{ color: C.textLight }}>
        <p>We would also be delighted to share<br />a bottle of wine that we will open<br />together one evening.</p>
      </motion.div>
      <Heart size={16} className="mx-auto mt-8" fill={C.heartGreen} style={{ color: C.heartGreen, opacity: 0.5 }} />
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   RSVP
   ══════════════════════════════════════════════════════════ */
const RsvpSection = ({ invitationId, isDemo }: { invitationId: number | null; isDemo: boolean }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "maybe" | "no">("yes");
  const [guestCount, setGuestCount] = useState(2);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!phone.trim() || phone.length < 10) { toast.error("Please enter a valid 10-digit phone number"); return; }
    if (isDemo) { toast("This is a demo — create your invitation to receive real RSVPs", { icon: "✨" }); return; }

    setLoading(true);
    try {
      await submitRsvp(String(invitationId || ""), { guestName: name, guestPhone: phone, attending: attending === "yes" ? "YES" : attending === "maybe" ? "MAYBE" : "NO", guestCount, message: message || undefined });
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
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="text-center rounded-2xl p-10 border" style={{ backgroundColor: C.warmWhite, borderColor: `${C.sage}30` }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${C.sage}20` }}>
              <Check className="w-8 h-8" style={{ color: C.sage }} />
            </motion.div>
            <p className="text-2xl mb-2" style={{ fontFamily: FONTS.script, color: C.text }}>Thank you, {name}!</p>
            <p className="text-sm" style={{ color: C.textMuted }}>We can&apos;t wait to celebrate with you.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20" style={{ backgroundColor: C.cream }}>
      <div className="max-w-md mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-[0.5px]" style={{ backgroundColor: C.sageMuted }} />
            <Heart size={14} fill={C.heartGreen} style={{ color: C.heartGreen }} />
            <div className="w-16 h-[0.5px]" style={{ backgroundColor: C.sageMuted }} />
          </div>
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: C.textMuted }}>Kindly Respond</p>
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: FONTS.script, color: C.text }}>Will You Join Us?</h2>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} onSubmit={handleSubmit} className="rounded-2xl p-8 border space-y-6" style={{ backgroundColor: C.warmWhite, borderColor: `${C.sage}25`, boxShadow: `0 4px 30px ${C.sage}08` }}>
          <div>
            <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: C.textMuted }}>Your Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ color: C.text, backgroundColor: C.white, border: `1px solid ${C.sage}30` }} placeholder="Enter your full name" />
          </div>
          <div>
            <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: C.textMuted }}>Phone Number *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ color: C.text, backgroundColor: C.white, border: `1px solid ${C.sage}30` }} placeholder="10-digit phone number" maxLength={10} />
          </div>

          <div>
            <label className="text-xs tracking-[0.15em] uppercase block mb-3" style={{ color: C.textMuted }}>Your Response</label>
            <div className="grid grid-cols-3 gap-2">
              {attendOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setAttending(opt.value)} className={cn("rounded-xl py-3 text-center transition-all border", attending === opt.value ? "ring-2 shadow-md" : "opacity-70 hover:opacity-100")} style={{ borderColor: attending === opt.value ? C.sage : `${C.sage}30`, backgroundColor: attending === opt.value ? `${C.sage}15` : C.white, ringColor: C.sage }}>
                  <span className="block text-lg mb-1">{opt.icon}</span>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: C.text }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {attending !== "no" && (
            <div>
              <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: C.textMuted }}>Number of Guests</label>
              <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ borderColor: `${C.sage}40` }}>
                  <Minus size={14} style={{ color: C.text }} />
                </button>
                <span className="text-2xl font-light w-12 text-center" style={{ color: C.text, fontFamily: FONTS.heading }}>{guestCount}</span>
                <button type="button" onClick={() => setGuestCount(Math.min(10, guestCount + 1))} className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ borderColor: `${C.sage}40` }}>
                  <Plus size={14} style={{ color: C.text }} />
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: C.textMuted }}>Message (Optional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ color: C.text, backgroundColor: C.white, border: `1px solid ${C.sage}30` }} placeholder="Write a message for the couple..." />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-60" style={{ backgroundColor: C.sage, color: C.cream }}>
            {loading ? <span className="animate-spin">⏳</span> : <Send size={16} />}
            {loading ? "Sending..." : "Send RSVP"}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default BlossomDateTemplate;
