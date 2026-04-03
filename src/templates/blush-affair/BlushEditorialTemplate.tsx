import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Heart } from "lucide-react";
import { TemplateProps, EventData } from "@/templates/types";
import {
  EditableEventCard,
  EditableMusicPlayer,
  EditablePhoto,
  EditablePhotoGallery,
  EditableText,
  AddEventButton,
  EditModeToolbar,
} from "@/components/inline-editor";
import FloatingMusicPlayer from "@/components/invitation/FloatingMusicPlayer";
import { formatEventDate, formatWeddingDate } from "@/utils/formatDate";
import { submitRsvp } from "@/api/rsvp";
import toast from "react-hot-toast";

const FONTS = {
  serif: "'Cormorant Garamond', serif",
  sans: "'Manrope', sans-serif",
  script: "'Parisienne', cursive",
};

const C = {
  line: "rgba(117, 90, 69, 0.22)",
  ink: "#241814",
  soft: "#695448",
  accent: "#a36f61",
  olive: "#71705b",
  dark: "#171311",
  paper: "#f6efe7",
};

const FALLBACKS = [
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80",
];

const getPhotos = (data: TemplateProps["data"]) =>
  data.galleryPhotos.length
    ? data.galleryPhotos
    : data.templateDefaults.defaultPhotos.length
      ? data.templateDefaults.defaultPhotos.map((photo, index) => ({
          photoUrl: photo.photoUrl,
          sortOrder: index,
          isDefault: true,
        }))
      : FALLBACKS.map((photoUrl, index) => ({ photoUrl, sortOrder: index, isDefault: true }));

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[0.38em]" style={{ fontFamily: FONTS.sans, color: C.soft }}>
    {children}
  </p>
);

