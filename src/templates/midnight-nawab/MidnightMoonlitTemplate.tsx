import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MoonStar,
  Sparkles,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { TemplateProps, EventData } from "@/templates/types";
import {
  AddEventButton,
  EditableEventCard,
  EditableMusicPlayer,
  EditablePhotoGallery,
  EditableText,
  EditModeToolbar,
} from "@/components/inline-editor";
import FloatingMusicPlayer from "@/components/invitation/FloatingMusicPlayer";
import { formatEventDate, formatWeddingDate } from "@/utils/formatDate";
import { submitRsvp } from "@/api/rsvp";
import toast from "react-hot-toast";

const FONTS = {
  serif: "'Cormorant Garamond', serif",
  sans: "'Manrope', sans-serif",
  script: "'Great Vibes', cursive",
};

const C = {
  bg: "#120f24",
  bgSoft: "#1c1730",
  gold: "#e8ba76",
  goldSoft: "#f7dfb4",
  text: "#f6e7ca",
  muted: "#d0b28a",
  line: "rgba(232,186,118,0.24)",
  card: "rgba(20,16,38,0.72)",
  button: "rgba(36,31,53,0.88)",
};

const FALLBACKS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80",
];

const storyMilestones = [
  { year: "2018", label: "First Meet" },
  { year: "2022", label: "Engagement" },
  { year: "2024", label: "We’re Getting Married" },
  { year: "2028", label: "Reception" },
];

const getPhotos = (data: TemplateProps["data"]) =>
  data.galleryPhotos.length > 0
    ? data.galleryPhotos
    : data.templateDefaults.defaultPhotos.length > 0
      ? data.templateDefaults.defaultPhotos.map((photo, index) => ({
          photoUrl: photo.photoUrl,
          sortOrder: index,
          isDefault: true,
        }))
      : FALLBACKS.map((photoUrl, index) => ({ photoUrl, sortOrder: index, isDefault: true }));

const eventIcon = (eventName: string) => {
  const key = eventName.toLowerCase();
  if (key.includes("dinner")) return UtensilsCrossed;
  if (key.includes("reception")) return Wine;
  if (key.includes("wedding")) return Heart;
  return Sparkles;
};

const SectionTitle = ({ title }: { title: string }) => (
  <div className="text-center">
    <div className="mx-auto flex max-w-md items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8ba76] to-transparent" />
      <Sparkles size={14} style={{ color: C.gold }} />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8ba76] to-transparent" />
    </div>
    <h2 className="mt-3 text-4xl sm:text-5xl" style={{ fontFamily: FONTS.script, color: C.gold }}>
      {title}
    </h2>
  </div>
);

