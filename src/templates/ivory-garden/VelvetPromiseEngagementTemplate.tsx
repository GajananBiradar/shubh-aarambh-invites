import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AddEventButton,
  EditableEventCard,
  EditableMusicPlayer,
  EditablePhoto,
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
  Stars,
} from "lucide-react";
import toast from "react-hot-toast";

const C = {
  bg: "#090909",
  surface: "rgba(255,255,255,0.05)",
  surfaceStrong: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.12)",
  text: "#f6efe7",
  muted: "rgba(246,239,231,0.74)",
  gold: "#d9ad67",
  goldSoft: "rgba(217,173,103,0.16)",
};

const F = {
  display: "'Bodoni Moda', serif",
  serif: "'Cormorant Garamond', serif",
  sans: "'Sora', sans-serif",
};

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
} as const;

/* Bokeh-style warm golden particles */
const generateBokeh = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 4 + Math.random() * 10,
    opacity: 0.1 + Math.random() * 0.35,
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 6,
    blur: 1 + Math.random() * 3,
  }));

/* Floating gold hearts */
const generateHearts = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    size: 8 + Math.random() * 10,
    duration: 5 + Math.random() * 7,
    delay: Math.random() * 8,
    drift: -20 + Math.random() * 40,
  }));

const BOKEH = generateBokeh(30);
const HEARTS = generateHearts(8);

/* Decorative gold ornament SVG */
const GoldOrnament = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 20"
    className={cn("mx-auto w-48 opacity-40", className)}
    fill="none"
  >
    <path
      d="M0 10h70c5 0 8-4 12-4s7 4 12 4h6c5 0 8-4 12-4s7 4 12 4h70"
      stroke={C.gold}
      strokeWidth="0.8"
    />
    <circle cx="100" cy="10" r="3" fill={C.gold} opacity="0.5" />
    <circle cx="80" cy="10" r="1.5" fill={C.gold} opacity="0.3" />
    <circle cx="120" cy="10" r="1.5" fill={C.gold} opacity="0.3" />
  </svg>
);

