import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  MapPin,
  Heart,
  Calendar,
  Clock,
  Trash2,
  Check,
  Minus,
  Plus,
  Send,
  Gift,
} from "lucide-react";
import { TemplateProps, EventData } from "@/templates/types";
import {
  EditableText,
  AddEventButton,
  EditablePhotoGallery,
  EditablePhoto,
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
   Premium Elegante Template
   Inspired by premiumelegante.thedigitalyes.com
   Full-featured: Hero · Countdown · Welcome · Gallery ·
   Venue · Day Programme · Dress Code · Pre-Wedding Events ·
   Accommodation · Footer
   ──────────────────────────────────────────── */

// ─── Color Palette (matching reference: premiumelegante.thedigitalyes.com) ───
const C = {
  bg: "#f3ede3", // hsl(40, 24%, 92%) – warm ivory
  text: "#5c4a32", // hsl(33, 47%, 35%) – sage-dark
  textMuted: "#7a6545", // sage-dark with opacity
  textLight: "#9a8a6e",
  gold: "#c5a46d", // exact reference gold
  goldLight: "#c4b08a",
  cream: "#f9f7f2", // ivory card bg
  white: "#ffffff",
  whiteWarm: "#f9f7f2",
  ornament: "#8b7040",
};

const FONTS = {
  body: "'Cormorant Garamond', serif",
  serif: "'Cormorant Garamond', serif",
};

// SVG noise texture for paper/linen effect (matching reference)
const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

const SECTION_REVEAL = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
};

import type { SectionVisibility } from "@/templates/types";

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  story: true,
  events: true,
  gallery: true,
  families: true,
  footer: true,
  music: true,
  venue: true,
  countdown: true,
  welcome: true,
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
      borderColor: variant === "add" ? `${C.gold}88` : `${C.gold}38`,
      background:
        variant === "add"
          ? `linear-gradient(135deg, ${C.gold}28, ${C.gold}10)`
          : "rgba(92,74,50,0.08)",
      color: variant === "add" ? C.gold : C.textMuted,
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
            "linear-gradient(180deg, rgba(243,237,227,0.6) 0%, rgba(228,216,198,0.4) 100%)",
          borderColor: `${C.gold}30`,
        }}
      >
        <p
          className="text-xs uppercase tracking-[0.32em]"
          style={{ color: C.textLight }}
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

