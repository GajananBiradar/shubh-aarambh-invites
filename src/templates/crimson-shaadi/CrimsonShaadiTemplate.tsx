import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Gift, Heart, MapPin, Minus, Plus, Trash2 } from "lucide-react";
import {
  TemplateProps,
  EventData,
  SectionVisibility,
  StoryMilestone,
} from "@/templates/types";
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
import { formatWeddingDate, formatEventDate } from "@/utils/formatDate";
import { cn } from "@/lib/utils";
import { submitRsvp } from "@/api/rsvp";
import toast from "react-hot-toast";

/* --------------------------------------------------------------------------
   Crimson Shaadi Template
   Royal Indian wedding – warm maroon & gold, bokeh particles,
   golden floral mandala frame, grid event cards
   -------------------------------------------------------------------------- */

const C = {
  bg: "#1a0808",
  bgLight: "#2e1111",
  bgCard: "#3a1414",
  bgWarm: "#321010",
  text: "#f5e6d0",
  textMuted: "#c9a87c",
  gold: "#d4af37",
  goldLight: "#f6d776",
  goldDark: "#b8962e",
  cream: "#f5e6d0",
  maroon: "#4a1818",
  maroonDark: "#2a0c0c",
  maroonMid: "#5a2020",
  red: "#8b2020",
  white: "#ffffff",
  cardGold: "#c69c2f",
  cardBg: "linear-gradient(145deg, #4a2a10, #3a1808, #2a0c04)",
};

const goldGradient = {
  background: "linear-gradient(135deg, #d4af37, #f6d776, #b8962e)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

const FONTS = {
  script: "'Great Vibes', cursive",
  heading: "'Cinzel', serif",
  body: "'Cormorant Garamond', serif",
};

/* Gold SVG icon components for events instead of emojis */
const GoldIcon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} fill="url(#goldGrad)" />
    <defs>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="24" y2="24">
        <stop offset="0%" stopColor="#f6d776" />
        <stop offset="50%" stopColor="#d4af37" />
        <stop offset="100%" stopColor="#b8962e" />
      </linearGradient>
    </defs>
  </svg>
);

const eventIconSVG: Record<string, string> = {
  Mehndi:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  Mehendi:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  Haldi:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  Sangeet:
    "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
  Wedding: "M12 2L14.5 9.5 22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z",
  Reception:
    "M8 5h2v2H8V5zm0 4h2v2H8V9zm0 4h2v2H8v-2zm6-8h-2v2h2V5zm0 4h-2v2h2V9zm0 4h-2v2h2v-2zM6 1v2H4v16h6v2h4v-2h6V3h-2V1H6zm12 16H6V3h12v14z",
  Engagement:
    "M12 4a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm0 1.8a3.2 3.2 0 1 1 0 6.4a3.2 3.2 0 0 1 0-6.4ZM12 15.5c-3.4 0-6.5 1.35-8.8 3.55l1.3 1.35A10.72 10.72 0 0 1 12 17.3a10.72 10.72 0 0 1 7.5 3.1l1.3-1.35A12.53 12.53 0 0 0 12 15.5Zm6.3-9.8l.95 1.75l1.95.35l-1.4 1.4l.28 1.96l-1.78-.85l-1.78.85l.28-1.96l-1.4-1.4l1.95-.35l.95-1.75Z",
};

/* Bokeh-style particles - larger, warmer, like light bokeh */
const generateBokeh = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 4 + Math.random() * 12,
    opacity: 0.15 + Math.random() * 0.45,
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
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 8,
    drift: -20 + Math.random() * 40,
  }));

const getDisplayPhotos = (data: TemplateProps["data"]) =>
  data.galleryPhotos.length > 0
    ? data.galleryPhotos
    : data.templateDefaults.defaultPhotos.map((photo, index) => ({
        photoUrl: photo.photoUrl,
        sortOrder: index,
        isDefault: true,
      }));

const getHeroPhoto = (data: TemplateProps["data"]) =>
  data.couplePhotoUrl ||
  data.bridePhotoUrl ||
  data.groomPhotoUrl ||
  getDisplayPhotos(data)[0]?.photoUrl ||
  null;

const getPortraitPhoto = (data: TemplateProps["data"]) =>
  data.bridePhotoUrl ||
  data.couplePhotoUrl ||
  getDisplayPhotos(data)[0]?.photoUrl ||
  null;

const GANESH_IMAGE_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/1/photos/ganesh.png?v=20260407-1";

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  story: true,
  events: true,
  gallery: true,
  families: true,
  footer: true,
  music: true,
  dressCode: true,
  details: true,
};

const getCustomText = (
  data: TemplateProps["data"],
  key: string,
  fallback: string,
) => data.customTexts?.[key] || fallback;

const DRESS_COLORS = [
  { hex: "#4a1818", name: "Maroon" },
  { hex: "#d4af37", name: "Gold" },
  { hex: "#8b2020", name: "Crimson" },
  { hex: "#2a0c0c", name: "Dark Wine" },
  { hex: "#f5e6d0", name: "Cream" },
  { hex: "#b8962e", name: "Antique Gold" },
];

const getSectionVisibility = (data: TemplateProps["data"]) => ({
  ...DEFAULT_SECTION_VISIBILITY,
  ...(data.sectionVisibility || {}),
});

const getDefaultStoryMilestones = (
  data: TemplateProps["data"],
): StoryMilestone[] => {
  const weddingDate = data.weddingDate ? new Date(data.weddingDate) : null;
  const weddingMonth =
    weddingDate && !Number.isNaN(weddingDate.getTime())
      ? weddingDate.toLocaleString("en-US", { month: "long" })
      : "February";
  const weddingYear =
    weddingDate && !Number.isNaN(weddingDate.getTime())
      ? String(weddingDate.getFullYear())
      : "2027";

  return [
    {
      month: "March",
      year: "2018",
      title: "First Meet",
      venue: "Royale Resort",
      iconKey: "Haldi",
    },
    {
      month: "December",
      year: "2021",
      title: "Engagement",
      venue: "Family Villa",
      iconKey: "Engagement",
    },
    {
      month: weddingMonth,
      year: weddingYear,
      title: "Wedding",
      venue: data.events[0]?.venueName || "Grand Ballroom",
      iconKey: "Wedding",
    },
  ];
};

const getStoryMilestones = (data: TemplateProps["data"]) => {
  const existing = data.storyMilestones || [];
  if (existing.length > 0) {
    return existing.map((milestone, index) => ({
      ...getDefaultStoryMilestones(data)[index],
      ...milestone,
    }));
  }
  return getDefaultStoryMilestones(data);
};

const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-3 opacity-90 sm:gap-4">
      <div
        className="h-px w-20 sm:w-28"
        style={{
          background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
        }}
      />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1L10.9 7.1L17 9L10.9 10.9L9 17L7.1 10.9L1 9L7.1 7.1L9 1Z"
          fill={C.goldLight}
          opacity="0.95"
        />
      </svg>
      <div
        className="h-px w-28"
        style={{
          background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
        }}
      />
    </div>
    <h2
      className="mt-4 text-[2.7rem] sm:text-5xl md:text-6xl"
      style={{ fontFamily: FONTS.script, ...goldGradient }}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className="mt-3 text-sm sm:text-base"
        style={{ color: C.textMuted, fontFamily: FONTS.body }}
      >
        {subtitle}
      </p>
    )}
  </div>
);

const FloralBurst = () => (
  <svg width="360" height="160" viewBox="0 0 360 160" fill="none">
    <g opacity="0.9">
      <path
        d="M12 80H148"
        stroke="url(#burstGrad)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M212 80H348"
        stroke="url(#burstGrad)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M70 80L126 54L148 80L126 106L70 80Z"
        stroke="url(#burstGrad)"
        strokeWidth="1"
        fill="rgba(212,175,55,0.05)"
      />
      <path
        d="M290 80L234 54L212 80L234 106L290 80Z"
        stroke="url(#burstGrad)"
        strokeWidth="1"
        fill="rgba(212,175,55,0.05)"
      />
      <path
        d="M148 80C136 66 120 58 104 58C122 72 126 86 104 102C122 102 136 94 148 80Z"
        stroke="url(#burstGrad)"
        strokeWidth="1"
        fill="rgba(212,175,55,0.03)"
      />
      <path
        d="M212 80C224 66 240 58 256 58C238 72 234 86 256 102C238 102 224 94 212 80Z"
        stroke="url(#burstGrad)"
        strokeWidth="1"
        fill="rgba(212,175,55,0.03)"
      />
      <circle cx="180" cy="80" r="6" fill="url(#burstGrad)" opacity="0.9" />
      <circle
        cx="180"
        cy="80"
        r="16"
        stroke="url(#burstGrad)"
        strokeOpacity="0.35"
      />
      <circle cx="88" cy="80" r="2" fill={C.gold} opacity="0.55" />
      <circle cx="272" cy="80" r="2" fill={C.gold} opacity="0.55" />
    </g>
    <defs>
      <linearGradient id="burstGrad" x1="12" y1="20" x2="348" y2="140">
        <stop offset="0%" stopColor="#8a6020" />
        <stop offset="50%" stopColor="#f6d776" />
        <stop offset="100%" stopColor="#8a6020" />
      </linearGradient>
    </defs>
  </svg>
);

