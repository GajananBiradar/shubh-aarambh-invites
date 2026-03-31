import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SAMPLE_INVITATION } from "@/mock/sampleInvitation";
import {
  Eye,
  Sparkles,
  Crown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { usePayment } from "@/hooks/usePayment";
import { Template } from "@/types";
import { getTemplates } from "@/api/templates";
import { SkeletonGrid } from "@/components/ui/SkeletonLoading";
import { getTemplateComponent, getTemplateTheme } from "@/templates";
import {
  TemplateComponent,
  InvitationData,
  createEmptyInvitationData,
} from "@/templates/types";

const DynamicTemplatePreview = ({
  templateId,
  theme,
}: {
  templateId: string | number;
  theme: string;
}) => {
  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const sampleData: InvitationData = useMemo(() => {
    const base = createEmptyInvitationData(
      typeof templateId === "string" ? parseInt(templateId) : templateId,
      theme,
      { defaultPhotos: [], defaultMusicUrl: "", defaultMusicName: "" },
    );
    return {
      ...base,
      brideName: "Ananya",
      groomName: "Vikram",
      brideBio: "Designer who paints sunsets & dreams",
      groomBio: "Architect who builds worlds & love",
      couplePhotoUrl: null,
      hashtag: "#AnanyaWedVikram",
      welcomeMessage:
        "Together with our families, we invite you to celebrate our wedding.",
      showCountdown: true,
      weddingDate: "2026-02-14",
      events: [
        {
          id: 1,
          eventName: "Haldi",
          eventDate: "2026-02-11",
          eventTime: "10:00:00",
          venueName: "Sharma Residence",
          venueAddress: "Banjara Hills",
          mapsUrl: null,
        },
        {
          id: 2,
          eventName: "Mehendi",
          eventDate: "2026-02-12",
          eventTime: "17:00:00",
          venueName: "The Garden Club",
          venueAddress: "Jubilee Hills",
          mapsUrl: null,
        },
      ],
      galleryPhotos: [],
      status: "PUBLISHED",
    };
  }, [templateId, theme]);

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      setError(false);
      try {
        const id =
          typeof templateId === "number" ? templateId.toString() : templateId;
        const component = await getTemplateComponent(id);
        if (component) {
          setTemplateComp(() => component);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("[v0] Failed to load template:", e);
        setError(true);
      }
      setLoading(false);
    };
    loadTemplate();
  }, [templateId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !TemplateComp) {
    return <FallbackPreview theme={theme} />;
  }

  return (
    <div
      ref={containerRef}
      data-theme={theme}
      className="w-full h-full overflow-hidden relative bg-white"
    >
      <div
        className={`pointer-events-none origin-top-left absolute top-0 left-0 ${isVisible ? "showcase-preview-scroll" : ""}`}
        style={{
          width: "150%",
          transform: "scale(0.667)",
          transformOrigin: "top left",
        }}
      >
        <TemplateComp
          mode="view"
          data={sampleData}
          onUpdate={() => {}}
          onSaveDraft={() => Promise.resolve(null)}
          onPublish={() => Promise.resolve()}
          isSaving={false}
          isPublishing={false}
        />
      </div>
      <style>{`
        .showcase-preview-scroll {
          animation: showcaseAutoScroll 20s ease-in-out infinite alternate;
        }
        @keyframes showcaseAutoScroll {
          0% { transform: scale(0.667) translateY(0); }
          100% { transform: scale(0.667) translateY(-50%); }
        }
      `}</style>
    </div>
  );
};

