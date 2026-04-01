/**
 * Royal Haveli Template — Premium Indian Wedding
 * Rich royal Indian aesthetic: Deep maroon & gold, ornate mandala borders,
 * Devanagari-inspired decorations, marigold garland accents
 * Sections: Hero (video/photo bg) → Mandala Welcome → Countdown →
 * Events Cards → Couple → Gallery → RSVP → Footer
 */
import { useState, useEffect, useRef } from "react";
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
   Color Palette — Royal Maroon & Gold
   ──────────────────────────────────────────── */
const C = {
  maroon: "#8B1A1A",
  maroonDark: "#6B1010",
  maroonLight: "#A52A2A",
  gold: "#D4AF37",
  goldLight: "#E8CC6A",
  goldDark: "#B8860B",
  cream: "#FFF8F0",
  ivory: "#FFFEF7",
  text: "#2D1810",
  textMuted: "#5C3D2E",
  textLight: "#8B7355",
  white: "#FFFFFF",
  black: "#1A0F0A",
  marigold: "#FF8C00",
  marigoldLight: "#FFA833",
};

const FONTS = {
  display: "'Playfair Display', serif",
  script: "'Great Vibes', cursive",
  body: "'Cormorant Garamond', serif",
};

const R2_BASE = "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev";

/* ────────────────────────────────────────────
   MANDALA SVG ORNAMENT
   ──────────────────────────────────────────── */
const MandalaOrnament = ({ size = 120, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
    <g stroke={C.gold} strokeWidth="0.5" opacity="0.6">
      <circle cx="60" cy="60" r="55" />
      <circle cx="60" cy="60" r="45" />
      <circle cx="60" cy="60" r="35" />
      <circle cx="60" cy="60" r="25" />
      <circle cx="60" cy="60" r="15" />
      {/* Petals */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 60 + 20 * Math.cos(angle);
        const y1 = 60 + 20 * Math.sin(angle);
        const x2 = 60 + 50 * Math.cos(angle);
        const y2 = 60 + 50 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      {/* Outer petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const cx = 60 + 42 * Math.cos(angle);
        const cy = 60 + 42 * Math.sin(angle);
        return <circle key={`p${i}`} cx={cx} cy={cy} r="6" />;
      })}
      {/* Inner diamond petals */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = ((i * 60 + 15) * Math.PI) / 180;
        const cx = 60 + 28 * Math.cos(angle);
        const cy = 60 + 28 * Math.sin(angle);
        return <circle key={`d${i}`} cx={cx} cy={cy} r="4" />;
      })}
    </g>
    <circle cx="60" cy="60" r="5" fill={C.gold} opacity="0.4" />
  </svg>
);

/* Decorative border pattern */
const GoldBorder = ({ className = "" }: { className?: string }) => (
  <div className={cn("w-full py-4 flex items-center justify-center gap-3", className)}>
    <div className="h-[1px] flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${C.gold})` }} />
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z" fill={C.gold} opacity="0.6" />
    </svg>
    <div className="h-[1px] flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${C.gold}, transparent)` }} />
  </div>
);

/* Marigold garland strip */
const MarigoldGarland = () => (
  <div className="w-full overflow-hidden py-2">
    <div className="flex justify-center">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-5 h-5 rounded-full mx-[2px]"
          style={{
            background: `radial-gradient(circle, ${i % 3 === 0 ? C.marigold : i % 3 === 1 ? C.marigoldLight : C.goldLight}, ${C.goldDark})`,
            transform: `translateY(${Math.sin(i * 0.7) * 4}px)`,
          }}
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 0.9, y: Math.sin(i * 0.7) * 4 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.03 }}
        />
      ))}
    </div>
  </div>
);

/* ════════════════════════════════════════════
   MAIN TEMPLATE COMPONENT
   ════════════════════════════════════════════ */