/* Overlay components */
const BokehOverlay = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {BOKEH.map((p) => (
      <motion.div
        key={p.id}
        className="absolute rounded-full"
        style={{
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          background: `radial-gradient(circle, ${C.gold}88, ${C.gold}22)`,
          filter: `blur(${p.blur}px)`,
        }}
        animate={{ opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const FloatingHearts = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {HEARTS.map((h) => (
      <motion.div
        key={h.id}
        className="absolute"
        style={{ left: h.left, bottom: -20, fontSize: h.size, color: C.gold, opacity: 0.25 }}
        animate={{ y: [0, -600], x: [0, h.drift], opacity: [0, 0.3, 0] }}
        transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: "easeOut" }}
      >
        ♥
      </motion.div>
    ))}
  </div>
);

const getDisplayPhotos = (data: TemplateProps["data"]) =>
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
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const cityFromEvent = (event?: EventData | null) => {
  if (!event?.venueAddress) return "Venue details";
  const parts = event.venueAddress.split(",");
  return parts[parts.length - 1]?.trim() || event.venueAddress;
};

const SectionHeading = ({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) => (
  <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
    <p
      className="text-[11px] uppercase tracking-[0.38em]"
      style={{ color: C.gold, fontFamily: F.sans }}
    >
      {kicker}
    </p>
    <h2
      className="mt-4 text-4xl leading-[0.96] sm:text-5xl md:text-6xl"
      style={{ color: C.text, fontFamily: F.display }}
    >
      {title}
    </h2>
    <p
      className="mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base"
      style={{ color: C.muted, fontFamily: F.sans }}
    >
      {body}
    </p>
  </motion.div>
);

const CountDownStrip = ({ weddingDate }: { weddingDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const tick = () => {
      if (!weddingDate) return setTimeLeft(null);
      const diff = new Date(weddingDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft(null);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [weddingDate]);

  if (!timeLeft) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
      ].map((item) => (
        <motion.div
          key={item.label}
          whileHover={{ y: -4 }}
          className="rounded-[26px] border px-4 py-6 text-center"
          style={{ borderColor: C.border, background: C.goldSoft }}
        >
          <motion.div
            key={item.value}
            initial={{ opacity: 0.6, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-4xl sm:text-5xl"
            style={{ color: C.text, fontFamily: F.display }}
          >
            {String(item.value).padStart(2, "0")}
          </motion.div>
          <p
            className="mt-2 text-[11px] uppercase tracking-[0.32em]"
            style={{ color: C.muted, fontFamily: F.sans }}
          >
            {item.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const PreviewEvent = ({
  event,
  index,
}: {
  event: EventData;
  index: number;
}) => (
  <motion.article
    {...reveal}
    transition={{ ...reveal.transition, delay: index * 0.08 }}
    whileHover={{ y: -6 }}
    className="rounded-[30px] border p-5 sm:p-7"
    style={{ borderColor: C.border, background: C.surface }}
  >
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-xl">
        <p
          className="text-[11px] uppercase tracking-[0.36em]"
          style={{ color: C.gold, fontFamily: F.sans }}
        >
          Event {String(index + 1).padStart(2, "0")}
        </p>
        <h3
          className="mt-3 text-3xl sm:text-4xl"
          style={{ color: C.text, fontFamily: F.display }}
        >
          {event.eventName}
        </h3>
        <p
          className="mt-4 text-base leading-7"
          style={{ color: C.muted, fontFamily: F.sans }}
        >
          {event.venueName}
        </p>
        {event.mapsUrl ? (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm leading-6 underline decoration-1 underline-offset-4 transition-colors hover:decoration-2"
            style={{ color: C.gold, fontFamily: F.sans }}
          >
            <MapPin size={14} />
            {event.venueAddress}
          </a>
        ) : (
          <p
            className="mt-2 text-sm leading-6"
            style={{ color: C.muted, fontFamily: F.sans }}
          >
            {event.venueAddress}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:min-w-[240px]">
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm"
          style={{ borderColor: C.border, color: C.text, fontFamily: F.sans }}
        >
          <CalendarDays size={16} color={C.gold} />
          {formatEventDate(event.eventDate)}
        </div>
        <div
          className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm"
          style={{ borderColor: C.border, color: C.text, fontFamily: F.sans }}
        >
          <Clock3 size={16} color={C.gold} />
          {formatTime(event.eventTime)}
        </div>
        {event.mapsUrl && (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm"
            style={{ borderColor: C.border, color: C.text, fontFamily: F.sans }}
          >
            <MapPin size={16} color={C.gold} />
            Open map
          </a>
        )}
      </div>
    </div>
  </motion.article>
);

const RSVPSection = ({
  invitationId,
  isDemo,
}: {
  invitationId: number | null;
  isDemo: boolean;
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [attending, setAttending] = useState<"yes" | "maybe" | "no">("yes");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return toast.error("Please enter your name");
    if (!phone.trim() || phone.length < 10) {
      return toast.error("Please enter a valid 10-digit phone number");
    }
    if (isDemo) {
      toast("Demo preview only. RSVP works after publishing.", { icon: "i" });
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
      <div
        className="rounded-[32px] border px-6 py-12 text-center"
        style={{ borderColor: C.border, background: C.surfaceStrong }}
      >
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: C.goldSoft }}
        >
          <Check color={C.gold} />
        </div>
        <h3
          className="mt-5 text-4xl"
          style={{ color: C.text, fontFamily: F.display }}
        >
          Thank you, {name}
        </h3>
        <p
          className="mt-4 text-sm leading-7"
          style={{ color: C.muted, fontFamily: F.sans }}
        >
          Your RSVP has been received. We are excited to celebrate this
          beautiful beginning with you.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-8 rounded-[32px] border p-6 sm:p-8 lg:grid-cols-[0.78fr_1.22fr]"
      style={{ borderColor: C.border, background: C.surface }}
    >
      <div>
        <p
          className="text-[11px] uppercase tracking-[0.38em]"
          style={{ color: C.gold, fontFamily: F.sans }}
        >
          RSVP
        </p>
        <h3
          className="mt-4 text-4xl leading-[0.96] sm:text-5xl"
          style={{ color: C.text, fontFamily: F.display }}
        >
          Will you join us for our engagement celebration?
        </h3>
        <p
          className="mt-4 text-sm leading-7"
          style={{ color: C.muted, fontFamily: F.sans }}
        >
          Please share your response before 5 February 2027 so seating, dinner
          service, and welcome hampers can be planned with care.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your full name"
          className="rounded-[20px] border px-4 py-4 outline-none"
          style={{
            borderColor: C.border,
            background: "rgba(0,0,0,0.18)",
            color: C.text,
            fontFamily: F.sans,
          }}
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
          maxLength={10}
          placeholder="Phone number"
          className="rounded-[20px] border px-4 py-4 outline-none"
          style={{
            borderColor: C.border,
            background: "rgba(0,0,0,0.18)",
            color: C.text,
            fontFamily: F.sans,
          }}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { value: "yes" as const, label: "Joyfully yes" },
            { value: "maybe" as const, label: "Maybe" },
            { value: "no" as const, label: "Cannot attend" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAttending(option.value)}
              className="rounded-[18px] border px-4 py-3 text-sm transition-all"
              style={{
                borderColor: attending === option.value ? C.gold : C.border,
                background:
                  attending === option.value ? C.goldSoft : "rgba(0,0,0,0.18)",
                color: C.text,
                fontFamily: F.sans,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          max={10}
          value={guestCount}
          onChange={(event) => setGuestCount(Number(event.target.value))}
          className="rounded-[20px] border px-4 py-4 outline-none"
          style={{
            borderColor: C.border,
            background: "rgba(0,0,0,0.18)",
            color: C.text,
            fontFamily: F.sans,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm uppercase tracking-[0.24em]"
          style={{
            background: `linear-gradient(135deg, ${C.gold}, #f0cc8a)`,
            color: "#20150f",
            fontFamily: F.sans,
          }}
        >
          {loading ? (
            <Sparkles size={16} className="animate-spin" />
          ) : (
            <Heart size={16} />
          )}
          {loading ? "Sending" : "Send RSVP"}
        </button>
      </form>
    </div>
  );
};

const VelvetPromiseEngagementTemplate = ({
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
  const photos = useMemo(() => getDisplayPhotos(data), [data]);
  const heroPhoto = data.couplePhotoUrl || photos[0]?.photoUrl || "";
  const bridePhoto = data.bridePhotoUrl || photos[1]?.photoUrl || heroPhoto;
  const groomPhoto = data.groomPhotoUrl || photos[2]?.photoUrl || heroPhoto;
  const firstEvent = data.events[0];
  const updateEventAt = (index: number, updates: Partial<EventData>) => {
    const nextEvents = [...data.events];
    nextEvents[index] = { ...nextEvents[index], ...updates };
    onUpdate({ events: nextEvents });
  };

  return (
    <div
      data-theme="velvet"
      className="relative min-h-screen overflow-x-hidden"
      style={{
        background:
          "radial-gradient(circle at top, rgba(126,39,39,0.18), transparent 24%), linear-gradient(180deg, #080808, #121010 38%, #080808)",
        color: C.text,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,700&family=Cormorant+Garamond:wght@400;500;600;700&family=Sora:wght@300;400;500;600&display=swap');`}</style>

      <BokehOverlay />
      <FloatingHearts />

      {mode !== "edit" && effectiveMusicUrl && (
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}

      <section className="relative px-4 pb-16 pt-6 sm:pb-20 sm:pt-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-8%] top-[-4%] h-64 w-64 rounded-full blur-3xl"
            style={{ background: "rgba(190,75,75,0.22)" }}
          />
          <motion.div
            animate={{ x: [0, -24, 0], y: [0, 26, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-6%] top-[18%] h-72 w-72 rounded-full blur-3xl"
            style={{ background: "rgba(217,173,103,0.16)" }}
          />
          <motion.div
            animate={{ x: [0, 18, 0], y: [0, -16, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-8%] left-[30%] h-56 w-56 rounded-full blur-3xl"
            style={{ background: "rgba(217,173,103,0.10)" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div
            className="rounded-[34px] border p-6 sm:p-8 lg:p-10"
            style={{ borderColor: C.border, background: C.surface }}
          >
            <div className="flex flex-wrap gap-3">
              {[
                "Engagement Celebration",
                "Premium Editorial",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.32em]"
                  style={{
                    borderColor: C.border,
                    color: item === "Premium Editorial" ? C.muted : C.gold,
                    fontFamily: F.sans,
                  }}
                >
                  <Stars size={14} />
                  {item}
                </span>
              ))}
            </div>

            <p
              className="mt-8 text-[11px] uppercase tracking-[0.38em]"
              style={{ color: C.muted, fontFamily: F.sans }}
            >
              Together with our families
            </p>

            <div className="mt-4 space-y-1">
              <EditableText
                value={data.brideName}
                onSave={(value) => onUpdate({ brideName: value })}
                mode={mode}
                as="h1"
                className="block text-5xl leading-[0.9] sm:text-6xl md:text-7xl"
                inputClassName="text-5xl sm:text-6xl md:text-7xl"
                placeholder="Bride name"
              />
              <div
                className="text-3xl"
                style={{ color: C.gold, fontFamily: F.serif }}
              >
                &amp;
              </div>
              <EditableText
                value={data.groomName}
                onSave={(value) => onUpdate({ groomName: value })}
                mode={mode}
                as="h1"
                className="block text-5xl leading-[0.9] sm:text-6xl md:text-7xl"
                inputClassName="text-5xl sm:text-6xl md:text-7xl"
                placeholder="Groom name"
              />
            </div>

            <EditableText
              value={data.welcomeMessage}
              onSave={(value) => onUpdate({ welcomeMessage: value })}
              mode={mode}
              multiline
              as="p"
              className="mt-6 max-w-2xl text-base leading-8 sm:text-lg"
              inputClassName="text-base sm:text-lg"
              placeholder="Write your engagement announcement..."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Celebration Date",
                  value: shortDate(data.weddingDate),
                  href: undefined as string | undefined,
                },
                {
                  label: "Venue",
                  value: cityFromEvent(firstEvent),
                  href: firstEvent?.mapsUrl || undefined,
                },
                {
                  label: "Hashtag",
                  value: data.hashtag || "#ForeverStartsNow",
                  href: undefined as string | undefined,
                },
              ].map((item, idx) => {
                const inner = (
                  <>
                    <div
                      className="break-words text-2xl leading-tight sm:text-3xl"
                      style={{ color: C.text, fontFamily: F.display }}
                    >
                      {item.value}
                    </div>
                    <p
                      className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.32em]"
                      style={{ color: item.href ? C.gold : C.muted, fontFamily: F.sans }}
                    >
                      {item.href && <MapPin size={12} />}
                      {item.label}
                    </p>
                  </>
                );
                return item.href ? (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="block rounded-[24px] border p-4 transition-colors"
                    style={{ borderColor: C.border, background: C.surfaceStrong }}
                  >
                    {inner}
                  </motion.a>
                ) : (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="rounded-[24px] border p-4"
                    style={{ borderColor: C.border, background: C.surfaceStrong }}
                  >
                    {inner}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="overflow-hidden rounded-[34px] border shadow-lg"
              style={{ borderColor: C.border, background: C.surfaceStrong, boxShadow: `0 0 40px ${C.goldSoft}` }}
            >
              {mode === "edit" ? (
                <EditablePhoto
                  photoUrl={heroPhoto}
                  onSave={(url) => onUpdate({ couplePhotoUrl: url })}
                  mode={mode}
                  className="h-[380px] w-full object-cover sm:h-[460px] lg:h-[560px]"
                  alt="Couple portrait"
                  invitationId={data.invitationId ?? undefined}
                  oldPublicUrl={data.couplePhotoUrl || undefined}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                />
              ) : (
                <motion.img
                  initial={{ scale: 1.12, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                  src={heroPhoto}
                  alt={`${data.brideName} and ${data.groomName}`}
                  className="h-[380px] w-full object-cover sm:h-[460px] lg:h-[560px]"
                />
              )}
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  key: "bridePhotoUrl",
                  photo: bridePhoto,
                  alt: data.brideName,
                },
                {
                  key: "groomPhotoUrl",
                  photo: groomPhoto,
                  alt: data.groomName,
                },
              ].map((item) => (
                <motion.div
                  key={item.key}
                  whileHover={{ y: -4 }}
                  className="overflow-hidden rounded-[28px] border"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  {mode === "edit" ? (
                    <EditablePhoto
                      photoUrl={item.photo}
                      onSave={(url) =>
                        onUpdate({ [item.key]: url } as Partial<typeof data>)
                      }
                      mode={mode}
                      className="h-64 w-full object-cover"
                      alt={item.alt}
                      invitationId={data.invitationId ?? undefined}
                      oldPublicUrl={
                        item.key === "bridePhotoUrl"
                          ? data.bridePhotoUrl || undefined
                          : data.groomPhotoUrl || undefined
                      }
                      templateId={templateId}
                      sessionUUID={sessionUUID}
                      uploadStage={uploadStage}
                    />
                  ) : (
                    <img
                      src={item.photo}
                      alt={item.alt}
                      className="h-64 w-full object-cover"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <GoldOrnament className="my-4" />

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="Celebrations"
            title="A premium schedule for every event."
            body="Add or remove each function the same way you now do in Crimson, while keeping the editorial Ivory Garden look."
          />
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
            ) : data.events.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {data.events.map((event, index) => (
                  <motion.div
                    key={event.id || index}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: index * 0.08 }}
                    className="rounded-[28px] border p-5 sm:p-6"
                    style={{ borderColor: C.border, background: C.surfaceStrong }}
                  >
                    <p
                      className="text-[11px] uppercase tracking-[0.34em]"
                      style={{ color: C.gold, fontFamily: F.sans }}
                    >
                      Event {index + 1}
                    </p>
                    <h3
                      className="mt-3 text-3xl sm:text-4xl"
                      style={{ color: C.text, fontFamily: F.display }}
                    >
                      {event.eventName || "Celebration"}
                    </h3>
                    <p
                      className="mt-4 text-sm leading-7 sm:text-base"
                      style={{ color: C.muted, fontFamily: F.sans }}
                    >
                      {event.eventDate
                        ? `${formatEventDate(event.eventDate)}${event.eventTime ? ` | ${formatTime(event.eventTime)}` : ""}`
                        : "Date and time to be announced"}
                    </p>
                    <p
                      className="mt-2 text-sm leading-7 sm:text-base"
                      style={{ color: C.muted, fontFamily: F.sans }}
                    >
                      {event.venueName || "Venue details"}
                      {event.venueAddress ? `, ${event.venueAddress}` : ""}
                    </p>
                    {event.mapsUrl ? (
                      <a
                        href={event.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm"
                        style={{ borderColor: C.border, color: C.text, fontFamily: F.sans }}
                      >
                        <MapPin size={16} color={C.gold} />
                        Open map
                      </a>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-[28px] border p-6"
                style={{ borderColor: C.border, background: C.surfaceStrong }}
              >
                <p style={{ color: C.muted, fontFamily: F.sans }}>
                  Add your first celebration to start building the schedule.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            {...reveal}
            className="rounded-[32px] border p-6 sm:p-8"
            style={{ borderColor: C.border, background: C.surface }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.38em]"
              style={{ color: C.gold, fontFamily: F.sans }}
            >
              About The Couple
            </p>
            <h2
              className="mt-4 text-4xl leading-[0.96] sm:text-5xl"
              style={{ color: C.text, fontFamily: F.display }}
            >
              A joyful beginning, shared with the people who matter most.
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <h3
                  className="text-2xl"
                  style={{ color: C.text, fontFamily: F.display }}
                >
                  {data.brideName}
                </h3>
                <EditableText
                  value={data.brideBio}
                  onSave={(value) => onUpdate({ brideBio: value })}
                  mode={mode}
                  multiline
                  as="p"
                  className="mt-3 text-sm leading-7"
                  placeholder="Bride bio"
                />
              </div>
              <div>
                <h3
                  className="text-2xl"
                  style={{ color: C.text, fontFamily: F.display }}
                >
                  {data.groomName}
                </h3>
                <EditableText
                  value={data.groomBio}
                  onSave={(value) => onUpdate({ groomBio: value })}
                  mode={mode}
                  multiline
                  as="p"
                  className="mt-3 text-sm leading-7"
                  placeholder="Groom bio"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.08 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            {[
              {
                title: "Proposal Story",
                text: "A quiet yes, a happy family call, and now a date we cannot wait to celebrate with everyone we love.",
              },
              {
                title: "Dress Code",
                text: "Elegant festive wear in jewel tones, soft metallics, or classic neutrals for an evening celebration.",
              },
              {
                title: "Guest Note",
                text: "Please arrive 20 minutes early for welcome drinks, ring ceremony seating, and family portraits.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-[28px] border p-5"
                style={{ borderColor: C.border, background: C.surfaceStrong }}
              >
                <p
                  className="text-[11px] uppercase tracking-[0.34em]"
                  style={{ color: C.gold, fontFamily: F.sans }}
                >
                  {item.title}
                </p>
                <p
                  className="mt-4 text-sm leading-7"
                  style={{ color: C.muted, fontFamily: F.sans }}
                >
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <GoldOrnament className="my-4" />

      {(data.showCountdown || mode === "edit") && (
        <section className="px-4 py-12 sm:py-16">
          <div
            className="mx-auto max-w-5xl rounded-[32px] border p-6 sm:p-8"
            style={{ borderColor: C.border, background: C.surface }}
          >
            {mode === "edit" && (
              <div className="mb-6 flex items-center justify-between">
                <p style={{ color: C.muted, fontFamily: F.sans }}>
                  Show countdown
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate({ showCountdown: !data.showCountdown })
                  }
                  className={cn(
                    "relative h-7 w-14 rounded-full border",
                    data.showCountdown && "bg-white/10",
                  )}
                  style={{ borderColor: C.border }}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-5 w-5 rounded-full transition-all",
                      data.showCountdown ? "left-8" : "left-1",
                    )}
                    style={{ background: C.gold }}
                  />
                </button>
              </div>
            )}
            {data.showCountdown && (
              <>
                <SectionHeading
                  kicker="Countdown"
                  title="The evening is getting closer."
                  body="Mark the date and let the excitement build. We will be sharing our first celebration as an engaged couple with family and friends."
                />
                <div className="mt-8">
                  <CountDownStrip weddingDate={data.weddingDate} />
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <GoldOrnament className="my-4" />

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="Gallery"
            title="A few frames from our story so far."
            body="Every glance, every laugh, every stolen moment — captured and kept forever. These are the memories we hold closest to our hearts."
          />
          <div className="mt-10">
            {mode === "edit" ? (
              <EditablePhotoGallery
                photos={data.galleryPhotos}
                defaultPhotos={data.templateDefaults.defaultPhotos}
                onUpdate={(items) => onUpdate({ galleryPhotos: items })}
                mode={mode}
                maxPhotos={10}
                invitationId={data.invitationId ?? undefined}
                templateId={templateId}
                sessionUUID={sessionUUID}
                uploadStage={uploadStage}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {photos.map((photo, index) => (
                  <motion.div
                    key={`${photo.photoUrl}-${index}`}
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-5% 0px" }}
                    transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={cn(
                      "group overflow-hidden rounded-[28px] border",
                      index === 0 || index === 3 ? "xl:col-span-2" : "",
                    )}
                    style={{ borderColor: C.border, background: C.surface }}
                  >
                    <img
                      src={photo.photoUrl}
                      alt={`Couple memory ${index + 1}`}
                      className="h-[260px] w-full object-cover transition-transform duration-700 group-hover:scale-110 sm:h-[320px]"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {mode === "edit" && (
        <section className="px-4 pb-8">
          <div
            className="mx-auto max-w-3xl rounded-[32px] border p-6 sm:p-8"
            style={{ borderColor: C.border, background: C.surface }}
          >
            <SectionHeading
              kicker="Music"
              title="Set the soundtrack."
              body="Choose the background music that should play while guests explore the invitation."
            />
            <div className="mt-8">
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
          </div>
        </section>
      )}

      <GoldOrnament className="my-4" />

      {mode !== "edit" && data.rsvpEnabled !== false && (
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <RSVPSection
              invitationId={data.invitationId}
              isDemo={mode === "demo"}
            />
          </div>
        </section>
      )}

      <GoldOrnament className="my-4" />

      <footer className={cn("px-4 pb-20 pt-8", mode === "edit" && "pb-36")}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-6xl rounded-[32px] border p-8 text-center"
          style={{ borderColor: C.border, background: C.surface }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.38em]"
            style={{ color: C.gold, fontFamily: F.sans }}
          >
            Velvet Promise
          </p>
          <h2
            className="mt-4 text-4xl sm:text-5xl"
            style={{ color: C.text, fontFamily: F.display }}
          >
            {data.brideName} &amp; {data.groomName}
          </h2>
          <p
            className="mt-4 text-sm sm:text-base"
            style={{ color: C.muted, fontFamily: F.sans }}
          >
            Engagement Celebration | {shortDate(data.weddingDate)}
          </p>
        </motion.div>
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

export default VelvetPromiseEngagementTemplate;
