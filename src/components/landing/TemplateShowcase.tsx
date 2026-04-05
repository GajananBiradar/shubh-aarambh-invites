import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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

/**
 * Dynamic Template Preview Component
 * Uses an iframe to render the template demo at a true mobile viewport width,
 * ensuring responsive Tailwind breakpoints behave correctly.
 */
const DynamicTemplatePreview = ({
  templateId,
}: {
  templateId: string | number;
  theme: string;
}) => {
  const MOBILE_WIDTH = 390;
  const MOBILE_HEIGHT = 844;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateScale = () => {
      const containerWidth = el.clientWidth;
      if (containerWidth > 0) {
        setScale(containerWidth / MOBILE_WIDTH);
      }
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative bg-black"
    >
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 bg-muted/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
      <iframe
        src={`/templates/${templateId}/demo`}
        title="Template preview"
        onLoad={() => setIframeLoaded(true)}
        className="pointer-events-none border-0 origin-top-left absolute top-0 left-0"
        style={{
          width: `${MOBILE_WIDTH}px`,
          height: `${MOBILE_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        tabIndex={-1}
        loading="lazy"
      />
    </div>
  );
};

const PriceBadge = ({ template }: { template: Template }) => {
  if (template.isFree) {
    return (
      <div className="absolute top-5 right-2.5 z-10 bg-emerald text-white font-body text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg">
        FREE
      </div>
    );
  }
  return (
    <div className="absolute top-5 right-2.5 z-10 btn-gold text-[10px] px-2.5 py-1 rounded-full">
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
      className="group max-w-[260px] mx-auto w-full cursor-pointer"
      onClick={() => window.open(`/templates/${template.id}/demo`, "_blank")}
    >
      {/* iPhone Frame */}
      <div className="relative rounded-[2rem] border-[3px] border-neutral-800 bg-neutral-900 p-[3px] shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-shadow duration-300">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 z-20 w-[60px] h-[14px] bg-neutral-900 rounded-full" />

        {/* Screen area */}
        <div className="relative rounded-[1.7rem] overflow-hidden aspect-[9/19.5] bg-black">
          {/* Template preview inside screen */}
          <div className="absolute inset-0">
            <DynamicTemplatePreview
              templateId={template.id}
              theme={template.theme}
            />
          </div>

          {/* Top badges */}
          {template.isPremium && (
            <div className="absolute top-5 left-2.5 z-10 bg-gold/90 text-background font-body text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Crown size={9} /> PREMIUM
            </div>
          )}
          <PriceBadge template={template} />

          {/* Bottom overlay with actions */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-3 px-3">
            <div className="flex gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/templates/${template.id}/demo`, "_blank");
                }}
                className="flex-1 bg-white/20 backdrop-blur-sm text-white px-1.5 py-1.5 rounded-lg text-[10px] font-body font-semibold flex items-center justify-center gap-1 hover:bg-white/30 transition-colors"
              >
                <Eye size={11} /> Demo
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerPaymentFlow(template.id);
                }}
                className={`flex-1 ${template.isFree ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-600 hover:bg-amber-700"} text-white px-1.5 py-1.5 rounded-lg text-[10px] font-body font-semibold flex items-center justify-center gap-1 transition-colors`}
              >
                <Sparkles size={11} /> {template.isFree ? "Free" : "Use"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Template name & description below frame */}
      <div className="mt-3 text-center px-1">
        <h3 className="font-display text-sm font-semibold leading-tight">
          {template.name}
        </h3>
        <p className="font-body text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
          {template.description}
        </p>
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
