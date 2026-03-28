import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, MapPin, Check, X, Copy, Eye } from "lucide-react";
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

// Event icons mapping
const eventIcons: Record<string, string> = {
  Haldi: "🌼",
  Mehendi: "🌿",
  Sangeet: "🎵",
  Wedding: "💒",
  Reception: "🥂",
  Engagement: "💍",
};

const CrimsonShaadiTemplate = ({
  mode,
  data,
  onUpdate,
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
}: TemplateProps) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate petals for hero animation
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 8 + Math.random() * 12,
        opacity: 0.3 + Math.random() * 0.5,
        duration: 7 + Math.random() * 8,
        delay: Math.random() * 10,
        drift: -80 + Math.random() * 160,
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

  // Calculate countdown
  const getCountdown = () => {
    if (!data.weddingDate) return null;
    const wedding = new Date(data.weddingDate);
    const now = new Date();
    const diff = wedding.getTime() - now.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

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
      data-theme="crimson"
      className="min-h-screen bg-background text-foreground"
    >
      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Photo */}
        <div className="absolute inset-0">
          {mode === "edit" ? (
            <EditablePhoto
              photoUrl={data.couplePhotoUrl}
              onSave={(url) => onUpdate({ couplePhotoUrl: url })}
              mode={mode}
              className="w-full h-full"
              placeholderText="Add Couple Photo"
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
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80" />
        </div>

        {/* Floating Petals */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {petals.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-petal"
              style={
                {
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  background: `radial-gradient(circle, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.4))`,
                  "--petal-opacity": p.opacity,
                  "--fall-duration": `${p.duration}s`,
                  "--fall-delay": `${p.delay}s`,
                  "--drift": `${p.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4">
          {/* Floral ornament */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-accent text-4xl mb-4"
          >
            ✿
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-body italic text-sm text-card-foreground/80 mb-4"
          >
            Together with their families
          </motion.p>

          {/* Bride Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <EditableText
              value={data.brideName}
              onSave={(val) => onUpdate({ brideName: val })}
              mode={mode}
              placeholder="Bride's Name"
              className="font-script text-5xl sm:text-6xl md:text-7xl text-card-foreground"
              as="h1"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-accent text-2xl my-2"
          >
            ✦
          </motion.p>

          {/* Groom Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <EditableText
              value={data.groomName}
              onSave={(val) => onUpdate({ groomName: val })}
              mode={mode}
              placeholder="Groom's Name"
              className="font-script text-5xl sm:text-6xl md:text-7xl text-card-foreground"
              as="h1"
            />
          </motion.div>

          {/* Gold line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="w-32 h-px bg-accent mx-auto my-6 origin-left"
          />

          {/* Wedding Date */}
          {mode === "edit" ? (
            <div className="mt-4">
              <label className="font-body text-xs text-card-foreground/70 block mb-1">
                Wedding Date
              </label>
              <input
                type="date"
                value={data.weddingDate}
                onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                className="bg-card/50 backdrop-blur border border-border rounded-lg px-4 py-2 font-body text-sm text-foreground"
              />
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="font-heading text-sm md:text-base text-card-foreground/90"
            >
              {formatWeddingDate(data.weddingDate)}
            </motion.p>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center"
        >
          <p className="font-body text-xs text-card-foreground/70 mb-2">
            Open Invitation
          </p>
          <ChevronDown className="w-6 h-6 text-card-foreground/70 mx-auto" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          COUPLE SECTION
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-16 bg-background"
      >
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Decorative divider */}
          <div className="text-center text-accent text-2xl mb-8">❀ ─── ❀</div>

          <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
            {/* Bride */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <EditablePhoto
                photoUrl={data.bridePhotoUrl || data.couplePhotoUrl}
                onSave={(url) => onUpdate({ bridePhotoUrl: url })}
                mode={mode}
                className="w-32 h-32 mx-auto mb-3 ring-4 ring-accent/30 hover:ring-accent/60 transition-all"
                shape="circle"
                alt={data.brideName}
                invitationId={data.invitationId ?? undefined}
                oldPublicUrl={data.bridePhotoUrl || undefined}
              />
              <h3 className="font-heading text-lg font-semibold">
                {data.brideName || "Bride"}
              </h3>
              <EditableText
                value={data.brideBio}
                onSave={(val) => onUpdate({ brideBio: val })}
                mode={mode}
                placeholder="Add a short bio..."
                className="font-body text-sm text-muted-foreground italic mt-1"
                maxLength={100}
                as="p"
              />
            </motion.div>

            {/* Heart & Hashtag */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="text-center"
            >
              <Heart className="w-8 h-8 text-primary fill-primary mx-auto" />
              <EditableText
                value={data.hashtag}
                onSave={(val) => onUpdate({ hashtag: val })}
                mode={mode}
                placeholder="#YourHashtag"
                className="font-script text-lg text-accent mt-2"
                as="p"
              />
            </motion.div>

            {/* Groom */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <EditablePhoto
                photoUrl={data.groomPhotoUrl || data.couplePhotoUrl}
                onSave={(url) => onUpdate({ groomPhotoUrl: url })}
                mode={mode}
                className="w-32 h-32 mx-auto mb-3 ring-4 ring-accent/30 hover:ring-accent/60 transition-all"
                shape="circle"
                alt={data.groomName}
                invitationId={data.invitationId ?? undefined}
                oldPublicUrl={data.groomPhotoUrl || undefined}
              />
              <h3 className="font-heading text-lg font-semibold">
                {data.groomName || "Groom"}
              </h3>
              <EditableText
                value={data.groomBio}
                onSave={(val) => onUpdate({ groomBio: val })}
                mode={mode}
                placeholder="Add a short bio..."
                className="font-body text-sm text-muted-foreground italic mt-1"
                maxLength={100}
                as="p"
              />
            </motion.div>
          </div>

          {/* Welcome Message */}
          <div className="mt-12 text-center">
            <EditableText
              value={data.welcomeMessage}
              onSave={(val) => onUpdate({ welcomeMessage: val })}
              mode={mode}
              placeholder="Add a welcome message for your guests..."
              className="font-body text-base text-foreground/80 max-w-xl mx-auto"
              multiline
              as="p"
            />
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          COUNTDOWN SECTION
          ═══════════════════════════════════════ */}
      {(data.showCountdown || mode === "edit") && (
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-16 bg-muted/30"
        >
          <div className="container mx-auto px-4 max-w-2xl text-center">
            {mode === "edit" && (
              <div className="mb-4 flex items-center justify-center gap-2">
                <label className="font-body text-sm">Show Countdown</label>
                <button
                  onClick={() =>
                    onUpdate({ showCountdown: !data.showCountdown })
                  }
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors",
                    data.showCountdown ? "bg-primary" : "bg-muted",
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform mx-1",
                      data.showCountdown && "translate-x-4",
                    )}
                  />
                </button>
              </div>
            )}

            {data.showCountdown && (
              <>
                <h2 className="font-heading text-2xl font-bold mb-8">
                  Counting Down To Our Big Day
                </h2>
                <CountdownDisplay weddingDate={data.weddingDate} />
              </>
            )}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════
          EVENTS SECTION
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-background"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading text-3xl font-bold text-center mb-10">
            Join Us For Our Celebrations
          </h2>

          {mode === "edit" ? (
            <div className="space-y-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.events.map((event, i) => (
                <motion.div
                  key={event.id || i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="card-hover bg-card rounded-2xl p-6 border border-border"
                >
                  <div className="text-3xl mb-3">
                    {eventIcons[event.eventName] || "✨"}
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">
                    {event.eventName}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mb-1">
                    {formatEventDate(event.eventDate)} ·{" "}
                    {formatTime(event.eventTime)}
                  </p>
                  <p className="font-body text-sm font-medium mt-3">
                    {event.venueName}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {event.venueAddress}
                  </p>
                  {event.mapsUrl && (
                    <a
                      href={event.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 font-body text-xs text-primary hover:underline"
                    >
                      <MapPin size={14} /> View on Map
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          GALLERY SECTION
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 bg-muted/30"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-heading text-3xl font-bold text-center mb-10">
            Our Gallery
          </h2>
          <EditablePhotoGallery
            photos={data.galleryPhotos}
            defaultPhotos={data.templateDefaults.defaultPhotos}
            onUpdate={(photos) => onUpdate({ galleryPhotos: photos })}
            mode={mode}
            maxPhotos={10}
            invitationId={data.invitationId ?? undefined}
          />
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          MUSIC SECTION (Edit mode only)
          ═══════════════════════════════════════ */}
      {mode === "edit" && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-xl">
            <EditableMusicPlayer
              musicUrl={data.musicUrl}
              musicName={data.musicName}
              defaultMusicUrl={data.templateDefaults.defaultMusicUrl}
              defaultMusicName={data.templateDefaults.defaultMusicName}
              onUpdate={(url, name) =>
                onUpdate({ musicUrl: url, musicName: name })
              }
              mode={mode}
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
          "py-16 bg-background text-center",
          mode === "edit" && "pb-32", // Extra padding for toolbar
        )}
      >
        <div className="container mx-auto px-4">
          <div className="text-accent text-3xl mb-4">✿</div>
          <p className="font-script text-3xl text-primary">
            {data.brideName?.split(" ")[0] || "Bride"} &{" "}
            {data.groomName?.split(" ")[0] || "Groom"}
          </p>
          <p className="font-body text-sm text-muted-foreground mt-2">
            {formatWeddingDate(data.weddingDate)}
          </p>
          {data.hashtag && (
            <p className="font-body text-sm text-accent mt-4">{data.hashtag}</p>
          )}
          <p className="font-body text-[10px] text-muted-foreground/50 mt-8">
            Made with love on ShubhAarambh
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
          hasUnsavedChanges={true} // TODO: Track actual dirty state
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
    <div className="flex justify-center gap-4 sm:gap-8">
      {[
        { value: countdown.days, label: "Days" },
        { value: countdown.hours, label: "Hours" },
        { value: countdown.minutes, label: "Minutes" },
        { value: countdown.seconds, label: "Seconds" },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-card border border-border flex items-center justify-center mb-2">
            <span className="font-heading text-2xl sm:text-3xl font-bold text-primary">
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <span className="font-body text-xs text-muted-foreground">
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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary fill-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2">
            Thank You!
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            Your response has been recorded.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-md">
        <h2 className="font-heading text-3xl font-bold text-center mb-8">
          RSVP
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendance buttons */}
          <div className="flex justify-center gap-3">
            {[
              { value: "yes", label: "Attending", icon: "🎉" },
              { value: "maybe", label: "Maybe", icon: "🤔" },
              { value: "no", label: "Cannot Attend", icon: "😢" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAttending(opt.value as any)}
                className={cn(
                  "px-4 py-3 rounded-xl font-body text-sm transition-all",
                  attending === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary/50",
                )}
              >
                <span className="text-lg mb-1 block">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {attending && attending !== "no" && (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={!attending}
            className={cn(
              "w-full py-3 rounded-xl font-body font-medium text-sm transition-all",
              attending
                ? "btn-gold"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            Confirm RSVP
          </button>
        </form>
      </div>
    </section>
  );
};

export default CrimsonShaadiTemplate;