const HeroRingOrnaments = () => (
  <svg width="360" height="360" viewBox="0 0 360 360" fill="none">
    <defs>
      <linearGradient id="heroRingGrad" x1="24" y1="24" x2="336" y2="336">
        <stop offset="0%" stopColor="#8a6020" />
        <stop offset="50%" stopColor="#f6d776" />
        <stop offset="100%" stopColor="#8a6020" />
      </linearGradient>
    </defs>
    <g opacity="0.92">
      <circle
        cx="180"
        cy="180"
        r="146"
        stroke="url(#heroRingGrad)"
        strokeWidth="1.2"
        opacity="0.3"
      />
      <circle
        cx="180"
        cy="180"
        r="132"
        stroke="url(#heroRingGrad)"
        strokeWidth="1.1"
        opacity="0.55"
      />
      <circle
        cx="180"
        cy="180"
        r="118"
        stroke="url(#heroRingGrad)"
        strokeWidth="1"
        opacity="0.24"
      />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI) / 6;
        const cx = 180 + 145 * Math.cos(angle);
        const cy = 180 + 145 * Math.sin(angle);
        const rotation = (i * 360) / 12;
        return (
          <g key={i} transform={`translate(${cx} ${cy}) rotate(${rotation})`}>
            <path
              d="M0 -16C8 -12 12 -6 12 0C12 6 8 12 0 16C-8 12 -12 6 -12 0C-12 -6 -8 -12 0 -16Z"
              stroke="url(#heroRingGrad)"
              strokeWidth="1"
              fill="rgba(212,175,55,0.07)"
            />
          </g>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4 + Math.PI / 8;
        const cx = 180 + 104 * Math.cos(angle);
        const cy = 180 + 104 * Math.sin(angle);
        return (
          <circle
            key={`orbit-${i}`}
            cx={cx}
            cy={cy}
            r="4"
            fill="url(#heroRingGrad)"
            opacity="0.8"
          />
        );
      })}
      <path
        d="M180 22C191 42 205 54 226 64C205 74 191 86 180 106C169 86 155 74 134 64C155 54 169 42 180 22Z"
        stroke="url(#heroRingGrad)"
        strokeWidth="1"
        fill="rgba(212,175,55,0.06)"
      />
      <path
        d="M180 254C188 268 199 278 214 286C199 294 188 304 180 318C172 304 161 294 146 286C161 278 172 268 180 254Z"
        stroke="url(#heroRingGrad)"
        strokeWidth="1"
        fill="rgba(212,175,55,0.05)"
      />
    </g>
  </svg>
);

/* ====== MAIN ====== */
const CrimsonShaadiTemplate = ({
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
  const sectionVisibility = getSectionVisibility(data);
  const updateCustomText = (key: string, value: string) =>
    onUpdate({
      customTexts: {
        ...data.customTexts,
        [key]: value,
      },
    });

  return (
    <div
      data-theme="crimson"
      className="min-h-screen"
      style={{
        backgroundColor: C.bg,
        color: C.text,
        fontFamily: FONTS.body,
        backgroundImage: `
          radial-gradient(circle at 18% 20%, rgba(212,175,55,0.08), transparent 28%),
          radial-gradient(circle at 82% 12%, rgba(212,175,55,0.06), transparent 24%),
          radial-gradient(circle at 50% 110%, rgba(120,32,24,0.45), transparent 34%),
          linear-gradient(180deg, #220909 0%, #3b100f 22%, #521715 46%, #421211 72%, #210808 100%)
        `,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&display=swap');`}</style>
      <HeroSection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
        templateId={templateId}
        sessionUUID={sessionUUID}
        uploadStage={uploadStage}
      />

      {sectionVisibility.story && (
        <OurStorySection mode={mode} data={data} onUpdate={onUpdate} />
      )}
      {mode === "edit" && !sectionVisibility.story && (
        <HiddenSectionPlaceholder
          title="Our Story"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, story: true },
            })
          }
        />
      )}

      {sectionVisibility.events && (
        <WeddingEventsSection mode={mode} data={data} onUpdate={onUpdate} />
      )}
      {mode === "edit" && !sectionVisibility.events && (
        <HiddenSectionPlaceholder
          title="Events"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, events: true },
            })
          }
        />
      )}

      {sectionVisibility.gallery && (
        <GallerySection
          mode={mode}
          data={data}
          onUpdate={onUpdate}
          templateId={templateId}
          sessionUUID={sessionUUID}
          uploadStage={uploadStage}
        />
      )}
      {mode === "edit" && !sectionVisibility.gallery && (
        <HiddenSectionPlaceholder
          title="Gallery"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, gallery: true },
            })
          }
        />
      )}

      {sectionVisibility.families && (
        <FamiliesSection mode={mode} data={data} onUpdate={onUpdate} />
      )}
      {mode === "edit" && !sectionVisibility.families && (
        <HiddenSectionPlaceholder
          title="Families"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, families: true },
            })
          }
        />
      )}

      {/* Dress Code */}
      {sectionVisibility.dressCode !== false && (
        <CrimsonDressCodeSection
          mode={mode}
          title={getCustomText(data, "dressCodeTitle", "Dress Code")}
          body={getCustomText(
            data,
            "dressCodeBody",
            "We would be grateful if you could follow the colour palette of our wedding.",
          )}
          onUpdateCustomText={updateCustomText}
          data={data}
          onUpdate={onUpdate}
          sectionVisibility={sectionVisibility}
        />
      )}
      {mode === "edit" && sectionVisibility.dressCode === false && (
        <HiddenSectionPlaceholder
          title="Dress Code"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, dressCode: true },
            })
          }
        />
      )}

      {/* Gifts & Blessings (payment) */}
      {sectionVisibility.details !== false && (
        <CrimsonDetailsSection
          mode={mode}
          title={getCustomText(data, "giftSectionLabel", "Gifts & Blessings")}
          heading={getCustomText(
            data,
            "giftSectionHeading",
            "Your Presence Is The Real Gift",
          )}
          body={getCustomText(
            data,
            "giftSectionBody",
            "If you still wish to contribute to the couple's new beginning, you can use the bank details below.",
          )}
          revealLabel={getCustomText(data, "giftRevealLabel", "Bank Details")}
          revealPrompt={getCustomText(data, "giftRevealPrompt", "Tap to reveal")}
          paymentLabel={getCustomText(data, "giftPaymentLabel", "Payment Option")}
          paymentTitle={getCustomText(
            data,
            "giftPaymentTitle",
            "UPI / Bank Transfer",
          )}
          upiLine={getCustomText(
            data,
            "giftUpiLine",
            "UPI ID: weddingfamily@okaxis",
          )}
          accountNameLine={getCustomText(
            data,
            "giftAccountNameLine",
            "A/C Name: Shubh Aarambh Couple Fund",
          )}
          accountNumberLine={getCustomText(
            data,
            "giftAccountNumberLine",
            "A/C No: 1234 5678 9012",
          )}
          ifscLine={getCustomText(data, "giftIfscLine", "IFSC: SBIN0001234")}
          note={getCustomText(
            data,
            "giftSectionNote",
            "Your presence will mean the most",
          )}
          onUpdateCustomText={updateCustomText}
          sectionVisibility={sectionVisibility}
          onUpdate={onUpdate}
        />
      )}
      {mode === "edit" && sectionVisibility.details === false && (
        <HiddenSectionPlaceholder
          title="Gifts & Details"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, details: true },
            })
          }
        />
      )}

      {mode === "edit" && sectionVisibility.music && (
        <section className="py-16" style={{ backgroundColor: C.bg }}>
          <div className="max-w-xl mx-auto px-6">
            <div className="mb-4 flex justify-end">
              <SectionActionButton
                label="Remove Music"
                onClick={() =>
                  onUpdate({
                    sectionVisibility: { ...sectionVisibility, music: false },
                  })
                }
              />
            </div>
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
      {mode === "edit" && !sectionVisibility.music && (
        <HiddenSectionPlaceholder
          title="Music"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, music: true },
            })
          }
        />
      )}

      {mode !== "edit" && data.rsvpEnabled !== false && (
        <RsvpSection
          invitationId={data.invitationId}
          isDemo={mode === "demo"}
        />
      )}

      {sectionVisibility.footer && (
        <footer
          className={cn(
            "relative overflow-hidden py-14 text-center sm:py-20",
            mode === "edit" && "pb-32",
          )}
          style={{
            background: `linear-gradient(to bottom, ${C.bg}, ${C.maroonDark})`,
          }}
        >
          <BokehOverlay count={15} />
          <GoldDivider />
          <div className="relative z-10 mx-auto mt-6 max-w-md px-6 sm:mt-8">
            {mode === "edit" && (
              <div className="mb-6 flex justify-center">
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
            <p
              className="mb-2 text-3xl sm:text-4xl"
              style={{ fontFamily: FONTS.script, color: C.gold }}
            >
              {data.brideName?.split(" ")[0] || "Bride"} &{" "}
              {data.groomName?.split(" ")[0] || "Groom"}
            </p>
            <p className="text-sm mt-3" style={{ color: C.textMuted }}>
              {formatWeddingDate(data.weddingDate)}
            </p>
            {(mode === "edit" || data.hashtag) && (
              <EditableText
                value={data.hashtag}
                onSave={(val) => onUpdate({ hashtag: val })}
                mode={mode}
                placeholder="#BrideWedGroom"
                className="mt-4 block text-sm"
                as="p"
              />
            )}
            {(mode === "edit" || data.footerNote) && (
              <EditableText
                value={data.footerNote || "Made with love on ShubhAarambh"}
                onSave={(val) => onUpdate({ footerNote: val })}
                mode={mode}
                placeholder="Made with love on ShubhAarambh"
                className="text-[10px] mt-8 block"
                as="p"
              />
            )}
          </div>
        </footer>
      )}
      {mode === "edit" && !sectionVisibility.footer && (
        <HiddenSectionPlaceholder
          title="Footer"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, footer: true },
            })
          }
        />
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

      {mode !== "edit" && sectionVisibility.music && effectiveMusicUrl && (
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}
    </div>
  );
};

