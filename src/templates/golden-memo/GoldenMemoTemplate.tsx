/**
 * Golden Memo Template — "Champagne Save The Date"
 * Elegant champagne & gold minimalist wedding invitation.
 * Features: Warm champagne backgrounds, gold foil accents,
 * big serif typography, editorial photo layout, elegant timeline.
 */
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, MapPin, Clock, Send, Minus, Plus, Check } from "lucide-react";
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
import { submitRsvp } from "@/api/rsvp";
import toast from "react-hot-toast";

/* ────────────────────────────────────────────
   Color Palette — Champagne & Gold
   ──────────────────────────────────────────── */
const C = {
  bg: "#faf6ef",
  bgWarm: "#f5ede0",
  bgDark: "#1c1914",
  bgCard: "#fff9f0",
  text: "#2c2418",
  textMuted: "#7a6e5d",
  textLight: "#b0a490",
  gold: "#c5a355",
  goldLight: "#dbc17a",
  goldDark: "#a88b3d",
  goldAccent: "#d4b064",
  champagne: "#e8dcc8",
  cream: "#faf6ef",
  white: "#ffffff",
};

const FONTS = {
  script: "'Great Vibes', cursive",
  heading: "'Playfair Display', serif",
  body: "'Cormorant Garamond', serif",
};

const R2_BASE = "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev";
const DEFAULT_COUPLE_PHOTO = `${R2_BASE}/templates/5/photos/couple.jpg`;

/* ────────────────────────────────────────────
   DECORATIVE COMPONENTS
   ──────────────────────────────────────────── */
const GoldDivider = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-center justify-center gap-4", className)}>
    <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c5a355]/50" />
    <div className="h-1.5 w-1.5 rotate-45 bg-[#c5a355]/60" />
    <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c5a355]/50" />
  </div>
);

const GoldLine = ({ width = "w-16" }: { width?: string }) => (
  <div
    className={cn(
      "mx-auto h-px bg-gradient-to-r from-transparent via-[#c5a355]/40 to-transparent",
      width,
    )}
  />
);