const PremiumBackground = () => (
  <>
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(197,164,109,0.18), transparent 28%), radial-gradient(circle at 80% 0%, rgba(139,112,64,0.12), transparent 24%), radial-gradient(circle at 50% 55%, rgba(255,255,255,0.5), transparent 32%)",
      }}
    />
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
      }}
    />
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -left-16 top-[18rem] h-56 w-56 rounded-full blur-3xl"
      style={{ backgroundColor: `${C.gold}18` }}
      animate={{ y: [0, 20, -8, 0], x: [0, 8, -6, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-20 top-[52rem] h-72 w-72 rounded-full blur-3xl"
      style={{ backgroundColor: `${C.ornament}10` }}
      animate={{ y: [0, -24, 10, 0], x: [0, -12, 8, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
  </>
);

const SectionFlourish = ({
  invert = false,
  tone = "gold",
}: {
  invert?: boolean;
  tone?: "gold" | "light";
}) => (
  <motion.div
    {...SECTION_REVEAL}
    transition={{ duration: 0.65 }}
    className={cn(
      "mb-6 flex items-center justify-center gap-3",
      invert && "flex-row-reverse",
    )}
  >
    <div
      className="h-px w-12 md:w-16"
      style={{
        backgroundColor:
          tone === "light" ? "rgba(255,255,255,0.55)" : `${C.gold}70`,
      }}
    />
    <span
      className="text-xs tracking-[0.45em] uppercase"
      style={{
        color: tone === "light" ? C.whiteWarm : C.gold,
        fontFamily: FONTS.body,
      }}
    >
      Aureate
    </span>
    <div
      className="h-px w-12 md:w-16"
      style={{
        backgroundColor:
          tone === "light" ? "rgba(255,255,255,0.55)" : `${C.gold}70`,
      }}
    />
  </motion.div>
);

const getPremiumDisplayPhotos = (data: TemplateProps["data"]) =>
  data.galleryPhotos.length > 0
    ? data.galleryPhotos
    : data.templateDefaults.defaultPhotos.map((photo, index) => ({
        photoUrl: photo.photoUrl,
        sortOrder: index,
        isDefault: true,
      }));

const getPremiumHeroPhoto = (data: TemplateProps["data"]) =>
  data.couplePhotoUrl ||
  data.bridePhotoUrl ||
  data.groomPhotoUrl ||
  getPremiumDisplayPhotos(data)[0]?.photoUrl ||
  null;

const PremiumEleganteTemplate = ({
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

  return (
    <div
      data-theme="premium"
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundColor: C.bg,
        color: C.text,
        backgroundImage: NOISE_BG,
        backgroundBlendMode: "overlay" as const,
        backgroundSize: "200px",
      }}
    >
      <PremiumBackground />
      {/* ═══════════ HERO SECTION (Video background with names) ═══════════ */}
      <HeroSection
        mode={mode}
        data={data}
        onUpdate={onUpdate}
        templateId={templateId}
        sessionUUID={sessionUUID}
        uploadStage={uploadStage}
      />

      {/* ═══════════ COUNTDOWN ═══════════ */}
      {sectionVisibility.countdown &&
        (data.showCountdown || mode === "edit") && (
          <CountdownSection
            mode={mode}
            weddingDate={data.weddingDate}
            showCountdown={data.showCountdown}
            onUpdate={onUpdate}
            sectionVisibility={sectionVisibility}
          />
        )}
      {mode === "edit" && !sectionVisibility.countdown && (
        <HiddenSectionPlaceholder
          title="Countdown"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, countdown: true },
            })
          }
        />
      )}

      {/* ═══════════ WELCOME ═══════════ */}
      {sectionVisibility.welcome && (
        <WelcomeSection
          mode={mode}
          welcomeMessage={data.welcomeMessage}
          onUpdate={onUpdate}
          sectionVisibility={sectionVisibility}
        />
      )}
      {mode === "edit" && !sectionVisibility.welcome && (
        <HiddenSectionPlaceholder
          title="Welcome"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, welcome: true },
            })
          }
        />
      )}

      {/* ═══════════ PHOTO GALLERY ═══════════ */}
      {sectionVisibility.gallery && (
        <GallerySection
          mode={mode}
          data={data}
          onUpdate={onUpdate}
          templateId={templateId}
          sessionUUID={sessionUUID}
          uploadStage={uploadStage}
          sectionVisibility={sectionVisibility}
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

      {/* ═══════════ ORNAMENT DIVIDER ═══════════ */}
      {sectionVisibility.gallery && <FloralVaseOrnament />}

      {/* ═══════════ THE VENUE ═══════════ */}
      {sectionVisibility.venue && data.events[0] && (
        <VenueSection
          event={data.events[0]}
          weddingDate={data.weddingDate}
          mode={mode}
          sectionVisibility={sectionVisibility}
          onUpdate={onUpdate}
        />
      )}
      {mode === "edit" && !sectionVisibility.venue && (
        <HiddenSectionPlaceholder
          title="Venue"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, venue: true },
            })
          }
        />
      )}

      {/* ═══════════ DAY PROGRAMME ═══════════ */}
      {sectionVisibility.events && (
        <DayProgrammeSection
          mode={mode}
          data={data}
          onUpdate={onUpdate}
          sectionVisibility={sectionVisibility}
        />
      )}
      {mode === "edit" && !sectionVisibility.events && (
        <HiddenSectionPlaceholder
          title="Day Programme"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, events: true },
            })
          }
        />
      )}

      {/* ═══════════ RIBBON BOW ═══════════ */}
      <RibbonBowOrnament />

      {/* ═══════════ MUSIC (Edit only) ═══════════ */}
      {mode === "edit" && sectionVisibility.music && (
        <section className="py-20" style={{ backgroundColor: C.bg }}>
          <div className="max-w-xl mx-auto px-6">
            <div className="mb-4 flex justify-center">
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

      {/* ═══════════ GIFTS & BLESSINGS ═══════════ */}
      {sectionVisibility.gifts && (
        <GiftsBlessingsSection
          mode={mode}
          data={data}
          onUpdate={onUpdate}
          sectionVisibility={sectionVisibility}
        />
      )}
      {mode === "edit" && !sectionVisibility.gifts && (
        <HiddenSectionPlaceholder
          title="Gifts & Blessings"
          onAdd={() =>
            onUpdate({
              sectionVisibility: { ...sectionVisibility, gifts: true },
            })
          }
        />
      )}

      {/* ═══════════ RSVP ═══════════ */}
      {sectionVisibility.rsvp !== false &&
        mode !== "edit" &&
        data.rsvpEnabled !== false && (
          <RsvpSection
            invitationId={data.invitationId}
            isDemo={mode === "demo"}
          />
        )}

      {/* ═══════════ FOOTER ═══════════ */}
      {sectionVisibility.footer && (
        <footer
          className={cn(
            "relative py-20 text-center overflow-hidden",
            mode === "edit" && "pb-32",
          )}
          style={{ backgroundColor: C.bg }}
        >
          {/* Decorative floral top border */}
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <svg
              width="400"
              height="80"
              viewBox="0 0 400 80"
              fill="none"
              style={{ color: C.gold, opacity: 0.4 }}
            >
              <path
                d="M0 80 Q50 30 100 50 Q150 70 200 40 Q250 10 300 50 Q350 70 400 30"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M0 80 Q50 50 100 65 Q150 80 200 55 Q250 30 300 65 Q350 80 400 50"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
              />
            </svg>
          </div>

          <div className="max-w-md mx-auto px-6 relative z-10">
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
            {/* Ending flowers illustration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mb-6"
            >
              <svg
                width="180"
                height="120"
                viewBox="0 0 180 120"
                fill="none"
                style={{ color: C.ornament }}
              >
                <g stroke="currentColor" strokeWidth="0.8" fill="none">
                  {/* Left branch with flowers */}
                  <path d="M90 100 Q60 80 30 90 Q20 70 35 55 Q25 40 40 30" />
                  <circle cx="35" cy="55" r="8" strokeWidth="0.6" />
                  <circle cx="35" cy="55" r="4" strokeWidth="0.4" />
                  <circle cx="40" cy="30" r="6" strokeWidth="0.6" />
                  <circle cx="40" cy="30" r="3" strokeWidth="0.4" />
                  {/* Left leaves */}
                  <path d="M55 85 Q45 75 55 70" />
                  <path d="M42 70 Q32 65 42 58" />
                  {/* Right branch with flowers */}
                  <path d="M90 100 Q120 80 150 90 Q160 70 145 55 Q155 40 140 30" />
                  <circle cx="145" cy="55" r="8" strokeWidth="0.6" />
                  <circle cx="145" cy="55" r="4" strokeWidth="0.4" />
                  <circle cx="140" cy="30" r="6" strokeWidth="0.6" />
                  <circle cx="140" cy="30" r="3" strokeWidth="0.4" />
                  {/* Right leaves */}
                  <path d="M125 85 Q135 75 125 70" />
                  <path d="M138 70 Q148 65 138 58" />
                  {/* Center top flower */}
                  <path d="M90 100 Q90 60 90 25" />
                  <circle cx="90" cy="20" r="10" strokeWidth="0.6" />
                  <circle cx="90" cy="20" r="5" strokeWidth="0.4" />
                  <circle cx="90" cy="20" r="2" fill="currentColor" />
                  {/* Small buds */}
                  <circle cx="70" cy="45" r="4" strokeWidth="0.5" />
                  <circle cx="110" cy="45" r="4" strokeWidth="0.5" />
                  {/* Center leaves */}
                  <path d="M85 70 Q75 60 85 55" />
                  <path d="M95 70 Q105 60 95 55" />
                </g>
              </svg>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-script text-4xl md:text-5xl mb-2"
              style={{ color: C.text }}
            >
              {data.brideName?.split(" ")[0] || "Partner"} &amp;{" "}
              {data.groomName?.split(" ")[0] || "Partner"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="flex items-center justify-center gap-3 my-4"
            >
              <div
                className="w-12 h-[1px]"
                style={{ backgroundColor: C.goldLight }}
              />
              <Heart size={14} style={{ color: C.gold }} fill={C.gold} />
              <div
                className="w-12 h-[1px]"
                style={{ backgroundColor: C.goldLight }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: C.textMuted, fontFamily: FONTS.body }}
            >
              {formatWeddingDate(data.weddingDate)}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="italic text-sm mt-6 mb-8"
              style={{ color: C.textLight, fontFamily: FONTS.serif }}
            >
              We can&apos;t wait to celebrate with you
            </motion.p>

            {/* Bottom floral accent */}
            <div className="flex justify-center mb-6">
              <svg
                width="120"
                height="30"
                viewBox="0 0 120 30"
                fill="none"
                style={{ color: C.gold, opacity: 0.5 }}
              >
                <path
                  d="M0 15 Q15 5 30 15 Q45 25 60 15 Q75 5 90 15 Q105 25 120 15"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  fill="none"
                />
                <circle
                  cx="30"
                  cy="15"
                  r="2"
                  fill="currentColor"
                  opacity="0.4"
                />
                <circle
                  cx="60"
                  cy="15"
                  r="2.5"
                  fill="currentColor"
                  opacity="0.5"
                />
                <circle
                  cx="90"
                  cy="15"
                  r="2"
                  fill="currentColor"
                  opacity="0.4"
                />
              </svg>
            </div>

            <p
              className="text-[10px] mt-4"
              style={{ color: C.goldLight, fontFamily: FONTS.body }}
            >
              Made with love on LuxEnvelope
            </p>
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

      {/* ═══════════ TOOLBAR ═══════════ */}
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

      {/* ═══════════ MUSIC PLAYER (View/Demo) ═══════════ */}
      {mode !== "edit" && effectiveMusicUrl && (
        <FloatingMusicPlayer
          musicUrl={effectiveMusicUrl}
          musicName={effectiveMusicName}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   HERO SECTION — Video background with names overlay
   ══════════════════════════════════════════════════════════ */
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
  const heroPhoto = getPremiumHeroPhoto(data);

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Video background */}
      <div className="absolute inset-0">
        {mode === "edit" ? (
          <EditablePhoto
            photoUrl={data.couplePhotoUrl}
            onSave={(url) => onUpdate({ couplePhotoUrl: url })}
            mode={mode}
            className="h-full w-full"
            alt="Hero image"
            placeholderText="Add Hero Image"
            templateId={templateId}
            sessionUUID={sessionUUID}
            uploadStage={uploadStage}
            invitationId={data.invitationId ?? undefined}
            oldPublicUrl={data.couplePhotoUrl || undefined}
          />
        ) : heroPhoto ? (
          <motion.img
            src={heroPhoto}
            alt={`${data.brideName} and ${data.groomName}`}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.12 }}
            transition={{ duration: 12, ease: "easeInOut" }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 25%, rgba(255,255,255,0.24), transparent 24%), linear-gradient(180deg, rgba(243,237,227,1) 0%, rgba(228,216,198,1) 100%)",
            }}
          />
        )}
        {/* Warm vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(56,40,24,0.28) 0%, rgba(92,74,50,0.2) 30%, rgba(92,74,50,0.56) 100%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.16), transparent 28%), radial-gradient(circle at 20% 80%, rgba(197,164,109,0.16), transparent 26%), radial-gradient(circle at 82% 18%, rgba(255,255,255,0.1), transparent 22%)",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border px-6 py-12 text-center shadow-2xl backdrop-blur-[2px] md:px-12 md:py-16"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.06) 100%)",
          borderColor: "rgba(255,255,255,0.18)",
          boxShadow: "0 30px 80px rgba(34, 24, 14, 0.22)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border text-xl tracking-[0.35em] text-white/90"
          style={{
            borderColor: "rgba(255,255,255,0.35)",
            backgroundColor: "rgba(255,255,255,0.08)",
            fontFamily: FONTS.body,
          }}
        >
          {(data.brideName?.trim()?.charAt(0)?.toUpperCase() || "P") +
            (data.groomName?.trim()?.charAt(0)?.toUpperCase() || "P")}
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8 text-[11px] uppercase tracking-[0.45em] md:text-sm"
          style={{ color: C.white, fontFamily: FONTS.body }}
        >
          A Celebration of Love and New Beginnings
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mb-8"
        >
          <EditableText
            value={data.brideName}
            onSave={(val) => onUpdate({ brideName: val })}
            mode={mode}
            placeholder="First Partner"
            className="block font-script text-6xl sm:text-7xl md:text-8xl leading-tight text-white drop-shadow-lg"
            as="h1"
          />
          <p className="text-3xl my-2 font-script text-white/80 drop-shadow">
            &amp;
          </p>
          <EditableText
            value={data.groomName}
            onSave={(val) => onUpdate({ groomName: val })}
            mode={mode}
            placeholder="Second Partner"
            className="block font-script text-6xl sm:text-7xl md:text-8xl leading-tight text-white drop-shadow-lg"
            as="h1"
          />
        </motion.div>

        {/* Diamond ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="w-16 h-[1px] bg-white/60" />
          <span className="text-white/60 text-sm">◆</span>
          <div className="w-16 h-[1px] bg-white/60" />
        </motion.div>

        {/* Date */}
        {mode === "edit" ? (
          <div className="mt-4">
            <label
              className="text-xs block mb-2 tracking-wider uppercase text-white/70"
              style={{ fontFamily: FONTS.body }}
            >
              Wedding Date
            </label>
            <input
              type="date"
              value={data.weddingDate}
              onChange={(e) => onUpdate({ weddingDate: e.target.value })}
              className="rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm text-white backdrop-blur"
              style={{ fontFamily: FONTS.body }}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="inline-flex rounded-full border px-6 py-3"
            style={{
              borderColor: "rgba(255,255,255,0.32)",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            <p
              className="text-sm uppercase tracking-[0.3em] text-white/90 md:text-base"
              style={{ fontFamily: FONTS.serif }}
            >
              {formatWeddingDate(data.weddingDate)}
            </p>
          </motion.div>
        )}

        {/* RSVP scroll hint */}
        {mode !== "edit" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.25 }}
            className="mt-12"
          >
            <p
              className="mb-2 text-[10px] uppercase tracking-[0.38em] text-white/70"
              style={{ fontFamily: FONTS.body }}
            >
              Scroll to discover
            </p>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronDown size={20} className="mx-auto text-white/70" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   COUNTDOWN SECTION
   ══════════════════════════════════════════════════════════ */
const CountdownSection = ({
  mode,
  weddingDate,
  showCountdown,
  onUpdate,
  sectionVisibility,
}: {
  mode: TemplateProps["mode"];
  weddingDate: string;
  showCountdown: boolean;
  onUpdate: TemplateProps["onUpdate"];
  sectionVisibility: SectionVisibility;
}) => (
  <section className="py-20 md:py-28" style={{ backgroundColor: C.bg }}>
    <div className="max-w-2xl mx-auto px-6 text-center">
      {mode === "edit" && (
        <>
          <div className="mb-4 flex justify-center">
            <SectionActionButton
              label="Remove Section"
              onClick={() =>
                onUpdate({
                  sectionVisibility: { ...sectionVisibility, countdown: false },
                })
              }
            />
          </div>
          <div className="mb-6 flex items-center justify-center gap-3">
            <label className="font-body text-sm" style={{ color: C.text }}>
              Show Countdown
            </label>
            <button
              onClick={() => onUpdate({ showCountdown: !showCountdown })}
              className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                showCountdown ? "bg-[#8a7656]" : "bg-[#d4c4a8]",
              )}
            >
              <div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform",
                  showCountdown ? "left-6" : "left-1",
                )}
              />
            </button>
          </div>
        </>
      )}

      {showCountdown && (
        <>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-script text-4xl md:text-7xl mb-4"
            style={{ color: C.text }}
          >
            Countdown
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs tracking-[0.3em] uppercase mb-12"
            style={{ color: C.textLight, fontFamily: FONTS.body }}
          >
            Until {formatWeddingDate(weddingDate)}
          </motion.p>
          <CountdownDisplay weddingDate={weddingDate} />
        </>
      )}
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   COUNTDOWN DISPLAY — Numbers with vertical dividers
   ══════════════════════════════════════════════════════════ */
