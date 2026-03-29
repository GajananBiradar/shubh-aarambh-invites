/**
 * Ivory Garden Template — "Royal Gold" style
 * Dark, dramatic, cinematic — like a theatre programme
 * Layout: Gold frame hero (no photo bg), vertical timeline events, horizontal scroll gallery
 */
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Heart,
  MapPin,
  Calendar,
  Clock,
  Copy,
  Eye,
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

const IvoryGardenTemplate = ({
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

  // Gold particle shimmer
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 3,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 5,
      })),
    [],
  );

  const effectiveMusicUrl =
    data.musicUrl ||
    data.effectiveMusicUrl ||
    data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName =
    data.musicName ||
    data.effectiveMusicName ||
    data.templateDefaults.defaultMusicName;

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
      data-theme="ivory"
      className="min-h-screen bg-background text-foreground"
    >
      {/* ═══════════════════════════════════════
          HERO — Dark with gold ornamental frame, NO photo bg
          ═══════════════════════════════════════ */}
      <section
        className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, hsl(225 50% 8%) 0%, hsl(225 40% 12%) 100%)",
        }}
      >
        {/* Gold particle shimmer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: "hsl(45, 100%, 60%)",
              }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{
                repeat: Infinity,
                duration: p.duration,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Gold ornamental frame */}
        <div className="absolute inset-8 sm:inset-12 md:inset-16 pointer-events-none">
          <div className="w-full h-full border border-[hsl(45,100%,50%,0.3)] relative">
            {/* Corner ornaments */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[hsl(45,100%,50%,0.6)]" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-[hsl(45,100%,50%,0.6)]" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-[hsl(45,100%,50%,0.6)]" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[hsl(45,100%,50%,0.6)]" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4">
          {/* Gold rule above */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1 }}
            className="w-24 h-px mx-auto mb-8"
            style={{ background: "hsl(45, 100%, 50%)" }}
          />

          {/* Bride Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <EditableText
              value={data.brideName}
              onSave={(val) => onUpdate({ brideName: val })}
              mode={mode}
              placeholder="Bride's Name"
              className="font-heading text-5xl sm:text-6xl md:text-7xl tracking-wide"
              as="h1"
            />
          </motion.div>

          {/* Large gold & symbol */}
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-4xl my-4 font-script"
            style={{ color: "hsl(45, 100%, 50%)" }}
          >
            &
          </motion.p>

          {/* Groom Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <EditableText
              value={data.groomName}
              onSave={(val) => onUpdate({ groomName: val })}
              mode={mode}
              placeholder="Groom's Name"
              className="font-heading text-5xl sm:text-6xl md:text-7xl tracking-wide"
              as="h1"
            />
          </motion.div>

          {/* Gold rule below */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="w-24 h-px mx-auto mt-8 mb-6"
            style={{ background: "hsl(45, 100%, 50%)" }}
          />

          {/* Date */}
          {mode === "edit" ? (
            <div className="mt-4">
              <label className="font-body text-xs opacity-70 block mb-1 tracking-wider uppercase">
                Wedding Date
              </label>
              <input
                type="date"
                value={data.weddingDate}
                onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                className="bg-transparent border border-[hsl(45,100%,50%,0.3)] rounded-lg px-4 py-2 font-body text-sm"
              />
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="font-body text-sm tracking-[0.3em] uppercase opacity-80"
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
          <p className="font-body text-xs opacity-50 mb-2 tracking-wider uppercase">
            Scroll
          </p>
          <ChevronDown className="w-5 h-5 opacity-50 mx-auto" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          COUPLE SECTION — Rectangular gold-framed photos on dark bg
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-20"
        style={{ background: "hsl(225, 40%, 10%)" }}
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {/* Bride */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-2 border border-[hsl(45,100%,50%,0.3)]" />
                <EditablePhoto
                  photoUrl={data.bridePhotoUrl || data.couplePhotoUrl}
                  onSave={(url) => onUpdate({ bridePhotoUrl: url })}
                  mode={mode}
                  className="w-48 h-60 object-cover"
                  alt={data.brideName}
                  invitationId={data.invitationId ?? undefined}
                  oldPublicUrl={data.bridePhotoUrl || undefined}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                />
              </div>
              <h3
                className="font-heading text-2xl"
                style={{ color: "hsl(45, 100%, 55%)" }}
              >
                {data.brideName || "The Bride"}
              </h3>
              <EditableText
                value={data.brideBio}
                onSave={(val) => onUpdate({ brideBio: val })}
                mode={mode}
                placeholder="A few words about the bride..."
                className="font-body text-sm opacity-70 mt-2"
                maxLength={100}
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
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-2 border border-[hsl(45,100%,50%,0.3)]" />
                <EditablePhoto
                  photoUrl={data.groomPhotoUrl || data.couplePhotoUrl}
                  onSave={(url) => onUpdate({ groomPhotoUrl: url })}
                  mode={mode}
                  className="w-48 h-60 object-cover"
                  alt={data.groomName}
                  invitationId={data.invitationId ?? undefined}
                  oldPublicUrl={data.groomPhotoUrl || undefined}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                />
              </div>
              <h3
                className="font-heading text-2xl"
                style={{ color: "hsl(45, 100%, 55%)" }}
              >
                {data.groomName || "The Groom"}
              </h3>
              <EditableText
                value={data.groomBio}
                onSave={(val) => onUpdate({ groomBio: val })}
                mode={mode}
                placeholder="A few words about the groom..."
                className="font-body text-sm opacity-70 mt-2"
                maxLength={100}
                as="p"
              />
            </motion.div>
          </div>

          {/* Hashtag & Welcome */}
          <div className="text-center mt-12">
            <EditableText
              value={data.hashtag}
              onSave={(val) => onUpdate({ hashtag: val })}
              mode={mode}
              placeholder="#YourHashtag"
              className="font-script text-2xl"
              as="p"
            />
            <div className="mt-8">
              <EditableText
                value={data.welcomeMessage}
                onSave={(val) => onUpdate({ welcomeMessage: val })}
                mode={mode}
                placeholder="Add a welcome message..."
                className="font-body text-base opacity-70 max-w-xl mx-auto"
                multiline
                as="p"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          COUNTDOWN — Gold outlined boxes on dark bg
          ═══════════════════════════════════════ */}
      {(data.showCountdown || mode === "edit") && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20"
          style={{ background: "hsl(225, 45%, 8%)" }}
        >
          <div className="container mx-auto px-4 max-w-2xl text-center">
            {mode === "edit" && (
              <div className="mb-6 flex items-center justify-center gap-3">
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
                <p
                  className="font-body text-xs tracking-[0.3em] uppercase mb-8"
                  style={{ color: "hsl(45, 100%, 55%)" }}
                >
                  Counting Down
                </p>
                <GoldCountdownDisplay weddingDate={data.weddingDate} />
              </>
            )}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════
          EVENTS — Vertical Timeline (not cards)
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24"
        style={{ background: "hsl(225, 40%, 10%)" }}
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <p
              className="font-body text-xs tracking-[0.3em] uppercase mb-4"
              style={{ color: "hsl(45, 100%, 55%)" }}
            >
              The Celebrations
            </p>
            <h2 className="font-heading text-4xl">Wedding Events</h2>
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
            /* Vertical Timeline */
            <div className="relative">
              {/* Central gold line */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block"
                style={{ background: "hsl(45, 100%, 50%, 0.3)" }}
              />

              <div className="space-y-16">
                {data.events.map((event, i) => (
                  <motion.div
                    key={event.id || i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="relative grid md:grid-cols-2 gap-8 items-center"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 hidden md:block ring-4 ring-[hsl(225,40%,10%)]"
                      style={{ background: "hsl(45, 100%, 50%)" }}
                    />

                    {/* Left side: date/time (even) or content (odd) */}
                    {i % 2 === 0 ? (
                      <>
                        <div className="text-right hidden md:block">
                          <p className="font-body text-sm opacity-60">
                            {formatEventDate(event.eventDate)}
                          </p>
                          <p className="font-body text-sm opacity-60">
                            {formatTime(event.eventTime)}
                          </p>
                        </div>
                        <div className="bg-[hsl(225,35%,14%)] rounded-xl p-6 border border-[hsl(45,100%,50%,0.15)]">
                          <p className="font-body text-sm opacity-60 md:hidden mb-2">
                            {formatEventDate(event.eventDate)} ·{" "}
                            {formatTime(event.eventTime)}
                          </p>
                          <h3
                            className="font-heading text-xl mb-2"
                            style={{ color: "hsl(45, 100%, 55%)" }}
                          >
                            {event.eventName}
                          </h3>
                          <p className="font-body text-sm">{event.venueName}</p>
                          <p className="font-body text-xs opacity-60">
                            {event.venueAddress}
                          </p>
                          {event.mapsUrl && (
                            <a
                              href={event.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 font-body text-xs hover:underline"
                              style={{ color: "hsl(45, 100%, 55%)" }}
                            >
                              <MapPin size={12} /> View Location
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-[hsl(225,35%,14%)] rounded-xl p-6 border border-[hsl(45,100%,50%,0.15)] md:text-right">
                          <p className="font-body text-sm opacity-60 md:hidden mb-2">
                            {formatEventDate(event.eventDate)} ·{" "}
                            {formatTime(event.eventTime)}
                          </p>
                          <h3
                            className="font-heading text-xl mb-2"
                            style={{ color: "hsl(45, 100%, 55%)" }}
                          >
                            {event.eventName}
                          </h3>
                          <p className="font-body text-sm">{event.venueName}</p>
                          <p className="font-body text-xs opacity-60">
                            {event.venueAddress}
                          </p>
                          {event.mapsUrl && (
                            <a
                              href={event.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 font-body text-xs hover:underline"
                              style={{ color: "hsl(45, 100%, 55%)" }}
                            >
                              <MapPin size={12} /> View Location
                            </a>
                          )}
                        </div>
                        <div className="hidden md:block">
                          <p className="font-body text-sm opacity-60">
                            {formatEventDate(event.eventDate)}
                          </p>
                          <p className="font-body text-sm opacity-60">
                            {formatTime(event.eventTime)}
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          GALLERY — Horizontal scroll strip
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24"
        style={{ background: "hsl(225, 45%, 8%)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p
              className="font-body text-xs tracking-[0.3em] uppercase mb-4"
              style={{ color: "hsl(45, 100%, 55%)" }}
            >
              Moments
            </p>
            <h2 className="font-heading text-4xl">Our Gallery</h2>
          </div>

          {mode === "edit" ? (
            <div className="max-w-4xl mx-auto">
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
            /* Horizontal scroll gallery */
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4" style={{ width: "max-content" }}>
                {data.galleryPhotos.map((photo, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="w-64 h-80 rounded-lg overflow-hidden flex-shrink-0 border border-[hsl(45,100%,50%,0.15)]"
                  >
                    <img
                      src={photo.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Music (edit only) */}
      {mode === "edit" && (
        <section className="py-16" style={{ background: "hsl(225, 40%, 10%)" }}>
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
              templateId={templateId}
              sessionUUID={sessionUUID}
              uploadStage={uploadStage}
              invitationId={data.invitationId ?? undefined}
            />
          </div>
        </section>
      )}

      {/* RSVP (view/demo) */}
      {mode !== "edit" && (
        <GoldRsvpSection
          invitationId={data.invitationId}
          isDemo={mode === "demo"}
        />
      )}

      {/* Footer */}
      <footer
        className={cn("py-20 text-center", mode === "edit" && "pb-32")}
        style={{ background: "hsl(225, 45%, 8%)" }}
      >
        <div className="container mx-auto px-4">
          <div
            className="w-16 h-px mx-auto mb-6"
            style={{ background: "hsl(45, 100%, 50%, 0.4)" }}
          />
          <p
            className="font-heading text-3xl"
            style={{ color: "hsl(45, 100%, 55%)" }}
          >
            {data.brideName?.split(" ")[0] || "Bride"} &{" "}
            {data.groomName?.split(" ")[0] || "Groom"}
          </p>
          <p className="font-body text-sm opacity-60 mt-4 tracking-widest uppercase">
            {formatWeddingDate(data.weddingDate)}
          </p>
          {data.hashtag && (
            <p
              className="font-body text-sm mt-4"
              style={{ color: "hsl(45, 100%, 55%)" }}
            >
              {data.hashtag}
            </p>
          )}
          <p className="font-body text-[10px] opacity-30 mt-10">
            Made with love on ShubhAarambh
          </p>
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

      {mode !== "edit" && effectiveMusicUrl && (
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}
    </div>
  );
};

/* Gold-outlined countdown */
const GoldCountdownDisplay = ({ weddingDate }: { weddingDate: string }) => {
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
      const diff = new Date(weddingDate).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown(null);
        return;
      }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  if (!countdown)
    return (
      <p className="font-body opacity-60">Set wedding date to see countdown</p>
    );

  return (
    <div className="flex justify-center gap-6">
      {[
        { value: countdown.days, label: "Days" },
        { value: countdown.hours, label: "Hours" },
        { value: countdown.minutes, label: "Min" },
        { value: countdown.seconds, label: "Sec" },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border border-[hsl(45,100%,50%,0.4)] rounded-lg flex items-center justify-center mb-2">
            <span
              className="font-heading text-3xl sm:text-4xl font-bold"
              style={{ color: "hsl(45, 100%, 55%)" }}
            >
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <span className="font-body text-xs opacity-50 tracking-wider uppercase">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* Dark themed RSVP */
const GoldRsvpSection = ({
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
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-20" style={{ background: "hsl(225, 40%, 10%)" }}>
        <div className="container mx-auto px-4 max-w-md text-center">
          <Heart
            className="w-10 h-10 mx-auto mb-4"
            style={{ color: "hsl(45, 100%, 55%)" }}
          />
          <h3 className="font-heading text-2xl mb-2">Thank You</h3>
          <p className="font-body text-sm opacity-60">
            Your response has been recorded.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20" style={{ background: "hsl(225, 40%, 10%)" }}>
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-10">
          <p
            className="font-body text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "hsl(45, 100%, 55%)" }}
          >
            Respond
          </p>
          <h2 className="font-heading text-4xl">RSVP</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  "px-5 py-3 rounded-lg font-body text-sm transition-all border",
                  attending === opt.value
                    ? "border-[hsl(45,100%,50%)] text-[hsl(45,100%,55%)]"
                    : "border-[hsl(225,25%,20%)] hover:border-[hsl(45,100%,50%,0.4)]",
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
                className="w-full px-4 py-3 rounded-lg border border-[hsl(225,25%,20%)] bg-transparent font-body text-sm focus:outline-none focus:border-[hsl(45,100%,50%,0.5)]"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-lg border border-[hsl(225,25%,20%)] bg-transparent font-body text-sm focus:outline-none focus:border-[hsl(45,100%,50%,0.5)]"
              />
              <div>
                <label className="font-body text-sm opacity-60 block mb-2">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-[hsl(225,25%,20%)] bg-transparent font-body text-sm focus:outline-none focus:border-[hsl(45,100%,50%,0.5)]"
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
                ? "border border-[hsl(45,100%,50%)] text-[hsl(45,100%,55%)] hover:bg-[hsl(45,100%,50%,0.1)]"
                : "opacity-30 cursor-not-allowed border border-[hsl(225,25%,20%)]",
            )}
          >
            Confirm Response
          </button>
        </form>
      </div>
    </section>
  );
};

export default IvoryGardenTemplate;
