import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AddEventButton,
  EditableEventCard,
  EditableMusicPlayer,
  EditablePhotoGallery,
  EditableText,
  EditModeToolbar,
} from "@/components/inline-editor";
import FloatingMusicPlayer from "@/components/invitation/FloatingMusicPlayer";
import { submitRsvp } from "@/api/rsvp";
import { cn } from "@/lib/utils";
import { createEmptyEvent, EventData, TemplateProps } from "@/templates/types";
import { formatEventDate, formatTime } from "@/utils/formatDate";
import {
  CalendarDays,
  Check,
  Clock3,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const C = {
  blush: "#f6e7e3",
  blushSoft: "#fbf2ef",
  parchment: "#fffaf5",
  parchmentWarm: "#f4ece0",
  sage: "#91a398",
  sageDeep: "#53655c",
  moss: "#3d4942",
  gold: "#c1a06a",
  goldSoft: "rgba(193, 160, 106, 0.16)",
  ink: "#2c2620",
  muted: "rgba(44, 38, 32, 0.68)",
  line: "rgba(193, 160, 106, 0.34)",
  shadow: "rgba(109, 87, 60, 0.16)",
  darkPanel: "#26241f",
};

const F = {
  display: "'Bodoni Moda', serif",
  serif: "'Cormorant Garamond', serif",
  sans: "'Jost', sans-serif",
  script: "'Allura', cursive",
};

const GANESH_ICON_URL =
  "https://upload.wikimedia.org/wikipedia/commons/0/05/Noun_Project_Ganesha_icon_744441_cc.svg";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
} as const;

const getPhotos = (data: TemplateProps["data"]) =>
  (data.galleryPhotos.length > 0
    ? data.galleryPhotos
    : data.templateDefaults.defaultPhotos.map((photo, index) => ({
        photoUrl: photo.photoUrl,
        sortOrder: index,
        isDefault: true,
      }))
  ).sort((a, b) => a.sortOrder - b.sortOrder);

const shortDate = (value: string) => {
  if (!value) return "Date to be announced";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const firstName = (value: string, fallback: string) => value?.split(" ")[0] || fallback;

const BotanicalStem = ({ className, delay = 0, reverse = false }: { className: string; delay?: number; reverse?: boolean }) => (
  <motion.div
    className={cn("pointer-events-none absolute", className)}
    animate={{ rotate: reverse ? [2, -3, 2] : [-2, 3, -2], y: [0, -6, 0] }}
    transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay }}
    style={{ transformOrigin: reverse ? "top right" : "top left" }}
  >
    <div className="relative h-48 w-40 sm:h-56 sm:w-48">
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(145,163,152,0),rgba(145,163,152,0.75),rgba(145,163,152,0.15))]" />
      {[
        { left: 34, top: 40, rotate: -34, w: 54, h: 18 },
        { left: 62, top: 78, rotate: 22, w: 58, h: 18 },
        { left: 20, top: 112, rotate: -28, w: 50, h: 16 },
        { left: 68, top: 148, rotate: 34, w: 56, h: 18 },
      ].map((leaf, index) => (
        <span
          key={`${leaf.left}-${index}`}
          className="absolute rounded-[100%_0_100%_0]"
          style={{
            left: leaf.left,
            top: leaf.top,
            width: leaf.w,
            height: leaf.h,
            transform: `rotate(${leaf.rotate}deg)`,
            background: "linear-gradient(135deg, #dfe8e0 0%, #a3b4a8 45%, #6f8477 100%)",
            boxShadow: "0 8px 12px rgba(109, 87, 60, 0.08)",
          }}
        />
      ))}
      {[{ left: 18, top: 14, size: 28 }, { left: 88, top: 10, size: 20 }, { left: 92, top: 186, size: 22 }].map((bloom, index) => (
        <span
          key={`${bloom.left}-${index}`}
          className="absolute rounded-full"
          style={{
            left: bloom.left,
            top: bloom.top,
            width: bloom.size,
            height: bloom.size,
            background: "radial-gradient(circle at 30% 30%, #fffefc, #f2ebe2 70%, #e0d1c0 100%)",
            boxShadow: "0 10px 16px rgba(109, 87, 60, 0.08)",
          }}
        />
      ))}
    </div>
  </motion.div>
);