const CountdownDisplay = ({ weddingDate }: { weddingDate: string }) => {
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!weddingDate) {
        setCountdown(null);
        return;
      }
      const diff = new Date(weddingDate).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setCountdown({
        days: Math.min(200, Math.floor(diff / 86400000)),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  if (!countdown) return null;

  const items = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hours, label: "Hours" },
    { value: countdown.minutes, label: "Minutes" },
    { value: countdown.seconds, label: "Seconds" },
  ];

  return (
    <div className="flex items-center justify-center flex-wrap gap-y-4">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center">
          {i > 0 && (
            <div
              className="w-[1px] h-10 mx-4 sm:mx-8 md:mx-12 sm:h-14"
              style={{ backgroundColor: C.goldLight }}
            />
          )}
          <div className="text-center min-w-[3rem]">
            <span
              className="block text-3xl sm:text-5xl md:text-6xl font-light italic"
              style={{ color: C.text, fontFamily: FONTS.serif }}
            >
              {item.value}
            </span>
            <span
              className="block text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase mt-2"
              style={{ color: C.textLight, fontFamily: FONTS.body }}
            >
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   WELCOME SECTION
   ══════════════════════════════════════════════════════════ */
const WelcomeSection = ({
  mode,
  welcomeMessage,
  onUpdate,
  sectionVisibility,
}: {
  mode: TemplateProps["mode"];
  welcomeMessage: string;
  onUpdate: TemplateProps["onUpdate"];
  sectionVisibility: SectionVisibility;
}) => (
  <section className="py-20 md:py-28" style={{ backgroundColor: C.cream }}>
    <div className="mx-auto max-w-4xl px-6 text-center">
      {mode === "edit" && (
        <div className="mb-6 flex justify-center">
          <SectionActionButton
            label="Remove Section"
            onClick={() =>
              onUpdate({
                sectionVisibility: { ...sectionVisibility, welcome: false },
              })
            }
          />
        </div>
      )}
      <SectionFlourish />
      <motion.div
        {...SECTION_REVEAL}
        transition={{ duration: 0.65 }}
        className="rounded-[2rem] border px-6 py-10 md:px-12"
        style={{
          backgroundColor: "rgba(255,255,255,0.45)",
          borderColor: `${C.gold}25`,
          boxShadow: "0 24px 60px rgba(92,74,50,0.08)",
        }}
      >
        <motion.h2
          {...SECTION_REVEAL}
          transition={{ duration: 0.7 }}
          className="mb-6 font-script text-4xl md:text-7xl"
          style={{ color: C.text }}
        >
          Welcome!
        </motion.h2>
        <motion.div
          {...SECTION_REVEAL}
          transition={{ delay: 0.15, duration: 0.7 }}
        >
          <EditableText
            value={welcomeMessage}
            onSave={(val) => onUpdate({ welcomeMessage: val })}
            mode={mode}
            placeholder="We warmly welcome you to celebrate our union of love and togetherness..."
            className="mx-auto max-w-2xl text-lg leading-relaxed italic md:text-[1.35rem]"
            multiline
            as="p"
          />
        </motion.div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   PHOTO GALLERY — Horizontal scrolling strip (view)
   ══════════════════════════════════════════════════════════ */
const GallerySection = ({
  mode,
  data,
  onUpdate,
  templateId,
  sessionUUID,
  uploadStage,
  sectionVisibility,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  templateId?: number;
  sessionUUID?: string;
  uploadStage?: "temp" | "draft" | "published";
  sectionVisibility: SectionVisibility;
}) => (
  <section className="pb-0 pt-0" style={{ backgroundColor: C.bg }}>
    <div className="max-w-7xl mx-auto px-6">
      {mode === "edit" && (
        <div className="mb-4 flex justify-center">
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
      {mode === "edit" ? (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-script text-4xl" style={{ color: C.text }}>
              Photo Gallery
            </h2>
          </div>
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
        </div>
      ) : (
        <HorizontalGalleryStrip
          photos={data.galleryPhotos}
          defaultPhotos={data.templateDefaults.defaultPhotos}
        />
      )}
    </div>
  </section>
);

/** Auto-scrolling marquee gallery strip (like reference) */
const HorizontalGalleryStrip = ({
  photos,
  defaultPhotos,
}: {
  photos: { photoUrl: string; sortOrder: number; isDefault: boolean }[];
  defaultPhotos: { photoUrl: string; sortOrder: number }[];
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayPhotos =
    photos.length > 0
      ? photos
      : defaultPhotos.map((p, i) => ({
          photoUrl: p.photoUrl,
          sortOrder: i,
          isDefault: true,
        }));

  if (displayPhotos.length === 0) return null;

  // Duplicate photos for infinite scroll effect
  const allPhotos = [...displayPhotos, ...displayPhotos];

  return (
    <>
      <div className="relative w-full overflow-hidden py-10">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-24"
          style={{
            background:
              "linear-gradient(90deg, rgba(243,237,227,0.98) 0%, rgba(243,237,227,0) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24"
          style={{
            background:
              "linear-gradient(270deg, rgba(243,237,227,0.98) 0%, rgba(243,237,227,0) 100%)",
          }}
        />
        <div
          ref={scrollRef}
          className="premium-gallery-track flex gap-4 md:gap-5"
          style={{
            width: "max-content",
            animation: `premium-marquee ${displayPhotos.length * 5}s linear infinite`,
          }}
        >
          {allPhotos.map((photo, i) => (
            <motion.div
              key={`gallery-${i}`}
              className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-[1.75rem] border"
              style={{
                height: "360px",
                width: "250px",
                borderColor: `${C.gold}30`,
                boxShadow: "0 18px 45px rgba(92,74,50,0.12)",
              }}
              onClick={() => setLightboxUrl(photo.photoUrl)}
            >
              <div
                className="absolute inset-x-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.35em]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.68)",
                  color: C.text,
                  fontFamily: FONTS.body,
                }}
              >
                Moments
              </div>
              <img
                src={photo.photoUrl}
                alt={`Gallery ${(i % displayPhotos.length) + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-80" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Marquee keyframes injected via style tag */}
      <style>{`
        @keyframes premium-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .premium-gallery-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(92, 74, 50, 0.95)" }}
            onClick={() => setLightboxUrl(null)}
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white text-2xl"
            >
              ✕
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightboxUrl}
              alt="Gallery photo"
              className="max-w-full max-h-[90vh] rounded-xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ══════════════════════════════════════════════════════════
   THE VENUE — Gold background with venue card
   ══════════════════════════════════════════════════════════ */
const VENUE_IMAGE_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/7/palace.png";

const VenueSection = ({
  event,
  weddingDate,
  mode,
  sectionVisibility,
  onUpdate,
}: {
  event: EventData;
  weddingDate: string;
  mode: TemplateProps["mode"];
  sectionVisibility: SectionVisibility;
  onUpdate: TemplateProps["onUpdate"];
}) => (
  <section
    className="py-20 md:py-28 relative overflow-hidden"
    style={{ backgroundColor: C.gold }}
  >
    <div className="max-w-3xl mx-auto px-6 text-center">
      {mode === "edit" && (
        <div className="mb-6 flex justify-center">
          <SectionActionButton
            label="Remove Section"
            onClick={() =>
              onUpdate({
                sectionVisibility: { ...sectionVisibility, venue: false },
              })
            }
          />
        </div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-script text-4xl md:text-7xl mb-3"
        style={{ color: C.white }}
      >
        The Venue
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="italic text-base mb-10"
        style={{ color: C.whiteWarm, fontFamily: FONTS.serif }}
      >
        Where we celebrate
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: C.white,
          boxShadow:
            "0 10px 40px -10px rgba(59,38,19,.15), 0 4px 15px -3px rgba(59,38,19,.08)",
        }}
      >
        {/* Venue image */}
        <div className="w-full overflow-hidden bg-[#f3ede3]">
          <img
            src={VENUE_IMAGE_URL}
            alt="Wedding Venue"
            className="w-full object-contain"
            style={{ maxHeight: "360px" }}
          />
        </div>

        <div className="p-8 md:p-10">
          {/* Venue name */}
          <h3
            className="font-script text-3xl md:text-4xl mb-6"
            style={{ color: "#7a6545" }}
          >
            {event.venueName || "The Venue"}
          </h3>

          <div
            className="w-20 h-[1px] mx-auto mb-6"
            style={{ backgroundColor: C.goldLight }}
          />

          {/* Date & time */}
          <p
            className="text-base italic mb-1"
            style={{ color: C.textMuted, fontFamily: FONTS.serif }}
          >
            {formatEventDate(event.eventDate)}
            {event.eventTime && <span className="mx-3">·</span>}
            {event.eventTime && (
              <span className="italic">{formatTime(event.eventTime)}</span>
            )}
          </p>

          <div
            className="w-12 h-[1px] mx-auto my-5"
            style={{ backgroundColor: C.goldLight }}
          />

          {/* Address */}
          <p
            className="text-sm md:text-base font-medium mb-1"
            style={{ color: C.text, fontFamily: FONTS.serif }}
          >
            {event.venueAddress || "Address"}
          </p>

          {/* Google map embed */}
          <div className="mt-8">
            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: "#d4c4a8" }}
            >
              <iframe
                src={
                  event.mapsUrl
                    ? getEmbedMapUrl(event.mapsUrl)
                    : "https://maps.google.com/maps?q=wedding+venue&output=embed"
                }
                width="100%"
                height="250"
                style={{
                  border: 0,
                  filter:
                    "sepia(0.25) saturate(0.6) hue-rotate(5deg) brightness(1.05)",
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Venue Location"
              />
            </div>
            {event.mapsUrl ? (
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-xs tracking-[0.2em] uppercase"
                style={{ color: "#7a6545", fontFamily: FONTS.body }}
              >
                <MapPin size={14} /> Open in Maps
              </a>
            ) : (
              <p
                className="inline-flex items-center gap-2 mt-4 text-xs tracking-[0.2em] uppercase"
                style={{ color: "#7a6545", fontFamily: FONTS.body }}
              >
                <MapPin size={14} /> Open in Maps
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════
   DAY PROGRAMME — Alternating left/right timeline
   ══════════════════════════════════════════════════════════ */
const DayProgrammeSection = ({
  mode,
  data,
  onUpdate,
  sectionVisibility,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  sectionVisibility: SectionVisibility;
}) => (
  <section
    className="py-20 md:py-28 relative overflow-hidden"
    style={{ backgroundColor: C.bg }}
  >
    {/* Subtle watermark pattern */}
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cpath d='M150 50 Q200 100 150 150 Q100 200 150 250' fill='none' stroke='%238a7656' stroke-width='0.5'/%3E%3Ccircle cx='150' cy='150' r='80' fill='none' stroke='%238a7656' stroke-width='0.3'/%3E%3Cpath d='M100 80 Q120 60 150 50 Q180 60 200 80' fill='none' stroke='%238a7656' stroke-width='0.3'/%3E%3C/svg%3E")`,
        backgroundSize: "300px 300px",
      }}
    />

    <div className="max-w-3xl mx-auto px-6 relative z-10">
      {mode === "edit" && (
        <div className="mb-6 flex justify-center">
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
      <div className="text-center mb-16">
        <SectionFlourish invert />
        <motion.h2
          {...SECTION_REVEAL}
          transition={{ duration: 0.7 }}
          className="font-script text-5xl md:text-6xl mb-3"
          style={{ color: C.text }}
        >
          Day Programme
        </motion.h2>
        <motion.p
          {...SECTION_REVEAL}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="italic text-base"
          style={{ color: C.textMuted, fontFamily: FONTS.serif }}
        >
          {formatWeddingDate(data.weddingDate)}
        </motion.p>
      </div>

      <AlternatingTimeline
        events={data.events}
        mode={mode}
        onUpdate={onUpdate}
        data={data}
      />

      {mode === "edit" && (
        <div className="mt-8">
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
      )}
    </div>
  </section>
);

/** Alternating left/right timeline with dots and central line — editable in edit mode */
const AlternatingTimeline = ({
  events,
  mode = "view",
  onUpdate,
  data,
}: {
  events: EventData[];
  mode?: TemplateProps["mode"];
  onUpdate?: TemplateProps["onUpdate"];
  data?: TemplateProps["data"];
}) => {
  const isEdit = mode === "edit" && onUpdate && data;

  const updateEvent = (index: number, updates: Partial<EventData>) => {
    if (!onUpdate || !data) return;
    const newEvents = [...data.events];
    newEvents[index] = { ...newEvents[index], ...updates };
    onUpdate({ events: newEvents });
  };

  const deleteEvent = (index: number) => {
    if (!onUpdate || !data) return;
    onUpdate({ events: data.events.filter((_, idx) => idx !== index) });
  };

  return (
    <div className="relative">
      {/* Central vertical line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2"
        style={{ backgroundColor: C.goldLight }}
      />

      <div className="space-y-0">
        {events.map((event, i) => {
          const isLeft = i % 2 === 0;

          const timeContent = isEdit ? (
            <InlineTimePicker
              value={event.eventTime}
              onChange={(val) => updateEvent(i, { eventTime: val })}
            />
          ) : (
            <p
              className="font-bold text-sm sm:text-base md:text-lg tracking-[0.1em] sm:tracking-[0.15em]"
              style={{ color: C.text, fontFamily: FONTS.body }}
            >
              {formatTime(event.eventTime)}
            </p>
          );

          const nameContent = isEdit ? (
            <EditableText
              value={event.eventName}
              onSave={(val) => updateEvent(i, { eventName: val })}
              mode={mode}
              placeholder="Event Name"
              className="text-xs sm:text-sm md:text-base tracking-[0.08em] sm:tracking-[0.12em] uppercase mt-1"
              as="p"
            />
          ) : (
            <p
              className="text-xs sm:text-sm md:text-base tracking-[0.08em] sm:tracking-[0.12em] uppercase mt-1"
              style={{ color: C.textMuted, fontFamily: FONTS.body }}
            >
              {event.eventName}
            </p>
          );

          const venueContent = isEdit ? (
            <>
              <EditableText
                value={event.venueName}
                onSave={(val) => updateEvent(i, { venueName: val })}
                mode={mode}
                placeholder="Venue Name"
                className="text-xs md:text-sm italic mt-1"
                as="p"
              />
              <EditableText
                value={event.venueAddress}
                onSave={(val) => updateEvent(i, { venueAddress: val })}
                mode={mode}
                placeholder="Venue Address"
                className="text-[11px] md:text-xs italic mt-0.5"
                as="p"
              />
              <div className="mt-1">
                <input
                  type="url"
                  value={event.mapsUrl || ""}
                  onChange={(e) =>
                    updateEvent(i, { mapsUrl: e.target.value || null })
                  }
                  placeholder="Google Maps URL"
                  className="w-full bg-white/60 border rounded-lg px-3 py-1.5 text-xs"
                  style={{
                    borderColor: C.goldLight,
                    color: C.text,
                    fontFamily: FONTS.body,
                  }}
                />
              </div>
            </>
          ) : (
            <>
              {event.venueName && (
                <p
                  className="text-xs md:text-sm italic mt-1"
                  style={{ color: C.textLight, fontFamily: FONTS.serif }}
                >
                  {event.venueName}
                </p>
              )}
              {event.venueAddress &&
                (event.mapsUrl ? (
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[11px] md:text-xs italic mt-0.5 hover:opacity-80 transition-opacity break-words"
                    style={{ color: C.gold, fontFamily: FONTS.serif }}
                  >
                    <MapPin
                      size={11}
                      className="inline-block align-middle mr-0.5 shrink-0"
                    />
                    <span className="align-middle">{event.venueAddress}</span>
                  </a>
                ) : (
                  <p
                    className="block text-[11px] md:text-xs italic mt-0.5 break-words"
                    style={{ color: C.textLight, fontFamily: FONTS.serif }}
                  >
                    <MapPin
                      size={11}
                      className="inline-block align-middle mr-0.5 shrink-0"
                    />
                    <span className="align-middle">{event.venueAddress}</span>
                  </p>
                ))}
            </>
          );

          const dateContent = isEdit ? (
            <InlineDatePicker
              value={event.eventDate}
              onChange={(val) => updateEvent(i, { eventDate: val })}
            />
          ) : null;

          const deleteBtn = isEdit ? (
            <button
              onClick={() => deleteEvent(i)}
              className="mt-2 p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete event"
            >
              <Trash2 size={14} />
            </button>
          ) : null;

          return (
            <motion.div
              key={event.id || i}
              {...SECTION_REVEAL}
              transition={{ delay: i * 0.1 }}
              className="relative grid grid-cols-2 py-8"
            >
              {/* Dot on timeline */}
              <div
                className="absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: C.gold }}
              />

              {isLeft ? (
                <>
                  <div className="text-right pr-4 sm:pr-10 overflow-hidden break-words">
                    {timeContent}
                    {nameContent}
                    {venueContent}
                    {dateContent}
                    {deleteBtn && (
                      <div className="flex justify-end">{deleteBtn}</div>
                    )}
                  </div>
                  <div className="pl-4 sm:pl-10" />
                </>
              ) : (
                <>
                  <div className="pr-4 sm:pr-10" />
                  <div className="text-left pl-4 sm:pl-10 overflow-hidden break-words">
                    {timeContent}
                    {nameContent}
                    {venueContent}
                    {dateContent}
                    {deleteBtn}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/** Small inline date picker for timeline edit mode */
const InlineDatePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block mt-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
        style={{ color: C.textLight, fontFamily: FONTS.body }}
      >
        <Calendar size={12} />
        {value ? formatEventDate(value) : "Set date"}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-20 bg-white border rounded-lg p-2 shadow-lg"
          style={{ borderColor: C.goldLight }}
        >
          <input
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(false);
            }}
            className="bg-transparent text-xs outline-none"
            style={{ color: C.text, fontFamily: FONTS.body }}
          />
        </div>
      )}
    </div>
  );
};

/** Small inline time picker for timeline edit mode */
const InlineTimePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 font-bold text-base md:text-lg tracking-[0.15em] hover:opacity-80 transition-opacity"
        style={{ color: C.text, fontFamily: FONTS.body }}
      >
        <Clock size={14} />
        {value ? formatTime(value) : "Set time"}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-20 bg-white border rounded-lg p-2 shadow-lg"
          style={{ borderColor: C.goldLight }}
        >
          <input
            type="time"
            value={value?.slice(0, 5) || ""}
            onChange={(e) => {
              onChange(e.target.value + ":00");
              setOpen(false);
            }}
            className="bg-transparent text-sm outline-none"
            style={{ color: C.text, fontFamily: FONTS.body }}
          />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PRE-WEDDING EVENTS — Gold bg with Indian wedding event cards
   ══════════════════════════════════════════════════════════ */
const PreWeddingEventsSection = ({
  mode,
  data,
  onUpdate,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
}) => {
  const subEvents = data.events.slice(1);
  if (subEvents.length === 0 && mode !== "edit") return null;

  const isEdit = mode === "edit";

  const updateSubEvent = (subIndex: number, updates: Partial<EventData>) => {
    const actualIndex = subIndex + 1; // offset by 1 since we skip events[0]
    const newEvents = [...data.events];
    newEvents[actualIndex] = { ...newEvents[actualIndex], ...updates };
    onUpdate({ events: newEvents });
  };

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: C.gold }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <SectionFlourish tone="light" />
        <motion.p
          {...SECTION_REVEAL}
          transition={{ duration: 0.65 }}
          className="text-xs tracking-[0.35em] uppercase mb-4"
          style={{ color: C.whiteWarm, fontFamily: FONTS.body }}
        >
          Wedding Celebrations
        </motion.p>

        <motion.h2
          {...SECTION_REVEAL}
          transition={{ duration: 0.7 }}
          className="font-script text-4xl md:text-7xl mb-4"
          style={{ color: C.white }}
        >
          Join the Festivities
        </motion.h2>

        <motion.p
          {...SECTION_REVEAL}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="italic text-sm mb-14 max-w-lg mx-auto"
          style={{ color: C.whiteWarm, fontFamily: FONTS.serif }}
        >
          We warmly invite you to be part of each joyous celebration leading up
          to our wedding day.
        </motion.p>

        <div className="space-y-8">
          {subEvents.map((event, i) => (
            <motion.div
              key={event.id || i}
              {...SECTION_REVEAL}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-[2rem] border p-8 md:p-10"
              style={{
                backgroundColor: C.cream,
                borderColor: "rgba(255,255,255,0.28)",
                boxShadow: "0 22px 50px rgba(92,74,50,0.12)",
              }}
            >
              <div
                className="absolute inset-x-10 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(197,164,109,0) 0%, rgba(197,164,109,0.85) 50%, rgba(197,164,109,0) 100%)",
                }}
              />
              {isEdit && (
                <button
                  onClick={() => {
                    const actualIndex = i + 1;
                    onUpdate({
                      events: data.events.filter(
                        (_, idx) => idx !== actualIndex,
                      ),
                    });
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                  title="Delete event"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <IndianEventIcon eventName={event.eventName} />

              {isEdit ? (
                <EditableText
                  value={event.eventName}
                  onSave={(val) => updateSubEvent(i, { eventName: val })}
                  mode={mode}
                  placeholder="Event Name"
                  className="font-script text-3xl md:text-4xl mb-4"
                  as="h3"
                />
              ) : (
                <h3
                  className="font-script text-3xl md:text-4xl mb-4"
                  style={{ color: C.text }}
                >
                  {event.eventName}
                </h3>
              )}

              <div
                className="w-16 h-[1px] mx-auto mb-4"
                style={{ backgroundColor: C.goldLight }}
              />

              {isEdit ? (
                <div className="flex items-center justify-center gap-3 mb-3">
                  <InlineDatePicker
                    value={event.eventDate}
                    onChange={(val) => updateSubEvent(i, { eventDate: val })}
                  />
                  <span style={{ color: C.textMuted }}>·</span>
                  <InlineTimePicker
                    value={event.eventTime}
                    onChange={(val) => updateSubEvent(i, { eventTime: val })}
                  />
                </div>
              ) : (
                <>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: "#7a6545", fontFamily: FONTS.body }}
                  >
                    {formatEventDate(event.eventDate)}
                  </p>
                  {event.eventTime && (
                    <p
                      className="text-sm italic mb-3"
                      style={{ color: C.textMuted, fontFamily: FONTS.serif }}
                    >
                      {formatTime(event.eventTime)}
                    </p>
                  )}
                </>
              )}

              {isEdit ? (
                <>
                  <EditableText
                    value={event.venueName}
                    onSave={(val) => updateSubEvent(i, { venueName: val })}
                    mode={mode}
                    placeholder="Venue Name"
                    className="text-sm font-medium mb-1"
                    as="p"
                  />
                  <EditableText
                    value={event.venueAddress}
                    onSave={(val) => updateSubEvent(i, { venueAddress: val })}
                    mode={mode}
                    placeholder="Venue Address"
                    className="text-xs italic"
                    as="p"
                  />
                </>
              ) : (
                <>
                  {event.venueName && (
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: C.text, fontFamily: FONTS.serif }}
                    >
                      {event.venueName}
                    </p>
                  )}
                  {event.venueAddress && (
                    <p
                      className="text-xs italic flex items-center justify-center gap-1"
                      style={{ color: C.textMuted, fontFamily: FONTS.serif }}
                    >
                      <MapPin size={12} />
                      {event.venueAddress}
                    </p>
                  )}
                </>
              )}

              {/* Maps link icon */}
              {event.mapsUrl && (
                <a
                  href={event.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-xs tracking-[0.2em] uppercase hover:opacity-80 transition-opacity"
                  style={{ color: "#7a6545", fontFamily: FONTS.body }}
                >
                  <MapPin size={14} /> View on Maps
                </a>
              )}

              {/* Maps URL editor in edit mode */}
              {isEdit && (
                <div className="mt-4">
                  <input
                    type="url"
                    value={event.mapsUrl || ""}
                    onChange={(e) =>
                      updateSubEvent(i, { mapsUrl: e.target.value || null })
                    }
                    placeholder="Google Maps URL"
                    className="w-full bg-white/60 border rounded-lg px-3 py-2 text-xs"
                    style={{
                      borderColor: C.goldLight,
                      color: C.text,
                      fontFamily: FONTS.body,
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   SVG ORNAMENTS / ILLUSTRATIONS
   ══════════════════════════════════════════════════════════ */

/** Floral vase ornament (between gallery and venue) — uses R2 flower image */
const FLOWER_IMAGE_URL =
  "https://pub-ae188d768af94d25a7750692051dfeea.r2.dev/templates/7/flower.png";

const FloralVaseOrnament = () => (
  <div
    className="py-6 md:py-8 flex items-center justify-center"
    style={{ backgroundColor: C.bg }}
  >
    <motion.img
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      src={FLOWER_IMAGE_URL}
      alt="Floral decoration"
      className="w-28 h-36 md:w-36 md:h-44 object-contain"
      style={{ mixBlendMode: "multiply" }}
    />
  </div>
);

/** Ribbon bow ornament (footer dividers) */
const RibbonBowOrnament = () => (
  <div className="py-6 flex justify-center">
    <svg
      width="80"
      height="60"
      viewBox="0 0 80 60"
      fill="none"
      style={{ color: C.gold }}
    >
      <path
        d="M40 20 C25 5, 5 10, 15 25 C20 32, 30 28, 40 20Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M40 20 C55 5, 75 10, 65 25 C60 32, 50 28, 40 20Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M35 25 C30 35, 20 50, 25 55"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M45 25 C50 35, 60 50, 55 55"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="40" cy="22" r="2" fill="currentColor" />
    </svg>
  </div>
);

/** Indian wedding event icons based on event name */
const IndianEventIcon = ({ eventName }: { eventName: string }) => {
  const name = eventName.toLowerCase();

  // Haldi — turmeric/mortar icon
  if (name.includes("haldi")) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <ellipse cx="25" cy="38" rx="14" ry="5" />
            <path d="M14 36 Q14 22 25 18 Q36 22 36 36" />
            <circle cx="25" cy="24" r="3.5" />
            <path d="M20 14 Q25 8 30 14" />
            <line x1="25" y1="8" x2="25" y2="14" />
            <path d="M22 11 L25 8 L28 11" />
          </g>
        </svg>
      </div>
    );
  }

  // Mehendi — henna hand
  if (name.includes("mehendi") || name.includes("mehndi")) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M25 45 Q20 35 18 25 Q16 18 20 12 Q24 8 28 12 Q32 18 30 25 Q28 35 25 45Z" />
            <path d="M22 30 Q25 26 28 30" />
            <circle cx="25" cy="22" r="2.5" />
            <path d="M23 17 Q25 14 27 17" />
            <circle cx="25" cy="35" r="1.5" />
            <path d="M21 25 L29 25" />
          </g>
        </svg>
      </div>
    );
  }

  // Sangeet — music/dance
  if (
    name.includes("sangeet") ||
    name.includes("music") ||
    name.includes("dance")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <circle cx="18" cy="36" r="6" />
            <line x1="24" y1="36" x2="24" y2="10" />
            <path d="M24 10 Q34 8 34 16 Q34 22 24 20" />
            <path d="M30 14 Q36 12 36 18" />
            <circle cx="15" cy="15" r="1.5" fill="currentColor" />
            <circle cx="10" cy="20" r="1" fill="currentColor" />
            <circle cx="38" cy="28" r="1.5" fill="currentColor" />
          </g>
        </svg>
      </div>
    );
  }

  // Baraat — decorated horse/procession
  if (name.includes("baraat") || name.includes("barat")) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M15 38 Q12 30 15 22 Q20 15 28 18 Q32 20 34 25" />
            <path d="M34 25 Q36 30 34 38" />
            <line x1="18" y1="38" x2="18" y2="44" />
            <line x1="30" y1="38" x2="30" y2="44" />
            <path d="M12 18 Q15 10 20 12" />
            <circle cx="14" cy="20" r="1.5" fill="currentColor" />
            <path d="M22 14 Q24 8 28 10 Q30 12 28 15" />
          </g>
        </svg>
      </div>
    );
  }

  // Pooja/Puja — diya/lamp
  if (
    name.includes("pooja") ||
    name.includes("puja") ||
    name.includes("prayer")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M15 35 Q15 28 25 25 Q35 28 35 35Z" />
            <ellipse cx="25" cy="36" rx="12" ry="4" />
            <path d="M25 25 Q25 18 25 15" />
            <path d="M22 15 Q25 8 28 15" />
            <circle cx="25" cy="10" r="2" fill="currentColor" opacity="0.5" />
          </g>
        </svg>
      </div>
    );
  }

  // Wedding / Pheras / Shaadi — mandap
  if (
    name.includes("wedding") ||
    name.includes("shaadi") ||
    name.includes("phere") ||
    name.includes("phera") ||
    name.includes("ceremony")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M10 18 H40" />
            <path d="M13 18 L18 10 H32 L37 18" />
            <line x1="15" y1="18" x2="15" y2="38" />
            <line x1="35" y1="18" x2="35" y2="38" />
            <path d="M18 38 H32" />
            <path d="M25 21 Q21 25 25 29 Q29 25 25 21Z" />
            <circle cx="25" cy="14" r="2" fill="currentColor" opacity="0.5" />
          </g>
        </svg>
      </div>
    );
  }

  // Reception / Cocktail / Party — glasses
  if (
    name.includes("reception") ||
    name.includes("cocktail") ||
    name.includes("party")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M16 12 H24 L22 22 H18 Z" />
            <line x1="20" y1="22" x2="20" y2="34" />
            <line x1="16" y1="34" x2="24" y2="34" />
            <path d="M26 12 H34 L32 22 H28 Z" />
            <line x1="30" y1="22" x2="30" y2="34" />
            <line x1="26" y1="34" x2="34" y2="34" />
            <path d="M21 14 L29 8" />
          </g>
        </svg>
      </div>
    );
  }

  // Engagement / Ring ceremony
  if (
    name.includes("engagement") ||
    name.includes("ring") ||
    name.includes("sagai")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <circle cx="21" cy="28" r="7" />
            <circle cx="29" cy="28" r="7" />
            <path d="M21 21 L24 15 L27 21" />
            <path d="M29 21 L32 15 L35 21" />
          </g>
        </svg>
      </div>
    );
  }

  // Vidai / Bidaai — doli
  if (
    name.includes("vidai") ||
    name.includes("vidaai") ||
    name.includes("bidaai") ||
    name.includes("bidai")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M12 32 Q25 18 38 32" />
            <path d="M16 32 V24 H34 V32" />
            <path d="M10 35 H40" />
            <circle cx="18" cy="38" r="2.5" />
            <circle cx="32" cy="38" r="2.5" />
          </g>
        </svg>
      </div>
    );
  }

  // Welcome / Tilak / Milni — floral thali
  if (
    name.includes("welcome") ||
    name.includes("tilak") ||
    name.includes("milni")
  ) {
    return (
      <div className="flex justify-center mb-3 opacity-70">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          style={{ color: C.ornament }}
        >
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <ellipse cx="25" cy="33" rx="13" ry="5" />
            <path d="M14 33 Q18 24 25 24 Q32 24 36 33" />
            <circle cx="25" cy="28" r="3" />
            <circle cx="18" cy="28" r="1.5" />
            <circle cx="32" cy="28" r="1.5" />
          </g>
        </svg>
      </div>
    );
  }

  // Default — lotus flower (universal Indian symbol)
  return (
    <div className="flex justify-center mb-3 opacity-70">
      <svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        fill="none"
        style={{ color: C.ornament }}
      >
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <path d="M25 40 Q25 30 25 22" />
          <path d="M25 22 Q20 15 15 20 Q12 25 18 28 Q22 30 25 28" />
          <path d="M25 22 Q30 15 35 20 Q38 25 32 28 Q28 30 25 28" />
          <path d="M25 18 Q22 10 25 5 Q28 10 25 18" />
          <path d="M20 24 Q14 18 10 22 Q8 28 15 28" />
          <path d="M30 24 Q36 18 40 22 Q42 28 35 28" />
          <circle cx="25" cy="24" r="2.5" fill="currentColor" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   HELPER: Convert Google Maps URL → embed URL
   ══════════════════════════════════════════════════════════ */
function getEmbedMapUrl(mapsUrl: string): string {
  if (mapsUrl.includes("/embed")) return mapsUrl;

  try {
    const url = new URL(mapsUrl);
    if (url.hostname.includes("google") && url.pathname.includes("/place/")) {
      const place = decodeURIComponent(
        url.pathname.split("/place/")[1]?.split("/")[0] || "",
      );
      if (place)
        return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
    }
    const q = url.searchParams.get("q") || url.searchParams.get("query");
    if (q)
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  } catch {
    // fallback
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(mapsUrl)}&output=embed`;
}

/* ══════════════════════════════════════════════════════════
   GIFTS & BLESSINGS — Tap-to-reveal payment details
   ══════════════════════════════════════════════════════════ */
const GiftsBlessingsSection = ({
  mode,
  data,
  onUpdate,
  sectionVisibility,
}: {
  mode: TemplateProps["mode"];
  data: TemplateProps["data"];
  onUpdate: TemplateProps["onUpdate"];
  sectionVisibility: SectionVisibility;
}) => {
  const [revealed, setRevealed] = useState(false);

  const updateCustomText = (key: string, value: string) =>
    onUpdate({ customTexts: { ...data.customTexts, [key]: value } });

  return (
    <section className="px-4 pb-20" style={{ backgroundColor: C.bg }}>
      <div className="mx-auto max-w-3xl">
        {mode === "edit" && (
          <div className="mb-6 flex justify-center">
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
        <motion.div
          {...SECTION_REVEAL}
          className="overflow-hidden rounded-[2rem] border px-6 py-12 text-center sm:px-10"
          style={{
            borderColor: `${C.gold}25`,
            background:
              "linear-gradient(180deg, rgba(255,253,249,0.96), rgba(249,241,230,0.86))",
            boxShadow: "0 24px 60px rgba(92,74,50,0.08)",
          }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${C.gold}1F` }}
          >
            <Gift size={28} style={{ color: C.gold }} />
          </div>
          <p
            className="text-[11px] uppercase tracking-[0.45em]"
            style={{ color: C.gold, fontFamily: FONTS.body }}
          >
            Gifts &amp; Blessings
          </p>
          <h2
            className="mt-4 font-script text-4xl md:text-6xl"
            style={{ color: C.text }}
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
            className="mx-auto mt-5 max-w-2xl text-lg leading-8 italic"
            style={{ color: C.textMuted, fontFamily: FONTS.serif }}
          >
            <EditableText
              value={
                data.customTexts?.giftsBody ||
                "If you wish to bless the couple as they start their new journey together, you can use the details below."
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
                  borderColor: `${C.gold}66`,
                  backgroundColor: `${C.gold}14`,
                }}
              >
                <p
                  className="mb-4 text-[11px] uppercase tracking-[0.34em]"
                  style={{ color: C.gold, fontFamily: FONTS.body }}
                >
                  Payment Details (editable)
                </p>
                <div
                  className="space-y-1 text-base"
                  style={{ color: C.textMuted, fontFamily: FONTS.body }}
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
                  borderColor: revealed ? `${C.gold}66` : `${C.gold}25`,
                  backgroundColor: revealed
                    ? `${C.gold}14`
                    : "rgba(255,255,255,0.7)",
                }}
              >
                {!revealed ? (
                  <div className="space-y-4">
                    <Gift
                      className="mx-auto"
                      size={28}
                      style={{ color: C.gold }}
                    />
                    <p
                      className="text-[11px] uppercase tracking-[0.34em]"
                      style={{ color: C.textMuted, fontFamily: FONTS.body }}
                    >
                      Bank Details
                    </p>
                    <p
                      className="font-script text-2xl"
                      style={{ color: C.text }}
                    >
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
                      style={{ color: C.gold, fontFamily: FONTS.body }}
                    >
                      Payment Option
                    </p>
                    <p
                      className="font-script text-2xl"
                      style={{ color: C.text }}
                    >
                      UPI / Bank Transfer
                    </p>
                    <div
                      className="space-y-1 text-base"
                      style={{ color: C.textMuted, fontFamily: FONTS.body }}
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
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════
   RSVP SECTION — Premium Elegante styled RSVP form
   ══════════════════════════════════════════════════════════ */
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
    if (phone.trim() && phone.length < 10) {
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
      const attendingMap: Record<string, string> = {
        yes: "YES",
        maybe: "MAYBE",
        no: "NO",
      };
      await submitRsvp(String(invitationId || ""), {
        guestName: name,
        guestPhone: phone || undefined,
        attending: attendingMap[attending] || "YES",
        guestCount,
        message: message || undefined,
      });
      setSubmitted(true);
    } catch {
      toast.error("Could not submit RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const attendOptions = [
    { value: "yes" as const, label: "Joyfully Accept", icon: "🌿" },
    { value: "maybe" as const, label: "Yet to Decide", icon: "💭" },
    { value: "no" as const, label: "Regretfully Decline", icon: "🙏" },
  ];

  if (submitted) {
    return (
      <section
        className="relative py-24 overflow-hidden"
        style={{ backgroundColor: C.bg }}
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: NOISE_BG }}
        />
        <div className="max-w-md mx-auto px-6 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center rounded-2xl p-10 border"
            style={{
              backgroundColor: C.cream,
              borderColor: `${C.gold}30`,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${C.gold}15` }}
            >
              <Check className="w-8 h-8" style={{ color: C.gold }} />
            </motion.div>
            <p
              className="text-2xl mb-2"
              style={{ fontFamily: FONTS.serif, color: C.text }}
            >
              Thank you, {name}!
            </p>
            <p
              className="text-sm"
              style={{ fontFamily: FONTS.body, color: C.textMuted }}
            >
              We can&apos;t wait to celebrate with you.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: NOISE_BG }}
      />

      <div className="max-w-md mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              className="w-16 h-[0.5px]"
              style={{ backgroundColor: C.goldLight }}
            />
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ color: C.gold }}
            >
              <path
                d="M10 2 Q12 6 16 8 Q12 10 10 14 Q8 10 4 8 Q8 6 10 2Z"
                fill="currentColor"
                opacity="0.5"
              />
            </svg>
            <div
              className="w-16 h-[0.5px]"
              style={{ backgroundColor: C.goldLight }}
            />
          </div>

          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: FONTS.body, color: C.textMuted }}
          >
            Kindly Respond
          </p>
          <h2
            className="text-3xl md:text-4xl"
            style={{ fontFamily: FONTS.serif, color: C.text }}
          >
            Will You Join Us?
          </h2>
        </motion.div>

        {/* RSVP Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 border space-y-6"
          style={{
            backgroundColor: C.cream,
            borderColor: `${C.gold}25`,
            boxShadow: `0 4px 30px ${C.gold}08`,
          }}
        >
          {/* Name */}
          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-2"
              style={{ fontFamily: FONTS.body, color: C.textMuted }}
            >
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                fontFamily: FONTS.body,
                color: C.text,
                backgroundColor: C.white,
                border: `1px solid ${C.gold}30`,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e) => (e.target.style.borderColor = `${C.gold}30`)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-2"
              style={{ fontFamily: FONTS.body, color: C.textMuted }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                fontFamily: FONTS.body,
                color: C.text,
                backgroundColor: C.white,
                border: `1px solid ${C.gold}30`,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e) => (e.target.style.borderColor = `${C.gold}30`)}
              placeholder="10-digit phone number"
            />
          </div>

          {/* Attendance */}
          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-3"
              style={{ fontFamily: FONTS.body, color: C.textMuted }}
            >
              Will you attend?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {attendOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAttending(opt.value)}
                  className="rounded-xl py-3 px-2 text-xs transition-all"
                  style={{
                    fontFamily: FONTS.body,
                    backgroundColor: attending === opt.value ? C.gold : C.white,
                    color: attending === opt.value ? C.white : C.text,
                    border: `1px solid ${attending === opt.value ? C.gold : `${C.gold}30`}`,
                  }}
                >
                  <span className="text-base block mb-0.5">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guest count */}
          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-3"
              style={{ fontFamily: FONTS.body, color: C.textMuted }}
            >
              Number of Guests
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{
                  border: `1px solid ${C.gold}40`,
                  color: C.gold,
                  backgroundColor: C.white,
                }}
              >
                <Minus size={16} />
              </button>
              <span
                className="text-xl font-semibold w-8 text-center tabular-nums"
                style={{ fontFamily: FONTS.serif, color: C.text }}
              >
                {guestCount}
              </span>
              <button
                type="button"
                onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                style={{
                  border: `1px solid ${C.gold}40`,
                  color: C.gold,
                  backgroundColor: C.white,
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              className="text-xs tracking-[0.15em] uppercase block mb-2"
              style={{ fontFamily: FONTS.body, color: C.textMuted }}
            >
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              style={{
                fontFamily: FONTS.body,
                color: C.text,
                backgroundColor: C.white,
                border: `1px solid ${C.gold}30`,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e) => (e.target.style.borderColor = `${C.gold}30`)}
              placeholder="Any message for the couple?"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              fontFamily: FONTS.body,
              backgroundColor: C.gold,
              color: C.white,
            }}
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send size={14} /> Send My RSVP
              </>
            )}
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default PremiumEleganteTemplate;
