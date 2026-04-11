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
import { createEmptyEvent, EventData, SectionVisibility, TemplateProps } from "@/templates/types";
import { formatEventDate, formatTime } from "@/utils/formatDate";
import {
  CalendarDays,
  Check,
  Clock3,
  Heart,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Stars,
} from "lucide-react";
import toast from "react-hot-toast";

const C = {
  bg: "#0c110f",
  surface: "rgba(20, 28, 24, 0.8)",
  surfaceStrong: "rgba(28, 38, 33, 0.92)",
  border: "rgba(222, 198, 154, 0.18)",
  text: "#f5ecdf",
  muted: "rgba(231, 219, 200, 0.72)",
  gold: "#d8b178",
  goldSoft: "rgba(216, 177, 120, 0.16)",
  sage: "rgba(142, 166, 143, 0.18)",
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

const VELVET_DRESS_COLORS = [
  { hex: "#1a2e28", name: "Deep Forest" },
  { hex: "#d8b178", name: "Gold" },
  { hex: "#8ea68f", name: "Sage" },
  { hex: "#2c3b34", name: "Dark Emerald" },
  { hex: "#f5ecdf", name: "Ivory" },
  { hex: "#6b7f5e", name: "Olive" },
];

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

/* Floating floral accents */
const generateFlowers = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    size: 18 + Math.random() * 18,
    duration: 10 + Math.random() * 8,
    delay: Math.random() * 8,
    drift: -40 + Math.random() * 80,
    rotate: -20 + Math.random() * 40,
  }));

