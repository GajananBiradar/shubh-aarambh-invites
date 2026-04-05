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
      });
    };

    tick();
    const interval = window.setInterval(tick, 60000);
    return () => window.clearInterval(interval);
  }, [weddingDate]);

  if (!timeLeft) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
      ].map((item) => (
        <motion.div
          key={item.label}
          whileHover={{ y: -4 }}
          className="rounded-[26px] border px-4 py-6 text-center"
          style={{ borderColor: C.border, background: C.goldSoft }}
        >
          <div
            className="text-4xl sm:text-5xl"
            style={{ color: C.text, fontFamily: F.display }}
          >
            {String(item.value).padStart(2, "0")}
          </div>
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
        <p
          className="mt-2 text-sm leading-6"
          style={{ color: C.muted, fontFamily: F.sans }}
        >
          {event.venueAddress}
        </p>
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

  return (
    <div
      data-theme="velvet"
      className="min-h-screen overflow-x-hidden"
      style={{
        background:
          "radial-gradient(circle at top, rgba(126,39,39,0.18), transparent 24%), linear-gradient(180deg, #080808, #121010 38%, #080808)",
        color: C.text,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,700&family=Cormorant+Garamond:wght@400;500;600;700&family=Sora:wght@300;400;500;600&display=swap');`}</style>

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
        </div>

        <motion.div
          {...reveal}
          className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div
            className="rounded-[34px] border p-6 sm:p-8 lg:p-10"
            style={{ borderColor: C.border, background: C.surface }}
          >
            <div className="flex flex-wrap gap-3">
              {[
                "Engagement Celebration",
                "Save The Date",
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
                },
                { label: "City", value: cityFromEvent(firstEvent) },
                {
                  label: "Hashtag",
                  value: data.hashtag || "#ForeverStartsNow",
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -4 }}
                  className="rounded-[24px] border p-4"
                  style={{ borderColor: C.border, background: C.surfaceStrong }}
                >
                  <div
                    className="break-words text-2xl leading-tight sm:text-3xl"
                    style={{ color: C.text, fontFamily: F.display }}
                  >
                    {item.value}
                  </div>
                  <p
                    className="mt-3 text-[11px] uppercase tracking-[0.32em]"
                    style={{ color: C.muted, fontFamily: F.sans }}
                  >
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="overflow-hidden rounded-[34px] border"
              style={{ borderColor: C.border, background: C.surfaceStrong }}
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
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
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
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -6 }}
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

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            kicker="Gallery"
            title="A few frames from our story so far."
            body="These images help the page feel personal from the first scroll, while still staying polished enough for a premium demo."
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
                    {...reveal}
                    transition={{ ...reveal.transition, delay: index * 0.05 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    className={cn(
                      "overflow-hidden rounded-[28px] border",
                      index === 0 || index === 3 ? "xl:col-span-2" : "",
                    )}
                    style={{ borderColor: C.border, background: C.surface }}
                  >
                    <img
                      src={photo.photoUrl}
                      alt={`Couple memory ${index + 1}`}
                      className="h-[260px] w-full object-cover sm:h-[320px]"
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

      <footer className={cn("px-4 pb-20 pt-8", mode === "edit" && "pb-36")}>
        <motion.div
          {...reveal}
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