/* ====== GOLD DIVIDER ====== */
const GoldDivider = ({ className = "" }: { className?: string }) => (
  <div className={cn("flex items-center justify-center gap-3 my-6", className)}>
    <div
      className="h-px flex-1 max-w-[100px]"
      style={{
        background: `linear-gradient(to right, transparent, ${C.gold})`,
      }}
    />
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill="url(#divGrad)"
      />
      <defs>
        <linearGradient id="divGrad" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor="#f6d776" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#b8962e" />
        </linearGradient>
      </defs>
    </svg>
    <div
      className="h-px flex-1 max-w-[100px]"
      style={{ background: `linear-gradient(to left, transparent, ${C.gold})` }}
    />
  </div>
);

/* ====== GOLDEN FLORAL ORNAMENT (flanks the mandala) ====== */
const GoldenFloral = ({ flip = false }: { flip?: boolean }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
    width="80"
    height="180"
    viewBox="0 0 80 180"
    fill="none"
    style={{ transform: flip ? "scaleX(-1)" : "none" }}
  >
    {/* Main stem */}
    <path
      d="M40 170 C40 130, 20 100, 40 70 C60 40, 40 20, 40 10"
      stroke="url(#floralGrad)"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Petals left */}
    <ellipse
      cx="25"
      cy="50"
      rx="18"
      ry="8"
      fill="url(#floralGrad)"
      opacity="0.3"
      transform="rotate(-30 25 50)"
    />
    <ellipse
      cx="20"
      cy="80"
      rx="16"
      ry="7"
      fill="url(#floralGrad)"
      opacity="0.25"
      transform="rotate(-20 20 80)"
    />
    <ellipse
      cx="22"
      cy="110"
      rx="15"
      ry="7"
      fill="url(#floralGrad)"
      opacity="0.2"
      transform="rotate(-25 22 110)"
    />
    {/* Petals right */}
    <ellipse
      cx="55"
      cy="60"
      rx="16"
      ry="7"
      fill="url(#floralGrad)"
      opacity="0.3"
      transform="rotate(25 55 60)"
    />
    <ellipse
      cx="58"
      cy="90"
      rx="15"
      ry="7"
      fill="url(#floralGrad)"
      opacity="0.25"
      transform="rotate(20 58 90)"
    />
    <ellipse
      cx="55"
      cy="120"
      rx="14"
      ry="6"
      fill="url(#floralGrad)"
      opacity="0.2"
      transform="rotate(30 55 120)"
    />
    {/* Flower at top */}
    <circle cx="40" cy="15" r="6" fill="url(#floralGrad)" opacity="0.5" />
    {[0, 60, 120, 180, 240, 300].map((a, i) => (
      <ellipse
        key={i}
        cx={40 + 10 * Math.cos((a * Math.PI) / 180)}
        cy={15 + 10 * Math.sin((a * Math.PI) / 180)}
        rx="5"
        ry="3"
        fill="url(#floralGrad)"
        opacity="0.35"
        transform={`rotate(${a} ${40 + 10 * Math.cos((a * Math.PI) / 180)} ${15 + 10 * Math.sin((a * Math.PI) / 180)})`}
      />
    ))}
    {/* Small dots */}
    <circle cx="15" cy="60" r="2" fill={C.gold} opacity="0.4" />
    <circle cx="65" cy="70" r="2" fill={C.gold} opacity="0.4" />
    <circle cx="18" cy="130" r="1.5" fill={C.gold} opacity="0.3" />
    <circle cx="62" cy="140" r="1.5" fill={C.gold} opacity="0.3" />
    <circle cx="40" cy="155" r="2" fill={C.gold} opacity="0.3" />
    <defs>
      <linearGradient id="floralGrad" x1="0" y1="0" x2="80" y2="180">
        <stop offset="0%" stopColor="#f6d776" />
        <stop offset="50%" stopColor="#d4af37" />
        <stop offset="100%" stopColor="#b8962e" />
      </linearGradient>
    </defs>
  </motion.svg>
);

/* ====== MANDALA FRAME ====== */
const MandalaFrame = ({
  children,
  size = 240,
}: {
  children: React.ReactNode;
  size?: number;
}) => (
  <div
    className="relative inline-flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <motion.svg
      className="absolute inset-0"
      viewBox="0 0 240 240"
      fill="none"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      {/* Outer decorative ring */}
      <circle
        cx="120"
        cy="120"
        r="118"
        stroke="url(#mandalaGrad)"
        strokeWidth="2"
        opacity="0.7"
      />
      <circle
        cx="120"
        cy="120"
        r="108"
        stroke="url(#mandalaGrad)"
        strokeWidth="1"
        opacity="0.4"
      />
      {Array.from({ length: 28 }).map((_, i) => {
        const angle = (i * 360) / 28;
        const rad = (angle * Math.PI) / 180;
        const cx = 120 + 118 * Math.cos(rad);
        const cy = 120 + 118 * Math.sin(rad);
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx="6"
            ry="3"
            fill="url(#mandalaGrad)"
            opacity={i % 2 === 0 ? "0.5" : "0.3"}
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        );
      })}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i * 360) / 14;
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`d${i}`}
            cx={120 + 112 * Math.cos(rad)}
            cy={120 + 112 * Math.sin(rad)}
            r="2.5"
            fill="url(#mandalaGrad)"
            opacity="0.6"
          />
        );
      })}
      <defs>
        <linearGradient id="mandalaGrad" x1="0" y1="0" x2="240" y2="240">
          <stop offset="0%" stopColor="#f6d776" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#b8962e" />
        </linearGradient>
      </defs>
    </motion.svg>
    <div
      className="rounded-full overflow-hidden relative z-10"
      style={{
        width: size * 0.82,
        height: size * 0.82,
        border: `3px solid ${C.gold}`,
        boxShadow: `0 0 40px ${C.gold}45, 0 0 80px ${C.gold}16`,
        background:
          "radial-gradient(circle at 50% 40%, rgba(95,26,22,0.9), rgba(50,12,12,0.98))",
      }}
    >
      {children}
    </div>
  </div>
);