const BOKEH = generateBokeh(30);
const FLOWERS = generateFlowers(10);
const HEARTS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${10 + Math.random() * 80}%`,
  size: 10 + Math.random() * 10,
  duration: 4 + Math.random() * 6,
  delay: Math.random() * 8,
  drift: -20 + Math.random() * 40,
}));

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

const FloatingFlowers = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {FLOWERS.map((flower) => (
      <motion.div
        key={flower.id}
        className="absolute"
        style={{ left: flower.left, bottom: -48, opacity: 0.22 }}
        animate={{
          y: [0, -720],
          x: [0, flower.drift],
          rotate: [0, flower.rotate, flower.rotate * -1],
          opacity: [0, 0.24, 0],
        }}
        transition={{
          duration: flower.duration,
          delay: flower.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width={flower.size}
          height={flower.size}
          viewBox="0 0 64 64"
          fill="none"
        >
          <ellipse cx="32" cy="14" rx="9" ry="14" fill={C.gold} fillOpacity="0.36" />
          <ellipse
            cx="50"
            cy="32"
            rx="9"
            ry="14"
            fill={C.gold}
            fillOpacity="0.28"
            transform="rotate(90 50 32)"
          />
          <ellipse cx="32" cy="50" rx="9" ry="14" fill={C.gold} fillOpacity="0.24" />
          <ellipse
            cx="14"
            cy="32"
            rx="9"
            ry="14"
            fill={C.gold}
            fillOpacity="0.28"
            transform="rotate(90 14 32)"
          />
          <circle cx="32" cy="32" r="6" fill="#f8e5bc" fillOpacity="0.7" />
        </svg>
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

const getEventTimeLabel = (event?: EventData | null) => {
  if (!event?.eventTime) return "Time to be announced";
  return formatTime(event.eventTime);
};

const getText = (
  data: TemplateProps["data"],
  key: string,
  fallback: string,
) => data.customTexts?.[key] || fallback;

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
          style={{
            borderColor: "rgba(216, 177, 120, 0.28)",
            background:
              "linear-gradient(180deg, rgba(32,45,39,0.96), rgba(61,56,37,0.9))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
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
  const [showHeroDatePicker, setShowHeroDatePicker] = useState(false);
  const [showHeroTimePicker, setShowHeroTimePicker] = useState(false);
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
  const customText = (key: string, fallback: string) => getText(data, key, fallback);
  const updateCustomText = (key: string, value: string) =>
    onUpdate({
      customTexts: {
        ...data.customTexts,
        [key]: value,
      },
    });
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
          "radial-gradient(circle at top, rgba(120, 153, 126, 0.16), transparent 26%), radial-gradient(circle at 85% 10%, rgba(216, 177, 120, 0.12), transparent 20%), linear-gradient(180deg, #08100d, #111916 38%, #090d0b)",
        color: C.text,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,700&family=Cormorant+Garamond:wght@400;500;600;700&family=Sora:wght@300;400;500;600&display=swap');`}</style>

      <BokehOverlay />
      <FloatingFlowers />

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
            style={{ background: "rgba(112, 151, 118, 0.22)" }}
          />
          <motion.div
            animate={{ x: [0, -24, 0], y: [0, 26, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-6%] top-[18%] h-72 w-72 rounded-full blur-3xl"
            style={{ background: "rgba(216, 177, 120, 0.16)" }}
          />
          <motion.div
            animate={{ x: [0, 18, 0], y: [0, -16, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-8%] left-[30%] h-56 w-56 rounded-full blur-3xl"
            style={{ background: "rgba(142, 166, 143, 0.14)" }}
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
              {["Engagement Celebration"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.32em]"
                  style={{
                    borderColor: C.border,
                    color: C.gold,
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
                  label: "Engagement Date",
                  value: firstEvent?.eventDate
                    ? shortDate(firstEvent.eventDate)
                    : "Date to be announced",
                  href: undefined as string | undefined,
                  note: customText("heroDateNote", "Celebrate with us"),
                  edit: mode === "edit" ? (
                    <div className="relative mt-3">
                      <button
                        type="button"
                        onClick={() => setShowHeroDatePicker((current) => !current)}
                        className="rounded-full border px-3 py-2 text-xs"
                        style={{ borderColor: C.border, color: C.gold, fontFamily: F.sans }}
                      >
                        Change date
                      </button>
                      {showHeroDatePicker && (
                        <div
                          className="absolute left-0 top-full z-20 mt-2 rounded-xl border p-3"
                          style={{ borderColor: C.border, background: C.surface }}
                        >
                          <input
                            type="date"
                            value={firstEvent?.eventDate || ""}
                            onChange={(event) => {
                              updateEventAt(0, { eventDate: event.target.value });
                              setShowHeroDatePicker(false);
                            }}
                            className="bg-transparent text-sm outline-none"
                            style={{ color: C.text, fontFamily: F.sans }}
                          />
                        </div>
                      )}
                    </div>
                  ) : null,
                },
                {
                  label: "Venue",
                  value: firstEvent?.venueName || "Venue Name",
                  href: firstEvent?.mapsUrl || undefined,
                  note: firstEvent?.venueAddress || "City, State",
                  edit: mode === "edit" ? (
                    <div className="mt-3 space-y-2">
                      <EditableText
                        value={firstEvent?.venueName || ""}
                        onSave={(value) => updateEventAt(0, { venueName: value })}
                        mode={mode}
                        as="p"
                        className="text-sm"
                        placeholder="Venue name"
                      />
                      <EditableText
                        value={firstEvent?.venueAddress || ""}
                        onSave={(value) => updateEventAt(0, { venueAddress: value })}
                        mode={mode}
                        as="p"
                        className="text-xs"
                        placeholder="Venue address"
                      />
                    </div>
                  ) : null,
                },
                {
                  label: "Engagement Time",
                  value: getEventTimeLabel(firstEvent),
                  href: undefined as string | undefined,
                  note: firstEvent?.eventName || "Ring ceremony",
                  edit: mode === "edit" ? (
                    <div className="relative mt-3">
                      <button
                        type="button"
                        onClick={() => setShowHeroTimePicker((current) => !current)}
                        className="rounded-full border px-3 py-2 text-xs"
                        style={{ borderColor: C.border, color: C.gold, fontFamily: F.sans }}
                      >
                        Change time
                      </button>
                      {showHeroTimePicker && (
                        <div
                          className="absolute left-0 top-full z-20 mt-2 rounded-xl border p-3"
                          style={{ borderColor: C.border, background: C.surface }}
                        >
                          <input
                            type="time"
                            value={firstEvent?.eventTime?.slice(0, 5) || ""}
                            onChange={(event) => {
                              updateEventAt(0, { eventTime: `${event.target.value}:00` });
                              setShowHeroTimePicker(false);
                            }}
                            className="bg-transparent text-sm outline-none"
                            style={{ color: C.text, fontFamily: F.sans }}
                          />
                        </div>
                      )}
                    </div>
                  ) : null,
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
                    {"note" in item && item.note ? (
                      <p
                        className="mt-2 text-xs leading-5"
                        style={{ color: C.muted, fontFamily: F.sans }}
                      >
                        {item.note}
                      </p>
                    ) : null}
                    {"edit" in item ? item.edit : null}
                  </>
                );
                return item.href && mode !== "edit" ? (
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
          <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
            <p
              className="text-[11px] uppercase tracking-[0.38em]"
              style={{ color: C.gold, fontFamily: F.sans }}
            >
              Celebrations
            </p>
            <EditableText
              value={customText(
                "eventsTitle",
                "A thoughtfully planned engagement celebration.",
              )}
              onSave={(value) => updateCustomText("eventsTitle", value)}
              mode={mode}
              as="h2"
              multiline
              className="mt-4 text-4xl leading-[0.96] sm:text-5xl md:text-6xl"
              inputClassName="text-4xl sm:text-5xl md:text-6xl"
              placeholder="Events section title"
            />
            <EditableText
              value={customText(
                "eventsBody",
                "From the first welcome to the final toast, share each engagement moment with the timing and venue your guests need.",
              )}
              onSave={(value) => updateCustomText("eventsBody", value)}
              mode={mode}
              multiline
              as="p"
              className="mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base"
              placeholder="Events section description"
            />
          </motion.div>
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
                    className="bg-[#f8f1e7] text-[#2f261f] border-[#d6bc93] shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
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
                  className="border-[#d6bc93] bg-[rgba(216,177,120,0.08)] text-[#e8c48a] hover:border-[#e8c48a] hover:text-[#f5ecdf] hover:bg-[rgba(216,177,120,0.14)]"
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
            <EditableText
              value={customText(
                "aboutTitle",
                "A joyful beginning, shared with the people who matter most.",
              )}
              onSave={(value) => updateCustomText("aboutTitle", value)}
              mode={mode}
              multiline
              as="h2"
              className="mt-4 text-4xl leading-[0.96] sm:text-5xl"
              inputClassName="text-4xl sm:text-5xl"
              placeholder="About section title"
            />
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
                key: "infoCard1",
                title: customText("infoCard1Title", "Proposal Story"),
                text: customText(
                  "infoCard1Body",
                  "A quiet yes, a happy family call, and now a date we cannot wait to celebrate with everyone we love.",
                ),
              },
              {
                key: "infoCard2",
                title: customText("infoCard2Title", "Dress Code"),
                text: customText(
                  "infoCard2Body",
                  "Elegant festive wear in jewel tones, soft metallics, or classic neutrals for an evening celebration.",
                ),
              },
              {
                key: "infoCard3",
                title: customText("infoCard3Title", "Guest Note"),
                text: customText(
                  "infoCard3Body",
                  "Please arrive 20 minutes early for welcome drinks, ring ceremony seating, and family portraits.",
                ),
              },
            ].map((item, idx) => (
              <motion.div
                key={item.key}
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
                  <EditableText
                    value={item.title}
                    onSave={(value) => updateCustomText(`${item.key}Title`, value)}
                    mode={mode}
                    as="span"
                    placeholder="Card title"
                  />
                </p>
                <EditableText
                  value={item.text}
                  onSave={(value) => updateCustomText(`${item.key}Body`, value)}
                  mode={mode}
                  multiline
                  as="p"
                  className="mt-4 text-sm leading-7"
                  placeholder="Card text"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <GoldOrnament className="my-4" />

      {/* Dress Code Color Palette */}
      <VelvetDressCodeSection
        mode={mode}
        title={customText("dressCodeTitle", "Dress Code")}
        body={customText(
          "dressCodeBody",
          "If possible, we would love for you to dress in these tones.",
        )}
        onUpdateCustomText={updateCustomText}
        data={data}
        onUpdate={onUpdate}
      />

      <GoldOrnament className="my-4" />

      {(data.showCountdown || mode === "edit") && (
        <section className="px-4 py-12 sm:py-16">
          <div
            className="mx-auto max-w-5xl rounded-[32px] border p-6 sm:p-8"
            style={{ borderColor: C.border, background: C.surface }}
          >
            {mode === "edit" && (
              <div className="mb-6 flex items-center justify-end gap-3">
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
                <p style={{ color: C.muted, fontFamily: F.sans }}>
                  Show countdown
                </p>
              </div>
            )}
            {data.showCountdown && (
              <>
                <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
                  <p
                    className="text-[11px] uppercase tracking-[0.38em]"
                    style={{ color: C.gold, fontFamily: F.sans }}
                  >
                    Countdown
                  </p>
                  <EditableText
                    value={customText(
                      "countdownTitle",
                      "The engagement evening is getting closer.",
                    )}
                    onSave={(value) => updateCustomText("countdownTitle", value)}
                    mode={mode}
                    multiline
                    as="h2"
                    className="mt-4 text-4xl leading-[0.96] sm:text-5xl md:text-6xl"
                    inputClassName="text-4xl sm:text-5xl md:text-6xl"
                    placeholder="Countdown title"
                  />
                  <EditableText
                    value={customText(
                      "countdownBody",
                      "Mark the engagement date and let the excitement build. We cannot wait to celebrate this special evening with family and friends.",
                    )}
                    onSave={(value) => updateCustomText("countdownBody", value)}
                    mode={mode}
                    multiline
                    as="p"
                    className="mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base"
                    placeholder="Countdown description"
                  />
                </motion.div>
                <div className="mt-8">
                  <CountDownStrip weddingDate={firstEvent?.eventDate || data.weddingDate} />
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
          <h2
            className="text-4xl sm:text-5xl"
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

/* ====== DRESS CODE COLOR PALETTE ====== */
const VelvetDressCodeSection = ({
  mode,
  title,
  body,
  onUpdateCustomText,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  title: string;
  body: string;
  onUpdateCustomText: (key: string, value: string) => void;
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const getColors = (): { hex: string; name: string }[] => {
    const saved = data.customTexts?.dressCodeColors;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* fall through */ }
    }
    return VELVET_DRESS_COLORS;
  };
  const colors = getColors();

  const updateColor = (index: number, hex: string) => {
    const updated = [...colors];
    updated[index] = { ...updated[index], hex };
    onUpdateCustomText("dressCodeColors", JSON.stringify(updated));
  };

  const addColor = () => {
    const updated = [...colors, { hex: "#cccccc", name: `Color ${colors.length + 1}` }];
    onUpdateCustomText("dressCodeColors", JSON.stringify(updated));
  };

  const removeColor = (index: number) => {
    const updated = colors.filter((_, i) => i !== index);
    onUpdateCustomText("dressCodeColors", JSON.stringify(updated));
  };

  return (
    <section className="px-4 py-12 sm:py-16">
      <div
        className="mx-auto max-w-5xl rounded-[32px] border p-6 text-center sm:p-8"
        style={{ borderColor: C.border, background: C.surface }}
      >
        <motion.p
          {...reveal}
          className="text-[11px] uppercase tracking-[0.38em]"
          style={{ color: C.gold, fontFamily: F.sans }}
        >
          <EditableText
            value={title}
            onSave={(val) => onUpdateCustomText("dressCodeTitle", val)}
            mode={mode}
            placeholder="Dress Code"
            className="block"
            as="span"
          />
        </motion.p>
        <motion.div
          {...reveal}
          transition={{ ...reveal.transition, delay: 0.1 }}
          className="mx-auto mt-4 max-w-md text-sm leading-7 sm:text-base"
          style={{ color: C.muted, fontFamily: F.serif }}
        >
          <EditableText
            value={body}
            onSave={(val) => onUpdateCustomText("dressCodeBody", val)}
            mode={mode}
            placeholder="Describe the colour palette or attire guidance."
            className="block"
            multiline
            as="p"
          />
        </motion.div>
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
          {colors.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={{ y: -6, scale: 1.04 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.45 }}
              className="relative h-14 w-11 rounded-lg md:h-[76px] md:w-14"
              style={{
                backgroundColor: c.hex,
                border:
                  c.hex === "#f5ecdf"
                    ? `1px solid rgba(231, 219, 200, 0.4)`
                    : `1px solid ${C.border}`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              }}
              title={c.name}
            >
              {mode === "edit" && (
                <>
                  <label className="absolute inset-0 cursor-pointer">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColor(i, e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </label>
                  {colors.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColor(i);
                      }}
                      className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] shadow-md hover:bg-red-600"
                      title="Remove color"
                    >
                      <Minus size={10} />
                    </button>
                  )}
                </>
              )}
            </motion.div>
          ))}
          {mode === "edit" && (
            <motion.button
              type="button"
              onClick={addColor}
              className="flex h-14 w-11 items-center justify-center rounded-lg border-2 border-dashed md:h-[76px] md:w-14"
              style={{ borderColor: C.border, color: C.muted }}
              title="Add color"
              whileHover={{ scale: 1.05 }}
            >
              <Plus size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
};

export default VelvetPromiseEngagementTemplate;
