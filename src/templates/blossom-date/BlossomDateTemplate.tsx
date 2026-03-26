/**
 * Blossom Date Template — "Garden Bliss" style
 * Light, airy, botanical — nature-inspired
 * Layout: Botanical wreath hero, accordion events, polaroid gallery, circular countdown
 */
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Heart, MapPin, Leaf, Camera } from "lucide-react";
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
import { formatWeddingDate, formatEventDate, formatTime } from "@/utils/formatDate";
import { cn } from "@/lib/utils";

const eventLeafIcons: Record<string, string> = {
  Haldi: "🌿", Mehendi: "🍃", Sangeet: "🌸", Wedding: "🌷", Reception: "🌹", Engagement: "💐",
};

const BlossomDateTemplate = ({
  mode, data, onUpdate, onSaveDraft, onPublish, isSaving, isPublishing,
}: TemplateProps) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const effectiveMusicUrl = data.musicUrl || data.effectiveMusicUrl || data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName = data.musicName || data.effectiveMusicName || data.templateDefaults.defaultMusicName;

  const handleCopyLink = () => {
    if (data.accessCode && data.slug) {
      const url = `${window.location.origin}/${data.accessCode}/invite/${data.slug}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div data-theme="blossom" className="min-h-screen bg-background text-foreground">
      {/* ═══════════════════════════════════════
          HERO — Light cream bg, botanical leaf decorations, no full-bleed photo
          ═══════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-background">
        {/* Watercolor texture bg */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse at 30% 20%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, hsl(var(--accent)) 0%, transparent 50%)' }}
        />

        {/* Botanical corner illustrations (SVG-like leaf decorations) */}
        <div className="absolute top-8 left-8 opacity-20 text-primary">
          <Leaf className="w-16 h-16 rotate-[-30deg]" />
        </div>
        <div className="absolute top-8 right-8 opacity-20 text-primary">
          <Leaf className="w-16 h-16 rotate-[30deg] scale-x-[-1]" />
        </div>
        <div className="absolute bottom-12 left-8 opacity-15 text-primary">
          <Leaf className="w-12 h-12 rotate-[60deg]" />
        </div>
        <div className="absolute bottom-12 right-8 opacity-15 text-primary">
          <Leaf className="w-12 h-12 rotate-[-60deg] scale-x-[-1]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-2xl">
          {/* Botanical wreath (simulated) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative inline-block mb-6"
          >
            <div className="absolute -inset-8 border-2 border-primary/20 rounded-full" />
            <div className="absolute -inset-12 border border-primary/10 rounded-full" />
            <p className="font-body text-xs tracking-[0.4em] uppercase text-muted-foreground">Save The Date</p>
          </motion.div>

          <div className="mt-4">
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
                className="font-heading text-4xl sm:text-5xl md:text-6xl text-foreground"
                as="h1"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="font-script text-2xl text-primary my-3"
            >
              and
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
                className="font-heading text-4xl sm:text-5xl md:text-6xl text-foreground"
                as="h1"
              />
            </motion.div>
          </div>

          {/* Botanical divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex items-center justify-center gap-3 my-8"
          >
            <div className="w-12 h-px bg-primary/30" />
            <Leaf className="w-4 h-4 text-primary/50" />
            <div className="w-12 h-px bg-primary/30" />
          </motion.div>

          {/* Date in circular badge */}
          {mode === "edit" ? (
            <div className="mt-4">
              <label className="font-body text-xs text-muted-foreground block mb-1 tracking-wider uppercase">Wedding Date</label>
              <input
                type="date"
                value={data.weddingDate}
                onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                className="bg-card border border-border rounded-lg px-4 py-2 font-body text-sm text-foreground"
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="inline-flex items-center justify-center w-28 h-28 rounded-full border-2 border-primary/30 mx-auto"
            >
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-foreground leading-none">
                  {data.weddingDate ? new Date(data.weddingDate).getDate() : '—'}
                </p>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                  {data.weddingDate ? new Date(data.weddingDate).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground/50 mx-auto" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          COUPLE — Single wide photo + clean card
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-background"
      >
        <div className="container mx-auto px-6 max-w-2xl">
          {/* Single wide photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <EditablePhoto
              photoUrl={data.couplePhotoUrl}
              onSave={(url) => onUpdate({ couplePhotoUrl: url })}
              mode={mode}
              className="w-full h-64 sm:h-80 rounded-2xl object-cover"
              alt={`${data.brideName} & ${data.groomName}`}
              placeholderText="Add Couple Photo"
            />
          </motion.div>

          {/* Names and bios in a clean card */}
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-heading text-xl font-semibold">{data.brideName || "The Bride"}</h3>
                <EditableText
                  value={data.brideBio}
                  onSave={(val) => onUpdate({ brideBio: val })}
                  mode={mode}
                  placeholder="A short bio..."
                  className="font-body text-sm text-muted-foreground mt-2"
                  maxLength={100}
                  as="p"
                />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold">{data.groomName || "The Groom"}</h3>
                <EditableText
                  value={data.groomBio}
                  onSave={(val) => onUpdate({ groomBio: val })}
                  mode={mode}
                  placeholder="A short bio..."
                  className="font-body text-sm text-muted-foreground mt-2"
                  maxLength={100}
                  as="p"
                />
              </div>
            </div>

            {/* Botanical divider */}
            <div className="flex items-center justify-center gap-3 my-6">
              <div className="w-8 h-px bg-border" />
              <Leaf className="w-3 h-3 text-primary/40" />
              <div className="w-8 h-px bg-border" />
            </div>

            <EditableText
              value={data.hashtag}
              onSave={(val) => onUpdate({ hashtag: val })}
              mode={mode}
              placeholder="#YourHashtag"
              className="font-script text-xl text-primary"
              as="p"
            />
          </div>

          {/* Welcome Message */}
          <div className="mt-10 text-center">
            <EditableText
              value={data.welcomeMessage}
              onSave={(val) => onUpdate({ welcomeMessage: val })}
              mode={mode}
              placeholder="Add a welcome message for your guests..."
              className="font-body text-base text-muted-foreground max-w-lg mx-auto leading-relaxed"
              multiline
              as="p"
            />
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          COUNTDOWN — Circular progress rings
          ═══════════════════════════════════════ */}
      {(data.showCountdown || mode === "edit") && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 bg-card"
        >
          <div className="container mx-auto px-4 max-w-2xl text-center">
            {mode === "edit" && (
              <div className="mb-6 flex items-center justify-center gap-3">
                <label className="font-body text-sm">Show Countdown</label>
                <button
                  onClick={() => onUpdate({ showCountdown: !data.showCountdown })}
                  className={cn("w-10 h-6 rounded-full transition-colors", data.showCountdown ? "bg-primary" : "bg-muted")}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform mx-1", data.showCountdown && "translate-x-4")} />
                </button>
              </div>
            )}
            {data.showCountdown && (
              <>
                <h2 className="font-heading text-2xl font-bold mb-8">Until We Say I Do</h2>
                <CircleCountdownDisplay weddingDate={data.weddingDate} />
              </>
            )}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════
          EVENTS — Accordion / Expandable List
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-background"
      >
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="font-heading text-3xl font-bold text-center mb-10">Our Celebrations</h2>

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
                  onDelete={() => onUpdate({ events: data.events.filter((_, idx) => idx !== i) })}
                  mode={mode}
                  index={i}
                />
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
            /* Accordion events */
            <div className="space-y-3">
              {data.events.map((event, i) => (
                <motion.div
                  key={event.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{eventLeafIcons[event.eventName] || "🌿"}</span>
                      <div className="text-left">
                        <h3 className="font-heading text-lg font-semibold">{event.eventName}</h3>
                        <p className="font-body text-xs text-muted-foreground">{formatEventDate(event.eventDate)}</p>
                      </div>
                    </div>
                    {expandedEvent === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>

                  <AnimatePresence>
                    {expandedEvent === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 border-t border-border">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>📅 {formatEventDate(event.eventDate)}</span>
                            <span>🕐 {formatTime(event.eventTime)}</span>
                          </div>
                          <p className="font-body text-sm font-medium">{event.venueName}</p>
                          <p className="font-body text-xs text-muted-foreground">{event.venueAddress}</p>
                          {event.mapsUrl && (
                            <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 font-body text-xs text-primary hover:underline">
                              <MapPin size={12} /> View on Map
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════
          GALLERY — Polaroid style photos
          ═══════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-card"
      >
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-primary" />
              <p className="font-body text-xs tracking-[0.3em] uppercase text-primary">Memories</p>
            </div>
            <h2 className="font-heading text-3xl font-bold">Our Gallery</h2>
          </div>

          {mode === "edit" ? (
            <EditablePhotoGallery
              photos={data.galleryPhotos}
              defaultPhotos={data.templateDefaults.defaultPhotos}
              onUpdate={(photos) => onUpdate({ galleryPhotos: photos })}
              mode={mode}
              maxPhotos={10}
            />
          ) : (
            /* Polaroid grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {data.galleryPhotos.map((photo, i) => {
                const rotation = -3 + Math.random() * 6;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30, rotate: rotation }}
                    whileInView={{ opacity: 1, y: 0, rotate: rotation }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                    className="bg-white rounded-sm p-2 pb-8 shadow-lg cursor-pointer"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <div className="aspect-square overflow-hidden rounded-sm">
                      <img src={photo.photoUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* Music (edit only) */}
      {mode === "edit" && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-xl">
            <EditableMusicPlayer
              musicUrl={data.musicUrl}
              musicName={data.musicName}
              defaultMusicUrl={data.templateDefaults.defaultMusicUrl}
              defaultMusicName={data.templateDefaults.defaultMusicName}
              onUpdate={(url, name) => onUpdate({ musicUrl: url, musicName: name })}
              mode={mode}
            />
          </div>
        </section>
      )}

      {/* RSVP (view/demo) */}
      {mode !== "edit" && <GardenRsvpSection invitationId={data.invitationId} isDemo={mode === "demo"} />}

      {/* Footer */}
      <footer className={cn("py-16 bg-background text-center", mode === "edit" && "pb-32")}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-primary/30" />
            <Leaf className="w-4 h-4 text-primary/40" />
            <div className="w-8 h-px bg-primary/30" />
          </div>
          <p className="font-heading text-3xl text-foreground">
            {data.brideName?.split(" ")[0] || "Bride"} & {data.groomName?.split(" ")[0] || "Groom"}
          </p>
          <p className="font-body text-sm text-muted-foreground mt-3">{formatWeddingDate(data.weddingDate)}</p>
          {data.hashtag && <p className="font-body text-sm text-primary mt-4">{data.hashtag}</p>}
          <p className="font-body text-[10px] text-muted-foreground/40 mt-8">Made with love on ShubhAarambh</p>
        </div>
      </footer>

      {mode === "edit" && (
        <EditModeToolbar onSaveDraft={onSaveDraft} onPublish={onPublish} isSaving={isSaving} isPublishing={isPublishing} invitationId={data.invitationId} hasUnsavedChanges={true} />
      )}

      {mode !== "edit" && effectiveMusicUrl && <FloatingMusicPlayer musicUrl={effectiveMusicUrl} musicName={effectiveMusicName} />}
    </div>
  );
};

/* Circular countdown rings */
const CircleCountdownDisplay = ({ weddingDate }: { weddingDate: string }) => {
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!weddingDate) { setCountdown(null); return; }
      const diff = new Date(weddingDate).getTime() - Date.now();
      if (diff <= 0) { setCountdown(null); return; }
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

  if (!countdown) return <p className="font-body text-muted-foreground">Set wedding date to see countdown</p>;

  const items = [
    { value: countdown.days, label: "Days", max: 365 },
    { value: countdown.hours, label: "Hours", max: 24 },
    { value: countdown.minutes, label: "Min", max: 60 },
    { value: countdown.seconds, label: "Sec", max: 60 },
  ];

  return (
    <div className="flex justify-center gap-6 sm:gap-8">
      {items.map((item, i) => {
        const circumference = 2 * Math.PI * 36;
        const progress = (item.value / item.max) * circumference;
        return (
          <div key={i} className="text-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"
                  strokeDasharray={circumference} strokeDashoffset={circumference - progress}
                  strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                  {String(item.value).padStart(2, "0")}
                </span>
              </div>
            </div>
            <span className="font-body text-xs text-muted-foreground mt-2 block">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* Garden-themed RSVP */
const GardenRsvpSection = ({ invitationId, isDemo }: { invitationId: number | null; isDemo: boolean }) => {
  const [attending, setAttending] = useState<"yes" | "maybe" | "no" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) { setSubmitted(true); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 max-w-md text-center">
          <Leaf className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="font-heading text-2xl font-semibold mb-2">Thank You!</h3>
          <p className="font-body text-sm text-muted-foreground">Your response has been recorded.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-6 max-w-md">
        <h2 className="font-heading text-3xl font-bold text-center mb-8">RSVP</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {[
              { value: "yes", label: "🌸 Attending" },
              { value: "maybe", label: "🤔 Maybe" },
              { value: "no", label: "😢 Cannot" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAttending(opt.value as any)}
                className={cn(
                  "px-4 py-3 rounded-xl font-body text-sm transition-all border",
                  attending === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {attending && attending !== "no" && (
            <div className="space-y-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div>
                <label className="font-body text-sm text-muted-foreground block mb-2">Number of Guests</label>
                <input type="number" min={1} max={10} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          )}
          <button type="submit" disabled={!attending}
            className={cn("w-full py-3 rounded-xl font-body font-medium text-sm transition-all",
              attending ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
            )}>
            Confirm RSVP
          </button>
        </form>
      </div>
    </section>
  );
};

export default BlossomDateTemplate;
