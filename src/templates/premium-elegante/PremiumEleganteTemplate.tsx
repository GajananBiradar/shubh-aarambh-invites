import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  MapPin,
  Heart,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react";
import { TemplateProps, EventData } from "@/templates/types";
import {
  EditableText,
  AddEventButton,
  EditablePhotoGallery,
  EditableMusicPlayer,
  EditModeToolbar,
} from "@/components/inline-editor";
import FloatingMusicPlayer from "@/components/invitation/FloatingMusicPlayer";
import {
  formatWeddingDate,
  formatEventDate,
  formatTime,
} from "@/utils/formatDate";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────
   Premium Elegante Template
   Inspired by premiumelegante.thedigitalyes.com
   Full-featured: Hero · Countdown · Welcome · Gallery ·
   Venue · Day Programme · Dress Code · Pre-Wedding Events ·
   Accommodation · Footer
   ──────────────────────────────────────────── */

// ─── Color Palette (matching reference: premiumelegante.thedigitalyes.com) ───
const C = {
  bg: "#f3ede3", // hsl(40, 24%, 92%) – warm ivory
  text: "#5c4a32", // hsl(33, 47%, 35%) – sage-dark
  textMuted: "#7a6545", // sage-dark with opacity
  textLight: "#9a8a6e",
  gold: "#c5a46d", // exact reference gold
  goldLight: "#c4b08a",
  cream: "#f9f7f2", // ivory card bg
  white: "#ffffff",
  whiteWarm: "#f9f7f2",
  ornament: "#8b7040",
};

const FONTS = {
  body: "'Cormorant Garamond', serif",
  serif: "'Cormorant Garamond', serif",
};

// SVG noise texture for paper/linen effect (matching reference)
const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