/* ════════════════════════════════════════════
   MAIN TEMPLATE COMPONENT
   ════════════════════════════════════════════ */
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

  return (
    <div
      data-theme="golden"
      className="min-h-screen"
      style={{ backgroundColor: C.bg, fontFamily: FONTS.body }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');`}</style>

      {mode !== "edit" && effectiveMusicUrl && (
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}

      <HeroSection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
        templateId={templateId}
        sessionUUID={sessionUUID}
        uploadStage={uploadStage}
      />
      <SaveTheDateBanner
        weddingDate={data.weddingDate}
        mode={mode}
        onUpdate={onUpdate}
      />
      <WelcomeSection mode={mode} data={data} onUpdate={onUpdate} />
      <EventsSection mode={mode} data={data} onUpdate={onUpdate} />
      {data.events[0] && <VenueSection event={data.events[0]} />}
      <GallerySection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
        templateId={templateId}
        sessionUUID={sessionUUID}
        uploadStage={uploadStage}
      />

      {mode === "edit" && (
        <section className="py-16" style={{ backgroundColor: C.bg }}>
          <div className="mx-auto max-w-xl px-6">
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
        className={cn("relative py-20 text-center", mode === "edit" && "pb-36")}
        style={{ backgroundColor: C.bgDark }}
      >
        <div className="mx-auto max-w-md px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GoldDivider className="mb-8" />
            <p
              className="text-4xl md:text-5xl"
              style={{ fontFamily: FONTS.script, color: C.goldLight }}
            >
              {data.brideName?.split(" ")[0] || "Bride"} &amp;{" "}
              {data.groomName?.split(" ")[0] || "Groom"}
            </p>
            <p
              className="mt-4 text-xs uppercase tracking-[0.3em]"
              style={{ color: C.textLight }}
            >
              {formatWeddingDate(data.weddingDate)}
            </p>
            {data.hashtag && (
              <p
                className="mt-4 text-sm italic"
                style={{ color: C.goldAccent }}
              >
                {data.hashtag}
              </p>
            )}
            <GoldDivider className="mt-8" />
            <p
              className="mt-8 text-[10px] tracking-[0.15em]"
              style={{ color: "#665e52" }}
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
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   HERO — Split layout: typography left, photo right
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

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: C.bgDark }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(197,163,85,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(197,163,85,0.2) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-7xl md:grid-cols-2">
        {/* Left: Typography */}
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center md:items-start md:px-16 md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-xs uppercase tracking-[0.45em]"
            style={{ color: C.goldAccent }}
          >
            Together with our families
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8"
          >
            <div style={{ fontFamily: FONTS.script }}>
              <EditableText
                value={data.brideName}
                onSave={(val) => onUpdate({ brideName: val })}
                mode={mode}
                placeholder="Bride's Name"
                className="block text-5xl leading-[1.1] sm:text-6xl md:text-7xl"
                style={{ color: C.cream }}
                as="h1"
              />
            </div>
            <p
              className="my-3 text-lg uppercase tracking-[0.3em]"
              style={{ color: C.goldAccent, fontFamily: FONTS.heading }}
            >
              &amp;
            </p>
            <div style={{ fontFamily: FONTS.script }}>
              <EditableText
                value={data.groomName}
                onSave={(val) => onUpdate({ groomName: val })}
                mode={mode}
                placeholder="Groom's Name"
                className="block text-5xl leading-[1.1] sm:text-6xl md:text-7xl"
                style={{ color: C.cream }}
                as="h1"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10"
          >
            <GoldLine width="w-24" />
            <p
              className="mt-4 text-sm uppercase tracking-[0.25em]"
              style={{ color: C.textLight }}
            >
              Are Getting Married
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8"
          >
            {mode === "edit" ? (
              <div>
                <label
                  className="mb-2 block text-xs uppercase tracking-[0.2em]"
                  style={{ color: C.textLight }}
                >
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={data.weddingDate}
                  onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                  className="rounded-lg border bg-white/10 px-5 py-3 text-sm backdrop-blur"
                  style={{ borderColor: C.gold + "40", color: C.cream }}
                />
              </div>
            ) : (
              <p
                className="text-2xl md:text-3xl"
                style={{ fontFamily: FONTS.heading, color: C.champagne }}
              >
                {formatWeddingDate(data.weddingDate)}
              </p>
            )}
          </motion.div>
        </div>

        {/* Right: Photo */}
        <div className="relative flex items-center justify-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-[2rem]"
            style={{
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(197,163,85,0.2)",
            }}
          >
            <div
              className="absolute inset-0 z-10 rounded-[2rem]"
              style={{
                border: "1px solid rgba(197,163,85,0.25)",
                pointerEvents: "none",
              }}
            />
            {mode === "edit" ? (
              <EditablePhoto
                photoUrl={data.couplePhotoUrl}
                onSave={(url) => onUpdate({ couplePhotoUrl: url })}
                mode={mode}
                className="h-full w-full object-cover"
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
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   SAVE THE DATE BANNER — Big date display
   ══════════════════════════════════════════════════════════ */
const SaveTheDateBanner = ({
  weddingDate,
  mode,
  onUpdate,
}: {
  weddingDate: string;
  mode: TemplateProps["mode"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const dateObj = weddingDate ? new Date(weddingDate) : null;
  const day = dateObj ? String(dateObj.getDate()).padStart(2, "0") : "--";
  const month = dateObj
    ? dateObj.toLocaleDateString("en", { month: "long" }).toUpperCase()
    : "MONTH";
  const year = dateObj ? String(dateObj.getFullYear()) : "YEAR";
  const dayName = dateObj
    ? dateObj.toLocaleDateString("en", { weekday: "long" }).toUpperCase()
    : "DAY";

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ backgroundColor: C.bg }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04]"
        style={{
          background: `radial-gradient(circle, ${C.gold}, transparent 70%)`,
        }}
      />
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2 text-xs uppercase tracking-[0.5em]"
          style={{ color: C.gold }}
        >
          Save The Date
        </motion.p>
        <GoldDivider className="mb-10" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-6 md:gap-10"
        >
          <div className="text-right">
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: C.textMuted }}
            >
              {dayName}
            </p>
            <p
              className="text-lg uppercase tracking-[0.2em] md:text-xl"
              style={{ color: C.text, fontFamily: FONTS.heading }}
            >
              {month}
            </p>
          </div>
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full border-2 md:h-36 md:w-36"
            style={{ borderColor: C.gold, boxShadow: `0 0 40px ${C.gold}15` }}
          >
            <p
              className="text-5xl font-light md:text-7xl"
              style={{ color: C.text, fontFamily: FONTS.heading }}
            >
              {day}
            </p>
          </div>
          <div className="text-left">
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: C.textMuted }}
            >
              Year
            </p>
            <p
              className="text-lg uppercase tracking-[0.2em] md:text-xl"
              style={{ color: C.text, fontFamily: FONTS.heading }}
            >
              {year}
            </p>
          </div>
        </motion.div>
        <GoldDivider className="mt-10" />
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   WELCOME MESSAGE
   ══════════════════════════════════════════════════════════ */
const WelcomeSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => (
  <section className="py-16 md:py-24" style={{ backgroundColor: C.bgWarm }}>
    <div className="mx-auto max-w-xl px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Heart
          size={18}
          className="mx-auto mb-6"
          fill={C.gold}
          style={{ color: C.gold }}
        />
        <h2
          className="mb-8 text-4xl md:text-5xl"
          style={{ fontFamily: FONTS.script, color: C.text }}
        >
          Dear Guests
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border px-8 py-10"
        style={{
          backgroundColor: C.white,
          borderColor: `${C.gold}20`,
          boxShadow: `0 16px 48px ${C.gold}08`,
        }}
      >
        <div style={{ color: C.textMuted, fontFamily: FONTS.body }}>
          <EditableText
            value={data.welcomeMessage}
            onSave={(val) => onUpdate({ welcomeMessage: val })}
            mode={mode}
            placeholder="Together with our families, we joyfully invite you to celebrate our union..."
            className="text-lg leading-relaxed italic md:text-xl"
            multiline
            as="p"
          />
        </div>
        <GoldDivider className="mt-8" />
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   EVENTS — Elegant alternating timeline
   ══════════════════════════════════════════════════════════ */
const EventsSection = ({
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
    <section className="py-16 md:py-24" style={{ backgroundColor: C.bg }}>
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p
            className="mb-2 text-xs uppercase tracking-[0.45em]"
            style={{ color: C.gold }}
          >
            Celebration
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: FONTS.script, color: C.text }}
          >
            Wedding Events
          </h2>
        </motion.div>
        {isEdit ? (
          <div className="mx-auto max-w-lg space-y-4">
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
          <EventTimeline events={data.events} />
        )}
      </div>
    </section>
  );
};

const EventTimeline = ({ events }: { events: EventData[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  if (events.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <div
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
        style={{ backgroundColor: `${C.gold}30` }}
      />
      <div className="space-y-12">
        {events.map((event, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
              className="relative grid grid-cols-[1fr_40px_1fr] items-center gap-4"
            >
              <div className={cn("text-right", !isLeft && "order-1")}>
                {isLeft ? <EventCard event={event} align="right" /> : <div />}
              </div>
              <div className="relative z-10 flex justify-center order-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{
                    delay: 0.3 + i * 0.15,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: C.gold,
                    boxShadow: `0 0 16px ${C.gold}30`,
                  }}
                >
                  <Heart size={12} fill={C.white} style={{ color: C.white }} />
                </motion.div>
              </div>
              <div className={cn(!isLeft ? "order-3" : "order-3")}>
                {!isLeft ? <EventCard event={event} align="left" /> : <div />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const EventCard = ({
  event,
  align,
}: {
  event: EventData;
  align: "left" | "right";
}) => (
  <div
    className={cn(
      "rounded-xl border p-5",
      align === "right" ? "text-right" : "text-left",
    )}
    style={{
      backgroundColor: C.bgCard,
      borderColor: `${C.gold}18`,
      boxShadow: `0 8px 30px ${C.gold}06`,
    }}
  >
    <h3
      className="text-xl md:text-2xl"
      style={{ fontFamily: FONTS.heading, color: C.text }}
    >
      {event.eventName}
    </h3>
    {event.eventTime && (
      <p
        className="mt-1 flex items-center gap-1.5 text-sm"
        style={{
          color: C.gold,
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >
        <Clock size={12} />
        {formatTime(event.eventTime)}
      </p>
    )}
    {event.eventDate && (
      <p className="mt-1 text-xs" style={{ color: C.textMuted }}>
        {formatEventDate(event.eventDate)}
      </p>
    )}
    {event.venueName && (
      <p className="mt-2 text-sm" style={{ color: C.textMuted }}>
        {event.venueName}
      </p>
    )}
    {event.mapsUrl && (
      <a
        href={event.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-xs hover:underline"
        style={{ color: C.gold }}
      >
        <MapPin size={10} /> Directions
      </a>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════
   VENUE
   ══════════════════════════════════════════════════════════ */
const VenueSection = ({ event }: { event: EventData }) => (
  <section
    className="relative overflow-hidden py-24 md:py-32"
    style={{ backgroundColor: C.bgDark }}
  >
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, ${C.gold}, transparent 60%)`,
      }}
    />
    <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <MapPin
          size={22}
          className="mx-auto mb-4"
          style={{ color: C.goldAccent }}
        />
        <h2
          className="mb-6 text-4xl md:text-5xl"
          style={{ fontFamily: FONTS.script, color: C.cream }}
        >
          Venue
        </h2>
        <p
          className="text-xl md:text-2xl"
          style={{ color: C.champagne, fontFamily: FONTS.heading }}
        >
          {event.venueName || "Venue Name"}
        </p>
        <p
          className="mt-2 text-base leading-relaxed"
          style={{ color: C.textLight }}
        >
          {event.venueAddress || "Venue Address"}
        </p>
        {event.mapsUrl && (
          <motion.a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border px-8 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
            style={{ borderColor: C.gold, color: C.gold }}
          >
            <MapPin size={14} /> Get Directions
          </motion.a>
        )}
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

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: C.bg }}>
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p
            className="mb-2 text-xs uppercase tracking-[0.45em]"
            style={{ color: C.gold }}
          >
            Moments
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: FONTS.script, color: C.text }}
          >
            Our Gallery
          </h2>
        </motion.div>
        {mode === "edit" ? (
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
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {displayPhotos.slice(0, 6).map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "overflow-hidden rounded-xl",
                  i === 0 && "col-span-2 row-span-2",
                )}
                style={{
                  boxShadow: `0 8px 30px ${C.gold}0a`,
                  border: `1px solid ${C.gold}15`,
                }}
              >
                <img
                  src={photo.photoUrl}
                  alt={`Gallery ${i + 1}`}
                  className={cn(
                    "w-full object-cover",
                    i === 0
                      ? "h-[300px] md:h-[460px]"
                      : "h-[150px] md:h-[220px]",
                  )}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

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
    { value: "yes" as const, label: "Joyfully Accept", icon: "✨" },
    { value: "maybe" as const, label: "Yet to Decide", icon: "💭" },
    { value: "no" as const, label: "Regretfully Decline", icon: "🙏" },
  ];

  if (submitted) {
    return (
      <section className="py-20" style={{ backgroundColor: C.bgWarm }}>
        <div className="mx-auto max-w-md px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border p-10 text-center"
            style={{ backgroundColor: C.white, borderColor: `${C.gold}25` }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${C.gold}15` }}
            >
              <Check className="h-8 w-8" style={{ color: C.gold }} />
            </motion.div>
            <p
              className="mb-2 text-2xl"
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
    <section className="py-20" style={{ backgroundColor: C.bgWarm }}>
      <div className="mx-auto max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <GoldDivider className="mb-6" />
          <p
            className="mb-2 text-xs uppercase tracking-[0.35em]"
            style={{ color: C.gold }}
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
          className="space-y-6 rounded-2xl border p-8"
          style={{
            backgroundColor: C.white,
            borderColor: `${C.gold}20`,
            boxShadow: `0 16px 48px ${C.gold}08`,
          }}
        >
          <div>
            <label
              className="mb-2 block text-xs uppercase tracking-[0.15em]"
              style={{ color: C.textMuted }}
            >
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                color: C.text,
                backgroundColor: C.bgCard,
                borderColor: `${C.gold}25`,
              }}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label
              className="mb-2 block text-xs uppercase tracking-[0.15em]"
              style={{ color: C.textMuted }}
            >
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                color: C.text,
                backgroundColor: C.bgCard,
                borderColor: `${C.gold}25`,
              }}
              placeholder="10-digit phone number"
              maxLength={10}
            />
          </div>
          <div>
            <label
              className="mb-3 block text-xs uppercase tracking-[0.15em]"
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
                    "rounded-xl border py-3 text-center transition-all",
                    attending === opt.value
                      ? "shadow-md"
                      : "opacity-70 hover:opacity-100",
                  )}
                  style={{
                    borderColor:
                      attending === opt.value ? C.gold : `${C.gold}25`,
                    backgroundColor:
                      attending === opt.value ? `${C.gold}12` : C.bgCard,
                    ...(attending === opt.value
                      ? { boxShadow: `0 0 0 2px ${C.gold}` }
                      : {}),
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
                className="mb-2 block text-xs uppercase tracking-[0.15em]"
                style={{ color: C.textMuted }}
              >
                Number of Guests
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border"
                  style={{ borderColor: `${C.gold}40` }}
                >
                  <Minus size={14} style={{ color: C.text }} />
                </button>
                <span
                  className="w-12 text-center text-2xl font-light"
                  style={{ color: C.text, fontFamily: FONTS.heading }}
                >
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border"
                  style={{ borderColor: `${C.gold}40` }}
                >
                  <Plus size={14} style={{ color: C.text }} />
                </button>
              </div>
            </div>
          )}
          <div>
            <label
              className="mb-2 block text-xs uppercase tracking-[0.15em]"
              style={{ color: C.textMuted }}
            >
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                color: C.text,
                backgroundColor: C.bgCard,
                borderColor: `${C.gold}25`,
              }}
              placeholder="Write a message for the couple..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold uppercase tracking-wider transition-all hover:shadow-lg disabled:opacity-60"
            style={{ backgroundColor: C.gold, color: C.white }}
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

export default GoldenMemoTemplate;
