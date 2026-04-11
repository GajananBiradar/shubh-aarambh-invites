import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Heart,
  MapPin,
  Calendar,
  Clock,
  Leaf,
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
import FloatingMusicPlayer from "@/components/invitation/FloatingMusicPlayer";
import {
  formatWeddingDate,
  formatEventDate,
  formatTime,
} from "@/utils/formatDate";
import { cn } from "@/lib/utils";

/**
 * Finca Olive Template
 * A modern, elegant Spanish-inspired wedding invitation template
 * Features: olive green palette, clean typography, parallax effects, timeline layout
 */
const FincaOliveTemplate = ({
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
  const [copiedLink, setCopiedLink] = useState(false);

  // Floating olive leaves animation
  const leaves = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 12 + Math.random() * 16,
        opacity: 0.15 + Math.random() * 0.25,
        duration: 12 + Math.random() * 10,
        delay: Math.random() * 12,
        drift: -60 + Math.random() * 120,
        rotate: Math.random() * 360,
      })),
    [],
  );

  // Effective music URL
  const effectiveMusicUrl =
    data.musicUrl ||
    data.effectiveMusicUrl ||
    data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName =
    data.musicName ||
    data.effectiveMusicName ||
    data.templateDefaults.defaultMusicName;

  // Copy invite link
  const handleCopyLink = () => {
    if (data.accessCode && data.slug) {
      const url = `${window.location.origin}/${data.accessCode}/invite/${data.slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      data-theme="finca"
      className="min-h-screen bg-background text-foreground"
    >
      {/* ═══════════════════════════════════════
          HERO SECTION - Full screen with parallax
          ═══════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Photo with Parallax */}
        <div className="absolute inset-0">
          {mode === "edit" ? (
            <EditablePhoto
              photoUrl={data.couplePhotoUrl}
              onSave={(url) => onUpdate({ couplePhotoUrl: url })}
              mode={mode}
              className="w-full h-full"
              placeholderText="Add Cover Photo"
              templateId={templateId}
              sessionUUID={sessionUUID}
              uploadStage={uploadStage}
            />
          ) : (
            data.couplePhotoUrl && (
              <img
                src={data.couplePhotoUrl}
                alt={`${data.groomName} & ${data.brideName}`}
                className="w-full h-full object-cover"
              />
            )
          )}
          {/* Elegant overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background" />
        </div>

        {/* Floating Olive Leaves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {leaves.map((leaf) => (
            <div
              key={leaf.id}
              className="absolute animate-petal"
              style={
                {
                  left: leaf.left,
                  width: leaf.size,
                  height: leaf.size * 1.8,
                  opacity: leaf.opacity,
                  "--fall-duration": `${leaf.duration}s`,
                  "--fall-delay": `${leaf.delay}s`,
                  "--drift": `${leaf.drift}px`,
                } as React.CSSProperties
              }
            >
              <Leaf
                className="w-full h-full text-primary"
                style={{ transform: `rotate(${leaf.rotate}deg)` }}
              />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-2xl">
          {/* Pre-title */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-body text-sm tracking-[0.3em] uppercase text-card-foreground/70 mb-6"
          >
            We&apos;re Getting Married
          </motion.p>

          {/* Couple Names */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-8"
          >
            <EditableText
              value={data.brideName}
              onSave={(val) => onUpdate({ brideName: val })}
              mode={mode}
              placeholder="Bride"
              className="font-heading text-5xl sm:text-6xl md:text-7xl text-card-foreground tracking-wide"
              as="h1"
            />
            <p className="text-primary text-3xl my-3 font-script">&</p>
            <EditableText
              value={data.groomName}
              onSave={(val) => onUpdate({ groomName: val })}
              mode={mode}
              placeholder="Groom"
              className="font-heading text-5xl sm:text-6xl md:text-7xl text-card-foreground tracking-wide"
              as="h1"
            />
          </motion.div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="w-24 h-[2px] bg-primary mx-auto mb-8"
          />

          {/* Wedding Date */}
          {mode === "edit" ? (
            <div className="mt-4">
              <label className="font-body text-xs text-card-foreground/70 block mb-2 tracking-wider uppercase">
                Wedding Date
              </label>
              <input
                type="date"
                value={data.weddingDate}
                onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                className="bg-card/30 backdrop-blur border border-border rounded-lg px-4 py-2 font-body text-sm text-foreground"
              />
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="font-body text-base tracking-[0.2em] uppercase text-card-foreground/80"
            >
              {formatWeddingDate(data.weddingDate)}
            </motion.p>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center"
        >
          <p className="font-body text-xs tracking-widest uppercase text-card-foreground/60 mb-2">
            Scroll
          </p>
          <ChevronDown className="w-5 h-5 text-card-foreground/60 mx-auto" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          OUR STORY SECTION
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="py-24 bg-background"
      >
        <div className="container mx-auto px-6 max-w-3xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4"
            >
              Our Story
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <EditableText
                value={data.welcomeMessage}
                onSave={(val) => onUpdate({ welcomeMessage: val })}
                mode={mode}
                placeholder="Share your love story with your guests..."
                className="font-heading text-2xl sm:text-3xl text-foreground leading-relaxed"
                multiline
                as="p"
              />
            </motion.div>
          </div>

          {/* Couple Bios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Bride */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-3 border border-primary/30 rounded-full" />
                <EditablePhoto
                  photoUrl={data.bridePhotoUrl || data.couplePhotoUrl}
                  onSave={(url) => onUpdate({ bridePhotoUrl: url })}
                  mode={mode}
                  className="w-40 h-40 rounded-full object-cover"
                  shape="circle"
                  alt={data.brideName}
                  invitationId={data.invitationId ?? undefined}
                  oldPublicUrl={data.bridePhotoUrl || undefined}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                />
              </div>
              <h3 className="font-heading text-2xl text-foreground mb-2">
                {data.brideName || "The Bride"}
              </h3>
              <EditableText
                value={data.brideBio}
                onSave={(val) => onUpdate({ brideBio: val })}
                mode={mode}
                placeholder="A few words about the bride..."
                className="font-body text-sm text-muted-foreground leading-relaxed"
                maxLength={150}
                as="p"
              />
            </motion.div>

            {/* Groom */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-3 border border-primary/30 rounded-full" />
                <EditablePhoto
                  photoUrl={data.groomPhotoUrl || data.couplePhotoUrl}
                  onSave={(url) => onUpdate({ groomPhotoUrl: url })}
                  mode={mode}
                  className="w-40 h-40 rounded-full object-cover"
                  shape="circle"
                  alt={data.groomName}
                  invitationId={data.invitationId ?? undefined}
                  oldPublicUrl={data.groomPhotoUrl || undefined}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                />
              </div>
              <h3 className="font-heading text-2xl text-foreground mb-2">
                {data.groomName || "The Groom"}
              </h3>
              <EditableText
                value={data.groomBio}
                onSave={(val) => onUpdate({ groomBio: val })}
                mode={mode}
                placeholder="A few words about the groom..."
                className="font-body text-sm text-muted-foreground leading-relaxed"
                maxLength={150}
                as="p"
              />
            </motion.div>
          </div>

          {/* Hashtag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <EditableText
              value={data.hashtag}
              onSave={(val) => onUpdate({ hashtag: val })}
              mode={mode}
              placeholder="#YourWeddingHashtag"
              className="font-body text-lg text-primary tracking-wide"
              as="p"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          COUNTDOWN SECTION
          ═══════════════════════════════════════ */}
      {(data.showCountdown || mode === "edit") && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 bg-muted/40"
        >
          <div className="container mx-auto px-6 max-w-2xl text-center">
            {mode === "edit" && (
              <div className="mb-6 flex items-center justify-center gap-3">
                <label className="font-body text-sm">Show Countdown</label>
                <button
                  onClick={() =>
                    onUpdate({ showCountdown: !data.showCountdown })
                  }
                  className={cn(
                    "w-12 h-7 rounded-full transition-colors relative",
                    data.showCountdown ? "bg-primary" : "bg-muted",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform",
                      data.showCountdown ? "left-6" : "left-1",
                    )}
                  />
                </button>
              </div>
            )}

            {data.showCountdown && (
              <>
                <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-8">
                  Counting Down
                </p>
                <CountdownDisplay weddingDate={data.weddingDate} />
              </>
            )}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════
          EVENTS TIMELINE SECTION
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-background"
      >
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">
              Wedding Events
            </p>
            <h2 className="font-heading text-4xl text-foreground">
              Join Our Celebrations
            </h2>
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
                    const newEvents = data.events.filter((_, idx) => idx !== i);
                    onUpdate({ events: newEvents });
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
            /* Timeline View */
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-border -translate-x-1/2 hidden md:block" />

              <div className="space-y-12">
                {data.events.map((event, i) => (
                  <motion.div
                    key={event.id || i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className={cn(
                      "relative grid md:grid-cols-2 gap-8 items-center",
                      i % 2 === 0 ? "md:text-right" : "md:flex-row-reverse",
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 hidden md:block ring-4 ring-background" />

                    {/* Content - alternating sides */}
                    <div
                      className={cn(
                        "bg-card rounded-2xl p-8 border border-border",
                        i % 2 === 0 ? "md:col-start-1" : "md:col-start-2",
                      )}
                    >
                      <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-body text-sm text-muted-foreground">
                          {formatEventDate(event.eventDate)}
                        </span>
                        <Clock className="w-4 h-4 text-primary ml-2" />
                        <span className="font-body text-sm text-muted-foreground">
                          {formatTime(event.eventTime)}
                        </span>
                      </div>

                      <h3 className="font-heading text-2xl text-foreground mb-2">
                        {event.eventName}
                      </h3>
                      <p className="font-body text-base text-foreground mb-1">
                        {event.venueName}
                      </p>
                      <p className="font-body text-sm text-muted-foreground mb-4">
                        {event.venueAddress}
                      </p>

                      {event.mapsUrl && (
                        <a
                          href={event.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline"
                        >
                          <MapPin size={14} /> View Location
                        </a>
                      )}
                    </div>

                    {/* Empty cell for alternating layout */}
                    <div
                      className={cn(
                        "hidden md:block",
                        i % 2 === 0 ? "md:col-start-2" : "md:col-start-1",
                      )}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          GALLERY SECTION
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-muted/40"
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">
              Memories
            </p>
            <h2 className="font-heading text-4xl text-foreground">
              Our Gallery
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
      </motion.section>

      {/* ═══════════════════════════════════════
          MUSIC SECTION (Edit mode only)
          ═══════════════════════════════════════ */}
      {mode === "edit" && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6 max-w-xl">
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

      {/* ═══════════════════════════════════════
          RSVP SECTION (View/Demo only)
          ═══════════════════════════════════════ */}
      {mode !== "edit" && (
        <RsvpSection
          invitationId={data.invitationId}
          isDemo={mode === "demo"}
        />
      )}

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer
        className={cn(
          "py-20 bg-background text-center",
          mode === "edit" && "pb-32",
        )}
      >
        <div className="container mx-auto px-6">
          <Leaf className="w-8 h-8 text-primary mx-auto mb-6 opacity-60" />
          <p className="font-heading text-3xl text-foreground mb-2">
            {data.brideName?.split(" ")[0] || "Bride"} &{" "}
            {data.groomName?.split(" ")[0] || "Groom"}
          </p>
          <p className="font-body text-sm tracking-widest uppercase text-muted-foreground mt-4">
            {formatWeddingDate(data.weddingDate)}
          </p>
          {data.hashtag && (
            <p className="font-body text-sm text-primary mt-4">
              {data.hashtag}
            </p>
          )}
          <p className="font-body text-[10px] text-muted-foreground/50 mt-10">
            Made with love on LuxEnvelope
          </p>
        </div>
      </footer>

      {/* ═══════════════════════════════════════
          EDIT MODE TOOLBAR
          ═══════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════
          FLOATING MUSIC PLAYER (View/Demo only)
          ═══════════════════════════════════════ */}
      {mode !== "edit" && effectiveMusicUrl && (
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}
    </div>
  );
};

// Countdown display component
const CountdownDisplay = ({ weddingDate }: { weddingDate: string }) => {
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!weddingDate) {
        setCountdown(null);
        return;
      }
      const wedding = new Date(weddingDate);
      const now = new Date();
      const diff = wedding.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown(null);
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  if (!countdown)
    return (
      <p className="font-body text-muted-foreground">
        Set wedding date to see countdown
      </p>
    );

  return (
    <div className="flex justify-center gap-6 sm:gap-10">
      {[
        { value: countdown.days, label: "Days" },
        { value: countdown.hours, label: "Hours" },
        { value: countdown.minutes, label: "Minutes" },
        { value: countdown.seconds, label: "Seconds" },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
            <span className="font-heading text-4xl sm:text-5xl font-light text-primary">
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <span className="font-body text-xs tracking-widest uppercase text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// RSVP Section component
const RsvpSection = ({
  invitationId,
  isDemo,
}: {
  invitationId: number | null;
  isDemo: boolean;
}) => {
  const [attending, setAttending] = useState<"yes" | "maybe" | "no" | null>(
    null,
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      setSubmitted(true);
      return;
    }
    // TODO: Implement actual RSVP submission
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-24 bg-muted/40">
        <div className="container mx-auto px-6 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-2xl text-foreground mb-3">
            Thank You
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            Your response has been recorded. We look forward to celebrating with
            you.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-muted/40">
      <div className="container mx-auto px-6 max-w-md">
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-4">
            Respond
          </p>
          <h2 className="font-heading text-4xl text-foreground">RSVP</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendance buttons */}
          <div className="flex justify-center gap-3">
            {[
              { value: "yes", label: "Attending" },
              { value: "maybe", label: "Maybe" },
              { value: "no", label: "Cannot Attend" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAttending(opt.value as any)}
                className={cn(
                  "px-6 py-3 rounded-lg font-body text-sm transition-all border",
                  attending === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {attending && attending !== "no" && (
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 rounded-lg border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-lg border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <div>
                <label className="font-body text-sm text-muted-foreground block mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!attending}
            className={cn(
              "w-full py-3 rounded-lg font-body font-medium text-sm tracking-wider uppercase transition-all",
              attending
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            Confirm Response
          </button>
        </form>
      </div>
    </section>
  );
};

export default FincaOliveTemplate;