const PremiumEleganteTemplate = ({
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

  return (
    <div
      data-theme="premium"
      className="min-h-screen"
      style={{
        backgroundColor: C.bg,
        color: C.text,
        backgroundImage: NOISE_BG,
        backgroundBlendMode: "overlay" as const,
        backgroundSize: "200px",
      }}
    >
      {/* ═══════════ HERO SECTION (Video background with names) ═══════════ */}
      <HeroSection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
        templateId={templateId}
        sessionUUID={sessionUUID}
        uploadStage={uploadStage}
      />

      {/* ═══════════ COUNTDOWN ═══════════ */}
      {(data.showCountdown || mode === "edit") && (
        <CountdownSection
          mode={mode}
          weddingDate={data.weddingDate}
          showCountdown={data.showCountdown}
          onUpdate={onUpdate}
        />
      )}

      {/* ═══════════ WELCOME ═══════════ */}
      <WelcomeSection
        mode={mode}
        welcomeMessage={data.welcomeMessage}
        onUpdate={onUpdate}
      />

      {/* ═══════════ PHOTO GALLERY ═══════════ */}
      <GallerySection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
        templateId={templateId}
        sessionUUID={sessionUUID}
        uploadStage={uploadStage}
      />

      {/* ═══════════ ORNAMENT DIVIDER ═══════════ */}
      <FloralVaseOrnament />

      {/* ═══════════ THE VENUE ═══════════ */}
      {data.events[0] && (
        <VenueSection event={data.events[0]} weddingDate={data.weddingDate} />
      )}

      {/* ═══════════ DAY PROGRAMME ═══════════ */}
      <DayProgrammeSection mode={mode} data={data} onUpdate={onUpdate} />

      {/* ═══════════ RIBBON BOW ═══════════ */}
      <RibbonBowOrnament />

      {/* ═══════════ PRE-WEDDING EVENTS ═══════════ */}
      {(data.events.length > 1 || mode === "edit") && (
        <PreWeddingEventsSection mode={mode} data={data} onUpdate={onUpdate} />
      )}

      {/* ═══════════ MUSIC (Edit only) ═══════════ */}
      {mode === "edit" && (
        <section className="py-20" style={{ backgroundColor: C.bg }}>
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

      {/* ═══════════ FOOTER ═══════════ */}
      <footer
        className={cn(
          "relative py-20 text-center overflow-hidden",
          mode === "edit" && "pb-32",
        )}
        style={{ backgroundColor: C.bg }}
      >
        {/* Decorative floral top border */}
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <svg
            width="400"
            height="80"
            viewBox="0 0 400 80"
            fill="none"
            style={{ color: C.gold, opacity: 0.4 }}
          >
            <path
              d="M0 80 Q50 30 100 50 Q150 70 200 40 Q250 10 300 50 Q350 70 400 30"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M0 80 Q50 50 100 65 Q150 80 200 55 Q250 30 300 65 Q350 80 400 50"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
            />
          </svg>
        </div>

        <div className="max-w-md mx-auto px-6 relative z-10">
          {/* Ending flowers illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-6"
          >
            <svg
              width="180"
              height="120"
              viewBox="0 0 180 120"
              fill="none"
              style={{ color: C.ornament }}
            >
              <g stroke="currentColor" strokeWidth="0.8" fill="none">
                {/* Left branch with flowers */}
                <path d="M90 100 Q60 80 30 90 Q20 70 35 55 Q25 40 40 30" />
                <circle cx="35" cy="55" r="8" strokeWidth="0.6" />
                <circle cx="35" cy="55" r="4" strokeWidth="0.4" />
                <circle cx="40" cy="30" r="6" strokeWidth="0.6" />
                <circle cx="40" cy="30" r="3" strokeWidth="0.4" />
                {/* Left leaves */}
                <path d="M55 85 Q45 75 55 70" />
                <path d="M42 70 Q32 65 42 58" />
                {/* Right branch with flowers */}
                <path d="M90 100 Q120 80 150 90 Q160 70 145 55 Q155 40 140 30" />
                <circle cx="145" cy="55" r="8" strokeWidth="0.6" />
                <circle cx="145" cy="55" r="4" strokeWidth="0.4" />
                <circle cx="140" cy="30" r="6" strokeWidth="0.6" />
                <circle cx="140" cy="30" r="3" strokeWidth="0.4" />
                {/* Right leaves */}
                <path d="M125 85 Q135 75 125 70" />
                <path d="M138 70 Q148 65 138 58" />
                {/* Center top flower */}
                <path d="M90 100 Q90 60 90 25" />
                <circle cx="90" cy="20" r="10" strokeWidth="0.6" />
                <circle cx="90" cy="20" r="5" strokeWidth="0.4" />
                <circle cx="90" cy="20" r="2" fill="currentColor" />
                {/* Small buds */}
                <circle cx="70" cy="45" r="4" strokeWidth="0.5" />
                <circle cx="110" cy="45" r="4" strokeWidth="0.5" />
                {/* Center leaves */}
                <path d="M85 70 Q75 60 85 55" />
                <path d="M95 70 Q105 60 95 55" />
              </g>
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-script text-4xl md:text-5xl mb-2"
            style={{ color: C.text }}
          >
            {data.brideName?.split(" ")[0] || "Bride"} &amp;{" "}
            {data.groomName?.split(" ")[0] || "Groom"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-3 my-4"
          >
            <div
              className="w-12 h-[1px]"
              style={{ backgroundColor: C.goldLight }}
            />
            <Heart size={14} style={{ color: C.gold }} fill={C.gold} />
            <div
              className="w-12 h-[1px]"
              style={{ backgroundColor: C.goldLight }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs tracking-[0.2em] uppercase"
            style={{ color: C.textMuted, fontFamily: FONTS.body }}
          >
            {formatWeddingDate(data.weddingDate)}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="italic text-sm mt-6 mb-8"
            style={{ color: C.textLight, fontFamily: FONTS.serif }}
          >
            We can&apos;t wait to celebrate with you
          </motion.p>

          {/* Bottom floral accent */}
          <div className="flex justify-center mb-6">
            <svg
              width="120"
              height="30"
              viewBox="0 0 120 30"
              fill="none"
              style={{ color: C.gold, opacity: 0.5 }}
            >
              <path
                d="M0 15 Q15 5 30 15 Q45 25 60 15 Q75 5 90 15 Q105 25 120 15"
                stroke="currentColor"
                strokeWidth="0.8"
                fill="none"
              />
              <circle cx="30" cy="15" r="2" fill="currentColor" opacity="0.4" />
              <circle
                cx="60"
                cy="15"
                r="2.5"
                fill="currentColor"
                opacity="0.5"
              />
              <circle cx="90" cy="15" r="2" fill="currentColor" opacity="0.4" />
            </svg>
          </div>

          <p
            className="text-[10px] mt-4"
            style={{ color: C.goldLight, fontFamily: FONTS.body }}
          >
            Made with love on ShubhAarambh
          </p>
        </div>
      </footer>

      {/* ═══════════ TOOLBAR ═══════════ */}
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

      {/* ═══════════ MUSIC PLAYER (View/Demo) ═══════════ */}
      {mode !== "edit" && effectiveMusicUrl && (
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   HERO SECTION — Video background with names overlay
   ══════════════════════════════════════════════════════════ */
const VIDEO_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/7/video/header%20video.mp4";

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
}) => (
  <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
    {/* Video background */}
    <div className="absolute inset-0">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        preload="metadata"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      {/* Warm vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(92,74,50,0.45) 0%, rgba(92,74,50,0.15) 40%, rgba(92,74,50,0.5) 100%)`,
        }}
      />
    </div>

    {/* Content */}
    <div className="relative z-10 text-center px-6 max-w-2xl">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-sm md:text-base tracking-[0.35em] uppercase mb-10"
        style={{ color: C.white, fontFamily: FONTS.body }}
      >
        We&apos;re Getting Married
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mb-8"
      >
        <EditableText
          value={data.brideName}
          onSave={(val) => onUpdate({ brideName: val })}
          mode={mode}
          placeholder="Bride"
          className="block font-script text-6xl sm:text-7xl md:text-8xl leading-tight text-white drop-shadow-lg"
          as="h1"
        />
        <p className="text-3xl my-2 font-script text-white/80 drop-shadow">
          &amp;
        </p>
        <EditableText
          value={data.groomName}
          onSave={(val) => onUpdate({ groomName: val })}
          mode={mode}
          placeholder="Groom"
          className="block font-script text-6xl sm:text-7xl md:text-8xl leading-tight text-white drop-shadow-lg"
          as="h1"
        />
      </motion.div>

      {/* Diamond ornament */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="flex items-center justify-center gap-3 mb-6"
      >
        <div className="w-16 h-[1px] bg-white/60" />
        <span className="text-white/60 text-sm">◆</span>
        <div className="w-16 h-[1px] bg-white/60" />
      </motion.div>

      {/* Date */}
      {mode === "edit" ? (
        <div className="mt-4">
          <label
            className="text-xs block mb-2 tracking-wider uppercase text-white/70"
            style={{ fontFamily: FONTS.body }}
          >
            Wedding Date
          </label>
          <input
            type="date"
            value={data.weddingDate}
            onChange={(e) => onUpdate({ weddingDate: e.target.value })}
            className="bg-white/30 backdrop-blur border border-white/40 rounded-lg px-4 py-2 text-sm text-white"
            style={{ fontFamily: FONTS.body }}
          />
        </div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-base md:text-lg tracking-[0.25em] uppercase text-white/90 drop-shadow"
          style={{ fontFamily: FONTS.serif }}
        >
          {formatWeddingDate(data.weddingDate)}
        </motion.p>
      )}

      {/* RSVP scroll hint */}
      {mode !== "edit" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-12"
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-2 text-white/70"
            style={{ fontFamily: FONTS.body }}
          >
            RSVP
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown size={20} className="mx-auto text-white/70" />
          </motion.div>
        </motion.div>
      )}
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   COUNTDOWN SECTION
   ══════════════════════════════════════════════════════════ */
const CountdownSection = ({
  mode,
  weddingDate,
  showCountdown,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  weddingDate: string;
  showCountdown: boolean;
  onUpdate: TemplateProps["onUpdate"];
}) => (
  <section className="py-20 md:py-28" style={{ backgroundColor: C.bg }}>
    <div className="max-w-2xl mx-auto px-6 text-center">
      {mode === "edit" && (
        <div className="mb-6 flex items-center justify-center gap-3">
          <label className="font-body text-sm" style={{ color: C.text }}>
            Show Countdown
          </label>
          <button
            onClick={() => onUpdate({ showCountdown: !showCountdown })}
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative",
              showCountdown ? "bg-[#8a7656]" : "bg-[#d4c4a8]",
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform",
                showCountdown ? "left-6" : "left-1",
              )}
            />
          </button>
        </div>
      )}

      {showCountdown && (
        <>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-script text-4xl md:text-7xl mb-4"
            style={{ color: C.text }}
          >
            Countdown
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs tracking-[0.3em] uppercase mb-12"
            style={{ color: C.textLight, fontFamily: FONTS.body }}
          >
            Until {formatWeddingDate(weddingDate)}
          </motion.p>
          <CountdownDisplay weddingDate={weddingDate} />
        </>
      )}
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   COUNTDOWN DISPLAY — Numbers with vertical dividers
   ══════════════════════════════════════════════════════════ */
const CountdownDisplay = ({ weddingDate }: { weddingDate: string }) => {
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!weddingDate) {
        setCountdown(null);
        return;
      }
      const diff = new Date(weddingDate).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  if (!countdown) return null;

  const items = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hours, label: "Hours" },
    { value: countdown.minutes, label: "Minutes" },
  ];

  return (
    <div className="flex items-center justify-center">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center">
          {i > 0 && (
            <div
              className="w-[1px] h-14 mx-8 md:mx-12"
              style={{ backgroundColor: C.goldLight }}
            />
          )}
          <div className="text-center">
            <span
              className="block text-5xl md:text-6xl font-light italic"
              style={{ color: C.text, fontFamily: FONTS.serif }}
            >
              {item.value}
            </span>
            <span
              className="block text-[10px] tracking-[0.3em] uppercase mt-2"
              style={{ color: C.textLight, fontFamily: FONTS.body }}
            >
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   WELCOME SECTION
   ══════════════════════════════════════════════════════════ */
const WelcomeSection = ({
  mode,
  welcomeMessage,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  welcomeMessage: string;
  onUpdate: TemplateProps["onUpdate"];
}) => (
  <section className="py-20 md:py-28" style={{ backgroundColor: C.cream }}>
    <div className="max-w-3xl mx-auto text-center px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-script text-4xl md:text-7xl mb-8"
        style={{ color: C.text }}
      >
        Welcome!
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
      >
        <EditableText
          value={welcomeMessage}
          onSave={(val) => onUpdate({ welcomeMessage: val })}
          mode={mode}
          placeholder="We warmly welcome you to celebrate our union of love and togetherness..."
          className="text-lg leading-relaxed italic"
          multiline
          as="p"
        />
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   PHOTO GALLERY — Horizontal scrolling strip (view)
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
}) => (
  <section className="pb-0 pt-0" style={{ backgroundColor: C.bg }}>
    <div className="max-w-7xl mx-auto px-6">
      {mode === "edit" ? (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-script text-4xl" style={{ color: C.text }}>
              Photo Gallery
            </h2>
          </div>
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
      ) : (
        <HorizontalGalleryStrip
          photos={data.galleryPhotos}
          defaultPhotos={data.templateDefaults.defaultPhotos}
        />
      )}
    </div>
  </section>
);

/** Auto-scrolling marquee gallery strip (like reference) */
const HorizontalGalleryStrip = ({
  photos,
  defaultPhotos,
}: {
  photos: { photoUrl: string; sortOrder: number; isDefault: boolean }[];
  defaultPhotos: { photoUrl: string; sortOrder: number }[];
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayPhotos =
    photos.length > 0
      ? photos
      : defaultPhotos.map((p, i) => ({
          photoUrl: p.photoUrl,
          sortOrder: i,
          isDefault: true,
        }));

  if (displayPhotos.length === 0) return null;

  // Duplicate photos for infinite scroll effect
  const allPhotos = [...displayPhotos, ...displayPhotos];

  return (
    <>
      <div className="w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4"
          style={{
            width: "max-content",
            animation: `premium-marquee ${displayPhotos.length * 5}s linear infinite`,
          }}
        >
          {allPhotos.map((photo, i) => (
            <div
              key={`gallery-${i}`}
              className="flex-shrink-0 overflow-hidden cursor-pointer rounded-lg"
              style={{ height: "340px", width: "240px" }}
              onClick={() => setLightboxUrl(photo.photoUrl)}
            >
              <img
                src={photo.photoUrl}
                alt={`Gallery ${(i % displayPhotos.length) + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Marquee keyframes injected via style tag */}
      <style>{`
        @keyframes premium-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(92, 74, 50, 0.95)" }}
            onClick={() => setLightboxUrl(null)}
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightboxUrl}
              alt="Gallery photo"
              className="max-w-full max-h-[90vh] rounded-xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ══════════════════════════════════════════════════════════
   THE VENUE — Gold background with venue card
   ══════════════════════════════════════════════════════════ */
const VENUE_IMAGE_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/7/palace.png";

const VenueSection = ({
  event,
  weddingDate,
}: {
  event: EventData;
  weddingDate: string;
}) => (
  <section
    className="py-20 md:py-28 relative overflow-hidden"
    style={{ backgroundColor: C.gold }}
  >
    <div className="max-w-3xl mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-script text-4xl md:text-7xl mb-3"
        style={{ color: C.white }}
      >
        The Venue
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="italic text-base mb-10"
        style={{ color: C.whiteWarm, fontFamily: FONTS.serif }}
      >
        Where we celebrate
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: C.white,
          boxShadow:
            "0 10px 40px -10px rgba(59,38,19,.15), 0 4px 15px -3px rgba(59,38,19,.08)",
        }}
      >
        {/* Venue image */}
        <div className="w-full overflow-hidden bg-[#f3ede3]">
          <img
            src={VENUE_IMAGE_URL}
            alt="Maharaja Palace"
            className="w-full object-contain"
            style={{ maxHeight: "360px" }}
          />
        </div>

        <div className="p-8 md:p-10">
          {/* Venue name */}
          <h3
            className="font-script text-3xl md:text-4xl mb-6"
            style={{ color: "#7a6545" }}
          >
            {event.venueName || "Maharaja Palace"}
          </h3>

          <div
            className="w-20 h-[1px] mx-auto mb-6"
            style={{ backgroundColor: C.goldLight }}
          />

          {/* Date & time */}
          <p
            className="text-base italic mb-1"
            style={{ color: C.textMuted, fontFamily: FONTS.serif }}
          >
            {formatEventDate(event.eventDate)}
            {event.eventTime && <span className="mx-3">·</span>}
            {event.eventTime && (
              <span className="italic">{formatTime(event.eventTime)}</span>
            )}
          </p>

          <div
            className="w-12 h-[1px] mx-auto my-5"
            style={{ backgroundColor: C.goldLight }}
          />

          {/* Address */}
          <p
            className="text-sm md:text-base font-medium mb-1"
            style={{ color: C.text, fontFamily: FONTS.serif }}
          >
            {event.venueAddress || "Address"}
          </p>

          {/* Google map embed */}
          <div className="mt-8">
            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: "#d4c4a8" }}
            >
              <iframe
                src={
                  event.mapsUrl
                    ? getEmbedMapUrl(event.mapsUrl)
                    : "https://maps.google.com/maps?q=wedding+venue&output=embed"
                }
                width="100%"
                height="250"
                style={{
                  border: 0,
                  filter:
                    "sepia(0.25) saturate(0.6) hue-rotate(5deg) brightness(1.05)",
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Venue Location"
              />
            </div>
            {event.mapsUrl ? (
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-xs tracking-[0.2em] uppercase"
                style={{ color: "#7a6545", fontFamily: FONTS.body }}
              >
                <MapPin size={14} /> Open in Maps
              </a>
            ) : (
              <p
                className="inline-flex items-center gap-2 mt-4 text-xs tracking-[0.2em] uppercase"
                style={{ color: "#7a6545", fontFamily: FONTS.body }}
              >
                <MapPin size={14} /> Open in Maps
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   DAY PROGRAMME — Alternating left/right timeline
   ══════════════════════════════════════════════════════════ */
const DayProgrammeSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => (
  <section
    className="py-20 md:py-28 relative overflow-hidden"
    style={{ backgroundColor: C.bg }}
  >
    {/* Subtle watermark pattern */}
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cpath d='M150 50 Q200 100 150 150 Q100 200 150 250' fill='none' stroke='%238a7656' stroke-width='0.5'/%3E%3Ccircle cx='150' cy='150' r='80' fill='none' stroke='%238a7656' stroke-width='0.3'/%3E%3Cpath d='M100 80 Q120 60 150 50 Q180 60 200 80' fill='none' stroke='%238a7656' stroke-width='0.3'/%3E%3C/svg%3E")`,
        backgroundSize: "300px 300px",
      }}
    />

    <div className="max-w-3xl mx-auto px-6 relative z-10">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-script text-5xl md:text-6xl mb-3"
          style={{ color: C.text }}
        >
          Day Programme
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="italic text-base"
          style={{ color: C.textMuted, fontFamily: FONTS.serif }}
        >
          {formatWeddingDate(data.weddingDate)}
        </motion.p>
      </div>

      <AlternatingTimeline
        events={data.events}
        mode={mode}
        onUpdate={onUpdate}
        data={data}
      />

      {mode === "edit" && (
        <div className="mt-8">
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
      )}
    </div>
  </section>
);

/** Alternating left/right timeline with dots and central line — editable in edit mode */
const AlternatingTimeline = ({
  events,
  mode = "view",
  onUpdate,
  data,
}: {
  events: EventData[];
  mode?: TemplateProps["mode"];
  onUpdate?: TemplateProps["onUpdate"];
  data?: TemplateProps["data"];
}) => {
  const isEdit = mode === "edit" && onUpdate && data;

  const updateEvent = (index: number, updates: Partial<EventData>) => {
    if (!onUpdate || !data) return;
    const newEvents = [...data.events];
    newEvents[index] = { ...newEvents[index], ...updates };
    onUpdate({ events: newEvents });
  };

  const deleteEvent = (index: number) => {
    if (!onUpdate || !data) return;
    onUpdate({ events: data.events.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="relative">
      {/* Central vertical line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2"
        style={{ backgroundColor: C.goldLight }}
      />

      <div className="space-y-0">
        {events.map((event, i) => {
          const isLeft = i % 2 === 0;

          const timeContent = isEdit ? (
            <InlineTimePicker
              value={event.eventTime}
              onChange={(val) => updateEvent(i, { eventTime: val })}
            />
          ) : (
            <p
              className="font-bold text-base md:text-lg tracking-[0.15em]"
              style={{ color: C.text, fontFamily: FONTS.body }}
            >
              {formatTime(event.eventTime)}
            </p>
          );

          const nameContent = isEdit ? (
            <EditableText
              value={event.eventName}
              onSave={(val) => updateEvent(i, { eventName: val })}
              mode={mode}
              placeholder="Event Name"
              className="text-sm md:text-base tracking-[0.12em] uppercase mt-1"
              as="p"
            />
          ) : (
            <p
              className="text-sm md:text-base tracking-[0.12em] uppercase mt-1"
              style={{ color: C.textMuted, fontFamily: FONTS.body }}
            >
              {event.eventName}
            </p>
          );

          const venueContent = isEdit ? (
            <EditableText
              value={event.venueName}
              onSave={(val) => updateEvent(i, { venueName: val })}
              mode={mode}
              placeholder="Venue Name"
              className="text-xs md:text-sm italic mt-1"
              as="p"
            />
          ) : (
            event.venueName && (
              <p
                className="text-xs md:text-sm italic mt-1"
                style={{ color: C.textLight, fontFamily: FONTS.serif }}
              >
                {event.venueName}
              </p>
            )
          );

          const dateContent = isEdit ? (
            <InlineDatePicker
              value={event.eventDate}
              onChange={(val) => updateEvent(i, { eventDate: val })}
            />
          ) : null;

          const deleteBtn = isEdit ? (
            <button
              onClick={() => deleteEvent(i)}
              className="mt-2 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete event"
            >
              <Trash2 size={14} />
            </button>
          ) : null;

          return (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative grid grid-cols-2 py-8"
            >
              {/* Dot on timeline */}
              <div
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ backgroundColor: C.gold }}
              />

              {isLeft ? (
                <>
                  <div className="text-right pr-10">
                    {timeContent}
                    {nameContent}
                    {venueContent}
                    {dateContent}
                    {deleteBtn && (
                      <div className="flex justify-end">{deleteBtn}</div>
                    )}
                  </div>
                  <div className="pl-10" />
                </>
              ) : (
                <>
                  <div className="pr-10" />
                  <div className="text-left pl-10">
                    {timeContent}
                    {nameContent}
                    {venueContent}
                    {dateContent}
                    {deleteBtn}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/** Small inline date picker for timeline edit mode */
const InlineDatePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block mt-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
        style={{ color: C.textLight, fontFamily: FONTS.body }}
      >
        <Calendar size={12} />
        {value ? formatEventDate(value) : "Set date"}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-20 bg-white border rounded-lg p-2 shadow-lg"
          style={{ borderColor: C.goldLight }}
        >
          <input
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(false);
            }}
            className="bg-transparent text-xs outline-none"
            style={{ color: C.text, fontFamily: FONTS.body }}
          />
        </div>
      )}
    </div>
  );
};

/** Small inline time picker for timeline edit mode */
const InlineTimePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 font-bold text-base md:text-lg tracking-[0.15em] hover:opacity-80 transition-opacity"
        style={{ color: C.text, fontFamily: FONTS.body }}
      >
        <Clock size={14} />
        {value ? formatTime(value) : "Set time"}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-20 bg-white border rounded-lg p-2 shadow-lg"
          style={{ borderColor: C.goldLight }}
        >
          <input
            type="time"
            value={value?.slice(0, 5) || ""}
            onChange={(e) => {
              onChange(e.target.value + ":00");
              setOpen(false);
            }}
            className="bg-transparent text-sm outline-none"
            style={{ color: C.text, fontFamily: FONTS.body }}
          />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PRE-WEDDING EVENTS — Gold bg with Indian wedding event cards
   ══════════════════════════════════════════════════════════ */
const PreWeddingEventsSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const subEvents = data.events.slice(1);
  if (subEvents.length === 0 && mode !== "edit") return null;

  const isEdit = mode === "edit";

  const updateSubEvent = (subIndex: number, updates: Partial<EventData>) => {
    const actualIndex = subIndex + 1; // offset by 1 since we skip events[0]
    const newEvents = [...data.events];
    newEvents[actualIndex] = { ...newEvents[actualIndex], ...updates };
    onUpdate({ events: newEvents });
  };

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: C.gold }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs tracking-[0.35em] uppercase mb-4"
          style={{ color: C.whiteWarm, fontFamily: FONTS.body }}
        >
          Wedding Celebrations
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-script text-4xl md:text-7xl mb-4"
          style={{ color: C.white }}
        >
          Join the Festivities
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="italic text-sm mb-14 max-w-lg mx-auto"
          style={{ color: C.whiteWarm, fontFamily: FONTS.serif }}
        >
          We warmly invite you to be part of each joyous celebration leading up
          to our wedding day.
        </motion.p>

        <div className="space-y-8">
          {subEvents.map((event, i) => (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-2xl p-8 md:p-10 relative group"
              style={{ backgroundColor: C.cream }}
            >
              {isEdit && (
                <button
                  onClick={() => {
                    const actualIndex = i + 1;
                    onUpdate({
                      events: data.events.filter(
                        (_, idx) => idx !== actualIndex,
                      ),
                    });
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                  title="Delete event"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <IndianEventIcon eventName={event.eventName} />

              {isEdit ? (
                <EditableText
                  value={event.eventName}
                  onSave={(val) => updateSubEvent(i, { eventName: val })}
                  mode={mode}
                  placeholder="Event Name"
                  className="font-script text-3xl md:text-4xl mb-4"
                  as="h3"
                />
              ) : (
                <h3
                  className="font-script text-3xl md:text-4xl mb-4"
                  style={{ color: C.text }}
                >
                  {event.eventName}
                </h3>
              )}

              <div
                className="w-16 h-[1px] mx-auto mb-4"
                style={{ backgroundColor: C.goldLight }}
              />

              {isEdit ? (
                <div className="flex items-center justify-center gap-3 mb-3">
                  <InlineDatePicker
                    value={event.eventDate}
                    onChange={(val) => updateSubEvent(i, { eventDate: val })}
                  />
                  <span style={{ color: C.textMuted }}>·</span>
                  <InlineTimePicker
                    value={event.eventTime}
                    onChange={(val) => updateSubEvent(i, { eventTime: val })}
                  />
                </div>
              ) : (
                <>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: "#7a6545", fontFamily: FONTS.body }}
                  >
                    {formatEventDate(event.eventDate)}
                  </p>
                  {event.eventTime && (
                    <p
                      className="text-sm italic mb-3"
                      style={{ color: C.textMuted, fontFamily: FONTS.serif }}
                    >
                      {formatTime(event.eventTime)}
                    </p>
                  )}
                </>
              )}

              {isEdit ? (
                <>
                  <EditableText
                    value={event.venueName}
                    onSave={(val) => updateSubEvent(i, { venueName: val })}
                    mode={mode}
                    placeholder="Venue Name"
                    className="text-sm font-medium mb-1"
                    as="p"
                  />
                  <EditableText
                    value={event.venueAddress}
                    onSave={(val) => updateSubEvent(i, { venueAddress: val })}
                    mode={mode}
                    placeholder="Venue Address"
                    className="text-xs italic"
                    as="p"
                  />
                </>
              ) : (
                <>
                  {event.venueName && (
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: C.text, fontFamily: FONTS.serif }}
                    >
                      {event.venueName}
                    </p>
                  )}
                  {event.venueAddress && (
                    <p
                      className="text-xs italic flex items-center justify-center gap-1"
                      style={{ color: C.textMuted, fontFamily: FONTS.serif }}
                    >
                      <MapPin size={12} />
                      {event.venueAddress}
                    </p>
                  )}
                </>
              )}

              {/* Maps link icon */}
              {event.mapsUrl && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-xs tracking-[0.2em] uppercase hover:opacity-80 transition-opacity"
                  style={{ color: "#7a6545", fontFamily: FONTS.body }}
                >
                  <MapPin size={14} /> View on Maps
                </a>
              )}

              {/* Maps URL editor in edit mode */}
              {isEdit && (
                <div className="mt-4">
                  <input
                    type="url"
                    value={event.mapsUrl || ""}
                    onChange={(e) =>
                      updateSubEvent(i, { mapsUrl: e.target.value || null })
                    }
                    placeholder="Google Maps URL"
                    className="w-full bg-white/60 border rounded-lg px-3 py-2 text-xs"
                    style={{
                      borderColor: C.goldLight,
                      color: C.text,
                      fontFamily: FONTS.body,
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   SVG ORNAMENTS / ILLUSTRATIONS
   ══════════════════════════════════════════════════════════ */

/** Floral vase ornament (between gallery and venue) — uses R2 flower image */
const FLOWER_IMAGE_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/7/flower.png";

const FloralVaseOrnament = () => (
  <div
    className="py-6 md:py-8 flex items-center justify-center"
    style={{ backgroundColor: C.bg }}
  >
    <motion.img
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      src={FLOWER_IMAGE_URL}
      alt="Floral decoration"
      className="w-28 h-36 md:w-36 md:h-44 object-contain"
      style={{ mixBlendMode: "multiply" }}
    />
  </div>
);

/** Ribbon bow ornament (footer dividers) */
const RibbonBowOrnament = () => (
  <div className="py-6 flex justify-center">
    <svg
      width="80"
      height="60"
      viewBox="0 0 80 60"
      fill="none"
      style={{ color: C.gold }}
    >
      <path
        d="M40 20 C25 5, 5 10, 15 25 C20 32, 30 28, 40 20Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M40 20 C55 5, 75 10, 65 25 C60 32, 50 28, 40 20Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M35 25 C30 35, 20 50, 25 55"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M45 25 C50 35, 60 50, 55 55"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="40" cy="22" r="2" fill="currentColor" />
    </svg>
  </div>
);

/** Indian wedding event icons based on event name */
const IndianEventIcon = ({ eventName }: { eventName: string }) => {
  const name = eventName.toLowerCase();

  // Haldi — turmeric/mortar icon
  if (name.includes("haldi")) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <ellipse cx="25" cy="38" rx="14" ry="5" />
            <path d="M14 36 Q14 22 25 18 Q36 22 36 36" />
            <circle cx="25" cy="24" r="3.5" />
            <path d="M20 14 Q25 8 30 14" />
            <line x1="25" y1="8" x2="25" y2="14" />
            <path d="M22 11 L25 8 L28 11" />
          </g>
        </svg>
      </div>
    );
  }

  // Mehendi — henna hand
  if (name.includes("mehendi") || name.includes("mehndi")) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M25 45 Q20 35 18 25 Q16 18 20 12 Q24 8 28 12 Q32 18 30 25 Q28 35 25 45Z" />
            <path d="M22 30 Q25 26 28 30" />
            <circle cx="25" cy="22" r="2.5" />
            <path d="M23 17 Q25 14 27 17" />
            <circle cx="25" cy="35" r="1.5" />
            <path d="M21 25 L29 25" />
          </g>
        </svg>
      </div>
    );
  }

  // Sangeet — music/dance
  if (
    name.includes("sangeet") ||
    name.includes("music") ||
    name.includes("dance")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <circle cx="18" cy="36" r="6" />
            <line x1="24" y1="36" x2="24" y2="10" />
            <path d="M24 10 Q34 8 34 16 Q34 22 24 20" />
            <path d="M30 14 Q36 12 36 18" />
            <circle cx="15" cy="15" r="1.5" fill="currentColor" />
            <circle cx="10" cy="20" r="1" fill="currentColor" />
            <circle cx="38" cy="28" r="1.5" fill="currentColor" />
          </g>
        </svg>
      </div>
    );
  }

  // Baraat — decorated horse/procession
  if (name.includes("baraat") || name.includes("barat")) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M15 38 Q12 30 15 22 Q20 15 28 18 Q32 20 34 25" />
            <path d="M34 25 Q36 30 34 38" />
            <line x1="18" y1="38" x2="18" y2="44" />
            <line x1="30" y1="38" x2="30" y2="44" />
            <path d="M12 18 Q15 10 20 12" />
            <circle cx="14" cy="20" r="1.5" fill="currentColor" />
            <path d="M22 14 Q24 8 28 10 Q30 12 28 15" />
          </g>
        </svg>
      </div>
    );
  }

  // Pooja/Puja — diya/lamp
  if (
    name.includes("pooja") ||
    name.includes("puja") ||
    name.includes("prayer")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M15 35 Q15 28 25 25 Q35 28 35 35Z" />
            <ellipse cx="25" cy="36" rx="12" ry="4" />
            <path d="M25 25 Q25 18 25 15" />
            <path d="M22 15 Q25 8 28 15" />
            <circle cx="25" cy="10" r="2" fill="currentColor" opacity="0.5" />
          </g>
        </svg>
      </div>
    );
  }

  // Default — lotus flower (universal Indian symbol)
  return (
    <div className="flex justify-center mb-3 opacity-70">
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        style={{ color: C.ornament }}
      >
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <path d="M25 40 Q25 30 25 22" />
          <path d="M25 22 Q20 15 15 20 Q12 25 18 28 Q22 30 25 28" />
          <path d="M25 22 Q30 15 35 20 Q38 25 32 28 Q28 30 25 28" />
          <path d="M25 18 Q22 10 25 5 Q28 10 25 18" />
          <path d="M20 24 Q14 18 10 22 Q8 28 15 28" />
          <path d="M30 24 Q36 18 40 22 Q42 28 35 28" />
          <circle cx="25" cy="24" r="2.5" fill="currentColor" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   HELPER: Convert Google Maps URL → embed URL
   ══════════════════════════════════════════════════════════ */
function getEmbedMapUrl(mapsUrl: string): string {
  if (mapsUrl.includes("/embed")) return mapsUrl;

  try {
    const url = new URL(mapsUrl);
    if (url.hostname.includes("google") && url.pathname.includes("/place/")) {
      const place = decodeURIComponent(
        url.pathname.split("/place/")[1]?.split("/")[0] || "",
      );
      if (place)
        return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
    }
    const q = url.searchParams.get("q") || url.searchParams.get("query");
    if (q)
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  } catch {
    // fallback
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(mapsUrl)}&output=embed`;
}

export default PremiumEleganteTemplate;