const PetalFloat = ({ index }: { index: number }) => (
  <motion.span
    className="pointer-events-none absolute rounded-full"
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0, 0.35, 0],
      y: [0, 260, 520],
      x: [0, index % 2 === 0 ? 28 : -26, index % 2 === 0 ? -18 : 16],
      rotate: [0, 120, 240],
    }}
    transition={{
      duration: 10 + (index % 4),
      repeat: Infinity,
      ease: "linear",
      delay: index * 0.7,
    }}
    style={{
      left: `${8 + ((index * 11) % 84)}%`,
      top: "-4%",
      width: index % 3 === 0 ? 10 : 7,
      height: index % 3 === 0 ? 14 : 10,
      background: index % 2 === 0 ? "rgba(193,160,106,0.24)" : "rgba(145,163,152,0.22)",
      filter: "blur(0.2px)",
      borderRadius: "55% 45% 60% 40%",
    }}
  />
);

const SectionHeading = ({ kicker, title, body }: { kicker: string; title: string; body?: string }) => (
  <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
    <p className="text-[11px] uppercase tracking-[0.42em]" style={{ color: C.gold, fontFamily: F.sans }}>
      {kicker}
    </p>
    <h2 className="mt-4 text-4xl leading-[0.95] sm:text-5xl md:text-6xl" style={{ color: C.ink, fontFamily: F.display }}>
      {title}
    </h2>
    {body ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: C.muted, fontFamily: F.sans }}>{body}</p> : null}
  </motion.div>
);

const DetailChip = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-full border px-5 py-4 text-left" style={{ borderColor: C.line, background: "rgba(255,255,255,0.52)" }}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: C.line, background: C.goldSoft }}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em]" style={{ color: C.muted, fontFamily: F.sans }}>{label}</p>
        <p className="mt-1 text-sm sm:text-base" style={{ color: C.ink, fontFamily: F.serif }}>{value}</p>
      </div>
    </div>
  </div>
);

const CoupleStoryCard = ({ title, text, photoUrl, align = "left" }: { title: string; text: string; photoUrl?: string; align?: "left" | "right" }) => (
  <motion.div
    {...reveal}
    whileHover={{ y: -6 }}
    className={cn("grid gap-5 rounded-[34px] border p-5 sm:p-6 lg:grid-cols-[0.92fr_1.08fr]", align === "right" && "lg:grid-cols-[1.08fr_0.92fr]")}
    style={{ borderColor: C.line, background: "rgba(255,255,255,0.56)" }}
  >
    <div className={cn("overflow-hidden rounded-[28px] border", align === "right" && "lg:order-2")} style={{ borderColor: C.lineSoft }}>
      {photoUrl ? <img src={photoUrl} alt={title} className="h-[280px] w-full object-cover sm:h-[340px]" /> : <div className="flex h-[280px] items-center justify-center sm:h-[340px]" style={{ color: C.muted, fontFamily: F.sans }}>Add a story photo</div>}
    </div>
    <div className={cn("flex flex-col justify-center", align === "right" && "lg:order-1")}>
      <p className="text-[11px] uppercase tracking-[0.36em]" style={{ color: C.gold, fontFamily: F.sans }}>Couple Story</p>
      <h3 className="mt-3 text-3xl sm:text-4xl" style={{ color: C.ink, fontFamily: F.display }}>{title}</h3>
      <p className="mt-4 text-base leading-8" style={{ color: C.muted, fontFamily: F.sans }}>{text}</p>
    </div>
  </motion.div>
);