const CandleCluster = ({ align }: { align: "left" | "right" }) => (
  <div className={`pointer-events-none absolute bottom-0 hidden w-56 lg:block ${align === "left" ? "left-0" : "right-0"}`}>
    <div className="relative h-44">
      {[{ h: 110, w: 46, x: 34 }, { h: 88, w: 36, x: 0 }, { h: 76, w: 34, x: 96 }].map((candle, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-md border"
          style={{
            left: align === "left" ? candle.x : undefined,
            right: align === "right" ? candle.x : undefined,
            width: candle.w,
            height: candle.h,
            borderColor: C.line,
            background: "rgba(31,23,42,0.78)",
            filter: "drop-shadow(0 0 22px rgba(232,186,118,0.32))",
          }}
        >
          <div className="absolute inset-x-2 bottom-3 rounded-sm bg-gradient-to-t from-[#f7c173] via-[#fff0cd] to-white opacity-90" style={{ height: candle.h * 0.58 }} />
        </div>
      ))}
    </div>
  </div>
);

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
  const effectiveMusicUrl = data.musicUrl || data.effectiveMusicUrl || data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName = data.musicName || data.effectiveMusicName || data.templateDefaults.defaultMusicName;

  return (
    <div
      data-theme="midnight"
      className="min-h-screen overflow-hidden"
      style={{
        color: C.text,
        background:
          "radial-gradient(circle at 50% -10%, rgba(255,229,163,0.16), transparent 18%), radial-gradient(circle at 20% 20%, rgba(120,90,180,0.18), transparent 24%), linear-gradient(180deg, #090713 0%, #171129 38%, #120f24 100%)",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family=Manrope:wght@400;500;600;700&display=swap');`}</style>

      <section className="relative overflow-hidden px-5 pb-14 pt-8 sm:px-8 md:px-10 lg:px-14">
        <div
          className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 rounded-full"
          style={{
            width: 220,
            height: 220,
            background:
              "radial-gradient(circle, rgba(255,245,214,0.98) 0%, rgba(255,220,160,0.85) 35%, rgba(255,220,160,0.18) 68%, transparent 100%)",
            boxShadow: "0 0 90px rgba(255,224,170,0.42)",
          }}
        />
        <CandleCluster align="left" />
        <CandleCluster align="right" />

        <div className="pointer-events-none absolute inset-x-0 top-6">
          <div className="mx-auto flex max-w-5xl justify-center gap-3 opacity-80">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  width: i % 4 === 0 ? 5 : 3,
                  height: i % 4 === 0 ? 5 : 3,
                  background: "#ffd89b",
                  boxShadow: "0 0 12px rgba(255,216,155,0.95)",
                  transform: `translateY(${Math.sin(i * 0.7) * 9}px)`,
                }}
              />
            ))}
          </div>
          <div className="mx-auto mt-10 flex max-w-4xl justify-center gap-4 opacity-70">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: "#ffd89b",
                  boxShadow: "0 0 10px rgba(255,216,155,0.95)",
                  transform: `translateY(${Math.sin(i * 0.85) * 12}px)`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-90">
          {Array.from({ length: 90 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${(i * 29) % 100}%`,
                width: i % 5 === 0 ? 3 : 2,
                height: i % 5 === 0 ? 3 : 2,
                background: "rgba(255,224,170,0.92)",
                boxShadow: "0 0 8px rgba(255,224,170,0.9)",
                opacity: i % 4 === 0 ? 0.8 : 0.45,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-5xl pt-28 text-center sm:pt-32">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex justify-center">
              <MoonStar size={22} style={{ color: C.gold }} />
            </div>
            <EditableText value={data.brideName} onSave={(val) => onUpdate({ brideName: val })} mode={mode} placeholder="Bride Name" className="text-[4rem] leading-none sm:text-[5rem] md:text-[6rem]" inputClassName="text-[4rem] sm:text-[5rem] md:text-[6rem]" as="h1" />
            <div className="text-[4rem] leading-none sm:text-[5rem] md:text-[6rem]" style={{ fontFamily: FONTS.script, color: C.goldSoft }}>&amp;</div>
            <EditableText value={data.groomName} onSave={(val) => onUpdate({ groomName: val })} mode={mode} placeholder="Groom Name" className="-mt-2 text-[4rem] leading-none sm:text-[5rem] md:text-[6rem]" inputClassName="text-[4rem] sm:text-[5rem] md:text-[6rem]" as="h1" />
          </motion.div>

          <p className="mt-3 text-2xl sm:text-3xl" style={{ fontFamily: FONTS.serif, color: C.gold }}>
            Are Getting Married
          </p>

          {mode === "edit" ? (
            <div className="mt-6 flex justify-center">
              <input type="date" value={data.weddingDate} onChange={(e) => onUpdate({ weddingDate: e.target.value })} className="rounded-full border bg-black/20 px-5 py-3 text-sm" style={{ borderColor: C.line, color: C.text, fontFamily: FONTS.sans }} />
            </div>
          ) : (
            <p className="mt-6 text-3xl sm:text-4xl" style={{ fontFamily: FONTS.serif, color: C.goldSoft }}>
              {formatWeddingDate(data.weddingDate)}
            </p>
          )}

          <div className="mx-auto mt-8 w-fit rounded-full border px-8 py-4 shadow-[0_0_24px_rgba(232,186,118,0.12)]" style={{ borderColor: C.line, background: C.button }}>
            <span className="text-lg" style={{ fontFamily: FONTS.serif, color: C.goldSoft }}>
              Add to Calendar
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 md:px-10 lg:px-14">
        <SectionTitle title="Our Story" />
        <div className="mx-auto mt-10 max-w-6xl">
          <div className="flex flex-wrap items-start justify-center gap-6 lg:flex-nowrap">
            {storyMilestones.map((item, index) => (
              <div key={item.year} className="w-[210px] text-center">
                <div className="relative mx-auto h-[170px] w-[170px] rounded-full border p-2 shadow-[0_0_25px_rgba(232,186,118,0.12)]" style={{ borderColor: C.line, background: "rgba(20,16,38,0.5)" }}>
                  <img src={photos[index]?.photoUrl || FALLBACKS[index % FALLBACKS.length]} alt={item.label} className="h-full w-full rounded-full object-cover" />
                </div>
                <p className="mt-4 text-4xl" style={{ fontFamily: FONTS.serif, color: C.goldSoft }}>{item.year}</p>
                <p className="text-xl" style={{ fontFamily: FONTS.serif, color: C.text }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-[28px] border p-6 text-center" style={{ borderColor: C.line, background: C.card }}>
            <EditableText value={data.welcomeMessage} onSave={(val) => onUpdate({ welcomeMessage: val })} mode={mode} placeholder="Share your night-wedding story..." className="text-lg leading-8" multiline as="p" style={{ fontFamily: FONTS.serif, color: C.text } as React.CSSProperties} />
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 md:px-10 lg:px-14">
        <SectionTitle title="Wedding Events" />
        <div className="mx-auto mt-10 max-w-5xl">
          {mode === "edit" ? (
            <div className="space-y-4">
              {data.events.map((event, index) => (
                <EditableEventCard key={event.id || index} event={event} onUpdate={(updates) => {
                  const next = [...data.events];
                  next[index] = { ...next[index], ...updates };
                  onUpdate({ events: next });
                }} onDelete={() => onUpdate({ events: data.events.filter((_, i) => i !== index) })} mode={mode} index={index} />
              ))}
              <AddEventButton onAdd={() => onUpdate({ events: [...data.events, { id: null, eventName: "New Event", eventDate: "", eventTime: "", venueName: "", venueAddress: "", mapsUrl: null } as EventData] })} mode={mode} maxEvents={8} currentCount={data.events.length} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.events.map((event, index) => {
                const Icon = eventIcon(event.eventName);
                return (
                  <motion.div key={event.id || index} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-[8px] border p-6 text-center shadow-[0_0_24px_rgba(232,186,118,0.08)]" style={{ borderColor: C.line, background: "rgba(18,15,33,0.6)" }}>
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border" style={{ borderColor: C.line, color: C.gold }}>
                      <Icon size={26} />
                    </div>
                    <h3 className="text-2xl" style={{ fontFamily: FONTS.serif, color: C.goldSoft }}>{event.eventName}</h3>
                    <p className="mt-3 text-sm" style={{ fontFamily: FONTS.sans, color: C.muted }}>{formatEventDate(event.eventDate)}</p>
                    {event.eventTime && <p className="mt-1 text-sm" style={{ fontFamily: FONTS.sans, color: C.muted }}>{event.eventTime}</p>}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-5xl rounded-[34px] border p-6" style={{ borderColor: C.line, background: C.card }}>
          <SectionTitle title="Will you join us?" />
          <div className="mt-8">
            <RsvpSection invitationId={data.invitationId} isDemo={mode === "demo"} />
          </div>
        </div>
      </section>

      {mode === "edit" && (
        <section className="px-5 pb-8 pt-2 sm:px-8 md:px-10 lg:px-14">
          <div className="mx-auto max-w-xl rounded-[28px] border p-5" style={{ borderColor: C.line, background: C.card }}>
            <EditablePhotoGallery photos={data.galleryPhotos} defaultPhotos={data.templateDefaults.defaultPhotos} onUpdate={(items) => onUpdate({ galleryPhotos: items })} mode={mode} maxPhotos={10} invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />
            <div className="mt-5">
              <EditableMusicPlayer musicUrl={data.musicUrl} musicName={data.musicName} defaultMusicUrl={data.templateDefaults.defaultMusicUrl} defaultMusicName={data.templateDefaults.defaultMusicName} onUpdate={(url, name) => onUpdate({ musicUrl: url, musicName: name })} mode={mode} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} invitationId={data.invitationId ?? undefined} />
            </div>
          </div>
        </section>
      )}

      <footer className={mode === "edit" ? "px-5 py-16 pb-32 text-center sm:px-8 md:px-10 lg:px-14" : "px-5 py-16 text-center sm:px-8 md:px-10 lg:px-14"}>
        <MoonStar className="mx-auto mb-4" style={{ color: C.gold }} />
        <p className="text-4xl" style={{ fontFamily: FONTS.script, color: C.goldSoft }}>{data.brideName?.split(" ")[0] || "Bride"} &amp; {data.groomName?.split(" ")[0] || "Groom"}</p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.38em]" style={{ fontFamily: FONTS.sans, color: C.muted }}>{formatWeddingDate(data.weddingDate)}</p>
      </footer>

      {mode === "edit" && <EditModeToolbar onSaveDraft={onSaveDraft} onPublish={onPublish} isSaving={isSaving} isPublishing={isPublishing} invitationId={data.invitationId} hasUnsavedChanges={true} />}
      {mode !== "edit" && effectiveMusicUrl && <FloatingMusicPlayer musicUrl={effectiveMusicUrl} musicName={effectiveMusicName} />}
    </div>
  );
};

const RsvpSection = ({ invitationId, isDemo }: { invitationId: number | null; isDemo: boolean }) => {
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) return setSubmitted(true);
    if (!invitationId || !attending) return;
    try {
      await submitRsvp(String(invitationId), {
        guestName: name,
        guestPhone: email,
        attending: attending === "yes" ? "YES" : "NO",
        guestCount: attending === "no" ? 0 : guestCount,
      });
      setSubmitted(true);
      toast.success("RSVP submitted!");
    } catch {
      toast.error("Failed to submit RSVP");
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[24px] border px-6 py-10 text-center" style={{ borderColor: C.line, background: "rgba(12,10,23,0.65)" }}>
        <Heart className="mx-auto mb-4" style={{ color: C.gold }} fill={C.gold} />
        <h3 className="text-3xl" style={{ fontFamily: FONTS.script, color: C.goldSoft }}>Thank you</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap justify-center gap-4">
        <button type="button" onClick={() => setAttending("yes")} className="rounded-full border px-8 py-4 text-lg" style={{ borderColor: attending === "yes" ? C.gold : C.line, background: attending === "yes" ? "rgba(232,186,118,0.14)" : C.button, color: C.goldSoft, fontFamily: FONTS.serif }}>Yes, we&apos;ll be there!</button>
        <button type="button" onClick={() => setAttending("no")} className="rounded-full border px-8 py-4 text-lg" style={{ borderColor: attending === "no" ? C.gold : C.line, background: attending === "no" ? "rgba(232,186,118,0.14)" : C.button, color: C.goldSoft, fontFamily: FONTS.serif }}>Sorry, we can&apos;t make it.</button>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required className="rounded-full border bg-black/20 px-6 py-4 text-lg" style={{ borderColor: C.line, color: C.text, fontFamily: FONTS.serif }} />
        <input type="number" min={1} max={10} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} placeholder="Guest(s)" className="rounded-full border bg-black/20 px-6 py-4 text-lg" style={{ borderColor: C.line, color: C.text, fontFamily: FONTS.serif }} />
      </div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full rounded-full border bg-black/20 px-6 py-4 text-lg" style={{ borderColor: C.line, color: C.text, fontFamily: FONTS.serif }} />
    </form>
  );
};

export default MidnightMoonlitTemplate;
