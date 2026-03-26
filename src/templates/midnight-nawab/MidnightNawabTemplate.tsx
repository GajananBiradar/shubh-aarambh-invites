/**
 * Midnight Nawab Template — Arabic-inspired geometric luxury
 * Dark navy/black bg, gold accents, geometric patterns
 * Layout: Geometric border hero, ornate card events, mosaic gallery
 */
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Heart, MapPin, Star } from "lucide-react";
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

const MidnightNawabTemplate = ({
  mode, data, onUpdate, onSaveDraft, onPublish, isSaving, isPublishing,
}: TemplateProps) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const effectiveMusicUrl = data.musicUrl || data.effectiveMusicUrl || data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName = data.musicName || data.effectiveMusicName || data.templateDefaults.defaultMusicName;

  // Geometric pattern particles
  const stars = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 4 + Math.random() * 8,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 8,
    })), []
  );

  return (
    <div data-theme="midnight" className="min-h-screen bg-background text-foreground">
      {/* ═══════════════════════════════════════
          HERO — Geometric Islamic-inspired borders
          ═══════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, hsl(var(--primary)) 0, hsl(var(--primary)) 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(-45deg, hsl(var(--primary)) 0, hsl(var(--primary)) 1px, transparent 1px, transparent 20px)`,
          }}
        />

        {/* Floating gold stars */}
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((s) => (
            <motion.div key={s.id}
              className="absolute"
              style={{ left: s.left, top: s.top }}
              animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: s.duration, delay: s.delay }}
            >
              <Star className="text-primary" style={{ width: s.size, height: s.size }} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        {/* Ornate geometric frame */}
        <div className="absolute inset-6 sm:inset-10 md:inset-14 pointer-events-none">
          <div className="w-full h-full border-2 border-primary/20 relative">
            <div className="absolute -top-2 -left-2 w-10 h-10 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute -top-2 -right-2 w-10 h-10 border-t-2 border-r-2 border-primary/50" />
            <div className="absolute -bottom-2 -left-2 w-10 h-10 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-primary/50" />
            {/* Center diamond ornament top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 border-2 border-primary/40 bg-background" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 border-2 border-primary/40 bg-background" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          {/* Bismillah / Opening */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-body text-xs tracking-[0.3em] uppercase text-primary/70 mb-8"
          >
            بسم الله الرحمن الرحيم
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-body text-sm italic text-foreground/60 mb-6"
          >
            Together with their families
          </motion.p>

          {/* Names */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <EditableText value={data.brideName} onSave={(val) => onUpdate({ brideName: val })} mode={mode}
              placeholder="Bride's Name" className="font-heading text-5xl sm:text-6xl md:text-7xl text-primary" as="h1" />
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
            className="my-4 flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-primary/40" />
            <Star className="w-4 h-4 text-primary" fill="currentColor" />
            <div className="w-12 h-px bg-primary/40" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <EditableText value={data.groomName} onSave={(val) => onUpdate({ groomName: val })} mode={mode}
              placeholder="Groom's Name" className="font-heading text-5xl sm:text-6xl md:text-7xl text-primary" as="h1" />
          </motion.div>

          {/* Date */}
          {mode === "edit" ? (
            <div className="mt-8">
              <label className="font-body text-xs text-foreground/50 block mb-1">Wedding Date</label>
              <input type="date" value={data.weddingDate} onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                className="bg-card border border-border rounded-lg px-4 py-2 font-body text-sm" />
            </div>
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              className="font-body text-sm tracking-[0.3em] uppercase text-foreground/70 mt-8">
              {formatWeddingDate(data.weddingDate)}
            </motion.p>
          )}
        </div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <ChevronDown className="w-5 h-5 text-primary/40" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          COUPLE SECTION
          ═══════════════════════════════════════ */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="py-20 bg-card">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <Star className="w-6 h-6 text-primary mx-auto mb-4" fill="currentColor" />
            <EditableText value={data.welcomeMessage} onSave={(val) => onUpdate({ welcomeMessage: val })} mode={mode}
              placeholder="Add a welcome message..." className="font-body text-base text-foreground/70 max-w-xl mx-auto leading-relaxed" multiline as="p" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* Bride */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute -inset-3 border border-primary/20 rotate-3" />
                <EditablePhoto photoUrl={data.couplePhotoUrl} onSave={(url) => onUpdate({ couplePhotoUrl: url })} mode={mode}
                  className="w-40 h-52 object-cover" alt={data.brideName} />
              </div>
              <h3 className="font-heading text-xl text-primary">{data.brideName || "The Bride"}</h3>
              <EditableText value={data.brideBio} onSave={(val) => onUpdate({ brideBio: val })} mode={mode}
                placeholder="Bio..." className="font-body text-sm text-foreground/60 mt-1" maxLength={100} as="p" />
            </motion.div>

            {/* Groom */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute -inset-3 border border-primary/20 -rotate-3" />
                <EditablePhoto photoUrl={data.couplePhotoUrl} onSave={(url) => onUpdate({ couplePhotoUrl: url })} mode={mode}
                  className="w-40 h-52 object-cover" alt={data.groomName} />
              </div>
              <h3 className="font-heading text-xl text-primary">{data.groomName || "The Groom"}</h3>
              <EditableText value={data.groomBio} onSave={(val) => onUpdate({ groomBio: val })} mode={mode}
                placeholder="Bio..." className="font-body text-sm text-foreground/60 mt-1" maxLength={100} as="p" />
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <EditableText value={data.hashtag} onSave={(val) => onUpdate({ hashtag: val })} mode={mode}
              placeholder="#YourHashtag" className="font-script text-2xl text-primary" as="p" />
          </div>
        </div>
      </motion.section>

      {/* Countdown */}
      {(data.showCountdown || mode === "edit") && (
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            {mode === "edit" && (
              <div className="mb-6 flex items-center justify-center gap-3">
                <label className="font-body text-sm">Show Countdown</label>
                <button onClick={() => onUpdate({ showCountdown: !data.showCountdown })}
                  className={cn("w-10 h-6 rounded-full transition-colors", data.showCountdown ? "bg-primary" : "bg-muted")}>
                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform mx-1", data.showCountdown && "translate-x-4")} />
                </button>
              </div>
            )}
            {data.showCountdown && <NawabCountdown weddingDate={data.weddingDate} />}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════
          EVENTS — Ornate cards with geometric borders
          ═══════════════════════════════════════ */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="py-24 bg-card">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-8 h-px bg-primary/40" />
              <Star className="w-3 h-3 text-primary" fill="currentColor" />
              <div className="w-8 h-px bg-primary/40" />
            </div>
            <h2 className="font-heading text-4xl text-primary">The Celebrations</h2>
          </div>

          {mode === "edit" ? (
            <div className="space-y-6">
              {data.events.map((event, i) => (
                <EditableEventCard key={event.id || i} event={event}
                  onUpdate={(updates) => { const e = [...data.events]; e[i] = { ...e[i], ...updates }; onUpdate({ events: e }); }}
                  onDelete={() => onUpdate({ events: data.events.filter((_, idx) => idx !== i) })} mode={mode} index={i} />
              ))}
              <AddEventButton onAdd={() => onUpdate({ events: [...data.events, { id: null, eventName: "New Event", eventDate: "", eventTime: "", venueName: "", venueAddress: "", mapsUrl: null }] })}
                mode={mode} maxEvents={8} currentCount={data.events.length} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.events.map((event, i) => (
                <motion.div key={event.id || i}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative bg-background rounded-lg p-6 border-2 border-primary/20 overflow-hidden group hover:border-primary/40 transition-colors">
                  {/* Corner geometric detail */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-primary/20 rounded-bl-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-r border-t border-primary/20 rounded-tr-lg" />

                  <Star className="w-5 h-5 text-primary mb-3" fill="currentColor" />
                  <h3 className="font-heading text-xl text-primary mb-2">{event.eventName}</h3>
                  <p className="font-body text-sm text-foreground/60 mb-1">
                    {formatEventDate(event.eventDate)} · {formatTime(event.eventTime)}
                  </p>
                  <p className="font-body text-sm text-foreground/80 mt-3">{event.venueName}</p>
                  <p className="font-body text-xs text-foreground/50">{event.venueAddress}</p>
                  {event.mapsUrl && (
                    <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 font-body text-xs text-primary hover:underline">
                      <MapPin size={12} /> Location
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Gallery */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="font-heading text-4xl text-primary text-center mb-12">Our Gallery</h2>
          <EditablePhotoGallery photos={data.galleryPhotos} defaultPhotos={data.templateDefaults.defaultPhotos}
            onUpdate={(photos) => onUpdate({ galleryPhotos: photos })} mode={mode} maxPhotos={10} />
        </div>
      </motion.section>

      {/* Music (edit) */}
      {mode === "edit" && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 max-w-xl">
            <EditableMusicPlayer musicUrl={data.musicUrl} musicName={data.musicName}
              defaultMusicUrl={data.templateDefaults.defaultMusicUrl} defaultMusicName={data.templateDefaults.defaultMusicName}
              onUpdate={(url, name) => onUpdate({ musicUrl: url, musicName: name })} mode={mode} />
          </div>
        </section>
      )}

      {/* RSVP */}
      {mode !== "edit" && <NawabRsvp invitationId={data.invitationId} isDemo={mode === "demo"} />}

      {/* Footer */}
      <footer className={cn("py-20 bg-card text-center", mode === "edit" && "pb-32")}>
        <div className="container mx-auto px-4">
          <Star className="w-6 h-6 text-primary mx-auto mb-4" fill="currentColor" />
          <p className="font-heading text-3xl text-primary">
            {data.brideName?.split(" ")[0] || "Bride"} & {data.groomName?.split(" ")[0] || "Groom"}
          </p>
          <p className="font-body text-sm text-foreground/50 mt-4">{formatWeddingDate(data.weddingDate)}</p>
          {data.hashtag && <p className="font-body text-sm text-primary/70 mt-4">{data.hashtag}</p>}
          <p className="font-body text-[10px] text-foreground/20 mt-10">Made with love on ShubhAarambh</p>
        </div>
      </footer>

      {mode === "edit" && (
        <EditModeToolbar onSaveDraft={onSaveDraft} onPublish={onPublish} isSaving={isSaving} isPublishing={isPublishing} invitationId={data.invitationId} hasUnsavedChanges={true} />
      )}
      {mode !== "edit" && effectiveMusicUrl && <FloatingMusicPlayer musicUrl={effectiveMusicUrl} musicName={effectiveMusicName} />}
    </div>
  );
};

const NawabCountdown = ({ weddingDate }: { weddingDate: string }) => {
  const [c, setC] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  useEffect(() => {
    const update = () => {
      if (!weddingDate) { setC(null); return; }
      const d = new Date(weddingDate).getTime() - Date.now();
      if (d <= 0) { setC(null); return; }
      setC({ days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) });
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [weddingDate]);
  if (!c) return <p className="font-body text-foreground/50">Set wedding date</p>;
  return (
    <div className="flex justify-center gap-6">
      {[{ v: c.days, l: "Days" }, { v: c.hours, l: "Hours" }, { v: c.minutes, l: "Min" }, { v: c.seconds, l: "Sec" }].map((x, i) => (
        <div key={i} className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-primary/30 rounded-lg flex items-center justify-center mb-2 bg-card">
            <span className="font-heading text-2xl sm:text-3xl font-bold text-primary">{String(x.v).padStart(2, "0")}</span>
          </div>
          <span className="font-body text-xs text-foreground/50">{x.l}</span>
        </div>
      ))}
    </div>
  );
};

const NawabRsvp = ({ invitationId, isDemo }: { invitationId: number | null; isDemo: boolean }) => {
  const [attending, setAttending] = useState<"yes" | "maybe" | "no" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  if (submitted) return (
    <section className="py-20 bg-background"><div className="container mx-auto px-4 max-w-md text-center">
      <Star className="w-8 h-8 text-primary mx-auto mb-4" fill="currentColor" />
      <h3 className="font-heading text-2xl text-primary mb-2">Thank You</h3>
      <p className="font-body text-sm text-foreground/50">Your response has been recorded.</p>
    </div></section>
  );

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 max-w-md">
        <h2 className="font-heading text-4xl text-primary text-center mb-10">RSVP</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {[{ value: "yes", label: "Attending" }, { value: "maybe", label: "Maybe" }, { value: "no", label: "Cannot" }].map((opt) => (
              <button key={opt.value} type="button" onClick={() => setAttending(opt.value as any)}
                className={cn("px-5 py-3 rounded-lg font-body text-sm border transition-all",
                  attending === opt.value ? "border-primary text-primary bg-primary/10" : "border-border hover:border-primary/40")}>{opt.label}</button>
            ))}
          </div>
          {attending && attending !== "no" && (
            <div className="space-y-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required
                className="w-full px-4 py-3 rounded-lg border border-border bg-card font-body text-sm focus:outline-none focus:border-primary/50" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone"
                className="w-full px-4 py-3 rounded-lg border border-border bg-card font-body text-sm focus:outline-none focus:border-primary/50" />
              <input type="number" min={1} max={10} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-border bg-card font-body text-sm focus:outline-none focus:border-primary/50" />
            </div>
          )}
          <button type="submit" disabled={!attending}
            className={cn("w-full py-3 rounded-lg font-body font-medium text-sm",
              attending ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed")}>Confirm</button>
        </form>
      </div>
    </section>
  );
};

export default MidnightNawabTemplate;