/* ====== BOKEH OVERLAY (warm golden light particles) ====== */
const BokehOverlay = ({ count = 30 }: { count?: number }) => {
  const particles = useMemo(() => generateBokeh(count), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(244,210,100,${p.opacity}) 0%, rgba(212,175,55,${p.opacity * 0.3}) 60%, transparent 100%)`,
            filter: `blur(${p.blur}px)`,
          }}
          animate={{
            opacity: [0, p.opacity, p.opacity * 0.5, p.opacity, 0],
            scale: [0.6, 1, 1.1, 1, 0.6],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/* ====== FLOATING HEARTS ====== */
const FloatingHearts = ({ count = 6 }: { count?: number }) => {
  const hearts = useMemo(() => generateHearts(count), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{ left: h.left, bottom: "-20px" }}
          animate={{
            y: [0, -600],
            x: [0, h.drift],
            opacity: [0, 0.6, 0.4, 0],
            rotate: [0, h.drift > 0 ? 15 : -15],
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: "easeOut",
          }}
        >
          <Heart size={h.size} fill={C.gold} color={C.gold} opacity={0.5} />
        </motion.div>
      ))}
    </div>
  );
};

/* ====== GOLD ORNAMENT TOP ====== */
const GoldOrnamentTop = () => (
  <svg width="240" height="50" viewBox="0 0 240 50" fill="none">
    <path
      d="M20 25 Q45 5 70 25 Q95 45 120 25 Q145 5 170 25 Q195 45 220 25"
      stroke="url(#ornGrad)"
      strokeWidth="1.2"
      fill="none"
      opacity="0.8"
    />
    <path
      d="M50 25 Q75 12 100 25 Q125 38 150 25 Q175 12 200 25"
      stroke="url(#ornGrad)"
      strokeWidth="0.8"
      fill="none"
      opacity="0.5"
    />
    {/* Center diamond */}
    <path d="M120 8L124 16L120 24L116 16Z" fill="url(#ornGrad)" opacity="0.7" />
    <circle cx="95" cy="18" r="2" fill={C.gold} opacity="0.5" />
    <circle cx="145" cy="18" r="2" fill={C.gold} opacity="0.5" />
    <circle cx="70" cy="22" r="1.5" fill={C.gold} opacity="0.3" />
    <circle cx="170" cy="22" r="1.5" fill={C.gold} opacity="0.3" />
    <defs>
      <linearGradient id="ornGrad" x1="20" y1="0" x2="220" y2="50">
        <stop offset="0%" stopColor="#b8962e" />
        <stop offset="50%" stopColor="#f6d776" />
        <stop offset="100%" stopColor="#b8962e" />
      </linearGradient>
    </defs>
  </svg>
);

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
      borderColor: variant === "add" ? `${C.gold}88` : "rgba(212,175,55,0.22)",
      background:
        variant === "add"
          ? "linear-gradient(135deg, rgba(246,215,118,0.16), rgba(212,175,55,0.06))"
          : "rgba(34,8,8,0.38)",
      color: variant === "add" ? C.goldLight : C.textMuted,
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
        style={{
          background:
            "linear-gradient(180deg, rgba(82,26,24,0.32) 0%, rgba(40,10,10,0.74) 100%)",
          borderColor: "rgba(212,175,55,0.2)",
        }}
      >
        <p
          className="text-xs uppercase tracking-[0.32em]"
          style={{ color: `${C.goldLight}cc` }}
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

/* ====== HERO SECTION ====== */
const HeroSection = ({
  mode,
  data,
  onUpdate,
  templateId,
  sessionUUID,
  uploadStage,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  templateId?: number;
  sessionUUID?: string;
  uploadStage?: "temp" | "draft" | "published";
}) => {
  const heroPhoto = getHeroPhoto(data);
  const portraitPhoto = data.couplePhotoUrl || getPortraitPhoto(data);

  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 50% 0%, rgba(255,198,120,0.18), transparent 26%),
          linear-gradient(180deg, rgba(42,10,10,0.78) 0%, rgba(58,16,16,0.82) 32%, rgba(64,18,18,0.9) 55%, rgba(34,8,8,0.98) 100%)
        `,
      }}
    >
      <div className="absolute inset-0">
        {mode === "edit" ? (
          <EditablePhoto
            photoUrl={data.couplePhotoUrl}
            onSave={(url) => onUpdate({ couplePhotoUrl: url })}
            mode={mode}
            className="w-full h-full"
            placeholderText="Add Couple Photo"
            templateId={templateId}
            sessionUUID={sessionUUID}
            uploadStage={uploadStage}
            invitationId={data.invitationId ?? undefined}
            oldPublicUrl={data.couplePhotoUrl || undefined}
          />
        ) : (
          heroPhoto && (
            <img
              src={heroPhoto}
              alt={`${data.groomName} & ${data.brideName}`}
              className="w-full h-full object-cover object-top"
            />
          )
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(180deg, rgba(35,10,10,0.18) 0%, rgba(56,20,18,0.34) 28%, rgba(58,16,16,0.74) 54%, rgba(31,8,8,0.98) 100%),
              radial-gradient(circle at 50% 28%, transparent 0%, rgba(30,8,8,0.12) 34%, rgba(24,6,6,0.8) 78%),
              linear-gradient(0deg, rgba(23,7,7,0.95) 0%, rgba(23,7,7,0) 36%)
            `,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[48%] pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 50% 0%, rgba(255,218,145,0.12), transparent 20%),
              linear-gradient(180deg, rgba(70,22,18,0) 0%, rgba(70,22,18,0.62) 20%, rgba(44,12,12,0.96) 100%)
            `,
          }}
        />
      </div>

      <BokehOverlay count={42} />
      <FloatingHearts count={7} />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-5xl flex-col items-center justify-end px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-6 sm:mb-10"
        >
          <GoldOrnamentTop />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="relative w-full max-w-2xl rounded-[1.75rem] border px-4 pb-28 pt-8 sm:rounded-[2rem] sm:px-10 sm:pb-36 sm:pt-12"
          style={{
            background: `
              linear-gradient(180deg, rgba(86,32,26,0.36) 0%, rgba(64,20,18,0.48) 38%, rgba(48,14,14,0.74) 100%),
              radial-gradient(circle at 50% 22%, rgba(255,220,145,0.08), transparent 30%)
            `,
            borderColor: "rgba(212,175,55,0.28)",
            boxShadow:
              "0 28px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,235,190,0.16), 0 0 0 1px rgba(111,51,25,0.18)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="absolute inset-3 rounded-[1.25rem] border sm:inset-4 sm:rounded-[1.5rem]"
            style={{ borderColor: "rgba(212,175,55,0.14)" }}
          />
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-5 flex justify-center sm:mb-6"
            >
              <img
                src={GANESH_IMAGE_URL}
                alt="Ganesh blessing"
                className="h-20 w-20 object-contain opacity-95 drop-shadow-[0_0_24px_rgba(212,175,55,0.35)] sm:h-24 sm:w-24"
              />
            </motion.div>
            <div
              className="mx-auto mb-4 h-px w-28 sm:mb-6 sm:w-44"
              style={{
                background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
              }}
            />
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9 }}
              className="text-[2.6rem] leading-none sm:text-6xl md:text-7xl"
              style={{
                fontFamily: FONTS.script,
                color: C.gold,
                textShadow:
                  "0 0 40px rgba(212,175,55,0.2), 0 2px 12px rgba(0,0,0,0.45)",
              }}
            >
              Wedding Invitation
            </motion.h1>
            <p
              className="mt-2 text-[11px] uppercase tracking-[0.34em] sm:text-xs"
              style={{ color: `${C.goldLight}d5` }}
            >
              Together with our families
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.75 }}
              className="mx-auto mt-4 max-w-lg text-[1.1rem] leading-relaxed sm:text-[1.45rem]"
              style={{ color: C.cream, fontFamily: FONTS.body }}
            >
              <EditableText
                value={
                  data.welcomeMessage ||
                  "Request the honor of your presence as we celebrate our wedding with love, blessings, and joy."
                }
                onSave={(val) => onUpdate({ welcomeMessage: val })}
                mode={mode}
                placeholder="Request the honor of your presence..."
                className="italic"
                as="span"
              />
            </motion.p>
            <div
              className="mx-auto mt-6 h-px w-28"
              style={{
                background: `linear-gradient(to right, transparent, ${C.gold}90, transparent)`,
              }}
            />
          </div>

          <div className="absolute inset-x-0 -bottom-[7.2rem] flex justify-center sm:-bottom-[8.6rem] pointer-events-none">
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute left-1/2 top-1/2 h-[17.5rem] w-[17.5rem] -translate-x-1/2 -translate-y-1/2 sm:h-[22rem] sm:w-[22rem]"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                <HeroRingOrnaments />
              </motion.div>
              <motion.div
                className="absolute left-1/2 top-1/2 h-[14.75rem] w-[14.75rem] -translate-x-1/2 -translate-y-1/2 rounded-full border sm:h-[18rem] sm:w-[18rem]"
                style={{
                  borderColor: "rgba(246,215,118,0.18)",
                  boxShadow: "0 0 40px rgba(212,175,55,0.14)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              >
                <span
                  className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-4 sm:w-4"
                  style={{
                    background: `radial-gradient(circle, ${C.goldLight} 0%, ${C.gold} 72%, rgba(212,175,55,0.08) 100%)`,
                    boxShadow: "0 0 16px rgba(246,215,118,0.6)",
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  opacity: { delay: 0.8, duration: 0.9, ease: "easeOut" },
                  scale: { delay: 0.8, duration: 0.9, ease: "easeOut" },
                }}
                className="relative z-10 pointer-events-auto"
              >
                <MandalaFrame size={220}>
                  {mode === "edit" ? (
                    <EditablePhoto
                      photoUrl={data.couplePhotoUrl}
                      onSave={(url) => onUpdate({ couplePhotoUrl: url })}
                      mode={mode}
                      className="w-full h-full"
                      shape="circle"
                      placeholderText="Couple Photo"
                      templateId={templateId}
                      sessionUUID={sessionUUID}
                      uploadStage={uploadStage}
                      invitationId={data.invitationId ?? undefined}
                      oldPublicUrl={data.couplePhotoUrl || undefined}
                    />
                  ) : portraitPhoto ? (
                    <img
                      src={portraitPhoto}
                      alt="Couple"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-6 text-center">
                      <span
                        className="text-sm uppercase tracking-[0.28em]"
                        style={{ color: `${C.goldLight}cc` }}
                      >
                        Couple Photo
                      </span>
                    </div>
                  )}
                </MandalaFrame>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-32 flex flex-col items-center sm:mt-40"
        >
          <p
            className="text-[10px] uppercase tracking-[0.38em] sm:text-xs sm:tracking-[0.5em]"
            style={{ color: `${C.goldLight}cc` }}
          >
            A Celebration of Marriage
          </p>
          <div className="mt-3 flex flex-col items-center gap-1 sm:flex-row sm:gap-5">
            <EditableText
              value={data.brideName}
              onSave={(val) => onUpdate({ brideName: val })}
              mode={mode}
              placeholder="Bride's Name"
              className="text-3xl sm:text-5xl md:text-6xl"
              as="h2"
            />
            <span
              className="text-2xl sm:text-4xl"
              style={{ color: C.goldLight, fontFamily: FONTS.script }}
            >
              &
            </span>
            <EditableText
              value={data.groomName}
              onSave={(val) => onUpdate({ groomName: val })}
              mode={mode}
              placeholder="Groom's Name"
              className="text-3xl sm:text-5xl md:text-6xl"
              as="h2"
            />
          </div>

          {mode === "edit" ? (
            <div className="mt-5">
              <label
                className="mb-1 block text-xs"
                style={{ color: C.textMuted }}
              >
                Wedding Date
              </label>
              <input
                type="date"
                value={data.weddingDate}
                onChange={(e) => onUpdate({ weddingDate: e.target.value })}
                className="rounded-full border px-5 py-2 text-sm"
                style={{
                  backgroundColor: "rgba(58,20,20,0.78)",
                  borderColor: `${C.gold}66`,
                  color: C.cream,
                  colorScheme: "dark",
                  position: "relative" as const,
                  zIndex: 20,
                }}
              />
            </div>
          ) : (
            <p
              className="mt-4 text-xs uppercase tracking-[0.28em] sm:mt-5 sm:text-base sm:tracking-[0.38em]"
              style={{ color: `${C.goldLight}c7` }}
            >
              {formatWeddingDate(data.weddingDate)}
            </p>
          )}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center"
      >
        <ChevronDown
          className="mx-auto h-6 w-6"
          style={{ color: C.goldLight }}
        />
      </motion.div>
    </section>
  );
};

