import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Heart,
  Gift,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createEmptyEvent,
  EventData,
  SectionVisibility,
  TemplateProps,
} from "@/templates/types";
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
import {
  formatEventDate,
  formatTime,
  formatWeddingDate,
} from "@/utils/formatDate";
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

const R2_BASE =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/6/photos";

// Header fallbacks (hero + detail photo)
const HERO_FALLBACK = `${R2_BASE}/couple1.jpg`;
const DETAIL_FALLBACK = `${R2_BASE}/couple2.webp`;

// Gallery fallbacks (separate from header)
const GALLERY_FALLBACKS = [
  `${R2_BASE}/couple3.jpg`,
  `${R2_BASE}/couple4.jpg`,
  `${R2_BASE}/couple5.jpg`,
  `${R2_BASE}/couple6.jpg`,
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
      : GALLERY_FALLBACKS.map((photoUrl, index) => ({
          photoUrl,
          sortOrder: index,
          isDefault: true,
        }));

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  story: true,
  events: true,
  gallery: true,
  families: true,
  footer: true,
  music: true,
  gifts: true,
  rsvp: true,
};

const getSectionVisibility = (data: TemplateProps["data"]) => ({
  ...DEFAULT_SECTION_VISIBILITY,
  ...(data.sectionVisibility || {}),
});