const RSVPSection = ({ invitationId, isDemo }: { invitationId: number | null; isDemo: boolean }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [attending, setAttending] = useState<"yes" | "maybe" | "no">("yes");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return toast.error("Please enter your name");
    if (!phone.trim() || phone.length < 10) return toast.error("Please enter a valid 10-digit phone number");
    if (isDemo) {
      toast("Demo preview only. RSVP works after publishing.", { icon: "i" });
      return;
    }
    setLoading(true);
    try {
      await submitRsvp(String(invitationId || ""), {
        guestName: name,
        guestPhone: phone,
        attending: attending === "yes" ? "YES" : attending === "maybe" ? "MAYBE" : "NO",
        guestCount,
      });
      setSubmitted(true);
    } catch {
      toast.error("Could not submit RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[32px] border px-6 py-12 text-center" style={{ borderColor: C.line, background: "rgba(255,255,255,0.06)" }}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border" style={{ borderColor: "rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.08)" }}>
          <Check color="#f5ede2" />
        </div>
        <h3 className="mt-5 text-4xl" style={{ color: C.parchment, fontFamily: F.display }}>Thank you, {name}</h3>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7" style={{ color: "rgba(245,237,226,0.76)", fontFamily: F.sans }}>
          Your RSVP has been received. We are delighted to celebrate this new chapter with you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 rounded-[34px] border p-6 sm:p-8 lg:grid-cols-[0.84fr_1.16fr]" style={{ borderColor: C.line, background: "rgba(255,255,255,0.04)" }}>
      <div>
        <p className="text-[11px] uppercase tracking-[0.38em]" style={{ color: "#d8c4a3", fontFamily: F.sans }}>RSVP</p>
        <h3 className="mt-4 text-4xl leading-[0.96] sm:text-5xl" style={{ color: C.parchment, fontFamily: F.display }}>
          Join us for one elegant evening.
        </h3>
        <p className="mt-4 text-sm leading-7" style={{ color: "rgba(245,237,226,0.74)", fontFamily: F.sans }}>
          A European-style engagement invitation should feel intimate and curated, so the RSVP remains simple and beautifully presented.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className="rounded-[18px] border px-4 py-4 outline-none" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", color: C.parchment, fontFamily: F.sans }} />
        <input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} maxLength={10} placeholder="Phone number" className="rounded-[18px] border px-4 py-4 outline-none" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", color: C.parchment, fontFamily: F.sans }} />
        <div className="grid gap-3 sm:grid-cols-3">
          {[{ value: "yes" as const, label: "Joyfully yes" }, { value: "maybe" as const, label: "Maybe" }, { value: "no" as const, label: "Cannot attend" }].map((option) => (
            <button key={option.value} type="button" onClick={() => setAttending(option.value)} className="rounded-[16px] border px-4 py-3 text-sm transition-all" style={{ borderColor: attending === option.value ? "#d8c4a3" : "rgba(255,255,255,0.14)", background: attending === option.value ? "rgba(193,160,106,0.18)" : "rgba(255,255,255,0.06)", color: C.parchment, fontFamily: F.sans }}>
              {option.label}
            </button>
          ))}
        </div>
        <input type="number" min={1} max={10} value={guestCount} onChange={(event) => setGuestCount(Number(event.target.value))} className="rounded-[18px] border px-4 py-4 outline-none" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", color: C.parchment, fontFamily: F.sans }} />
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm uppercase tracking-[0.24em]" style={{ background: `linear-gradient(135deg, ${C.gold}, #d7b686)`, color: C.darkPanel, fontFamily: F.sans }}>
          {loading ? <Sparkles size={16} className="animate-spin" /> : <Heart size={16} />}
          {loading ? "Sending" : "Send RSVP"}
        </button>
      </form>
    </div>
  );
};