const BlushAffairTemplate = ({
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
  const effectiveMusicUrl = data.musicUrl || data.effectiveMusicUrl || data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName = data.musicName || data.effectiveMusicName || data.templateDefaults.defaultMusicName;

  return (
    <div data-theme="blush" className="min-h-screen" style={{ backgroundColor: C.cream, fontFamily: FONTS.body }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');`}</style>

      {/* Hero */}
      <HeroSection mode={mode} data={data} onUpdate={onUpdate} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />

      {/* Marigold garland transition */}
      <MarigoldGarland />

      {/* Welcome with Mandala */}
      <WelcomeSection mode={mode} data={data} onUpdate={onUpdate} />

      {/* Countdown */}
      {(data.showCountdown || mode === "edit") && (
        <CountdownSection mode={mode} weddingDate={data.weddingDate} showCountdown={data.showCountdown} onUpdate={onUpdate} />
      )}

      {/* Events */}
      <EventsSection mode={mode} data={data} onUpdate={onUpdate} />

      {/* Couple Section */}
      <CoupleSection mode={mode} data={data} onUpdate={onUpdate} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />

      {/* Gallery */}
      <GallerySection mode={mode} data={data} onUpdate={onUpdate} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />

      {/* Music Editor */}
      {mode === "edit" && (
        <section className="py-16" style={{ backgroundColor: C.cream }}>
          <div className="max-w-xl mx-auto px-6">
            <EditableMusicPlayer musicUrl={data.musicUrl} musicName={data.musicName} defaultMusicUrl={data.templateDefaults.defaultMusicUrl} defaultMusicName={data.templateDefaults.defaultMusicName} onUpdate={(url, name) => onUpdate({ musicUrl: url, musicName: name })} mode={mode} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} invitationId={data.invitationId ?? undefined} />
          </div>
        </section>
      )}

      {/* RSVP */}
      {mode !== "edit" && data.rsvpEnabled !== false && (
        <RsvpSection invitationId={data.invitationId} isDemo={mode === "demo"} />
      )}

      {/* Footer */}
      <footer className={cn("relative py-20 text-center overflow-hidden", mode === "edit" && "pb-32")} style={{ backgroundColor: C.maroonDark }}>
        <MandalaOrnament size={80} className="mx-auto mb-6 opacity-40" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-4xl md:text-5xl mb-3" style={{ fontFamily: FONTS.script, color: C.gold }}>
            {data.brideName?.split(" ")[0] || "Bride"} &amp; {data.groomName?.split(" ")[0] || "Groom"}
          </p>
          <GoldBorder />
          <p className="text-xs tracking-[0.2em] uppercase mt-4" style={{ color: `${C.gold}99` }}>
            {formatWeddingDate(data.weddingDate)}
          </p>
          {data.hashtag && <p className="text-sm mt-4 italic" style={{ color: `${C.gold}70` }}>{data.hashtag}</p>}
          <p className="text-[10px] mt-10" style={{ color: `${C.gold}40` }}>Made with love on ShubhAarambh</p>
        </motion.div>
      </footer>

      {mode === "edit" && (
        <EditModeToolbar onSaveDraft={onSaveDraft} onPublish={onPublish} isSaving={isSaving} isPublishing={isPublishing} invitationId={data.invitationId} hasUnsavedChanges={true} />
      )}

      {mode !== "edit" && effectiveMusicUrl && (
        <FloatingMusicPlayer musicUrl={effectiveMusicUrl} musicName={effectiveMusicName} />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   HERO — Dark maroon bg with ornate gold frame
   ══════════════════════════════════════════════════════════ */
const HeroSection = ({ mode, data, onUpdate, templateId, sessionUUID, uploadStage }: {
  mode: TemplateProps["mode"]; data: TemplateProps["data"]; onUpdate: TemplateProps["onUpdate"];
  templateId?: number; sessionUUID?: string; uploadStage?: "temp" | "draft" | "published";
}) => {
  const couplePhoto = data.couplePhotoUrl || `${R2_BASE}/templates/7/photos/marriage.png`;

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: C.maroonDark }}>
      {/* Background photo with dark overlay */}
      <div className="absolute inset-0">
        {mode === "edit" ? (
          <EditablePhoto photoUrl={data.couplePhotoUrl} onSave={(url) => onUpdate({ couplePhotoUrl: url })} mode={mode} className="w-full h-full object-cover" alt="Couple Photo" placeholderText="Add Your Photo" invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} oldPublicUrl={data.couplePhotoUrl || undefined} />
        ) : (
          <img src={couplePhoto} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${C.maroonDark}CC 0%, ${C.maroonDark}80 40%, ${C.maroonDark}DD 100%)` }} />
      </div>

      {/* Gold ornate border frame */}
      <div className="absolute inset-4 md:inset-8 border-2 rounded-lg pointer-events-none" style={{ borderColor: `${C.gold}40` }}>
        <div className="absolute inset-2 border rounded-lg" style={{ borderColor: `${C.gold}20` }} />
        {/* Corner ornaments */}
        {["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-12 h-12`}>
            <svg viewBox="0 0 50 50" fill="none" className="w-full h-full">
              <path d="M5 5 Q5 25 25 25 Q25 5 5 5 Z" stroke={C.gold} strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M0 15 Q10 15 15 0" stroke={C.gold} strokeWidth="0.8" fill="none" opacity="0.4" />
            </svg>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-2xl">
        <MandalaOrnament size={100} className="mx-auto mb-8 opacity-50" />

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xs tracking-[0.4em] uppercase mb-6" style={{ color: C.goldLight, fontFamily: FONTS.body }}>
          Shubh Vivah
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div style={{ fontFamily: FONTS.script, color: C.gold }}>
            <EditableText value={data.brideName} onSave={(val) => onUpdate({ brideName: val })} mode={mode} placeholder="Bride's Name" className="block text-5xl sm:text-6xl md:text-7xl drop-shadow-lg" as="h1" />
          </div>
          <p className="text-2xl my-2" style={{ fontFamily: FONTS.script, color: `${C.gold}80` }}>&amp;</p>
          <div style={{ fontFamily: FONTS.script, color: C.gold }}>
            <EditableText value={data.groomName} onSave={(val) => onUpdate({ groomName: val })} mode={mode} placeholder="Groom's Name" className="block text-5xl sm:text-6xl md:text-7xl drop-shadow-lg" as="h1" />
          </div>
        </motion.div>

        <GoldBorder className="my-8" />

        {mode === "edit" ? (
          <div className="mt-4">
            <label className="text-xs block mb-2 tracking-wider uppercase" style={{ color: C.goldLight }}>Wedding Date</label>
            <input type="date" value={data.weddingDate} onChange={(e) => onUpdate({ weddingDate: e.target.value })} className="bg-white/10 backdrop-blur border rounded-lg px-4 py-2 text-sm" style={{ borderColor: `${C.gold}40`, color: C.gold }} />
          </div>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-sm md:text-base tracking-[0.25em] uppercase" style={{ color: C.goldLight, fontFamily: FONTS.body }}>
            {formatWeddingDate(data.weddingDate)}
          </motion.p>
        )}

        {mode !== "edit" && (
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-10">
            <ChevronDown size={22} style={{ color: `${C.gold}60` }} className="mx-auto" />
          </motion.div>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   WELCOME — with mandala decoration
   ══════════════════════════════════════════════════════════ */
const WelcomeSection = ({ mode, data, onUpdate }: {
  mode: TemplateProps["mode"]; data: TemplateProps["data"]; onUpdate: TemplateProps["onUpdate"];
}) => (
  <section className="py-20 md:py-28" style={{ backgroundColor: C.cream }}>
    <div className="max-w-2xl mx-auto text-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
        <MandalaOrnament size={60} className="mx-auto mb-6" />
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl mb-8" style={{ fontFamily: FONTS.display, color: C.maroon }}>
        With Blessings & Joy
      </motion.h2>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
        <div style={{ color: C.textMuted }}>
          <EditableText value={data.welcomeMessage} onSave={(val) => onUpdate({ welcomeMessage: val })} mode={mode} placeholder="Together with our families, we joyfully invite you..." className="text-lg md:text-xl leading-relaxed italic" multiline as="p" />
        </div>
      </motion.div>

      <GoldBorder className="mt-8" />
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   COUNTDOWN
   ══════════════════════════════════════════════════════════ */
const CountdownSection = ({ mode, weddingDate, showCountdown, onUpdate }: {
  mode: TemplateProps["mode"]; weddingDate: string; showCountdown: boolean; onUpdate: TemplateProps["onUpdate"];
}) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      if (!weddingDate) return;
      const diff = new Date(weddingDate).getTime() - Date.now();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
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

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: C.maroon }}>
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        {mode === "edit" && (
          <div className="mb-6 flex items-center justify-center gap-3">
            <label className="text-sm" style={{ color: C.goldLight }}>Show Countdown</label>
            <button onClick={() => onUpdate({ showCountdown: !showCountdown })} className={cn("w-12 h-7 rounded-full transition-colors relative", showCountdown ? `bg-[${C.gold}]` : "bg-white/20")}>
              <div className={cn("absolute top-1 w-5 h-5 rounded-full bg-white transition-transform", showCountdown ? "left-6" : "left-1")} />
            </button>
          </div>
        )}

        {showCountdown && (
          <>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl mb-10" style={{ fontFamily: FONTS.display, color: C.gold }}>
              Counting Down to Our Day
            </motion.h2>
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {[
                { value: countdown.days, label: "Days" },
                { value: countdown.hours, label: "Hours" },
                { value: countdown.minutes, label: "Min" },
                { value: countdown.seconds, label: "Sec" },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center border" style={{ borderColor: `${C.gold}50`, backgroundColor: `${C.gold}10` }}>
                    <span className="text-3xl md:text-4xl font-light" style={{ color: C.gold, fontFamily: FONTS.display }}>{String(item.value).padStart(2, "0")}</span>
                  </div>
                  <p className="text-[10px] tracking-[0.2em] uppercase mt-2" style={{ color: `${C.gold}80` }}>{item.label}</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   EVENTS — Royal event cards with Indian icons
   ══════════════════════════════════════════════════════════ */
const INDIAN_EVENT_ICONS: Record<string, string> = {
  haldi: "🌼",
  mehendi: "🌿",
  sangeet: "🎵",
  wedding: "🪷",
  reception: "🥂",
  baraat: "🐎",
  engagement: "💍",
  cocktail: "🍷",
};

const EventsSection = ({ mode, data, onUpdate }: {
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

  if (data.events.length === 0 && !isEdit) return null;

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: C.ivory }}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: C.gold }}>Our Celebrations</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: FONTS.display, color: C.maroon }}>Wedding Events</h2>
          <GoldBorder className="mt-4" />
        </motion.div>

        {isEdit ? (
          <div className="space-y-4">
            {data.events.map((event, i) => (
              <EditableEventCard key={event.id || i} event={event} onUpdate={(updates) => updateEvent(i, updates)} onDelete={() => deleteEvent(i)} mode={mode} index={i} />
            ))}
            <AddEventButton onAdd={() => onUpdate({ events: [...data.events, { id: null, eventName: "New Event", eventDate: "", eventTime: "", venueName: "", venueAddress: "", mapsUrl: null }] })} mode={mode} maxEvents={8} currentCount={data.events.length} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.events.map((event, i) => {
              const icon = INDIAN_EVENT_ICONS[event.eventName.toLowerCase()] || "✨";
              return (
                <motion.div key={event.id || i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="rounded-2xl p-8 border text-center relative overflow-hidden group hover:shadow-lg transition-shadow" style={{ backgroundColor: C.white, borderColor: `${C.gold}30` }}>
                  {/* Gold corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl" style={{ borderColor: `${C.gold}50` }} />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl" style={{ borderColor: `${C.gold}50` }} />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl" style={{ borderColor: `${C.gold}50` }} />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl" style={{ borderColor: `${C.gold}50` }} />

                  <span className="text-3xl mb-3 block">{icon}</span>
                  <h3 className="text-2xl mb-2" style={{ fontFamily: FONTS.display, color: C.maroon }}>{event.eventName}</h3>
                  <div className="w-8 h-[1px] mx-auto mb-3" style={{ backgroundColor: C.gold }} />
                  <p className="text-sm font-semibold" style={{ color: C.textMuted }}>{formatEventDate(event.eventDate)}</p>
                  {event.eventTime && <p className="text-sm italic" style={{ color: C.textLight }}>{formatTime(event.eventTime)}</p>}
                  {event.venueName && <p className="text-sm font-medium mt-3" style={{ color: C.text }}>{event.venueName}</p>}
                  {event.venueAddress && <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: C.textMuted }}><MapPin size={12} />{event.venueAddress}</p>}
                  {event.mapsUrl && (
                    <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs tracking-wider uppercase hover:underline" style={{ color: C.maroon }}>
                      <MapPin size={12} /> Directions
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   COUPLE SECTION — Two photos side by side with bios
   ══════════════════════════════════════════════════════════ */
const CoupleSection = ({ mode, data, onUpdate, templateId, sessionUUID, uploadStage }: {
  mode: TemplateProps["mode"]; data: TemplateProps["data"]; onUpdate: TemplateProps["onUpdate"];
  templateId?: number; sessionUUID?: string; uploadStage?: "temp" | "draft" | "published";
}) => (
  <section className="py-20 md:py-28 relative" style={{ backgroundColor: C.cream }}>
    <div className="max-w-3xl mx-auto px-6 text-center">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl mb-12" style={{ fontFamily: FONTS.display, color: C.maroon }}>
        The Couple
      </motion.h2>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
        {/* Bride */}
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto mb-4 overflow-hidden border-4" style={{ borderColor: `${C.gold}60` }}>
            <img src={data.bridePhotoUrl || `${R2_BASE}/templates/7/photos/mehandi.png`} alt="Bride" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-2xl" style={{ fontFamily: FONTS.script, color: C.maroon }}>{data.brideName?.split(" ")[0] || "Bride"}</h3>
          {data.brideBio && <p className="text-sm mt-2 italic max-w-[200px] mx-auto" style={{ color: C.textMuted }}>{data.brideBio}</p>}
        </motion.div>

        {/* Heart connector */}
        <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Heart size={28} fill={C.maroon} style={{ color: C.maroon }} className="opacity-70" />
        </motion.div>

        {/* Groom */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto mb-4 overflow-hidden border-4" style={{ borderColor: `${C.gold}60` }}>
            <img src={data.groomPhotoUrl || `${R2_BASE}/templates/7/photos/Pose.png`} alt="Groom" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-2xl" style={{ fontFamily: FONTS.script, color: C.maroon }}>{data.groomName?.split(" ")[0] || "Groom"}</h3>
          {data.groomBio && <p className="text-sm mt-2 italic max-w-[200px] mx-auto" style={{ color: C.textMuted }}>{data.groomBio}</p>}
        </motion.div>
      </div>

      {data.hashtag && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-10">
          <p className="text-lg italic" style={{ color: C.maroon, fontFamily: FONTS.script }}>{data.hashtag}</p>
        </motion.div>
      )}
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   GALLERY — Masonry grid
   ══════════════════════════════════════════════════════════ */
const GallerySection = ({ mode, data, onUpdate, templateId, sessionUUID, uploadStage }: {
  mode: TemplateProps["mode"]; data: TemplateProps["data"]; onUpdate: TemplateProps["onUpdate"];
  templateId?: number; sessionUUID?: string; uploadStage?: "temp" | "draft" | "published";
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const displayPhotos = data.galleryPhotos.length > 0 ? data.galleryPhotos : data.templateDefaults.defaultPhotos.map((p, i) => ({ photoUrl: p.photoUrl, sortOrder: i, isDefault: true }));

  if (displayPhotos.length === 0 && mode !== "edit") return null;

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: C.ivory }}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: C.gold }}>Moments</p>
          <h2 className="text-4xl md:text-5xl" style={{ fontFamily: FONTS.display, color: C.maroon }}>Our Gallery</h2>
          <GoldBorder className="mt-4" />
        </motion.div>

        {mode === "edit" ? (
          <EditablePhotoGallery photos={data.galleryPhotos} defaultPhotos={data.templateDefaults.defaultPhotos} onUpdate={(photos) => onUpdate({ galleryPhotos: photos })} mode={mode} maxPhotos={10} invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />
        ) : (
          <>
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {displayPhotos.map((photo, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="break-inside-avoid cursor-pointer group relative rounded-xl overflow-hidden" onClick={() => setLightboxUrl(photo.photoUrl)}>
                  <img src={photo.photoUrl} alt={`Gallery ${i + 1}`} className="w-full rounded-xl transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <Heart size={20} className="text-white" />
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {lightboxUrl && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: `${C.maroonDark}F0` }} onClick={() => setLightboxUrl(null)}>
                  <button onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white text-2xl">✕</button>
                  <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={lightboxUrl} alt="" className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   RSVP — Royal themed
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
    if (!phone.trim() || phone.length < 10) { toast.error("Please enter a valid phone number"); return; }
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

  if (submitted) {
    return (
      <section className="py-20" style={{ backgroundColor: C.cream }}>
        <div className="max-w-md mx-auto px-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center rounded-2xl p-10 border" style={{ backgroundColor: C.white, borderColor: `${C.gold}30` }}>
            <Check className="w-10 h-10 mx-auto mb-4" style={{ color: C.maroon }} />
            <p className="text-2xl mb-2" style={{ fontFamily: FONTS.script, color: C.maroon }}>Thank you, {name}!</p>
            <p className="text-sm" style={{ color: C.textMuted }}>We look forward to celebrating with you.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20" style={{ backgroundColor: C.cream }}>
      <div className="max-w-md mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <MandalaOrnament size={50} className="mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl" style={{ fontFamily: FONTS.display, color: C.maroon }}>RSVP</h2>
          <GoldBorder />
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onSubmit={handleSubmit} className="rounded-2xl p-8 border space-y-6" style={{ backgroundColor: C.white, borderColor: `${C.gold}30` }}>
          <div>
            <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: C.textMuted }}>Your Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all" style={{ color: C.text, backgroundColor: C.ivory, border: `1px solid ${C.gold}30` }} placeholder="Enter your name" />
          </div>
          <div>
            <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: C.textMuted }}>Phone *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ color: C.text, backgroundColor: C.ivory, border: `1px solid ${C.gold}30` }} placeholder="10-digit phone" maxLength={10} />
          </div>

          <div>
            <label className="text-xs tracking-[0.15em] uppercase block mb-3" style={{ color: C.textMuted }}>Response</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "yes" as const, label: "Accept", icon: "🎉" },
                { v: "maybe" as const, label: "Maybe", icon: "💭" },
                { v: "no" as const, label: "Decline", icon: "🙏" },
              ].map((opt) => (
                <button key={opt.v} type="button" onClick={() => setAttending(opt.v)} className={cn("rounded-xl py-3 text-center transition-all border", attending === opt.v ? "ring-2 shadow-md" : "opacity-70")} style={{ borderColor: attending === opt.v ? C.maroon : `${C.gold}30`, backgroundColor: attending === opt.v ? `${C.maroon}10` : C.ivory, ['--tw-ring-color' as any]: C.maroon }}>
                  <span className="block text-lg mb-1">{opt.icon}</span>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: C.text }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {attending !== "no" && (
            <div>
              <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: C.textMuted }}>Guests</label>
              <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ borderColor: `${C.gold}40` }}><Minus size={14} /></button>
                <span className="text-2xl font-light w-12 text-center" style={{ color: C.maroon, fontFamily: FONTS.display }}>{guestCount}</span>
                <button type="button" onClick={() => setGuestCount(Math.min(10, guestCount + 1))} className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ borderColor: `${C.gold}40` }}><Plus size={14} /></button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs tracking-[0.15em] uppercase block mb-2" style={{ color: C.textMuted }}>Message (Optional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ color: C.text, backgroundColor: C.ivory, border: `1px solid ${C.gold}30` }} placeholder="A message for the couple..." />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-60" style={{ backgroundColor: C.maroon, color: C.gold }}>
            {loading ? <span className="animate-spin">⏳</span> : <Send size={16} />}
            {loading ? "Sending..." : "Send RSVP"}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default BlushAffairTemplate;
