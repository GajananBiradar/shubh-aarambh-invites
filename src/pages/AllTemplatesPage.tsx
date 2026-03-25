import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SAMPLE_INVITATION } from "@/mock/sampleInvitation";
import { Eye, Sparkles, Crown, Search, AlertCircle } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";
import { Template } from "@/types";
import PageWrapper from "@/components/layout/PageWrapper";
import { getTemplates } from "@/api/templates";
import { SkeletonGrid } from "@/components/ui/SkeletonLoading";

const MiniInvitePreview = ({ theme }: { theme: string }) => {
  const inv = SAMPLE_INVITATION;
  return (
    <div data-theme={theme} className="w-full bg-background text-foreground">
      <div className="h-52 bg-gradient-to-b from-primary/20 via-primary/5 to-background flex flex-col items-center justify-center p-6">
        <p className="font-body text-[10px] text-muted-foreground italic">
          Together with their families
        </p>
        <p className="font-script text-3xl text-primary mt-2">
          {inv.groomName.split(" ")[0]} & {inv.brideName.split(" ")[0]}
        </p>
        <div className="w-12 h-px bg-accent mt-3" />
      </div>
      <div className="flex justify-center gap-6 py-8 px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/15 mx-auto mb-2 ring-2 ring-accent/20" />
          <p className="text-[9px] font-display font-semibold">
            {inv.brideName.split(" ")[0]}
          </p>
        </div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-accent/15 mx-auto mb-2 ring-2 ring-accent/20" />
          <p className="text-[9px] font-display font-semibold">
            {inv.groomName.split(" ")[0]}
          </p>
        </div>
      </div>
      <div className="px-4 py-4 space-y-2">
        {inv.events.slice(0, 2).map((e, i) => (
          <div key={i} className="bg-card rounded-lg p-3 border border-border">
            <p className="text-[9px] font-display font-semibold">
              {e.eventName}
            </p>
            <p className="text-[8px] text-muted-foreground font-body">
              {e.venueName}
            </p>
          </div>
        ))}
      </div>
      <div className="h-24 bg-gradient-to-t from-primary/8 to-background flex items-center justify-center">
        <p className="font-script text-lg text-primary">{inv.hashtag}</p>
      </div>
    </div>
  );
};

const TemplateCard = ({ template }: { template: Template }) => {
  const { triggerPaymentFlow } = usePayment();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card-hover bg-card rounded-2xl overflow-hidden border border-border relative group"
    >
      {template.isPremium && (
        <div className="absolute top-3 left-3 z-10 bg-gold/90 text-background font-body text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Crown size={10} /> PREMIUM
        </div>
      )}
      {template.isFree ? (
        <div className="absolute top-3 right-3 z-10 bg-emerald text-white font-body text-xs font-semibold px-3 py-1.5 rounded-full">
          ✨ FREE
        </div>
      ) : (
        <div className="absolute top-3 right-3 z-10 btn-gold text-xs px-3 py-1.5 rounded-full">
          ₹{template.priceInr}
        </div>
      )}
      <div className="h-72 overflow-hidden relative">
        <div style={{ animation: "autoScroll 25s linear infinite" }}>
          <MiniInvitePreview theme={template.theme} />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-semibold">
            {template.name}
          </h3>
          <span className="font-body text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-full">
            {template.category}
          </span>
        </div>
        <p className="font-body text-xs text-muted-foreground line-clamp-1">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {template.tags.map((tag) => {
            const tagName = typeof tag === "string" ? tag : tag.name;
            return (
              <span
                key={tagName}
                className="font-body text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full"
              >
                {tagName}
              </span>
            );
          })}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() =>
              window.open(`/templates/${template.id}/demo`, "_blank")
            }
            className="flex-1 btn-outline-accent px-3 py-2 rounded-lg text-sm font-body font-semibold flex items-center justify-center gap-1.5"
          >
            <Eye size={16} /> Demo
          </button>
          <button
            onClick={() => triggerPaymentFlow(template.id)}
            className={`flex-1 ${template.isFree ? "btn-emerald" : "btn-gold"} px-3 py-2 rounded-lg text-sm font-body font-semibold flex items-center justify-center gap-1.5`}
          >
            <Sparkles size={16} />{" "}
            {template.isFree ? "Start Free" : "Use This Template"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AllTemplatesPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    data: templates = [] as Template[],
    isLoading,
    isError,
    error,
  } = useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: () => getTemplates(),
  });

  // Extract unique tags from templates
  const allTags = useMemo(() => {
    const tags = new Set(["All", "Free", "Premium"]);
    templates.forEach((t) => {
      if (Array.isArray(t.tags)) {
        t.tags.forEach((tag) => {
          const tagName = typeof tag === "string" ? tag : tag.name;
          tags.add(tagName);
        });
      }
    });
    return Array.from(tags).sort((a, b) => {
      // Keep All, Free, Premium at the start
      const order = { All: 0, Free: 1, Premium: 2 };
      const aOrder = order[a as keyof typeof order] ?? 999;
      const bOrder = order[b as keyof typeof order] ?? 999;
      return aOrder - bOrder;
    });
  }, [templates]);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return templates;
    if (activeFilter === "Free") return templates.filter((t) => t.isFree);
    if (activeFilter === "Premium") return templates.filter((t) => t.isPremium);
    return templates.filter((t) => {
      if (t.category === activeFilter) return true;
      if (Array.isArray(t.tags)) {
        return t.tags.some((tag) => {
          const tagName = typeof tag === "string" ? tag : tag.name;
          return tagName === activeFilter;
        });
      }
      return false;
    });
  }, [activeFilter, templates]);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">
            All Templates
          </h1>
          <p className="font-body text-muted-foreground font-light">
            Choose from our collection of beautiful wedding invitation
            templates.
          </p>
        </div>

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
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-12 sticky top-16 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`font-body text-xs px-4 py-2 rounded-full border transition-all ${
                    activeFilter === tag
                      ? "bg-gold text-background border-gold"
                      : "bg-card text-muted-foreground border-border hover:border-gold/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {filtered.map((t) => (
                  <TemplateCard key={t.id} template={t} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-body text-muted-foreground">
                  No templates match this filter. Try another category.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default AllTemplatesPage;