/* ====== OUR STORY TIMELINE ====== */
const OurStorySection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const milestones = getStoryMilestones(data);
  const sectionVisibility = getSectionVisibility(data);
  const updateMilestone = (index: number, updates: Partial<StoryMilestone>) => {
    const nextMilestones = [...milestones];
    nextMilestones[index] = { ...nextMilestones[index], ...updates };
    onUpdate({ storyMilestones: nextMilestones });
  };
  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    onUpdate({
      storyMilestones: milestones.filter(
        (_, milestoneIndex) => milestoneIndex !== index,
      ),
    });
  };
  const addMilestone = () => {
    onUpdate({
      storyMilestones: [
        ...milestones,
        {
          month: "Month",
          year: "2028",
          title: "New Story Moment",
          venue: "Venue",
          iconKey: "Wedding",
        },
      ],
    });
  };

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        background: `
          radial-gradient(circle at 50% 0%, rgba(255,198,120,0.08), transparent 24%),
          linear-gradient(180deg, rgba(58,16,16,0.84) 0%, rgba(72,22,20,0.9) 35%, rgba(40,10,10,0.98) 100%)
        `,
      }}
    >
      <BokehOverlay count={20} />
      <FloatingHearts count={3} />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-4">
          <SectionTitle title="Our Story" />
          {mode === "edit" && (
            <div className="flex flex-wrap justify-center gap-2">
              <SectionActionButton
                label="Add Story Card"
                onClick={addMilestone}
                variant="add"
              />
              <SectionActionButton
                label="Remove Section"
                onClick={() =>
                  onUpdate({
                    sectionVisibility: { ...sectionVisibility, story: false },
                  })
                }
              />
            </div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
          className="mb-10 mt-8 flex justify-center"
        >
          <Heart
            size={28}
            fill={C.gold}
            color={C.gold}
            style={{ filter: "drop-shadow(0 0 8px rgba(212,175,55,0.5))" }}
          />
        </motion.div>

        <div
          className="relative rounded-[2rem] border px-4 py-8 sm:px-8 sm:py-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(91,32,30,0.2) 0%, rgba(52,14,14,0.38) 100%)",
            borderColor: "rgba(212,175,55,0.14)",
            boxShadow: "inset 0 1px 0 rgba(255,230,186,0.08)",
          }}
        >
          <div
            className="pointer-events-none absolute left-8 right-8 top-[4.65rem] hidden h-px sm:block"
            style={{
              background: `linear-gradient(to right, transparent, ${C.gold}88 12%, ${C.goldLight}, ${C.gold}88 88%, transparent)`,
              zIndex: 0,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-8 left-1/2 top-8 w-px -translate-x-1/2 sm:hidden"
            style={{
              background: `linear-gradient(to bottom, transparent, ${C.gold}88 12%, ${C.goldLight}, ${C.gold}88 88%, transparent)`,
              zIndex: 0,
            }}
          />
          <div
            className="relative mx-auto grid max-w-4xl gap-10 sm:gap-6"
            style={{
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            }}
          >
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.7, ease: "easeOut" }}
                className="relative z-10 text-center"
              >
                {mode === "edit" && milestones.length > 1 && (
                  <div className="mb-3 flex justify-center">
                    <SectionActionButton
                      label="Remove Card"
                      onClick={() => removeMilestone(i)}
                    />
                  </div>
                )}
                <motion.div
                  className="mb-4 flex justify-center"
                  whileInView={{ rotate: [0, 10, -10, 0] }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full border"
                    style={{
                      borderColor: `${C.gold}66`,
                      background:
                        "radial-gradient(circle at 50% 30%, rgba(255,223,157,0.18), rgba(91,32,30,0.72))",
                      boxShadow: "0 0 28px rgba(212,175,55,0.12)",
                    }}
                  >
                    <GoldIcon
                      d={eventIconSVG[m.iconKey] || eventIconSVG.Wedding}
                      size={24}
                    />
                  </div>
                </motion.div>
                <div
                  className="mx-auto max-w-[14rem] rounded-[1.5rem] px-4 py-4"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(74,20,20,0.72) 0%, rgba(48,12,12,0.78) 100%)",
                    border: "1px solid rgba(212,175,55,0.12)",
                    boxShadow:
                      "0 12px 26px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,233,185,0.06)",
                  }}
                >
                  <EditableText
                    value={m.month}
                    onSave={(val) => updateMilestone(i, { month: val })}
                    mode={mode}
                    placeholder="Month"
                    className="block text-xs uppercase tracking-[0.3em]"
                    as="p"
                  />
                  <EditableText
                    value={m.year}
                    onSave={(val) => updateMilestone(i, { year: val })}
                    mode={mode}
                    placeholder="Year"
                    className="text-3xl font-bold sm:text-4xl"
                    as="p"
                  />
                  <EditableText
                    value={m.title}
                    onSave={(val) => updateMilestone(i, { title: val })}
                    mode={mode}
                    placeholder="Title"
                    className="mt-2 block text-xl"
                    as="p"
                  />
                  <div
                    className="mt-2 flex items-center justify-center gap-1 text-xs sm:text-sm"
                    style={{ color: C.textMuted }}
                  >
                    <MapPin size={10} style={{ color: C.gold }} />
                    <EditableText
                      value={m.venue}
                      onSave={(val) => updateMilestone(i, { venue: val })}
                      mode={mode}
                      placeholder="Venue"
                      className="block"
                      as="span"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ====== WEDDING EVENTS (GRID, not scroll) ====== */
const WeddingEventsSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const sectionVisibility = getSectionVisibility(data);
  if (mode !== "edit" && data.events.length === 0) {
    return null;
  }
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        background: `
        radial-gradient(circle at 50% 0%, rgba(255,205,130,0.08), transparent 22%),
        linear-gradient(180deg, rgba(58,16,16,0.95) 0%, rgba(76,22,20,0.98) 42%, rgba(35,9,9,1) 100%)
      `,
      }}
    >
      <BokehOverlay count={18} />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-4">
          <SectionTitle title="Wedding Events" />
          {mode === "edit" && (
            <div className="flex flex-wrap justify-center gap-2">
              <SectionActionButton
                label="Remove Section"
                onClick={() =>
                  onUpdate({
                    sectionVisibility: { ...sectionVisibility, events: false },
                  })
                }
              />
            </div>
          )}
        </div>

        {mode === "edit" ? (
          <div className="space-y-4 mt-10">
            {data.events.map((event, i) => (
              <EditableEventCard
                key={event.id || i}
                event={event}
                onUpdate={(updates) => {
                  const newEvents = [...data.events];
                  newEvents[i] = { ...newEvents[i], ...updates };
                  onUpdate({ events: newEvents });
                }}
                onDelete={() => {
                  const newEvents = data.events.filter((_, idx) => idx !== i);
                  onUpdate({ events: newEvents });
                }}
                mode={mode}
                index={i}
              />
            ))}
            <AddEventButton
              onAdd={() => {
                const newEvent: EventData = {
                  id: null,
                  eventName: "New Event",
                  eventDate: "",
                  eventTime: "",
                  venueName: "",
                  venueAddress: "",
                  mapsUrl: null,
                };
                onUpdate({ events: [...data.events, newEvent] });
              }}
              mode={mode}
              maxEvents={8}
              currentCount={data.events.length}
            />
          </div>
        ) : data.events.length > 0 ? (
          <div
            className="mt-12 grid justify-center gap-3 sm:gap-4"
            style={{
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 220px), 240px))",
            }}
          >
            {data.events.map((event, i) => (
              <motion.button
                key={event.id || i}
                type="button"
                onClick={() => {
                  if (event.mapsUrl) {
                    window.open(event.mapsUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 8px 40px rgba(212,175,55,0.4)",
                }}
                className="relative min-h-[158px] w-full overflow-hidden rounded-[1.25rem] p-3 text-center sm:min-h-[170px] sm:rounded-2xl sm:p-5"
                style={{
                  background:
                    "radial-gradient(circle at 50% 18%, rgba(255,219,141,0.16), transparent 36%), linear-gradient(145deg, rgba(106,56,24,0.95), rgba(82,30,14,0.96) 45%, rgba(56,16,12,0.96) 100%)",
                  border: `1.6px solid ${C.gold}75`,
                  boxShadow: `0 18px 32px rgba(0,0,0,0.28), 0 0 20px ${C.gold}1f, inset 0 1px 0 rgba(255,233,185,0.18)`,
                  cursor: event.mapsUrl ? "pointer" : "default",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-2 rounded-[1.1rem] border"
                  style={{ borderColor: "rgba(246,215,118,0.16)" }}
                />
                <div
                  className="absolute left-2 top-2 h-6 w-6 rounded-tl-xl border-l border-t"
                  style={{ borderColor: `${C.gold}80` }}
                />
                <div
                  className="absolute right-2 top-2 h-6 w-6 rounded-tr-xl border-r border-t"
                  style={{ borderColor: `${C.gold}80` }}
                />
                <div
                  className="absolute bottom-2 left-2 h-6 w-6 rounded-bl-xl border-b border-l"
                  style={{ borderColor: `${C.gold}80` }}
                />
                <div
                  className="absolute bottom-2 right-2 h-6 w-6 rounded-br-xl border-b border-r"
                  style={{ borderColor: `${C.gold}80` }}
                />
                <div className="relative z-10 flex h-full flex-col items-center justify-center">
                  <motion.div
                    whileInView={{ rotate: [0, 360] }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    className="mb-2"
                  >
                    <GoldIcon
                      d={eventIconSVG[event.eventName] || eventIconSVG.Wedding}
                      size={20}
                    />
                  </motion.div>
                  <h3
                    className="text-[11px] font-bold uppercase sm:text-sm"
                    style={{
                      fontFamily: FONTS.heading,
                      color: C.cream,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {event.eventName}
                  </h3>
                  <p
                    className="mt-2 text-xs font-semibold sm:mt-3 sm:text-sm"
                    style={{ color: C.gold }}
                  >
                    {formatEventDate(event.eventDate)}
                  </p>
                  <p
                    className="mt-2 flex items-center justify-center gap-1 text-[10px] sm:text-xs"
                    style={{ color: C.textMuted }}
                  >
                    <MapPin size={9} style={{ color: C.gold }} />{" "}
                    {event.venueName}
                  </p>
                  {event.mapsUrl && (
                    <span
                      className="inline-flex items-center gap-1 mt-2 text-[10px]"
                      style={{ color: C.goldLight }}
                    >
                      Tap for directions
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

/* ====== GALLERY ====== */
const GallerySection = ({
  mode,
  data,
  onUpdate,
  templateId,
  sessionUUID,
  uploadStage,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  templateId?: number;
  sessionUUID?: string;
  uploadStage?: "temp" | "draft" | "published";
}) => {
  const displayPhotos = getDisplayPhotos(data);
  const showcasePhotos = displayPhotos.slice(0, 4);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const sectionVisibility = getSectionVisibility(data);

  useEffect(() => {
    if (showcasePhotos.length <= 1) return;
    const timer = window.setInterval(() => {
      setActivePhotoIndex((current) => (current + 1) % showcasePhotos.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [showcasePhotos.length]);

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        background: `
          radial-gradient(circle at 50% 0%, rgba(255,205,130,0.08), transparent 24%),
          linear-gradient(180deg, rgba(72,22,20,0.98) 0%, rgba(62,18,18,0.96) 44%, rgba(34,8,8,1) 100%)
        `,
      }}
    >
      <BokehOverlay count={20} />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-4">
          <SectionTitle title="Gallery" subtitle="Our Beautiful Moments" />
          {mode === "edit" && (
            <div className="flex flex-wrap justify-center gap-2">
              <SectionActionButton
                label="Remove Section"
                onClick={() =>
                  onUpdate({
                    sectionVisibility: { ...sectionVisibility, gallery: false },
                  })
                }
              />
            </div>
          )}
        </div>
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {mode === "edit" ? (
            <EditablePhotoGallery
              photos={data.galleryPhotos}
              defaultPhotos={data.templateDefaults.defaultPhotos}
              onUpdate={(photos) => onUpdate({ galleryPhotos: photos })}
              mode={mode}
              maxPhotos={10}
              invitationId={data.invitationId ?? undefined}
              templateId={templateId}
              sessionUUID={sessionUUID}
              uploadStage={uploadStage}
            />
          ) : showcasePhotos.length > 0 ? (
            <div className="mx-auto max-w-[25rem]">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div
                  className="relative aspect-square overflow-hidden rounded-[2rem] border p-4 sm:p-5"
                  style={{
                    borderColor: "rgba(212,175,55,0.24)",
                    background:
                      "linear-gradient(145deg, rgba(92,30,24,0.82), rgba(48,12,12,0.94))",
                    boxShadow:
                      "0 28px 54px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,233,185,0.14)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-4 rounded-[1.6rem] border"
                    style={{ borderColor: "rgba(246,215,118,0.14)" }}
                  />
                  {showcasePhotos.map((photo, index) => {
                    const isActive =
                      index === activePhotoIndex % showcasePhotos.length;
                    return (
                      <motion.div
                        key={`${photo.photoUrl}-${index}`}
                        className="absolute inset-5 overflow-hidden rounded-[1.4rem]"
                        initial={false}
                        animate={{
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 1.05,
                        }}
                        transition={{ duration: 0.65, ease: "easeInOut" }}
                      >
                        <img
                          src={photo.photoUrl}
                          alt={`Gallery photo ${index + 1}`}
                          className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-35"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,5,5,0.16),rgba(21,5,5,0.45))]" />
                        <img
                          src={photo.photoUrl}
                          alt={`Gallery photo ${index + 1}`}
                          className="relative z-10 h-full w-full object-contain p-3"
                        />
                      </motion.div>
                    );
                  })}
                  <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {showcasePhotos.map((photo, index) => (
                      <button
                        key={`dot-${photo.photoUrl}-${index}`}
                        type="button"
                        onClick={() => setActivePhotoIndex(index)}
                        className="h-2.5 rounded-full transition-all"
                        style={{
                          width: index === activePhotoIndex ? 28 : 10,
                          backgroundColor:
                            index === activePhotoIndex
                              ? C.goldLight
                              : "rgba(246,215,118,0.35)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};

/* ====== OUR FAMILIES ====== */
const FamiliesSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const sectionVisibility = getSectionVisibility(data);
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        background: `
        radial-gradient(circle at 50% 0%, rgba(255,205,130,0.06), transparent 20%),
        linear-gradient(180deg, rgba(64,18,18,0.96) 0%, rgba(78,24,22,0.98) 38%, rgba(30,8,8,1) 100%)
      `,
      }}
    >
      <BokehOverlay count={12} />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-4">
          <SectionTitle title="Our Families" />
          {mode === "edit" && (
            <div className="flex flex-wrap justify-center gap-2">
              <SectionActionButton
                label="Remove Section"
                onClick={() =>
                  onUpdate({
                    sectionVisibility: {
                      ...sectionVisibility,
                      families: false,
                    },
                  })
                }
              />
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -4, boxShadow: `0 8px 30px ${C.gold}25` }}
            className="text-center rounded-[1.75rem] p-8"
            style={{
              background:
                "radial-gradient(circle at 50% 18%, rgba(255,223,157,0.08), transparent 28%), linear-gradient(160deg, rgba(74,24,20,0.88), rgba(46,12,12,0.92))",
              border: `1.5px solid ${C.gold}35`,
              boxShadow: `0 18px 35px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,233,185,0.12)`,
            }}
          >
            <div
              className="mx-auto mb-5 h-px w-40"
              style={{
                background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
              }}
            />
            <h3
              className="mb-4 text-2xl font-bold"
              style={{ fontFamily: FONTS.heading, ...goldGradient }}
            >
              Bride's Family
            </h3>
            <EditableText
              value={data.brideFamilyNames || ""}
              onSave={(val) => onUpdate({ brideFamilyNames: val })}
              mode={mode}
              placeholder="Daughter of..."
              className="mb-4 block text-sm sm:text-base"
              as="p"
            />
            <EditableText
              value={data.brideBio}
              onSave={(val) => onUpdate({ brideBio: val })}
              mode={mode}
              placeholder="Mother & Father of the Bride..."
              className="text-lg leading-relaxed"
              multiline
              as="p"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -4, boxShadow: `0 8px 30px ${C.gold}25` }}
            className="text-center rounded-[1.75rem] p-8"
            style={{
              background:
                "radial-gradient(circle at 50% 18%, rgba(255,223,157,0.08), transparent 28%), linear-gradient(160deg, rgba(74,24,20,0.88), rgba(46,12,12,0.92))",
              border: `1.5px solid ${C.gold}35`,
              boxShadow: `0 18px 35px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,233,185,0.12)`,
            }}
          >
            <div
              className="mx-auto mb-5 h-px w-40"
              style={{
                background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
              }}
            />
            <h3
              className="mb-4 text-2xl font-bold"
              style={{ fontFamily: FONTS.heading, ...goldGradient }}
            >
              Groom's Family
            </h3>
            <EditableText
              value={data.groomFamilyNames || ""}
              onSave={(val) => onUpdate({ groomFamilyNames: val })}
              mode={mode}
              placeholder="Son of..."
              className="mb-4 block text-sm sm:text-base"
              as="p"
            />
            <EditableText
              value={data.groomBio}
              onSave={(val) => onUpdate({ groomBio: val })}
              mode={mode}
              placeholder="Mother & Father of the Groom..."
              className="text-lg leading-relaxed"
              multiline
              as="p"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ====== RSVP ====== */
const RsvpSection = ({
  invitationId,
  isDemo,
}: {
  invitationId: number | null;
  isDemo: boolean;
}) => {
  const [attending, setAttending] = useState<"yes" | "maybe" | "no" | null>(
    null,
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      setSubmitted(true);
      return;
    }
    if (!invitationId || !attending) return;
    setIsSubmitting(true);
    try {
      await submitRsvp(String(invitationId), {
        guestName: name,
        guestPhone: phone,
        attending: attending === "yes" ? "yes" : "no",
        guestCount: attending === "no" ? 0 : guestCount,
      });
      setSubmitted(true);
      toast.success("RSVP submitted!");
    } catch {
      toast.error("Failed to submit RSVP");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section
        className="relative py-16 overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${C.bg}, ${C.maroonDark})`,
        }}
      >
        <BokehOverlay count={10} />
        <div className="max-w-md mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                backgroundColor: `${C.gold}20`,
                boxShadow: `0 0 30px ${C.gold}30`,
              }}
            >
              <Heart
                className="w-8 h-8"
                style={{ color: C.gold }}
                fill={C.gold}
              />
            </div>
          </motion.div>
          <h3
            className="text-xl font-semibold"
            style={{ color: C.cream, fontFamily: FONTS.heading }}
          >
            Thank You!
          </h3>
          <p className="text-sm mt-2" style={{ color: C.textMuted }}>
            Your response has been recorded.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden py-20"
      style={{
        background: `
          radial-gradient(circle at 50% 0%, rgba(255,205,130,0.06), transparent 20%),
          linear-gradient(to bottom, ${C.bg}, ${C.maroonDark})
        `,
      }}
    >
      <BokehOverlay count={12} />
      <div className="max-w-md mx-auto px-4 sm:px-6 relative z-10">
        <SectionTitle title="RSVP" />

        <motion.form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-[1.5rem] border p-4 sm:mt-10 sm:rounded-[1.8rem] sm:p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            background:
              "linear-gradient(180deg, rgba(77,22,22,0.5) 0%, rgba(45,12,12,0.72) 100%)",
            borderColor: "rgba(212,175,55,0.16)",
            boxShadow:
              "0 20px 38px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,233,185,0.1)",
          }}
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              { value: "yes" as const, label: "Attending", icon: "\u{1F389}" },
              { value: "maybe" as const, label: "Maybe", icon: "\u{1F914}" },
              { value: "no" as const, label: "Cannot", icon: "\u{1F622}" },
            ].map((opt) => (
              <motion.button
                key={opt.value}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAttending(opt.value)}
                className="min-w-[96px] px-3 py-3 rounded-xl text-sm transition-all sm:min-w-0 sm:px-4"
                style={{
                  background:
                    attending === opt.value
                      ? "linear-gradient(135deg, #d4af37, #f6d776)"
                      : "linear-gradient(145deg, #3a1a10, #2a0c06)",
                  color: attending === opt.value ? C.bg : C.cream,
                  border: `1.5px solid ${attending === opt.value ? C.gold : C.gold + "40"}`,
                  boxShadow:
                    attending === opt.value ? `0 0 20px ${C.gold}40` : "none",
                }}
              >
                <span className="text-lg mb-1 block">{opt.icon}</span>
                {opt.label}
              </motion.button>
            ))}
          </div>

          {attending && attending !== "no" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  background: "linear-gradient(145deg, #3a1a10, #2a0c06)",
                  border: `1px solid ${C.gold}40`,
                  color: C.cream,
                }}
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  background: "linear-gradient(145deg, #3a1a10, #2a0c06)",
                  border: `1px solid ${C.gold}40`,
                  color: C.cream,
                }}
              />
              <div>
                <label
                  className="text-sm block mb-2"
                  style={{ color: C.textMuted }}
                >
                  Number of Guests
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    background: "linear-gradient(145deg, #3a1a10, #2a0c06)",
                    border: `1px solid ${C.gold}40`,
                    color: C.cream,
                  }}
                />
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={!attending || isSubmitting}
            whileHover={
              attending
                ? { scale: 1.02, boxShadow: "0 0 30px rgba(212,175,55,0.5)" }
                : {}
            }
            whileTap={attending ? { scale: 0.98 } : {}}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all"
            style={{
              background: attending
                ? "linear-gradient(135deg, #d4af37, #f6d776)"
                : `${C.bgCard}cc`,
              color: attending ? C.bg : C.textMuted,
              cursor: attending ? "pointer" : "not-allowed",
              boxShadow: attending ? "0 0 25px rgba(212,175,55,0.4)" : "none",
              fontFamily: FONTS.heading,
              letterSpacing: "0.1em",
            }}
          >
            {isSubmitting ? "Submitting..." : "Confirm RSVP"}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};

/* ====== DRESS CODE ====== */
const CrimsonDressCodeSection = ({
  mode,
  title,
  body,
  onUpdateCustomText,
  data,
  onUpdate,
  sectionVisibility,
}: {
  mode: TemplateProps["mode"];
  title: string;
  body: string;
  onUpdateCustomText: (key: string, value: string) => void;
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  sectionVisibility: SectionVisibility;
}) => {
  const getColors = (): { hex: string; name: string }[] => {
    const saved = data.customTexts?.dressCodeColors;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* fall through */ }
    }
    return DRESS_COLORS;
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
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        background: `
          radial-gradient(circle at 50% 0%, rgba(255,198,120,0.08), transparent 24%),
          linear-gradient(180deg, rgba(58,16,16,0.84) 0%, rgba(72,22,20,0.9) 35%, rgba(40,10,10,0.98) 100%)
        `,
      }}
    >
      <BokehOverlay count={12} />
      <div className="relative z-10 mx-auto max-w-md px-6 text-center">
        {mode === "edit" && (
          <div className="mb-6 flex justify-center">
            <SectionActionButton
              label="Remove Section"
              onClick={() =>
                onUpdate({
                  sectionVisibility: { ...sectionVisibility, dressCode: false },
                })
              }
            />
          </div>
        )}
        <SectionTitle title="Dress Code" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 mt-6 text-4xl sm:text-5xl"
          style={{ fontFamily: FONTS.script, ...goldGradient }}
        >
          <EditableText
            value={title}
            onSave={(val) => onUpdateCustomText("dressCodeTitle", val)}
            mode={mode}
            placeholder="Dress Code"
            className="block"
            as="span"
          />
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mb-8 text-lg leading-relaxed"
          style={{ color: C.textMuted, fontFamily: FONTS.body }}
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
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {colors.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={{ y: -6, scale: 1.04 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22 + i * 0.08, duration: 0.45 }}
              className="relative h-14 w-11 rounded-sm shadow-[0_10px_20px_rgba(0,0,0,0.25)] md:h-[76px] md:w-14"
              style={{
                backgroundColor: c.hex,
                border:
                  c.hex === "#f5e6d0" ? `1px solid ${C.textMuted}40` : `1px solid ${C.gold}30`,
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
              className="flex h-14 w-11 items-center justify-center rounded-sm border-2 border-dashed md:h-[76px] md:w-14"
              style={{ borderColor: `${C.gold}66`, color: C.textMuted }}
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

/* ====== GIFTS & BLESSINGS (Payment) ====== */
const CrimsonDetailsSection = ({
  mode,
  title,
  heading,
  body,
  revealLabel,
  revealPrompt,
  paymentLabel,
  paymentTitle,
  upiLine,
  accountNameLine,
  accountNumberLine,
  ifscLine,
  note,
  onUpdateCustomText,
  sectionVisibility,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  title: string;
  heading: string;
  body: string;
  revealLabel: string;
  revealPrompt: string;
  paymentLabel: string;
  paymentTitle: string;
  upiLine: string;
  accountNameLine: string;
  accountNumberLine: string;
  ifscLine: string;
  note: string;
  onUpdateCustomText: (key: string, value: string) => void;
  sectionVisibility: SectionVisibility;
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const [revealed, setRevealed] = useState(mode === "edit");

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28"
      style={{
        background: `
          radial-gradient(circle at 50% 0%, rgba(255,205,130,0.06), transparent 20%),
          linear-gradient(180deg, rgba(64,18,18,0.96) 0%, rgba(78,24,22,0.98) 38%, rgba(30,8,8,1) 100%)
        `,
      }}
    >
      <BokehOverlay count={10} />
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        {mode === "edit" && (
          <div className="mb-6 flex justify-center">
            <SectionActionButton
              label="Remove Section"
              onClick={() =>
                onUpdate({
                  sectionVisibility: { ...sectionVisibility, details: false },
                })
              }
            />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden rounded-[2rem] border px-6 py-12 text-center shadow-[0_24px_50px_rgba(0,0,0,0.3)] sm:px-10"
          style={{
            background:
              "radial-gradient(circle at 50% 18%, rgba(255,223,157,0.08), transparent 28%), linear-gradient(160deg, rgba(74,24,20,0.88), rgba(46,12,12,0.92))",
            borderColor: `${C.gold}35`,
          }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${C.gold}20` }}
          >
            <Gift size={28} style={{ color: C.gold }} />
          </div>
          <EditableText
            value={title}
            onSave={(val) => onUpdateCustomText("giftSectionLabel", val)}
            mode={mode}
            placeholder="Gifts & Blessings"
            className="text-[11px] uppercase tracking-[0.45em]"
            inputClassName="text-center"
            as="p"
          />
          <EditableText
            value={heading}
            onSave={(val) => onUpdateCustomText("giftSectionHeading", val)}
            mode={mode}
            placeholder="Your Presence Is The Real Gift"
            className="mt-4 text-4xl leading-tight md:text-5xl"
            inputClassName="text-center"
            multiline
            as="h2"
          />
          <EditableText
            value={body}
            onSave={(val) => onUpdateCustomText("giftSectionBody", val)}
            mode={mode}
            placeholder="Add your gifts or blessings note."
            className="mx-auto mt-5 block max-w-2xl text-lg leading-8"
            inputClassName="text-center"
            multiline
            as="p"
          />

          <div className="mt-10 flex justify-center">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setRevealed((prev) => !prev)}
              className="w-full max-w-sm rounded-[28px] border px-6 py-10 text-center"
              style={{
                borderColor: revealed ? `${C.gold}66` : `${C.gold}2c`,
                backgroundColor: revealed
                  ? `${C.gold}14`
                  : "rgba(58,20,20,0.72)",
              }}
            >
              {!revealed ? (
                <div className="space-y-4">
                  <Gift
                    className="mx-auto"
                    size={28}
                    style={{ color: C.gold }}
                  />
                  <EditableText
                    value={revealLabel}
                    onSave={(val) => onUpdateCustomText("giftRevealLabel", val)}
                    mode={mode}
                    placeholder="Bank Details"
                    className="text-[11px] uppercase tracking-[0.34em]"
                    inputClassName="text-center"
                    as="p"
                  />
                  <EditableText
                    value={revealPrompt}
                    onSave={(val) =>
                      onUpdateCustomText("giftRevealPrompt", val)
                    }
                    mode={mode}
                    placeholder="Tap to reveal"
                    className="text-2xl"
                    inputClassName="text-center"
                    as="p"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <EditableText
                    value={paymentLabel}
                    onSave={(val) => onUpdateCustomText("giftPaymentLabel", val)}
                    mode={mode}
                    placeholder="Payment Option"
                    className="text-[11px] uppercase tracking-[0.34em]"
                    inputClassName="text-center"
                    as="p"
                  />
                  <EditableText
                    value={paymentTitle}
                    onSave={(val) => onUpdateCustomText("giftPaymentTitle", val)}
                    mode={mode}
                    placeholder="UPI / Bank Transfer"
                    className="text-2xl"
                    inputClassName="text-center"
                    as="p"
                  />
                  <div
                    className="space-y-1 text-base"
                    style={{ color: C.textMuted, fontFamily: FONTS.body }}
                  >
                    <EditableText
                      value={upiLine}
                      onSave={(val) => onUpdateCustomText("giftUpiLine", val)}
                      mode={mode}
                      placeholder="UPI ID: weddingfamily@okaxis"
                      inputClassName="text-center"
                      as="p"
                    />
                    <EditableText
                      value={accountNameLine}
                      onSave={(val) =>
                        onUpdateCustomText("giftAccountNameLine", val)
                      }
                      mode={mode}
                      placeholder="A/C Name: Shubh Aarambh Couple Fund"
                      inputClassName="text-center"
                      as="p"
                    />
                    <EditableText
                      value={accountNumberLine}
                      onSave={(val) =>
                        onUpdateCustomText("giftAccountNumberLine", val)
                      }
                      mode={mode}
                      placeholder="A/C No: 1234 5678 9012"
                      inputClassName="text-center"
                      as="p"
                    />
                    <EditableText
                      value={ifscLine}
                      onSave={(val) => onUpdateCustomText("giftIfscLine", val)}
                      mode={mode}
                      placeholder="IFSC: SBIN0001234"
                      inputClassName="text-center"
                      as="p"
                    />
                  </div>
                </motion.div>
              )}
            </motion.button>
          </div>

          <EditableText
            value={note}
            onSave={(val) => onUpdateCustomText("giftSectionNote", val)}
            mode={mode}
            placeholder="Your presence will mean the most"
            className="mt-6 block text-sm uppercase tracking-[0.24em]"
            inputClassName="text-center"
            as="p"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CrimsonShaadiTemplate;
