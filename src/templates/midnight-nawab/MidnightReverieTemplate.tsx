import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  MoonStar,
  Sparkles,
} from "lucide-react";
import { TemplateProps, EventData } from "@/templates/types";
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
import { formatEventDate, formatTime, formatWeddingDate } from "@/utils/formatDate";
import { submitRsvp } from "@/api/rsvp";
import toast from "react-hot-toast";

const FONTS = {
  serif: "'Cormorant Garamond', serif",
  sans: "'Manrope', sans-serif",
  script: "'Parisienne', cursive",
};

const C = {
  bg: "#09070d",
  bgSoft: "#15101b",
  card: "rgba(19, 14, 25, 0.82)",
  line: "rgba(223, 187, 121, 0.24)",
  gold: "#dfbb79",
  champagne: "#f4e7cf",
  muted: "#bca78a",
  plum: "#2a1426",
};

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80",
];

const DEFAULT_VIDEO =
  "https://cdn.coverr.co/videos/coverr-a-toast-under-string-lights-1562569482304?download=1080p";

const getPhotos = (data: TemplateProps["data"]) =>
  data.galleryPhotos.length > 0
    ? data.galleryPhotos
    : data.templateDefaults.defaultPhotos.length > 0
      ? data.templateDefaults.defaultPhotos.map((photo, index) => ({
          photoUrl: photo.photoUrl,
          sortOrder: index,
          isDefault: true,
        }))
      : FALLBACK_PHOTOS.map((photoUrl, index) => ({
          photoUrl,
          sortOrder: index,
          isDefault: true,
        }));

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-[10px] uppercase tracking-[0.36em]"
    style={{ fontFamily: FONTS.sans, color: C.muted }}
  >
    {children}
  </p>
);