const FallbackPreview = ({ theme }: { theme: string }) => {
  const inv = SAMPLE_INVITATION;
  return (
    <div data-theme={theme} className="w-full bg-background text-foreground">
      <div className="h-52 bg-gradient-to-b from-primary/20 via-primary/5 to-background flex flex-col items-center justify-center p-6">
        <p className="font-body text-[10px] text-muted-foreground italic tracking-wide">
          Together with our families
        </p>
        <p className="font-script text-3xl text-primary mt-2">
          {inv.groomName.split(" ")[0]} & {inv.brideName.split(" ")[0]}
        </p>
        <div className="w-12 h-px bg-accent mt-3" />
        <p className="text-[9px] text-muted-foreground mt-2 font-body tracking-widest uppercase">
          invite you to celebrate
        </p>
      </div>
      <div className="flex justify-center gap-6 py-8 px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/15 mx-auto mb-2 ring-2 ring-accent/20" />
          <p className="text-[9px] font-display font-semibold">
            {inv.brideName.split(" ")[0]}
          </p>
        </div>
        <div className="flex items-center text-accent text-xs">✦</div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-accent/15 mx-auto mb-2 ring-2 ring-accent/20" />
          <p className="text-[9px] font-display font-semibold">
            {inv.groomName.split(" ")[0]}
          </p>
        </div>
      </div>
    </div>
  );
};

const PriceBadge = ({ template }: { template: Template }) => {
  if (template.isFree) {
    return (
      <div className="absolute top-3 right-3 z-10 bg-emerald text-white font-body text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
        ✨ FREE
      </div>
    );
  }
  return (
    <div className="absolute top-3 right-3 z-10 btn-gold text-xs px-3 py-1.5 rounded-full">
      ₹{template.priceInr}
    </div>
  );
};

const TemplateCard = ({ template }: { template: Template }) => {
  const { triggerPaymentFlow } = usePayment();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-hover rounded-2xl overflow-hidden relative group max-w-[280px] mx-auto w-full aspect-[9/16] cursor-pointer"
      onClick={() => window.open(`/templates/${template.id}/demo`, "_blank")}
    >
      {/* Full-bleed template preview */}
      <div className="absolute inset-0">
        <DynamicTemplatePreview
          templateId={template.id}
          theme={template.theme}
        />
      </div>

      {/* Top badges */}
      {template.isPremium && (
        <div className="absolute top-3 left-3 z-10 bg-gold/90 text-background font-body text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm">
          <Crown size={10} /> PREMIUM
        </div>
      )}
      <PriceBadge template={template} />

      {/* Bottom overlay with info */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-16 pb-4 px-4">
        <h3 className="font-display text-base font-semibold text-white leading-tight">
          {template.name}
        </h3>
        <p className="font-body text-[11px] text-white/70 line-clamp-1 mt-1">
          {template.description}
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/templates/${template.id}/demo`, "_blank");
            }}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg text-xs font-body font-semibold flex items-center justify-center gap-1 hover:bg-white/30 transition-colors"
          >
            <Eye size={13} /> Demo
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerPaymentFlow(template.id);
            }}
            className={`flex-1 ${template.isFree ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-600 hover:bg-amber-700"} text-white px-2 py-1.5 rounded-lg text-xs font-body font-semibold flex items-center justify-center gap-1 transition-colors`}
          >
            <Sparkles size={13} /> {template.isFree ? "Free" : "Use"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TemplateShowcase = () => {
  const navigate = useNavigate();
  const {
    data: templates = [] as Template[],
    isLoading,
    isError,
    error,
  } = useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: () => getTemplates(),
  });

  const visibleTemplates = templates.slice(0, 6);

  return (
    <section id="templates" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
            Find Your Perfect Invitation
          </h2>
          <p className="text-muted-foreground font-body mb-16 max-w-lg mx-auto font-light">
            Start free. Upgrade when you're ready.
          </p>
        </motion.div>

        {/* Error State */}
        {isError && (
          <div className="max-w-6xl mx-auto mb-8 p-6 bg-destructive/10 border border-destructive/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-body font-semibold text-destructive mb-1">
                Unable to load templates
              </p>
              <p className="font-body text-sm text-destructive/80">
                {error instanceof Error
                  ? error.message
                  : "Please try refreshing the page"}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <SkeletonGrid count={6} />}

        {/* Loaded State */}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-center">
              {visibleTemplates.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-20">
                <p className="font-body text-muted-foreground">
                  No templates available yet. Check back soon!
                </p>
              </div>
            )}
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate("/templates")}
            className="btn-outline-accent px-8 py-3 rounded-xl text-sm inline-flex items-center gap-2"
          >
            Show All Templates <ChevronDown size={16} />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TemplateShowcase;