const MidnightMoonlitTemplate = ({
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
  const photos = useMemo(() => getPhotos(data), [data]);
  const heroPhoto = data.couplePhotoUrl || photos[0]?.photoUrl || "";
  const storyPhotoOne = photos[1]?.photoUrl || heroPhoto;
  const storyPhotoTwo = photos[2]?.photoUrl || photos[1]?.photoUrl || heroPhoto;
  const celebration = data.events[0];
  const effectiveMusicUrl = data.musicUrl || data.effectiveMusicUrl || data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName = data.musicName || data.effectiveMusicName || data.templateDefaults.defaultMusicName;

  const storyOne = data.brideBio || "A quiet beginning, a familiar ease, and conversations that felt like they had been waiting for the right time.";
  const storyTwo = data.groomBio || "From thoughtful moments to a beautiful promise, their story now opens into a joyful celebration surrounded by the people they love.";
  const updateEventAt = (index: number, updates: Partial<EventData>) => {
    const nextEvents = [...data.events];
    nextEvents[index] = { ...nextEvents[index], ...updates };
    onUpdate({ events: nextEvents });
  };

  return (
    <div
      data-theme="midnight"
      className="min-h-screen overflow-x-hidden"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.4), transparent 18%), radial-gradient(circle at bottom right, rgba(145,163,152,0.16), transparent 20%), linear-gradient(180deg, #f4dfdf 0%, #f7eee8 32%, #f2e3cf 100%)",
        color: C.ink,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Allura&family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,700&family=Cormorant+Garamond:wght@400;500;600;700&family=Jost:wght@400;500;600;700&display=swap');`}</style>

      {mode !== "edit" && effectiveMusicUrl ? <FloatingMusicPlayer musicUrl={effectiveMusicUrl} musicName={effectiveMusicName} /> : null}

      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        {Array.from({ length: 14 }).map((_, index) => <PetalFloat key={index} index={index} />)}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),transparent_70%)]" />

        <motion.div
          {...reveal}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[42px] border p-3 shadow-[0_34px_100px_rgba(109,87,60,0.16)] sm:p-4"
          style={{
            borderColor: "rgba(255,255,255,0.6)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.48), rgba(255,255,255,0.22))",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="relative overflow-hidden rounded-[34px] border px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
            style={{
              borderColor: C.line,
              background:
                "linear-gradient(180deg, rgba(255,250,245,0.98) 0%, rgba(247,239,231,0.96) 100%)",
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at center, rgba(255,255,255,0.55), transparent 58%)" }} />
            <div className="pointer-events-none absolute inset-[18px] rounded-[28px] border" style={{ borderColor: C.lineSoft }} />
            <div className="pointer-events-none absolute left-1/2 top-[24px] h-[1px] w-40 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(193,160,106,0.6),transparent)] sm:w-56" />

            <BotanicalStem className="left-0 top-[-10px]" />
            <BotanicalStem className="right-0 top-[-8px]" reverse delay={1.1} />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border shadow-[0_18px_40px_rgba(109,87,60,0.12)]" style={{ borderColor: C.line, background: "radial-gradient(circle at 30% 30%, #fffdf9, #f0e4d5 70%, #dcc8b0 100%)" }}>
                <img src={GANESH_ICON_URL} alt="Ganesh icon" className="h-12 w-12" style={{ filter: "invert(59%) sepia(15%) saturate(842%) hue-rotate(353deg) brightness(91%) contrast(84%)", opacity: 0.95 }} />
              </div>

              <p className="mt-8 text-[11px] uppercase tracking-[0.48em]" style={{ color: C.gold, fontFamily: F.sans }}>
                Engagement Invitation
              </p>
              <p className="mt-4 text-xl sm:text-2xl" style={{ color: C.sageDeep, fontFamily: F.script }}>
                a beautifully gathered evening of love and promise
              </p>

              <h1 className="mt-6 text-5xl leading-[0.9] sm:text-6xl md:text-7xl" style={{ color: C.ink, fontFamily: F.display }}>
                <EditableText value={data.brideName} onSave={(value) => onUpdate({ brideName: value })} mode={mode} as="span" className="block" inputClassName="text-5xl sm:text-6xl md:text-7xl" placeholder="Bride name" />
                <span className="my-3 block text-4xl sm:text-5xl" style={{ color: C.gold, fontFamily: F.script }}>&amp;</span>
                <EditableText value={data.groomName} onSave={(value) => onUpdate({ groomName: value })} mode={mode} as="span" className="block" inputClassName="text-5xl sm:text-6xl md:text-7xl" placeholder="Groom name" />
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 sm:text-lg" style={{ color: C.muted, fontFamily: F.sans }}>
                together with their families request the pleasure of your presence as they celebrate the beginning of a beautiful new chapter.
              </p>

              <div className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-4">
                <div className="h-px flex-1" style={{ background: C.line }} />
                <Sparkles size={16} color={C.gold} />
                <div className="h-px flex-1" style={{ background: C.line }} />
              </div>

              <EditableText value={data.welcomeMessage} onSave={(value) => onUpdate({ welcomeMessage: value })} mode={mode} multiline as="p" className="mx-auto mt-8 max-w-2xl text-base leading-8 sm:text-lg" inputClassName="text-base sm:text-lg" placeholder="Write your engagement announcement..." />

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <DetailChip icon={<CalendarDays size={16} color={C.gold} />} label="Date" value={shortDate(data.weddingDate)} />
                <DetailChip icon={<Clock3 size={16} color={C.gold} />} label="Time" value={celebration?.eventTime ? formatTime(celebration.eventTime) : "Time to be announced"} />
                <DetailChip icon={<MapPin size={16} color={C.gold} />} label="Venue" value={celebration?.venueName || "Venue details"} />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.96fr_1.04fr]">
          <motion.div {...reveal} className="rounded-[34px] border p-5 sm:p-6" style={{ borderColor: C.line, background: "rgba(255,255,255,0.54)" }}>
            <div className="overflow-hidden rounded-[28px] border" style={{ borderColor: C.lineSoft }}>
              {heroPhoto ? <img src={heroPhoto} alt={`${data.brideName} and ${data.groomName}`} className="h-[360px] w-full object-cover sm:h-[460px]" /> : <div className="flex h-[360px] items-center justify-center sm:h-[460px]" style={{ color: C.muted, fontFamily: F.sans }}>Add a hero photo</div>}
            </div>
          </motion.div>

          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="rounded-[34px] border p-6 sm:p-8" style={{ borderColor: C.line, background: "rgba(255,255,255,0.54)" }}>
            <p className="text-[11px] uppercase tracking-[0.42em]" style={{ color: C.gold, fontFamily: F.sans }}>The Celebration</p>
            <h2 className="mt-4 text-4xl leading-[0.95] sm:text-5xl" style={{ color: C.ink, fontFamily: F.display }}>
              A beautifully styled sequence of celebrations.
            </h2>
            <p className="mt-5 text-base leading-8" style={{ color: C.muted, fontFamily: F.sans }}>
              This concept now supports multiple moments as well, so you can add, remove, and arrange each function while keeping the page light, romantic, and editorial.
            </p>

            <div className="mt-8 grid gap-4">
              {mode === "edit" ? (
                <>
                  {data.events.map((event, index) => (
                    <EditableEventCard
                      key={event.id || index}
                      event={event}
                      onUpdate={(updates) => updateEventAt(index, updates)}
                      onDelete={() =>
                        onUpdate({
                          events: data.events.filter((_, eventIndex) => eventIndex !== index),
                        })
                      }
                      mode={mode}
                      index={index}
                    />
                  ))}
                  <AddEventButton
                    onAdd={() =>
                      onUpdate({
                        events: [...data.events, createEmptyEvent()],
                      })
                    }
                    mode={mode}
                    maxEvents={8}
                    currentCount={data.events.length}
                  />
                </>
              ) : (
                data.events.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {data.events.map((event, index) => (
                      <div key={event.id || index} className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: C.line, background: "rgba(255,250,245,0.7)" }}>
                        <p className="text-[10px] uppercase tracking-[0.34em]" style={{ color: C.gold, fontFamily: F.sans }}>Celebration {index + 1}</p>
                        <h3 className="mt-3 text-3xl sm:text-4xl" style={{ color: C.ink, fontFamily: F.display }}>{event.eventName || "Engagement Celebration"}</h3>
                        <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: C.muted, fontFamily: F.sans }}>
                          {event.eventDate
                            ? `${formatEventDate(event.eventDate)}${event.eventTime ? ` | ${formatTime(event.eventTime)}` : ""}`
                            : "Date and time to be announced"}
                        </p>
                        <p className="mt-2 text-sm leading-7 sm:text-base" style={{ color: C.muted, fontFamily: F.sans }}>
                          {event.venueName || "Venue details"}
                          {event.venueAddress ? `, ${event.venueAddress}` : ""}
                        </p>
                        {event.mapsUrl ? <a href={event.mapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm" style={{ borderColor: C.line, color: C.ink, fontFamily: F.sans }}><MapPin size={16} color={C.gold} />Open map</a> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: C.line, background: "rgba(255,250,245,0.7)" }}>
                    <p className="text-sm leading-7 sm:text-base" style={{ color: C.muted, fontFamily: F.sans }}>Event details will appear here once added.</p>
                  </div>
                )
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border p-5" style={{ borderColor: C.line, background: "rgba(255,250,245,0.6)" }}>
                <p className="text-[10px] uppercase tracking-[0.34em]" style={{ color: C.gold, fontFamily: F.sans }}>Styling</p>
                <p className="mt-3 text-base leading-7" style={{ color: C.muted, fontFamily: F.sans }}>Paper tones, soft botanicals, and editorial typography keep the page looking premium and distinctly different from your current templates.</p>
              </div>
              <div className="rounded-[26px] border p-5" style={{ borderColor: C.line, background: "rgba(255,250,245,0.6)" }}>
                <p className="text-[10px] uppercase tracking-[0.34em]" style={{ color: C.gold, fontFamily: F.sans }}>Blessing Seal</p>
                <p className="mt-3 text-base leading-7" style={{ color: C.muted, fontFamily: F.sans }}>The Ganesh crest stays integrated into the stationery layout so it feels ceremonial, refined, and intentional.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading kicker="Our Story" title="A softer, more personal chapter" body="You asked for couple story and a more premium engagement page, so this section replaces the wedding-event grid with something more intimate and editorial." />
          <div className="mt-10 grid gap-6">
            <CoupleStoryCard title="How it began" text={storyOne} photoUrl={storyPhotoOne} />
            <CoupleStoryCard title="Why this day matters" text={storyTwo} photoUrl={storyPhotoTwo} align="right" />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading kicker="Gallery" title="Frames from the journey so far" body="The gallery stays elegant and spacious, with enough room for romance without becoming visually heavy." />
          <div className="mt-10">
            {mode === "edit" ? (
              <div className="rounded-[34px] border p-5 sm:p-6" style={{ borderColor: C.line, background: "rgba(255,255,255,0.54)" }}>
                <EditablePhotoGallery photos={data.galleryPhotos} defaultPhotos={data.templateDefaults.defaultPhotos} onUpdate={(items) => onUpdate({ galleryPhotos: items })} mode={mode} maxPhotos={10} invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {photos.map((photo, index) => (
                  <motion.div key={`${photo.photoUrl}-${index}`} {...reveal} transition={{ ...reveal.transition, delay: index * 0.05 }} whileHover={{ y: -6 }} className={cn("overflow-hidden rounded-[30px] border", index === 0 || index === 3 ? "xl:col-span-2" : "")} style={{ borderColor: C.line, background: "rgba(255,255,255,0.5)" }}>
                    <img src={photo.photoUrl} alt={`Couple memory ${index + 1}`} className="h-[260px] w-full object-cover sm:h-[320px]" loading="lazy" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {mode === "edit" ? (
        <section className="px-4 pb-8 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-[34px] border p-6 sm:p-8" style={{ borderColor: C.line, background: "rgba(255,255,255,0.54)" }}>
            <SectionHeading kicker="Music" title="Set the soundtrack" body="Choose the background music for this invitation experience." />
            <div className="mt-8">
              <EditableMusicPlayer musicUrl={data.musicUrl} musicName={data.musicName} defaultMusicUrl={data.templateDefaults.defaultMusicUrl} defaultMusicName={data.templateDefaults.defaultMusicName} onUpdate={(url, name) => onUpdate({ musicUrl: url, musicName: name })} mode={mode} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} invitationId={data.invitationId ?? undefined} />
            </div>
          </div>
        </section>
      ) : null}

      {mode !== "edit" && data.rsvpEnabled !== false ? (
        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl rounded-[38px] p-1" style={{ background: "linear-gradient(135deg, rgba(193,160,106,0.26), rgba(61,73,66,0.82))" }}>
            <div className="rounded-[36px] bg-[#292621] p-6 sm:p-8">
              <RSVPSection invitationId={data.invitationId} isDemo={mode === "demo"} />
            </div>
          </div>
        </section>
      ) : null}

      <footer className={cn("px-4 pb-20 pt-8 sm:px-6", mode === "edit" && "pb-36")}>
        <motion.div {...reveal} className="mx-auto max-w-5xl rounded-[34px] border px-6 py-10 text-center sm:px-10" style={{ borderColor: C.line, background: "rgba(255,255,255,0.48)" }}>
          <p className="text-[11px] uppercase tracking-[0.42em]" style={{ color: C.gold, fontFamily: F.sans }}>Sage Letter</p>
          <h2 className="mt-4 text-4xl sm:text-5xl" style={{ color: C.ink, fontFamily: F.display }}>{data.brideName} &amp; {data.groomName}</h2>
          <p className="mt-4 text-sm sm:text-base" style={{ color: C.muted, fontFamily: F.sans }}>Engagement Celebration | {shortDate(data.weddingDate)}</p>
          <p className="mx-auto mt-4 max-w-2xl text-xs leading-6" style={{ color: "rgba(44,38,32,0.5)", fontFamily: F.sans }}>Ganesh icon source: Ameya Narvankar via Wikimedia Commons, CC BY-SA 3.0.</p>
        </motion.div>
      </footer>

      {mode === "edit" ? <EditModeToolbar onSaveDraft={onSaveDraft} onPublish={onPublish} isSaving={isSaving} isPublishing={isPublishing} invitationId={data.invitationId} hasUnsavedChanges={true} /> : null}
    </div>
  );
};

export default MidnightMoonlitTemplate;