const MidnightReverieTemplate = ({
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
  const heroPhoto = data.couplePhotoUrl || photos[0]?.photoUrl || FALLBACK_PHOTOS[0];
  const detailPhoto = data.bridePhotoUrl || data.groomPhotoUrl || photos[1]?.photoUrl || FALLBACK_PHOTOS[1];
  const effectiveMusicUrl =
    data.musicUrl || data.effectiveMusicUrl || data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName =
    data.musicName || data.effectiveMusicName || data.templateDefaults.defaultMusicName;
  const heroVideo = data.templateDefaults.defaultVideoUrl || DEFAULT_VIDEO;

  return (
    <div
      data-theme="midnight"
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top, rgba(97,53,82,0.26), transparent 24%), radial-gradient(circle at bottom right, rgba(223,187,121,0.08), transparent 18%), linear-gradient(180deg, #08060c 0%, #120d17 38%, #09070d 100%)",
        color: C.champagne,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Parisienne&display=swap');`}</style>

      <section className="relative min-h-[100dvh] overflow-hidden px-5 pb-16 pt-8 sm:px-8 md:px-10 lg:px-14">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster={heroPhoto}
          >
            <source src={heroVideo} />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,12,0.44),rgba(8,6,12,0.68)_35%,rgba(8,6,12,0.92)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 flex items-center justify-between">
            <Eyebrow>Premium Night Wedding</Eyebrow>
            <div
              className="rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
              style={{ borderColor: C.line, fontFamily: FONTS.sans, color: C.muted, background: "rgba(12,9,17,0.45)" }}
            >
              Cinematic Invitation
            </div>
          </div>

          <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <Eyebrow>{data.events[0]?.venueName || "Grand Ballroom"} • {formatWeddingDate(data.weddingDate)}</Eyebrow>
              <div className="mt-5" style={{ fontFamily: FONTS.serif }}>
                <EditableText value={data.brideName} onSave={(val) => onUpdate({ brideName: val })} mode={mode} placeholder="Bride Name" className="text-[4rem] leading-[0.88] sm:text-[5.5rem] md:text-[7rem]" as="h1" />
                <div className="ml-10 text-[4rem] leading-none sm:text-[5.5rem] md:text-[7rem]">&amp;</div>
                <EditableText value={data.groomName} onSave={(val) => onUpdate({ groomName: val })} mode={mode} placeholder="Groom Name" className="-mt-2 text-[4rem] leading-[0.88] sm:text-[5.5rem] md:text-[7rem]" as="h1" />
              </div>
              <div className="mb-8 ml-1 text-4xl sm:text-5xl" style={{ fontFamily: FONTS.script, color: C.gold }}>
                under the stars, we begin
              </div>
              <EditableText value={data.welcomeMessage} onSave={(val) => onUpdate({ welcomeMessage: val })} mode={mode} placeholder="A premium opening line..." className="max-w-xl text-base leading-8 text-[#eadcc5] sm:text-lg" multiline as="p" />

              {mode === "edit" && (
                <div className="mt-8 w-fit rounded-[20px] border px-4 py-3" style={{ borderColor: C.line, background: "rgba(15,11,20,0.54)" }}>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.28em]" style={{ fontFamily: FONTS.sans, color: C.muted }}>
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    value={data.weddingDate}
                    onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                    className="rounded-xl border bg-black/20 px-4 py-2 text-sm"
                    style={{ borderColor: C.line, color: C.champagne, fontFamily: FONTS.sans }}
                  />
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative mx-auto h-[600px] w-full max-w-[540px]">
              <div className="absolute right-10 top-0 h-[230px] w-[185px] rounded-[28px] border p-3 shadow-[0_24px_70px_rgba(0,0,0,0.35)]" style={{ borderColor: C.line, background: "rgba(18,12,24,0.72)" }}>
                <EditablePhoto photoUrl={detailPhoto} onSave={(url) => onUpdate({ bridePhotoUrl: url })} mode={mode} className="h-full w-full rounded-[20px]" alt="Detail portrait" placeholderText="Add Secondary Photo" invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} oldPublicUrl={data.bridePhotoUrl || undefined} />
              </div>
              <div className="absolute left-0 top-16 h-[430px] w-[330px] rounded-[36px] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.42)]" style={{ background: "rgba(23,16,27,0.86)" }}>
                <EditablePhoto photoUrl={heroPhoto} onSave={(url) => onUpdate({ couplePhotoUrl: url })} mode={mode} className="h-full w-full rounded-[28px]" alt="Couple portrait" placeholderText="Add Hero Photo" invitationId={data.invitationId ?? undefined} templateId={templateId} sessionUUID={sessionUUID} uploadStage={uploadStage} oldPublicUrl={data.couplePhotoUrl || undefined} />
              </div>
              <div className="absolute bottom-8 right-0 max-w-[270px] rounded-[28px] border p-6 backdrop-blur" style={{ borderColor: C.line, background: "rgba(16,11,21,0.82)" }}>
                <Eyebrow>Black Tie Evening</Eyebrow>
                <p className="mt-2 text-3xl leading-none" style={{ fontFamily: FONTS.serif }}>
                  Candlelight,
                  <br />
                  vows, and
                  <br />
                  a moonlit reception
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[34px] border p-7" style={{ borderColor: C.line, background: C.card }}>
            <Eyebrow>Couple Story</Eyebrow>
            <h2 className="mt-4 text-5xl leading-[0.95]" style={{ fontFamily: FONTS.serif }}>
              A love story
              <br />
              lit by city lights
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-3xl" style={{ fontFamily: FONTS.script, color: C.gold }}>
                  {data.brideName?.split(" ")[0] || "Bride"}
                </h3>
                <EditableText value={data.brideBio} onSave={(val) => onUpdate({ brideBio: val })} mode={mode} placeholder="Write the bride story..." className="mt-3 text-base leading-7 text-[#e8d8be]" multiline as="p" />
              </div>
              <div>
                <h3 className="text-3xl" style={{ fontFamily: FONTS.script, color: C.gold }}>
                  {data.groomName?.split(" ")[0] || "Groom"}
                </h3>
                <EditableText value={data.groomBio} onSave={(val) => onUpdate({ groomBio: val })} mode={mode} placeholder="Write the groom story..." className="mt-3 text-base leading-7 text-[#e8d8be]" multiline as="p" />
              </div>
            </div>
            <EditableText value={data.hashtag} onSave={(val) => onUpdate({ hashtag: val })} mode={mode} placeholder="#MidnightWedding" className="mt-8 text-lg italic text-[#d8c19b]" as="p" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {photos.slice(2, 5).map((photo, index) => (
              <div key={`${photo.photoUrl}-${index}`} className="overflow-hidden rounded-[28px] border p-3 shadow-[0_18px_40px_rgba(0,0,0,0.26)]" style={{ borderColor: C.line, background: index % 2 === 0 ? "rgba(26,17,29,0.84)" : "rgba(40,20,37,0.74)" }}>
                <img src={photo.photoUrl} alt={`Story ${index + 1}`} className="h-full w-full rounded-[20px] object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl rounded-[42px] border p-8 sm:p-10 lg:p-12" style={{ borderColor: C.line, background: "rgba(18,12,24,0.82)" }}>
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <Eyebrow>Evening Details</Eyebrow>
              <h2 className="mt-4 text-5xl leading-none" style={{ fontFamily: FONTS.serif }}>
                A schedule styled like
                <br />
                a luxury gala card
              </h2>
              <div className="mt-8 rounded-[28px] border px-6 py-5" style={{ borderColor: C.line, background: "rgba(8,6,12,0.55)" }}>
                <div className="text-[10px] uppercase tracking-[0.36em]" style={{ fontFamily: FONTS.sans, color: C.muted }}>
                  Dress Code
                </div>
                <div className="mt-3 text-3xl" style={{ fontFamily: FONTS.serif }}>
                  Black Tie
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em]" style={{ fontFamily: FONTS.sans, color: C.gold }}>
                  Velvet, candlelight, jewel tones <Sparkles size={14} />
                </div>
              </div>
            </div>

            {mode === "edit" ? (
              <div className="space-y-4">
                {data.events.map((event, index) => (
                  <EditableEventCard
                    key={event.id || index}
                    event={event}
                    onUpdate={(updates) => {
                      const next = [...data.events];
                      next[index] = { ...next[index], ...updates };
                      onUpdate({ events: next });
                    }}
                    onDelete={() => onUpdate({ events: data.events.filter((_, i) => i !== index) })}
                    mode={mode}
                    index={index}
                  />
                ))}
                <AddEventButton
                  onAdd={() =>
                    onUpdate({
                      events: [
                        ...data.events,
                        { id: null, eventName: "New Event", eventDate: "", eventTime: "", venueName: "", venueAddress: "", mapsUrl: null } as EventData,
                      ],
                    })
                  }
                  mode={mode}
                  maxEvents={8}
                  currentCount={data.events.length}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {data.events.map((event, index) => (
                  <motion.div key={event.id || index} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} className="grid gap-4 rounded-[26px] border p-5 sm:grid-cols-[120px_1fr]" style={{ borderColor: C.line, background: "rgba(9,7,13,0.55)" }}>
                    <div className="text-xs uppercase tracking-[0.34em]" style={{ fontFamily: FONTS.sans, color: C.muted }}>
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long" }) : "Event"}
                    </div>
                    <div>
                      <h3 className="text-3xl leading-none" style={{ fontFamily: FONTS.serif }}>{event.eventName}</h3>
                      <div className="mt-3 flex flex-wrap gap-5 text-xs uppercase tracking-[0.24em]" style={{ fontFamily: FONTS.sans, color: C.muted }}>
                        <span className="inline-flex items-center gap-2"><CalendarDays size={14} />{formatEventDate(event.eventDate)}</span>
                        {event.eventTime && <span className="inline-flex items-center gap-2"><Clock3 size={14} />{formatTime(event.eventTime)}</span>}
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

      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <Eyebrow>Gallery</Eyebrow>
            <h2 className="mt-4 text-5xl" style={{ fontFamily: FONTS.serif }}>
              After-dark elegance
            </h2>
          </div>
          {mode === "edit" ? (
            <div className="rounded-[34px] border p-6" style={{ borderColor: C.line, background: "rgba(18,12,24,0.72)" }}>
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
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-12 sm:grid-rows-2">
              {photos.slice(0, 5).map((photo, index) => {
                const layout = [
                  "sm:col-span-4 sm:row-span-2",
                  "sm:col-span-3 sm:row-span-1",
                  "sm:col-span-5 sm:row-span-1",
                  "sm:col-span-4 sm:row-span-1",
                  "sm:col-span-4 sm:row-span-1",
                ];
                return (
                  <div key={`${photo.photoUrl}-${index}`} className={`${layout[index] || "sm:col-span-4"} overflow-hidden rounded-[28px] border p-3`} style={{ borderColor: C.line, background: index % 2 === 0 ? "rgba(20,13,25,0.84)" : "rgba(42,20,38,0.72)" }}>
                    <img src={photo.photoUrl} alt={`Gallery ${index + 1}`} className="h-full w-full rounded-[20px] object-cover" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {mode === "edit" && (
        <section className="px-5 pb-8 pt-2 sm:px-8 md:px-10 lg:px-14">
          <div className="mx-auto max-w-xl rounded-[28px] border p-5" style={{ borderColor: C.line, background: "rgba(18,12,24,0.72)" }}>
            <EditableMusicPlayer
              musicUrl={data.musicUrl}
              musicName={data.musicName}
              defaultMusicUrl={data.templateDefaults.defaultMusicUrl}
              defaultMusicName={data.templateDefaults.defaultMusicName}
              onUpdate={(url, name) => onUpdate({ musicUrl: url, musicName: name })}
              mode={mode}
              templateId={templateId}
              sessionUUID={sessionUUID}
              uploadStage={uploadStage}
              invitationId={data.invitationId ?? undefined}
            />
          </div>
        </section>
      )}

      {mode !== "edit" && data.rsvpEnabled !== false && (
        <RsvpSection invitationId={data.invitationId} isDemo={mode === "demo"} />
      )}

      <footer className={mode === "edit" ? "px-5 py-16 pb-32 text-center sm:px-8 md:px-10 lg:px-14" : "px-5 py-16 text-center sm:px-8 md:px-10 lg:px-14"}>
        <div className="mx-auto max-w-3xl rounded-[34px] border px-6 py-12" style={{ borderColor: C.line, background: "rgba(16,11,21,0.72)" }}>
          <MoonStar className="mx-auto mb-4" style={{ color: C.gold }} />
          <p className="text-4xl sm:text-5xl" style={{ fontFamily: FONTS.script, color: C.gold }}>
            {data.brideName?.split(" ")[0] || "Bride"} &amp; {data.groomName?.split(" ")[0] || "Groom"}
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.38em]" style={{ fontFamily: FONTS.sans, color: C.muted }}>
            {formatWeddingDate(data.weddingDate)}
          </p>
          {data.hashtag && (
            <p className="mt-5 text-lg" style={{ fontFamily: FONTS.serif, color: C.gold }}>
              {data.hashtag}
            </p>
          )}
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
        <FloatingMusicPlayer musicUrl={effectiveMusicUrl} musicName={effectiveMusicName} />
      )}
    </div>
  );
};

const RsvpSection = ({
  invitationId,
  isDemo,
}: {
  invitationId: number | null;
  isDemo: boolean;
}) => {
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
      await submitRsvp(String(invitationId), {
        guestName: name,
        guestPhone: phone,
        attending: attending === "yes" ? "YES" : attending === "maybe" ? "MAYBE" : "NO",
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
      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-md rounded-[30px] border px-6 py-12 text-center" style={{ borderColor: C.line, background: "rgba(16,11,21,0.72)" }}>
          <Heart className="mx-auto mb-4" style={{ color: C.gold }} fill={C.gold} />
          <h3 className="text-4xl" style={{ fontFamily: FONTS.script, color: C.gold }}>
            Thank you
          </h3>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl rounded-[40px] border p-8 sm:p-10 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-10" style={{ borderColor: C.line, background: "rgba(18,12,24,0.82)" }}>
        <div className="mb-8 lg:mb-0">
          <Eyebrow>Reply Card</Eyebrow>
          <h2 className="mt-4 text-5xl leading-none" style={{ fontFamily: FONTS.serif }}>
            Reply for a night of
            <br />
            candlelight and celebration
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-[30px] border p-5 sm:p-6" style={{ borderColor: C.line, background: "rgba(9,7,13,0.55)" }}>
          <div className="flex flex-wrap gap-3">
            {[{ value: "yes" as const, label: "Attending" }, { value: "maybe" as const, label: "Maybe" }, { value: "no" as const, label: "Decline" }].map((opt) => (
              <button key={opt.value} type="button" onClick={() => setAttending(opt.value)} className="rounded-full px-5 py-3 text-xs uppercase tracking-[0.24em]" style={{ fontFamily: FONTS.sans, border: `1px solid ${attending === opt.value ? C.gold : C.line}`, background: attending === opt.value ? C.gold : "rgba(255,255,255,0.06)", color: attending === opt.value ? C.bg : C.champagne }}>
                {opt.label}
              </button>
            ))}
          </div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required className="w-full rounded-[18px] border bg-black/20 px-4 py-3 text-sm" style={{ borderColor: C.line, fontFamily: FONTS.sans, color: C.champagne }} />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full rounded-[18px] border bg-black/20 px-4 py-3 text-sm" style={{ borderColor: C.line, fontFamily: FONTS.sans, color: C.champagne }} />
          {attending && attending !== "no" && <input type="number" min={1} max={10} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full rounded-[18px] border bg-black/20 px-4 py-3 text-sm" style={{ borderColor: C.line, fontFamily: FONTS.sans, color: C.champagne }} />}
          <button type="submit" disabled={!attending} className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-xs uppercase tracking-[0.26em]" style={{ fontFamily: FONTS.sans, background: C.gold, color: C.bg, opacity: attending ? 1 : 0.6 }}>
            Send RSVP <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </section>
  );
};

export default MidnightReverieTemplate;
