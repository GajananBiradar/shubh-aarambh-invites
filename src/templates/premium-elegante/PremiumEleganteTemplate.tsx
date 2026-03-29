import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";
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
  bg: "#f3ede3",       // hsl(40, 24%, 92%) – warm ivory
  text: "#5c4a32",     // hsl(33, 47%, 35%) – sage-dark
  textMuted: "#7a6545", // sage-dark with opacity
  textLight: "#9a8a6e",
  gold: "#c5a46d",     // exact reference gold
  goldLight: "#c4b08a",
  cream: "#f9f7f2",    // ivory card bg
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
      {/* ═══════════ HERO SECTION ═══════════ */}
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
      <DayProgrammeSection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
      />

      {/* ═══════════ DRESS CODE ═══════════ */}
      <DressCodeSection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
      />

      {/* ═══════════ RIBBON BOW ═══════════ */}
      <RibbonBowOrnament />

      {/* ═══════════ PRE-WEDDING EVENTS ═══════════ */}
      {data.events.length > 1 && (
        <PreWeddingEventsSection events={data.events} />
      )}

      {/* ═══════════ ACCOMMODATION ═══════════ */}
      <AccommodationSection
        mode={mode}
        hashtag={data.hashtag}
        onUpdate={onUpdate}
      />

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
        className={cn("py-16 text-center", mode === "edit" && "pb-32")}
        style={{ backgroundColor: C.bg }}
      >
        <div className="max-w-md mx-auto px-6">
          <RibbonBowOrnament />
          <p className="font-script text-3xl mt-6 mb-2" style={{ color: C.text }}>
            {data.brideName?.split(" ")[0] || "Bride"} &amp;{" "}
            {data.groomName?.split(" ")[0] || "Groom"}
          </p>
          <p
            className="text-xs tracking-[0.2em] uppercase mt-4"
            style={{ color: C.textMuted, fontFamily: FONTS.body }}
          >
            {formatWeddingDate(data.weddingDate)}
          </p>
          <p className="text-[10px] mt-10" style={{ color: C.goldLight, fontFamily: FONTS.body }}>
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
   HERO SECTION — Full viewport, watercolor background
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
}) => (
  <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      {mode === "edit" ? (
        <EditablePhoto
          photoUrl={data.couplePhotoUrl}
          onSave={(url) => onUpdate({ couplePhotoUrl: url })}
          mode={mode}
          className="w-full h-full"
          placeholderText="Add Hero Background (watercolor painting)"
          templateId={templateId}
          sessionUUID={sessionUUID}
          uploadStage={uploadStage || "temp"}
        />
      ) : data.couplePhotoUrl ? (
        <img
          src={data.couplePhotoUrl}
          alt={`${data.brideName} & ${data.groomName}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(180deg, #e8d5b8 0%, #f0e4d1 30%, #d4c4a8 60%, #c9b896 100%)`,
          }}
        />
      )}
      {/* Warm vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(220,200,170,0.25) 0%, rgba(200,180,150,0.15) 50%, rgba(220,200,170,0.35) 100%)`,
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
        style={{ color: C.text, fontFamily: FONTS.body }}
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
          className="block font-script text-6xl sm:text-7xl md:text-8xl leading-tight"
          as="h1"
        />
        <p className="text-3xl my-2 font-script" style={{ color: C.textMuted }}>
          &amp;
        </p>
        <EditableText
          value={data.groomName}
          onSave={(val) => onUpdate({ groomName: val })}
          mode={mode}
          placeholder="Groom"
          className="block font-script text-6xl sm:text-7xl md:text-8xl leading-tight"
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
        <div className="w-16 h-[1px]" style={{ backgroundColor: C.textMuted }} />
        <span style={{ color: C.textMuted, fontSize: "14px" }}>◆</span>
        <div className="w-16 h-[1px]" style={{ backgroundColor: C.textMuted }} />
      </motion.div>

      {/* Date */}
      {mode === "edit" ? (
        <div className="mt-4">
          <label
            className="text-xs block mb-2 tracking-wider uppercase"
            style={{ color: C.textMuted, fontFamily: FONTS.body }}
          >
            Wedding Date
          </label>
          <input
            type="date"
            value={data.weddingDate}
            onChange={(e) => onUpdate({ weddingDate: e.target.value })}
            className="bg-white/30 backdrop-blur border rounded-lg px-4 py-2 text-sm"
            style={{ borderColor: C.goldLight, color: C.text, fontFamily: FONTS.body }}
          />
        </div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-base md:text-lg tracking-[0.25em] uppercase"
          style={{ color: C.text, fontFamily: FONTS.serif }}
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
            className="text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color: C.textMuted, fontFamily: FONTS.body }}
          >
            RSVP
          </p>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown size={20} style={{ color: C.textMuted }} className="mx-auto" />
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
        setCountdown(null);
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
            <div className="w-[1px] h-14 mx-8 md:mx-12" style={{ backgroundColor: C.goldLight }} />
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
  <section className="pb-0 pt-0" style={{ backgroundColor: C.cream }}>
    <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16 px-6 pt-20 md:pt-28">
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
          placeholder="We warmly invite you to celebrate our wedding day..."
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
  <section className="pb-12 pt-0" style={{ backgroundColor: C.cream }}>
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
            maxPhotos={12}
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
              className="flex-shrink-0 overflow-hidden cursor-pointer"
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
const VenueSection = ({
  event,
  weddingDate,
}: {
  event: EventData;
  weddingDate: string;
}) => (
  <section className="py-20 md:py-28" style={{ backgroundColor: C.gold }}>
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
        className="rounded-2xl p-8 md:p-10"
        style={{ backgroundColor: C.white, boxShadow: "0 10px 40px -10px rgba(59,38,19,.15), 0 4px 15px -3px rgba(59,38,19,.08)" }}
      >
        {/* Building illustration */}
        <VenueIllustration />

        {/* Venue name */}
        <h3 className="font-script text-3xl md:text-4xl mb-6" style={{ color: "#7a6545" }}>
          {event.venueName || "Venue Name"}
        </h3>

        <div className="w-20 h-[1px] mx-auto mb-6" style={{ backgroundColor: C.goldLight }} />

        {/* Date & time */}
        <p className="text-base italic mb-1" style={{ color: C.textMuted, fontFamily: FONTS.serif }}>
          {formatEventDate(event.eventDate)}
          {event.eventTime && <span className="mx-3">·</span>}
          {event.eventTime && <span className="italic">{formatTime(event.eventTime)}</span>}
        </p>

        <div className="w-12 h-[1px] mx-auto my-5" style={{ backgroundColor: C.goldLight }} />

        {/* Address */}
        <p className="text-sm md:text-base font-medium mb-1" style={{ color: C.text, fontFamily: FONTS.serif }}>
          {event.venueAddress || "Address"}
        </p>

        {/* Google map embed */}
        <div className="mt-8">
          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#d4c4a8" }}>
            <iframe
              src={
                event.mapsUrl
                  ? getEmbedMapUrl(event.mapsUrl)
                  : "https://maps.google.com/maps?q=wedding+venue&output=embed"
              }
              width="100%"
              height="250"
              style={{ border: 0, filter: "sepia(0.25) saturate(0.6) hue-rotate(5deg) brightness(1.05)" }}
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

      {mode === "edit" ? (
        <div className="space-y-6">
          {data.events.map((event, i) => (
            <EditableEventCard
              key={event.id || i}
              event={event}
              onUpdate={(updates) => {
                const newEvents = [...data.events];
                newEvents[i] = { ...newEvents[i], ...updates };
                onUpdate({ events: newEvents });
              }}
              onDelete={() => {
                onUpdate({ events: data.events.filter((_, idx) => idx !== i) });
              }}
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
        <AlternatingTimeline events={data.events} />
      )}
    </div>
  </section>
);

/** Alternating left/right timeline with dots and central line */
const AlternatingTimeline = ({ events }: { events: EventData[] }) => (
  <div className="relative">
    {/* Central vertical line */}
    <div
      className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2"
      style={{ backgroundColor: C.goldLight }}
    />

    <div className="space-y-0">
      {events.map((event, i) => (
        <motion.div
          key={event.id || i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative grid grid-cols-2 py-6"
        >
          {/* Dot on timeline */}
          <div
            className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ backgroundColor: C.textMuted }}
          />

          {i % 2 === 0 ? (
            <>
              <div className="text-right pr-10">
                <p
                  className="font-bold text-sm md:text-base tracking-[0.15em]"
                  style={{ color: C.text, fontFamily: FONTS.body }}
                >
                  {formatTime(event.eventTime)}
                </p>
                <p
                  className="text-xs tracking-[0.15em] uppercase mt-0.5"
                  style={{ color: C.textMuted + "cc", fontFamily: FONTS.body }}
                >
                  {event.eventName}
                </p>
              </div>
              <div className="pl-10" />
            </>
          ) : (
            <>
              <div className="pr-10" />
              <div className="text-left pl-10">
                <p
                  className="font-bold text-sm md:text-base tracking-[0.15em]"
                  style={{ color: C.text, fontFamily: FONTS.body }}
                >
                  {formatTime(event.eventTime)}
                </p>
                <p
                  className="text-xs tracking-[0.15em] uppercase mt-0.5"
                  style={{ color: C.textMuted + "cc", fontFamily: FONTS.body }}
                >
                  {event.eventName}
                </p>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   DRESS CODE — Full bg image with frosted card overlay
   ══════════════════════════════════════════════════════════ */
const DressCodeSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => (
  <section className="relative py-20 md:py-28 overflow-hidden">
    {/* Background image or gradient */}
    <div className="absolute inset-0">
      {data.bridePhotoUrl || data.groomPhotoUrl || data.couplePhotoUrl ? (
        <img
          src={data.bridePhotoUrl || data.groomPhotoUrl || data.couplePhotoUrl || ""}
          alt="Background"
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(180deg, #a8967a 0%, #8a7a60 50%, #6b5d48 100%)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
    </div>

    <div className="relative z-10 max-w-xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-10 md:p-14 text-center backdrop-blur-sm"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.90)" }}
      >
        <h2 className="font-script text-4xl md:text-7xl mb-10" style={{ color: C.text }}>
          Dress Code
        </h2>

        {/* Women */}
        <div className="mb-8">
          <h3 className="font-script text-3xl mb-2" style={{ color: "#7a6545" }}>
            Women
          </h3>
          <EditableText
            value={data.brideBio || "Cocktail or formal dress"}
            onSave={(val) => onUpdate({ brideBio: val })}
            mode={mode}
            placeholder="Cocktail or formal dress"
            className="italic text-sm"
            as="p"
          />
        </div>

        <div className="w-16 h-[1px] mx-auto my-6" style={{ backgroundColor: C.goldLight }} />

        {/* Men */}
        <div>
          <h3 className="font-script text-3xl mb-2" style={{ color: "#7a6545" }}>
            Men
          </h3>
          <EditableText
            value={data.groomBio || "Dark suit and tie"}
            onSave={(val) => onUpdate({ groomBio: val })}
            mode={mode}
            placeholder="Dark suit and tie"
            className="italic text-sm"
            as="p"
          />
        </div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   PRE-WEDDING EVENTS — Gold bg with event cards
   ══════════════════════════════════════════════════════════ */
const PreWeddingEventsSection = ({ events }: { events: EventData[] }) => {
  const subEvents = events.slice(1);
  if (subEvents.length === 0) return null;

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
          Pre-Wedding Events
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-script text-4xl md:text-7xl mb-4"
          style={{ color: C.white }}
        >
          Come Say Hello...
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="italic text-sm mb-14 max-w-lg mx-auto"
          style={{ color: C.whiteWarm, fontFamily: FONTS.serif }}
        >
          These are informal gatherings, so feel free to join us if you&apos;re in the area.
        </motion.p>

        <div className="space-y-8">
          {subEvents.map((event, i) => (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-2xl p-8 md:p-10"
              style={{ backgroundColor: C.cream }}
            >
              <SmallEventIcon index={i} />

              <h3 className="font-script text-3xl md:text-4xl mb-4" style={{ color: C.text }}>
                {event.eventName}
              </h3>

              <div className="w-16 h-[1px] mx-auto mb-4" style={{ backgroundColor: C.goldLight }} />

              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#7a6545", fontFamily: FONTS.body }}
              >
                {formatEventDate(event.eventDate)}
              </p>
              {event.eventTime && (
                <p className="text-sm italic mb-2" style={{ color: C.textMuted, fontFamily: FONTS.serif }}>
                  {formatTime(event.eventTime)}
                </p>
              )}
              {event.venueName && (
                <p className="text-sm italic" style={{ color: C.textMuted, fontFamily: FONTS.serif }}>
                  {event.venueName}
                  {event.venueAddress && `, ${event.venueAddress}`}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   ACCOMMODATION SECTION
   ══════════════════════════════════════════════════════════ */
const AccommodationSection = ({
  mode,
  hashtag,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  hashtag: string;
  onUpdate: TemplateProps["onUpdate"];
}) => (
  <section className="py-20 md:py-28" style={{ backgroundColor: C.bg }}>
    <div className="max-w-3xl mx-auto px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-script text-4xl md:text-7xl mb-4"
        style={{ color: C.text }}
      >
        Accommodation
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <EditableText
          value={hashtag}
          onSave={(val) => onUpdate({ hashtag: val })}
          mode={mode}
          placeholder="Add accommodation info, nearby hotels, or travel tips..."
          className="italic text-sm leading-relaxed"
          multiline
          as="p"
        />
      </motion.div>

      {/* Sample hotel cards (visible in view/demo) */}
      {mode !== "edit" && hashtag && hashtag !== "#BrideWedGroom" && (
        <div className="space-y-6 text-center">
          {/* These are sample cards — user text goes above */}
          <div className="w-16 h-[1px] mx-auto" style={{ backgroundColor: C.goldLight }} />
        </div>
      )}
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   SVG ORNAMENTS / ILLUSTRATIONS
   ══════════════════════════════════════════════════════════ */

/** Floral vase ornament (between gallery and venue) */
const FloralVaseOrnament = () => (
  <div className="py-10 flex justify-center" style={{ backgroundColor: C.bg }}>
    <svg width="120" height="160" viewBox="0 0 120 160" fill="none" style={{ color: C.ornament }}>
      <g stroke="currentColor" strokeWidth="1" fill="none">
        {/* Vase */}
        <path d="M45 110 Q40 130 45 150 L75 150 Q80 130 75 110Z" />
        <path d="M50 110 Q60 105 70 110" />
        <ellipse cx="60" cy="150" rx="16" ry="4" />
        <rect x="48" y="150" width="24" height="4" rx="1" />
        {/* Flowers */}
        <circle cx="45" cy="80" r="10" />
        <circle cx="75" cy="80" r="10" />
        <circle cx="60" cy="70" r="12" />
        <circle cx="35" cy="90" r="8" />
        <circle cx="85" cy="90" r="8" />
        <circle cx="50" cy="65" r="8" />
        <circle cx="70" cy="65" r="8" />
        {/* Stems */}
        <line x1="60" y1="82" x2="60" y2="110" />
        <path d="M45 90 Q50 100 55 110" />
        <path d="M75 90 Q70 100 65 110" />
        {/* Leaves */}
        <path d="M50 95 Q42 100 50 105" />
        <path d="M70 95 Q78 100 70 105" />
      </g>
    </svg>
  </div>
);

/** Ribbon bow ornament (footer dividers) */
const RibbonBowOrnament = () => (
  <div className="py-6 flex justify-center">
    <svg width="80" height="60" viewBox="0 0 80 60" fill="none" style={{ color: C.gold }}>
      <path d="M40 20 C25 5, 5 10, 15 25 C20 32, 30 28, 40 20Z" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M40 20 C55 5, 75 10, 65 25 C60 32, 50 28, 40 20Z" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M35 25 C30 35, 20 50, 25 55" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M45 25 C50 35, 60 50, 55 55" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="40" cy="22" r="2" fill="currentColor" />
    </svg>
  </div>
);

/** Venue building illustration */
const VenueIllustration = () => (
  <div className="mb-6">
    <svg viewBox="0 0 400 220" className="w-full max-w-md mx-auto" style={{ color: C.ornament }}>
      <g stroke="currentColor" fill="none" strokeWidth="1.2">
        {/* Main building */}
        <rect x="80" y="60" width="240" height="140" rx="2" />
        {/* Roof /pediment */}
        <path d="M70 60 L200 15 L330 60" />
        <line x1="200" y1="15" x2="200" y2="8" />
        {/* Windows row 1 */}
        <rect x="100" y="80" width="24" height="35" rx="12" />
        <rect x="140" y="80" width="24" height="35" rx="12" />
        <rect x="237" y="80" width="24" height="35" rx="12" />
        <rect x="277" y="80" width="24" height="35" rx="12" />
        {/* Central entrance */}
        <rect x="178" y="75" width="44" height="60" rx="22" />
        <line x1="200" y1="135" x2="200" y2="200" />
        {/* Door */}
        <rect x="185" y="150" width="30" height="50" rx="15" />
        <line x1="200" y1="150" x2="200" y2="200" />
        {/* Windows row 2 */}
        <rect x="100" y="140" width="24" height="30" rx="2" />
        <rect x="140" y="140" width="24" height="30" rx="2" />
        <rect x="237" y="140" width="24" height="30" rx="2" />
        <rect x="277" y="140" width="24" height="30" rx="2" />
        {/* Side towers */}
        <rect x="60" y="40" width="30" height="160" rx="1" />
        <rect x="310" y="40" width="30" height="160" rx="1" />
        <line x1="60" y1="40" x2="75" y2="25" />
        <line x1="75" y1="25" x2="90" y2="40" />
        <line x1="310" y1="40" x2="325" y2="25" />
        <line x1="325" y1="25" x2="340" y2="40" />
        {/* Decorative top circle */}
        <circle cx="200" cy="45" r="14" />
        {/* Path / driveway */}
        <path d="M170 200 Q185 210 200 215 Q215 210 230 200" />
      </g>
    </svg>
  </div>
);

/** Small event icons for pre-wedding cards */
const SmallEventIcon = ({ index }: { index: number }) => {
  const icons = [
    // Cheese/appetizer plate
    <svg key="0" width="50" height="50" viewBox="0 0 50 50" fill="none" style={{ color: C.ornament }}>
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <ellipse cx="25" cy="35" rx="18" ry="6" />
        <path d="M10 33 Q15 15 25 12 Q35 15 40 33" />
        <circle cx="20" cy="22" r="3" />
        <circle cx="30" cy="18" r="2.5" />
        <path d="M25 28 L22 24 L28 24Z" />
      </g>
    </svg>,
    // Teacup with steam
    <svg key="1" width="50" height="50" viewBox="0 0 50 50" fill="none" style={{ color: C.ornament }}>
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <path d="M12 20 Q12 38 25 38 Q38 38 38 20Z" />
        <path d="M38 24 Q46 24 46 30 Q46 36 38 36" />
        <ellipse cx="25" cy="40" rx="15" ry="3" />
        <path d="M20 15 Q22 10 20 5" />
        <path d="M25 13 Q27 8 25 3" />
        <path d="M30 15 Q32 10 30 5" />
      </g>
    </svg>,
    // Champagne glass
    <svg key="2" width="50" height="50" viewBox="0 0 50 50" fill="none" style={{ color: C.ornament }}>
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <path d="M18 5 Q18 22 25 28 Q32 22 32 5Z" />
        <line x1="25" y1="28" x2="25" y2="42" />
        <ellipse cx="25" cy="44" rx="8" ry="3" />
        <path d="M20 10 Q25 14 30 10" />
      </g>
    </svg>,
  ];

  return <div className="flex justify-center mb-2 opacity-70">{icons[index % icons.length]}</div>;
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
      if (place) return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
    }
    const q = url.searchParams.get("q") || url.searchParams.get("query");
    if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  } catch {
    // fallback
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(mapsUrl)}&output=embed`;
}

export default PremiumEleganteTemplate;