const SectionActionButton = ({
  label,
  onClick,
  variant = "remove",
}: {
  label: string;
  onClick: () => void;
  variant?: "remove" | "add";
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition-all"
    style={{
      borderColor:
        variant === "add" ? `${C.accent}88` : "rgba(163,111,97,0.22)",
      background:
        variant === "add"
          ? "linear-gradient(135deg, rgba(163,111,97,0.16), rgba(163,111,97,0.06))"
          : "rgba(23,19,17,0.38)",
      color: variant === "add" ? C.accent : C.soft,
      fontFamily: FONTS.sans,
    }}
  >
    {variant === "add" ? <Plus size={14} /> : <Trash2 size={14} />}
    {label}
  </button>
);

const HiddenSectionPlaceholder = ({
  title,
  onAdd,
}: {
  title: string;
  onAdd: () => void;
}) => (
  <section className="py-10 sm:py-12">
    <div className="mx-auto max-w-5xl px-6">
      <div
        className="rounded-[1.5rem] border px-6 py-8 text-center"
        style={{ background: "rgba(255,250,245,0.6)", borderColor: C.line }}
      >
        <p
          className="text-xs uppercase tracking-[0.32em]"
          style={{ color: C.soft, fontFamily: FONTS.sans }}
        >
          {title} hidden
        </p>
        <div className="mt-4 flex justify-center">
          <SectionActionButton
            label={`Add ${title}`}
            onClick={onAdd}
            variant="add"
          />
        </div>
      </div>
    </div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-[10px] uppercase tracking-[0.38em]"
    style={{ fontFamily: FONTS.sans, color: C.soft }}
  >
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
  const hero = data.couplePhotoUrl || HERO_FALLBACK;
  const detail = data.bridePhotoUrl || data.groomPhotoUrl || DETAIL_FALLBACK;
  const effectiveMusicUrl =
    data.musicUrl ||
    data.effectiveMusicUrl ||
    data.templateDefaults.defaultMusicUrl;
  const effectiveMusicName =
    data.musicName ||
    data.effectiveMusicName ||
    data.templateDefaults.defaultMusicName;
  const sectionVisibility = getSectionVisibility(data);

  const updateCustomText = (key: string, value: string) =>
    onUpdate({ customTexts: { ...data.customTexts, [key]: value } });

  return (
    <div
      className="min-h-screen"
      style={{
        color: C.ink,
        background:
          "radial-gradient(circle at top left, rgba(216,191,158,0.32), transparent 22%), linear-gradient(180deg, #f7f1e8 0%, #f3ece3 38%, #ebe1d2 100%)",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Parisienne&display=swap');`}</style>

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="px-5 pb-16 pt-8 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between">
            <Eyebrow>Wedding Invitation</Eyebrow>
            <div
              className="rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
              style={{
                borderColor: C.line,
                fontFamily: FONTS.sans,
                color: C.soft,
                background: "rgba(255,255,255,0.45)",
              }}
            >
              {mode === "edit" ? "Edit Mode" : "You're Invited"}
            </div>
          </div>

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Eyebrow>
                {data.events[0]?.venueName || "Wedding Venue"} •{" "}
                {formatWeddingDate(data.weddingDate)}
              </Eyebrow>
              <div className="mt-4" style={{ fontFamily: FONTS.serif }}>
                <EditableText
                  value={data.brideName}
                  onSave={(val) => onUpdate({ brideName: val })}
                  mode={mode}
                  placeholder="Bride Name"
                  className="text-[2.8rem] leading-[0.88] sm:text-[4.1rem] md:text-[5.5rem] lg:text-[7rem]"
                  as="h1"
                />
                <div className="ml-10 text-[2.8rem] leading-none sm:text-[4.1rem] md:text-[5.5rem] lg:text-[7rem]">
                  &amp;
                </div>
                <EditableText
                  value={data.groomName}
                  onSave={(val) => onUpdate({ groomName: val })}
                  mode={mode}
                  placeholder="Groom Name"
                  className="-mt-2 text-[2.8rem] leading-[0.88] sm:text-[4.1rem] md:text-[5.5rem] lg:text-[7rem]"
                  as="h1"
                />
              </div>
              <div
                className="relative -mt-2 mb-8 ml-1 text-2xl sm:text-4xl md:text-5xl"
                style={{ fontFamily: FONTS.script, color: C.accent }}
              >
                together with our families
              </div>
              <EditableText
                value={data.welcomeMessage}
                onSave={(val) => onUpdate({ welcomeMessage: val })}
                mode={mode}
                placeholder="Write your invitation message..."
                className="max-w-xl text-base leading-8 text-stone-700 sm:text-lg"
                multiline
                as="p"
              />
              {mode === "edit" && (
                <div
                  className="mt-8 w-fit rounded-[20px] border px-4 py-3"
                  style={{
                    borderColor: C.line,
                    background: "rgba(255,255,255,0.45)",
                  }}
                >
                  <label
                    className="mb-2 block text-[10px] uppercase tracking-[0.28em]"
                    style={{ fontFamily: FONTS.sans, color: C.soft }}
                  >
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    value={data.weddingDate}
                    onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                    className="rounded-xl border bg-white/70 px-4 py-2 text-sm"
                    style={{
                      borderColor: C.line,
                      color: C.ink,
                      fontFamily: FONTS.sans,
                    }}
                  />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[520px] md:h-[640px]"
            >
              <div className="absolute right-2 top-0 z-20 h-[160px] w-[130px] rounded-[20px] border border-white/70 bg-white/60 p-2 shadow-[0_24px_60px_rgba(73,50,35,0.15)] backdrop-blur sm:right-6 sm:h-[200px] sm:w-[160px] sm:rounded-[26px] sm:p-3 md:right-10 md:h-[250px] md:w-[190px] md:rounded-[30px]">
                <EditablePhoto
                  photoUrl={detail}
                  onSave={(url) => onUpdate({ bridePhotoUrl: url })}
                  mode={mode}
                  className="h-full w-full rounded-[14px] sm:rounded-[18px] md:rounded-[22px]"
                  alt="Detail portrait"
                  placeholderText="Add Secondary Photo"
                  invitationId={data.invitationId ?? undefined}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                  oldPublicUrl={data.bridePhotoUrl || undefined}
                />
              </div>
              <div className="absolute left-0 top-10 z-10 h-[300px] w-[220px] rounded-[28px] bg-[#efe4d3] p-3 shadow-[0_30px_80px_rgba(76,53,39,0.18)] sm:top-12 sm:h-[370px] sm:w-[280px] sm:rounded-[34px] sm:p-4 md:top-16 md:h-[460px] md:w-[340px] md:rounded-[40px]">
                <EditablePhoto
                  photoUrl={hero}
                  onSave={(url) => onUpdate({ couplePhotoUrl: url })}
                  mode={mode}
                  className="h-full w-full rounded-[20px] sm:rounded-[26px] md:rounded-[30px]"
                  alt="Couple portrait"
                  placeholderText="Add Hero Photo"
                  invitationId={data.invitationId ?? undefined}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                  oldPublicUrl={data.couplePhotoUrl || undefined}
                />
              </div>
              <div
                className="absolute bottom-4 right-0 z-30 max-w-[200px] rounded-[20px] border p-4 shadow-[0_20px_60px_rgba(76,53,39,0.14)] backdrop-blur sm:bottom-6 sm:max-w-[240px] sm:rounded-[24px] sm:p-5 md:bottom-9 md:max-w-[280px] md:rounded-[28px] md:p-6"
                style={{
                  borderColor: C.line,
                  background: "rgba(251,247,241,0.92)",
                }}
              >
                <Eyebrow>Save The Date</Eyebrow>
                <p
                  className="mt-2 text-3xl leading-none"
                  style={{ fontFamily: FONTS.serif }}
                >
                  {formatWeddingDate(data.weddingDate)}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Story Section (removable) ────────────────────── */}
      {sectionVisibility.story ? (
        <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div
              className="rounded-[36px] border p-7 shadow-[0_20px_55px_rgba(56,39,28,0.08)]"
              style={{
                borderColor: C.line,
                background: "rgba(255,250,245,0.6)",
              }}
            >
              <Eyebrow>Our Story</Eyebrow>
              <h2
                className="mt-4 max-w-md text-5xl leading-[0.95]"
                style={{ fontFamily: FONTS.serif }}
              >
                Two hearts, one beautiful journey ahead
              </h2>
              <EditableText
                value={data.hashtag}
                onSave={(val) => onUpdate({ hashtag: val })}
                mode={mode}
                placeholder="#YourHashtag"
                className="mt-6 text-lg italic text-stone-700"
                as="p"
              />
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3
                    className="text-3xl"
                    style={{ fontFamily: FONTS.script, color: C.accent }}
                  >
                    {data.brideName?.split(" ")[0] || "Bride"}
                  </h3>
                  <EditableText
                    value={data.brideBio}
                    onSave={(val) => onUpdate({ brideBio: val })}
                    mode={mode}
                    placeholder="Bride bio"
                    className="mt-3 text-base leading-7 text-stone-700"
                    multiline
                    as="p"
                  />
                </div>
                <div>
                  <h3
                    className="text-3xl"
                    style={{ fontFamily: FONTS.script, color: C.accent }}
                  >
                    {data.groomName?.split(" ")[0] || "Groom"}
                  </h3>
                  <EditableText
                    value={data.groomBio}
                    onSave={(val) => onUpdate({ groomBio: val })}
                    mode={mode}
                    placeholder="Groom bio"
                    className="mt-3 text-base leading-7 text-stone-700"
                    multiline
                    as="p"
                  />
                </div>
              </div>
              {mode === "edit" && (
                <div className="mt-6 flex justify-center">
                  <SectionActionButton
                    label="Remove Section"
                    onClick={() =>
                      onUpdate({
                        sectionVisibility: {
                          ...sectionVisibility,
                          story: false,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>

            {mode === "edit" ? (
              <div
                className="rounded-[34px] border p-6"
                style={{
                  borderColor: C.line,
                  background: "rgba(255,248,240,0.65)",
                }}
              >
                <EditablePhotoGallery
                  photos={data.galleryPhotos}
                  defaultPhotos={data.templateDefaults.defaultPhotos}
                  onUpdate={(items) => onUpdate({ galleryPhotos: items })}
                  mode={mode}
                  maxPhotos={8}
                  invitationId={data.invitationId ?? undefined}
                  templateId={templateId}
                  sessionUUID={sessionUUID}
                  uploadStage={uploadStage}
                />
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {photos.slice(0, 4).map((photo, index) => (
                  <div
                    key={`${photo.photoUrl}-${index}`}
                    className="overflow-hidden rounded-[28px] border p-3 shadow-[0_18px_40px_rgba(56,39,28,0.10)]"
                    style={{
                      borderColor: C.line,
                      background:
                        index % 2 === 0 ? "#efe4d7" : "rgba(255,255,255,0.68)",
                    }}
                  >
                    <img
                      src={photo.photoUrl}
                      alt={`Gallery ${index + 1}`}
                      className="h-[220px] w-full rounded-[22px] object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        mode === "edit" && (
          <HiddenSectionPlaceholder
            title="Our Story"
            onAdd={() =>
              onUpdate({
                sectionVisibility: { ...sectionVisibility, story: true },
              })
            }
          />
        )
      )}

      {/* ── Events / Schedule Section (removable) ───────── */}
      {sectionVisibility.events ? (
        <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
          <div
            className="mx-auto max-w-7xl rounded-[42px] border p-8 shadow-[0_22px_65px_rgba(56,39,28,0.09)] sm:p-10 lg:p-12"
            style={{
              borderColor: C.line,
              background: "rgba(251,246,239,0.82)",
            }}
          >
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <Eyebrow>Wedding Schedule</Eyebrow>
                <h2
                  className="mt-4 text-5xl leading-none"
                  style={{ fontFamily: FONTS.serif }}
                >
                  Celebrate with us
                  <br />
                  across the weekend
                </h2>
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
                      onDelete={() => {
                        const next = data.events.filter((_, i) => i !== index);
                        onUpdate({
                          events: next.length > 0 ? next : [createEmptyEvent()],
                        });
                      }}
                      mode={mode}
                      index={index}
                    />
                  ))}
                  <AddEventButton
                    onAdd={() =>
                      onUpdate({ events: [...data.events, createEmptyEvent()] })
                    }
                    mode={mode}
                    maxEvents={8}
                    currentCount={data.events.length}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {data.events.map((event, index) => (
                    <motion.div
                      key={event.id || index}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="grid gap-4 rounded-[26px] border bg-white/70 p-5 shadow-[0_14px_35px_rgba(56,39,28,0.08)] sm:grid-cols-[120px_1fr]"
                      style={{ borderColor: C.line }}
                    >
                      <div
                        className="text-xs uppercase tracking-[0.34em]"
                        style={{ fontFamily: FONTS.sans, color: C.soft }}
                      >
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString(
                              "en-US",
                              { weekday: "long" },
                            )
                          : "Event"}
                      </div>
                      <div>
                        <h3
                          className="text-3xl leading-none"
                          style={{ fontFamily: FONTS.serif }}
                        >
                          {event.eventName}
                        </h3>
                        <div
                          className="mt-3 flex flex-wrap gap-5 text-xs uppercase tracking-[0.24em]"
                          style={{ fontFamily: FONTS.sans, color: C.soft }}
                        >
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={14} />
                            {formatEventDate(event.eventDate)}
                          </span>
                          {event.eventTime && (
                            <span className="inline-flex items-center gap-2">
                              <Clock3 size={14} />
                              {formatTime(event.eventTime)}
                            </span>
                          )}
                          {event.venueName && (
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={14} />
                              {event.venueName}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {mode === "edit" && (
              <div className="mt-6 flex justify-center">
                <SectionActionButton
                  label="Remove Section"
                  onClick={() =>
                    onUpdate({
                      sectionVisibility: {
                        ...sectionVisibility,
                        events: false,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        </section>
      ) : (
        mode === "edit" && (
          <HiddenSectionPlaceholder
            title="Events"
            onAdd={() =>
              onUpdate({
                sectionVisibility: { ...sectionVisibility, events: true },
              })
            }
          />
        )
      )}

      {/* ── Gifts / Bank Account Section (removable) ──── */}
      {sectionVisibility.gifts !== false ? (
        <GiftsSection
          mode={mode}
          data={data}
          onUpdate={onUpdate}
          updateCustomText={updateCustomText}
          sectionVisibility={sectionVisibility}
        />
      ) : (
        mode === "edit" && (
          <HiddenSectionPlaceholder
            title="Gifts"
            onAdd={() =>
              onUpdate({
                sectionVisibility: { ...sectionVisibility, gifts: true },
              })
            }
          />
        )
      )}

      {/* ── Music Editor (edit mode only) ────────────────── */}
      {mode === "edit" && (
        <section className="px-5 pb-8 pt-2 sm:px-8 md:px-10 lg:px-14">
          <div
            className="mx-auto max-w-xl rounded-[28px] border p-5"
            style={{
              borderColor: C.line,
              background: "rgba(255,249,241,0.82)",
            }}
          >
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
        </section>
      )}

      {/* ── RSVP Section ─────────────────────────────────── */}
      {mode !== "edit" && data.rsvpEnabled !== false && (
        <RsvpSection
          invitationId={data.invitationId}
          isDemo={mode === "demo"}
        />
      )}

      {/* ── Footer (removable) ───────────────────────────── */}
      {sectionVisibility.footer ? (
        <footer
          className={`px-5 py-16 text-center sm:px-8 md:px-10 lg:px-14 ${mode === "edit" ? "pb-32" : ""}`}
        >
          <div
            className="mx-auto max-w-3xl rounded-[34px] border px-6 py-12"
            style={{
              borderColor: C.line,
              background: "rgba(255,248,240,0.65)",
            }}
          >
            <p
              className="text-4xl sm:text-5xl"
              style={{ fontFamily: FONTS.script, color: C.accent }}
            >
              {data.brideName?.split(" ")[0] || "Bride"} &amp;{" "}
              {data.groomName?.split(" ")[0] || "Groom"}
            </p>
            <p
              className="mt-3 text-[11px] uppercase tracking-[0.38em]"
              style={{ fontFamily: FONTS.sans, color: C.soft }}
            >
              {formatWeddingDate(data.weddingDate)}
            </p>
            {data.hashtag && (
              <p
                className="mt-5 text-lg"
                style={{ fontFamily: FONTS.serif, color: C.olive }}
              >
                {data.hashtag}
              </p>
            )}
            {mode === "edit" && (
              <div className="mt-6 flex justify-center">
                <SectionActionButton
                  label="Remove Section"
                  onClick={() =>
                    onUpdate({
                      sectionVisibility: {
                        ...sectionVisibility,
                        footer: false,
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        </footer>
      ) : (
        mode === "edit" && (
          <HiddenSectionPlaceholder
            title="Footer"
            onAdd={() =>
              onUpdate({
                sectionVisibility: { ...sectionVisibility, footer: true },
              })
            }
          />
        )
      )}

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
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}
    </div>
  );
};

/* ── Gifts Section ───────────────────────────────────────── */
const GiftsSection = ({
  mode,
  data,
  onUpdate,
  updateCustomText,
  sectionVisibility,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  updateCustomText: (key: string, value: string) => void;
  sectionVisibility: SectionVisibility;
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-[40px] border px-6 py-12 text-center sm:px-10"
          style={{
            borderColor: C.line,
            background: "rgba(255,250,245,0.82)",
            boxShadow: "0 28px 80px rgba(56,39,28,0.09)",
          }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(163,111,97,0.12)" }}
          >
            <Gift size={28} style={{ color: C.accent }} />
          </div>
          <Eyebrow>Gifts & Blessings</Eyebrow>
          <h2
            className="mt-4 text-5xl sm:text-6xl"
            style={{ fontFamily: FONTS.serif }}
          >
            <EditableText
              value={
                data.customTexts?.giftsHeading ||
                "Your Presence Is The Real Gift"
              }
              onSave={(val) => updateCustomText("giftsHeading", val)}
              mode={mode}
              placeholder="Your Presence Is The Real Gift"
              as="span"
            />
          </h2>
          <p
            className="mx-auto mt-5 max-w-3xl text-lg leading-8"
            style={{ color: C.soft, fontFamily: FONTS.sans }}
          >
            <EditableText
              value={
                data.customTexts?.giftsBody ||
                "If you wish to bless us as we begin our new journey together, you can use the details below."
              }
              onSave={(val) => updateCustomText("giftsBody", val)}
              mode={mode}
              placeholder="Add a message about gifts"
              as="span"
              multiline
            />
          </p>

          <div className="mt-10 flex justify-center">
            {mode === "edit" ? (
              <div
                className="w-full max-w-sm rounded-[28px] border px-6 py-10"
                style={{
                  borderColor: "rgba(163,111,97,0.4)",
                  backgroundColor: "rgba(163,111,97,0.08)",
                }}
              >
                <p
                  className="mb-4 text-[11px] uppercase tracking-[0.34em]"
                  style={{ color: C.accent, fontFamily: FONTS.sans }}
                >
                  Payment Details (editable)
                </p>
                <div
                  className="space-y-1 text-base"
                  style={{ color: C.soft, fontFamily: FONTS.sans }}
                >
                  <p>
                    <EditableText
                      value={
                        data.customTexts?.giftsUpi || "UPI ID: yourname@upi"
                      }
                      onSave={(val) => updateCustomText("giftsUpi", val)}
                      mode={mode}
                      placeholder="UPI ID: yourname@upi"
                      as="span"
                    />
                  </p>
                  <p>
                    <EditableText
                      value={
                        data.customTexts?.giftsAccountName ||
                        "A/C Name: Account Holder Name"
                      }
                      onSave={(val) =>
                        updateCustomText("giftsAccountName", val)
                      }
                      mode={mode}
                      placeholder="A/C Name: Account Holder Name"
                      as="span"
                    />
                  </p>
                  <p>
                    <EditableText
                      value={
                        data.customTexts?.giftsAccountNo ||
                        "A/C No: XXXX XXXX XXXX"
                      }
                      onSave={(val) => updateCustomText("giftsAccountNo", val)}
                      mode={mode}
                      placeholder="A/C No: XXXX XXXX XXXX"
                      as="span"
                    />
                  </p>
                  <p>
                    <EditableText
                      value={data.customTexts?.giftsIfsc || "IFSC: XXXX0001234"}
                      onSave={(val) => updateCustomText("giftsIfsc", val)}
                      mode={mode}
                      placeholder="IFSC: XXXX0001234"
                      as="span"
                    />
                  </p>
                </div>
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setRevealed((prev) => !prev)}
                className="w-full max-w-sm rounded-[28px] border px-6 py-10"
                style={{
                  borderColor: revealed ? "rgba(163,111,97,0.4)" : C.line,
                  backgroundColor: revealed
                    ? "rgba(163,111,97,0.08)"
                    : "rgba(255,255,255,0.7)",
                }}
              >
                {!revealed ? (
                  <div className="space-y-4">
                    <Gift
                      className="mx-auto"
                      size={28}
                      style={{ color: C.accent }}
                    />
                    <p
                      className="text-[11px] uppercase tracking-[0.34em]"
                      style={{ color: C.soft, fontFamily: FONTS.sans }}
                    >
                      Bank Details
                    </p>
                    <p className="text-2xl" style={{ fontFamily: FONTS.serif }}>
                      Tap to reveal
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <p
                      className="text-[11px] uppercase tracking-[0.34em]"
                      style={{ color: C.accent, fontFamily: FONTS.sans }}
                    >
                      Payment Option
                    </p>
                    <p className="text-2xl" style={{ fontFamily: FONTS.serif }}>
                      UPI / Bank Transfer
                    </p>
                    <div
                      className="space-y-1 text-base"
                      style={{ color: C.soft, fontFamily: FONTS.sans }}
                    >
                      <p>
                        {data.customTexts?.giftsUpi || "UPI ID: yourname@upi"}
                      </p>
                      <p>
                        {data.customTexts?.giftsAccountName ||
                          "A/C Name: Account Holder Name"}
                      </p>
                      <p>
                        {data.customTexts?.giftsAccountNo ||
                          "A/C No: XXXX XXXX XXXX"}
                      </p>
                      <p>
                        {data.customTexts?.giftsIfsc || "IFSC: XXXX0001234"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {mode === "edit" && (
          <div className="mt-6 flex justify-center">
            <SectionActionButton
              label="Remove Section"
              onClick={() =>
                onUpdate({
                  sectionVisibility: { ...sectionVisibility, gifts: false },
                })
              }
            />
          </div>
        )}
      </div>
    </section>
  );
};

/* ── RSVP Section (Golden Memo style) ────────────────────── */
const RsvpSection = ({
  invitationId,
  isDemo,
}: {
  invitationId: number | null;
  isDemo: boolean;
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "maybe" | "no">("yes");
  const [guestCount, setGuestCount] = useState(2);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (isDemo) {
      toast("This is a demo — create your invitation to receive real RSVPs", {
        icon: "✨",
      });
      return;
    }

    setLoading(true);
    try {
      await submitRsvp(String(invitationId || ""), {
        guestName: name,
        guestPhone: phone,
        attending:
          attending === "yes" ? "YES" : attending === "maybe" ? "MAYBE" : "NO",
        guestCount: attending === "no" ? 0 : guestCount,
        message: message || undefined,
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
      <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
        <div
          className="mx-auto max-w-md rounded-[30px] border px-6 py-12 text-center"
          style={{ borderColor: C.line, background: "rgba(255,248,240,0.72)" }}
        >
          <Heart
            className="mx-auto mb-4"
            size={30}
            style={{ color: C.accent }}
            fill={C.accent}
          />
          <h3
            className="text-4xl"
            style={{ fontFamily: FONTS.script, color: C.accent }}
          >
            Thank you, {name}
          </h3>
          <p
            className="mx-auto mt-4 max-w-sm text-base leading-7"
            style={{ color: C.soft, fontFamily: FONTS.sans }}
          >
            We're so happy you responded. Your RSVP has been received with love.
          </p>
        </div>
      </section>
    );
  }

  const options = [
    { value: "yes" as const, label: "Joyfully Accept" },
    { value: "maybe" as const, label: "Maybe" },
    { value: "no" as const, label: "Decline" },
  ];

  return (
    <section className="px-5 py-16 sm:px-8 md:px-10 lg:px-14">
      <div
        className="mx-auto max-w-6xl rounded-[40px] border p-8 sm:p-10 lg:grid lg:grid-cols-[0.82fr_1.18fr] lg:gap-10"
        style={{ borderColor: C.line, background: "rgba(251,246,239,0.86)" }}
      >
        <div className="mb-8 lg:mb-0">
          <Eyebrow>Kindly Respond</Eyebrow>
          <h2
            className="mt-4 text-5xl leading-none"
            style={{ fontFamily: FONTS.serif }}
          >
            Will you celebrate
            <br />
            with us?
          </h2>
          <p
            className="mt-5 max-w-md text-base leading-7"
            style={{ color: C.soft, fontFamily: FONTS.sans }}
          >
            We'd love to know if you can make it. Please fill in your details so
            we can prepare everything just right for you.
          </p>
          <div className="mt-6 space-y-3">
            {[
              "Confirm your attendance",
              "Let us know your guest count",
              "Leave a personal note for us",
            ].map((line) => (
              <div key={line} className="flex items-center gap-3">
                <Heart size={14} style={{ color: C.accent }} />
                <span
                  className="text-sm"
                  style={{ color: C.soft, fontFamily: FONTS.sans }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-[30px] border p-5 sm:p-6"
          style={{ borderColor: C.line, background: "rgba(255,255,255,0.62)" }}
        >
          <label className="grid gap-2">
            <span
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ color: C.soft, fontFamily: FONTS.sans }}
            >
              Guest Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full rounded-[18px] border bg-white/70 px-4 py-3 text-sm outline-none"
              style={{
                borderColor: C.line,
                fontFamily: FONTS.sans,
                color: C.ink,
              }}
            />
          </label>
          <label className="grid gap-2">
            <span
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ color: C.soft, fontFamily: FONTS.sans }}
            >
              Phone Number
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              required
              maxLength={10}
              placeholder="10-digit mobile number"
              className="w-full rounded-[18px] border bg-white/70 px-4 py-3 text-sm outline-none"
              style={{
                borderColor: C.line,
                fontFamily: FONTS.sans,
                color: C.ink,
              }}
            />
          </label>
          <div>
            <p
              className="mb-3 text-[11px] uppercase tracking-[0.3em]"
              style={{ color: C.soft, fontFamily: FONTS.sans }}
            >
              Response
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAttending(opt.value)}
                  className="rounded-[18px] border px-4 py-3 text-sm transition-all"
                  style={{
                    fontFamily: FONTS.sans,
                    borderColor: attending === opt.value ? C.accent : C.line,
                    background:
                      attending === opt.value
                        ? "rgba(163,111,97,0.08)"
                        : "rgba(255,255,255,0.68)",
                    color: attending === opt.value ? C.ink : C.soft,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {attending !== "no" && (
            <label className="grid gap-2">
              <span
                className="text-[11px] uppercase tracking-[0.3em]"
                style={{ color: C.soft, fontFamily: FONTS.sans }}
              >
                Guest Count
              </span>
              <input
                type="number"
                min={1}
                max={10}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full rounded-[18px] border bg-white/70 px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: C.line,
                  fontFamily: FONTS.sans,
                  color: C.ink,
                }}
              />
            </label>
          )}
          <label className="grid gap-2">
            <span
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ color: C.soft, fontFamily: FONTS.sans }}
            >
              Message
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Add a lovely note"
              className="w-full rounded-[18px] border bg-white/70 px-4 py-3 text-sm outline-none"
              style={{
                borderColor: C.line,
                fontFamily: FONTS.sans,
                color: C.ink,
              }}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-xs uppercase tracking-[0.26em]"
            style={{
              fontFamily: FONTS.sans,
              background: C.accent,
              color: C.paper,
            }}
          >
            {loading ? (
              <Sparkles size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {loading ? "Sending..." : "Send RSVP"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BlushEditorialTemplate;
