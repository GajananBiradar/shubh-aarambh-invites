import { ReactNode } from "react";
import { Template } from "@/types";

const themeSurfaceMap: Record<
  string,
  { glow: string; tint: string; accent: string; text: string }
> = {
  crimson: {
    glow: "from-amber-400/25 via-rose-600/10 to-transparent",
    tint: "from-[#2a090c] via-[#5e1718] to-[#120507]",
    accent: "border-amber-300/30 text-amber-100",
    text: "text-amber-50",
  },
  ivory: {
    glow: "from-amber-300/20 via-stone-300/15 to-transparent",
    tint: "from-[#f9f3e8] via-[#eee1cf] to-[#e3d1ba]",
    accent: "border-stone-500/20 text-stone-700",
    text: "text-stone-900",
  },
  blossom: {
    glow: "from-rose-300/30 via-pink-200/20 to-transparent",
    tint: "from-[#fff8f5] via-[#f7ece7] to-[#f1ddd7]",
    accent: "border-rose-300/30 text-rose-900",
    text: "text-stone-900",
  },
  midnight: {
    glow: "from-yellow-300/20 via-sky-400/10 to-transparent",
    tint: "from-[#081426] via-[#10243e] to-[#050b17]",
    accent: "border-yellow-200/25 text-yellow-50",
    text: "text-white",
  },
  golden: {
    glow: "from-amber-300/25 via-orange-300/10 to-transparent",
    tint: "from-[#f7efe2] via-[#e8d6bf] to-[#cdb493]",
    accent: "border-amber-600/20 text-amber-950",
    text: "text-stone-950",
  },
  blush: {
    glow: "from-rose-200/25 via-orange-100/15 to-transparent",
    tint: "from-[#fff8f5] via-[#f5e6e0] to-[#e8d0c6]",
    accent: "border-rose-300/25 text-rose-900",
    text: "text-stone-900",
  },
  finca: {
    glow: "from-lime-200/20 via-emerald-200/15 to-transparent",
    tint: "from-[#eff0e3] via-[#d9dbc7] to-[#b6b59d]",
    accent: "border-lime-800/20 text-lime-950",
    text: "text-lime-950",
  },
  premium: {
    glow: "from-amber-300/30 via-orange-200/20 to-transparent",
    tint: "from-[#fbf4e6] via-[#e9dbc5] to-[#d6b992]",
    accent: "border-amber-700/20 text-amber-950",
    text: "text-stone-950",
  },
};

const fallbackSurface = themeSurfaceMap.crimson;

const sanitizeImageUrl = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getTemplatePreviewImage = (template: Template) =>
  sanitizeImageUrl(
    template.thumbnailUrl ||
      template.previewImageUrl ||
      template.previewImage ||
      template.defaultPhotos?.[0]?.photoUrl,
  );

interface TemplatePosterFrameProps {
  template: Template;
  topLeftBadge?: ReactNode;
  topRightBadge?: ReactNode;
  children?: ReactNode;
}

const TemplatePosterFrame = ({
  template,
  topLeftBadge,
  topRightBadge,
  children,
}: TemplatePosterFrameProps) => {
  const previewImage = getTemplatePreviewImage(template);
  const surface =
    themeSurfaceMap[template.themeKey || template.theme] || fallbackSurface;

  return (
    <div className="relative rounded-[2.25rem] border border-white/10 bg-[#120f0b] p-[4px] shadow-[0_28px_80px_rgba(0,0,0,0.36)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_36px_110px_rgba(0,0,0,0.5)]">
      <div className="absolute left-1/2 top-[8px] z-20 h-[13px] w-[74px] -translate-x-1/2 rounded-full bg-[#100d0a]" />
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.95rem] bg-[#1b140f]">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${surface.tint}`}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${surface.glow}`}
          aria-hidden="true"
        />

        {previewImage ? (
          <img
            src={previewImage}
            alt={template.name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-x-[16%] top-[12%] h-[32%] rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-sm" />
            <div className="absolute left-[12%] top-[22%] h-[18%] w-[28%] rounded-[1.4rem] border border-white/20 bg-black/10" />
            <div className="absolute right-[12%] top-[50%] h-[26%] w-[32%] rounded-[1.5rem] border border-white/20 bg-white/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/22 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/22 to-transparent" />

        {topLeftBadge && (
          <div className="absolute left-3 top-5 z-10">{topLeftBadge}</div>
        )}
        {topRightBadge && (
          <div className="absolute right-3 top-5 z-10">{topRightBadge}</div>
        )}

        <div className="absolute inset-x-4 bottom-20 z-10">
          <div
            className={`inline-flex rounded-full border bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em] backdrop-blur-sm ${surface.accent}`}
          >
            {template.category.replace(/_/g, " ")}
          </div>
          <div className={`mt-4 max-w-[70%] ${surface.text}`}>
            <h3 className="font-display text-[2rem] leading-[0.95] drop-shadow-md">
              {template.name}
            </h3>
            <p className="mt-3 font-body text-[11px] leading-5 text-white/80">
              {template.shortDescription ||
                template.description ||
                "An elevated invitation with thoughtful storytelling and premium detail."}
            </p>
          </div>
        </div>

        {children && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/92 via-black/72 to-transparent px-3 pb-3 pt-14">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePosterFrame;