const BlushEditorialTemplate = ({
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
  const hero = data.couplePhotoUrl || photos[0]?.photoUrl || FALLBACKS[0];
  const detail = data.bridePhotoUrl || data.groomPhotoUrl || photos[1]?.photoUrl || FALLBACKS[1];
  const effectiveMusicUrl = data.musicUrl || data.effectiveMusicUrl || data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName = data.musicName || data.effectiveMusicName || data.templateDefaults.defaultMusicName;

  return (
    <div className="min-h-screen" style={{ color: C.ink, background: "radial-gradient(circle at top left, rgba(216,191,158,0.32), transparent 22%), linear-gradient(180deg, #f7f1e8 0%, #f3ece3 38%, #ebe1d2 100%)" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Parisienne&display=swap');`}</style>

      <section className="px-5 pb-16 pt-8 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between">
            <Eyebrow>European Editorial Collection</Eyebrow>
            <div className="rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.28em]" style={{ borderColor: C.line, fontFamily: FONTS.sans, color: C.soft, background: "rgba(255,255,255,0.45)" }}>
              {mode === "edit" ? "Edit Mode" : "Wedding Invitation"}
            </div>
          </div>

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <Eyebrow>{data.events[0]?.venueName || "Florence, Italy"} • {formatWeddingDate(data.weddingDate)}</Eyebrow>
              <div className="mt-4" style={{ fontFamily: FONTS.serif }}>
                <EditableText value={data.brideName} onSave={(val) => onUpdate({ brideName: val })} mode={mode} placeholder="Bride Name" className="text-[4.1rem] leading-[0.88] sm:text-[5.5rem] md:text-[7rem]" as="h1" />
                <div className="ml-10 text-[4.1rem] leading-none sm:text-[5.5rem] md:text-[7rem]">&amp;</div>
                <EditableText value={data.groomName} onSave={(val) => onUpdate({ groomName: val })} mode={mode} placeholder="Groom Name" className="-mt-2 text-[4.1rem] leading-[0.88] sm:text-[5.5rem] md:text-[7rem]" as="h1" />
              </div>
              <div className="relative -mt-2 mb-8 ml-1 text-4xl sm:text-5xl" style={{ fontFamily: FONTS.script, color: C.accent }}>
                a weekend written like a love story
              </div>
              <EditableText value={data.welcomeMessage} onSave={(val) => onUpdate({ welcomeMessage: val })} mode={mode} placeholder="A romantic editorial invitation note..." className="max-w-xl text-base leading-8 text-stone-700 sm:text-lg" multiline as="p" />
              {mode === "edit" && (
                <div className="mt-8 w-fit rounded-[20px] border px-4 py-3" style={{ borderColor: C.line, background: "rgba(255,255,255,0.45)" }}>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.28em]" style={{ fontFamily: FONTS.sans, color: C.soft }}>Wedding Date</label>
                  <input type="date" value={data.weddingDate} onChange={(e) => onUpdate({ weddingDate: e.target.value })} className="rounded-xl border bg-white/70 px-4 py-2 text-sm" style={{ borderColor: C.line, color: C.ink, fontFamily: FONTS.sans }} />
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative mx-auto h-[640px] w-full max-w-[560px]">
              <div className="absolute right-10 top-0 h-[250px] w-[190px] rounded-[30px] border border-white/70 bg-white/60 p-3 shadow-[0_24px_60px_rgba(73,50,35,0.15)] backdrop-blur">
                <EditablePhoto photoUrl={detail} onSave={(url) => onUpdate({ bridePhotoUrl: url })} mode={mode} className="h-full w-full rounded-[22px]" alt="Detail portrait" placeholderText="Add Secondary Photo" invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} oldPublicUrl={data.bridePhotoUrl || undefined} />
              </div>
              <div className="absolute left-0 top-16 h-[460px] w-[340px] rounded-[40px] bg-[#efe4d3] p-4 shadow-[0_30px_80px_rgba(76,53,39,0.18)]">
                <EditablePhoto photoUrl={hero} onSave={(url) => onUpdate({ couplePhotoUrl: url })} mode={mode} className="h-full w-full rounded-[30px]" alt="Couple portrait" placeholderText="Add Hero Photo" invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} oldPublicUrl={data.couplePhotoUrl || undefined} />
              </div>
              <div className="absolute bottom-9 right-0 max-w-[280px] rounded-[28px] border p-6 shadow-[0_20px_60px_rgba(76,53,39,0.14)] backdrop-blur" style={{ borderColor: C.line, background: "rgba(251,247,241,0.92)" }}>
                <Eyebrow>Invitation Note</Eyebrow>
                <p className="mt-2 text-3xl leading-none" style={{ fontFamily: FONTS.serif }}>Join us for<br />dinner, vows,<br />and dancing</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[36px] border p-7 shadow-[0_20px_55px_rgba(56,39,28,0.08)]" style={{ borderColor: C.line, background: "rgba(255,250,245,0.6)" }}>
            <Eyebrow>Story Section</Eyebrow>
            <h2 className="mt-4 max-w-md text-5xl leading-[0.95]" style={{ fontFamily: FONTS.serif }}>Not a classic invite. More like a wedding editorial.</h2>
            <EditableText value={data.hashtag} onSave={(val) => onUpdate({ hashtag: val })} mode={mode} placeholder="#YourWeddingWeekend" className="mt-6 text-lg italic text-stone-700" as="p" />
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-3xl" style={{ fontFamily: FONTS.script, color: C.accent }}>{data.brideName?.split(" ")[0] || "Bride"}</h3>
                <EditableText value={data.brideBio} onSave={(val) => onUpdate({ brideBio: val })} mode={mode} placeholder="Bride bio" className="mt-3 text-base leading-7 text-stone-700" multiline as="p" />
              </div>
              <div>
                <h3 className="text-3xl" style={{ fontFamily: FONTS.script, color: C.accent }}>{data.groomName?.split(" ")[0] || "Groom"}</h3>
                <EditableText value={data.groomBio} onSave={(val) => onUpdate({ groomBio: val })} mode={mode} placeholder="Groom bio" className="mt-3 text-base leading-7 text-stone-700" multiline as="p" />
              </div>
            </div>
          </div>

          {mode === "edit" ? (
            <div className="rounded-[34px] border p-6" style={{ borderColor: C.line, background: "rgba(255,248,240,0.65)" }}>
              <EditablePhotoGallery photos={data.galleryPhotos} defaultPhotos={data.templateDefaults.defaultPhotos} onUpdate={(items) => onUpdate({ galleryPhotos: items })} mode={mode} maxPhotos={10} invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {photos.slice(2, 5).map((photo, index) => (
                <div key={`${photo.photoUrl}-${index}`} className="overflow-hidden rounded-[28px] border p-3 shadow-[0_18px_40px_rgba(56,39,28,0.10)]" style={{ borderColor: C.line, background: index % 2 === 0 ? "#efe4d7" : "rgba(255,255,255,0.68)" }}>
                  <img src={photo.photoUrl} alt={`Gallery ${index + 1}`} className="h-full w-full rounded-[22px] object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl rounded-[42px] border p-8 shadow-[0_22px_65px_rgba(56,39,28,0.09)] sm:p-10 lg:p-12" style={{ borderColor: C.line, background: "rgba(251,246,239,0.82)" }}>
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <Eyebrow>Schedule Design</Eyebrow>
              <h2 className="mt-4 text-5xl leading-none" style={{ fontFamily: FONTS.serif }}>A timeline styled like<br />luxury stationery</h2>
              <div className="mt-8 rounded-[28px] px-6 py-5 text-[#f5ecdf]" style={{ background: C.dark }}>
                <div className="text-[10px] uppercase tracking-[0.36em] text-[#d8c5ad]" style={{ fontFamily: FONTS.sans }}>RSVP Card Preview</div>
                <div className="mt-3 text-3xl" style={{ fontFamily: FONTS.serif }}>Reply by 20 May</div>
                <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em]" style={{ fontFamily: FONTS.sans }}>Confirm your seat <ArrowRight size={14} /></div>
              </div>
            </div>

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
              <div className="space-y-4">
                {data.events.map((event, index) => (
                  <motion.div key={event.id || index} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} className="grid gap-4 rounded-[26px] border bg-white/70 p-5 shadow-[0_14px_35px_rgba(56,39,28,0.08)] sm:grid-cols-[120px_1fr]" style={{ borderColor: C.line }}>
                    <div className="text-xs uppercase tracking-[0.34em]" style={{ fontFamily: FONTS.sans, color: C.soft }}>{event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long" }) : "Event"}</div>
                    <div>
                      <h3 className="text-3xl leading-none" style={{ fontFamily: FONTS.serif }}>{event.eventName}</h3>
                      <div className="mt-3 flex flex-wrap gap-5 text-xs uppercase tracking-[0.24em]" style={{ fontFamily: FONTS.sans, color: C.soft }}>
                        <span className="inline-flex items-center gap-2"><CalendarDays size={14} />{formatEventDate(event.eventDate)}</span>
                        {event.venueName && <span className="inline-flex items-center gap-2"><MapPin size={14} />{event.venueName}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {mode === "edit" && (
        <section className="px-5 pb-8 pt-2 sm:px-8 md:px-10 lg:px-14">
          <div className="mx-auto max-w-xl rounded-[28px] border p-5" style={{ borderColor: C.line, background: "rgba(255,249,241,0.82)" }}>
            <EditableMusicPlayer musicUrl={data.musicUrl} musicName={data.musicName} defaultMusicUrl={data.templateDefaults.defaultMusicUrl} defaultMusicName={data.templateDefaults.defaultMusicName} onUpdate={(url, name) => onUpdate({ musicUrl: url, musicName: name })} mode={mode} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} invitationId={data.invitationId ?? undefined} />
          </div>
        </section>
      )}

      {mode !== "edit" && data.rsvpEnabled !== false && <RsvpSection invitationId={data.invitationId} isDemo={mode === "demo"} />}

      <footer className={`px-5 py-16 text-center sm:px-8 md:px-10 lg:px-14 ${mode === "edit" ? "pb-32" : ""}`}>
        <div className="mx-auto max-w-3xl rounded-[34px] border px-6 py-12" style={{ borderColor: C.line, background: "rgba(255,248,240,0.65)" }}>
          <p className="text-4xl sm:text-5xl" style={{ fontFamily: FONTS.script, color: C.accent }}>{data.brideName?.split(" ")[0] || "Bride"} &amp; {data.groomName?.split(" ")[0] || "Groom"}</p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.38em]" style={{ fontFamily: FONTS.sans, color: C.soft }}>{formatWeddingDate(data.weddingDate)}</p>
          {data.hashtag && <p className="mt-5 text-lg" style={{ fontFamily: FONTS.serif, color: C.olive }}>{data.hashtag}</p>}
        </div>
      </footer>

      {mode === "edit" && <EditModeToolbar onSaveDraft={onSaveDraft} onPublish={onPublish} isSaving={isSaving} isPublishing={isPublishing} invitationId={data.invitationId} hasUnsavedChanges={true} />}
      {mode !== "edit" && effectiveMusicUrl && <FloatingMusicPlayer musicUrl={effectiveMusicUrl} musicName={effectiveMusicName} />}
    </div>
  );
};

const RsvpSection = ({ invitationId, isDemo }: { invitationId: number | null; isDemo: boolean }) => {
  const [attending, setAttending] = useState<"yes" | "maybe" | "no" | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) return setSubmitted(true);
    if (!invitationId || !attending) return;
    try {
      await submitRsvp(String(invitationId), { guestName: name, guestPhone: phone, attending: attending === "yes" ? "YES" : attending === "maybe" ? "MAYBE" : "NO", guestCount: attending === "no" ? 0 : guestCount });
      setSubmitted(true);
      toast.success("RSVP submitted!");
    } catch {
      toast.error("Failed to submit RSVP");
    }
  };

  if (submitted) {
    return <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14"><div className="mx-auto max-w-md rounded-[30px] border px-6 py-12 text-center" style={{ borderColor: C.line, background: "rgba(255,248,240,0.72)" }}><Heart className="mx-auto mb-4" style={{ color: C.accent }} fill={C.accent} /><h3 className="text-4xl" style={{ fontFamily: FONTS.script, color: C.accent }}>Thank you</h3></div></section>;
  }

  return (
    <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl rounded-[40px] border p-8 sm:p-10 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-10" style={{ borderColor: C.line, background: "rgba(251,246,239,0.86)" }}>
        <div className="mb-8 lg:mb-0">
          <Eyebrow>Reply Card</Eyebrow>
          <h2 className="mt-4 text-5xl leading-none" style={{ fontFamily: FONTS.serif }}>RSVP with the same<br />quiet luxury</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-[30px] border p-5 sm:p-6" style={{ borderColor: C.line, background: "rgba(255,255,255,0.62)" }}>
          <div className="flex flex-wrap gap-3">
            {[{ value: "yes" as const, label: "Attending" }, { value: "maybe" as const, label: "Maybe" }, { value: "no" as const, label: "Decline" }].map((opt) => (
              <button key={opt.value} type="button" onClick={() => setAttending(opt.value)} className="rounded-full px-5 py-3 text-xs uppercase tracking-[0.24em]" style={{ fontFamily: FONTS.sans, border: `1px solid ${attending === opt.value ? C.dark : C.line}`, background: attending === opt.value ? C.dark : "rgba(255,255,255,0.68)", color: attending === opt.value ? C.paper : C.soft }}>{opt.label}</button>
            ))}
          </div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required className="w-full rounded-[18px] border bg-white/70 px-4 py-3 text-sm" style={{ borderColor: C.line, fontFamily: FONTS.sans, color: C.ink }} />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full rounded-[18px] border bg-white/70 px-4 py-3 text-sm" style={{ borderColor: C.line, fontFamily: FONTS.sans, color: C.ink }} />
          {attending && attending !== "no" && <input type="number" min={1} max={10} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full rounded-[18px] border bg-white/70 px-4 py-3 text-sm" style={{ borderColor: C.line, fontFamily: FONTS.sans, color: C.ink }} />}
          <button type="submit" disabled={!attending} className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-xs uppercase tracking-[0.26em]" style={{ fontFamily: FONTS.sans, background: attending ? C.dark : "rgba(36,24,20,0.35)", color: C.paper }}>Send RSVP <ArrowRight size={14} /></button>
        </form>
      </div>
    </section>
  );
};

export default BlushEditorialTemplate;
