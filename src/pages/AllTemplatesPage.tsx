import { useState, useMemo, useEffect, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SAMPLE_INVITATION } from "@/mock/sampleInvitation";
import {
  Eye,
  Sparkles,
  Crown,
  Search,
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { usePayment } from "@/hooks/usePayment";
import { useAuthStore } from "@/store/authStore";
import { Template } from "@/types";
import PageWrapper from "@/components/layout/PageWrapper";
import { getTemplates } from "@/api/templates";
import { getMyDrafts } from "@/api/invitations";
import { deleteInvitation } from "@/api/invitations";
import { SkeletonGrid } from "@/components/ui/SkeletonLoading";
import { getTemplateComponent, getTemplateTheme } from "@/templates";
import {
  TemplateComponent,
  InvitationData,
  createEmptyInvitationData,
} from "@/templates/types";
import toast from "react-hot-toast";

interface DraftInfo {
  invitationId: number;
  templateId: number;
  brideName: string;
  groomName: string;
  updatedAt: string;
}

/**
 * Dynamic Template Preview Component
 * Loads and renders the actual template component in a mini preview mode
 */
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

  // Create sample data for preview
  const sampleData: InvitationData = useMemo(() => {
    const base = createEmptyInvitationData(
      typeof templateId === "string" ? parseInt(templateId) : templateId,
      theme,
      { defaultPhotos: [], defaultMusicUrl: "", defaultMusicName: "" },
    );

    // Add sample data to make preview look nice
    return {
      ...base,
      brideName: "Ananya",
      groomName: "Vikram",
      brideBio: "Designer who paints sunsets & dreams",
      groomBio: "Architect who builds worlds & love",
      couplePhotoUrl: null,
      hashtag: "#AnanyaWedVikram",
      welcomeMessage:
        "Together with their families, we invite you to celebrate our wedding.",
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

  if (loading) {
    return (
      <div className="w-full h-full bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !TemplateComp) {
    // Fallback to simple preview
    return <FallbackPreview theme={theme} />;
  }

  return (
    <div
      data-theme={theme}
      className="w-full h-full overflow-hidden transform origin-top scale-[0.35] -mt-[32.5%]"
      style={{ width: "285%", height: "285%" }}
    >
      <div className="pointer-events-none">
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
    </div>
  );
};

/**
 * Fallback simple preview when template component fails to load
 */
const FallbackPreview = ({ theme }: { theme: string }) => {
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

const TemplateCard = ({
  template,
  draftInfo,
  onDraftDelete,
}: {
  template: Template;
  draftInfo?: DraftInfo;
  onDraftDelete?: () => void;
}) => {
  const { triggerPaymentFlow } = usePayment();
  const navigate = useNavigate();
  const templateTheme = template.themeKey || template.theme || "crimson";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteDraft = async () => {
    if (!draftInfo) return;
    setIsDeleting(true);
    try {
      await deleteInvitation(String(draftInfo.invitationId));
      toast.success("Draft deleted");
      onDraftDelete?.();
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error("Failed to delete draft");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card-hover bg-card rounded-2xl overflow-hidden border border-border relative group"
    >
      {draftInfo && (
        <div className="absolute top-3 left-3 z-10 bg-amber-500/90 text-amber-950 font-body text-[10px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1">
          ✏️ Draft saved
        </div>
      )}
      {template.isPremium && !draftInfo && (
        <div className="absolute top-3 left-3 z-10 bg-gold/90 text-background font-body text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Crown size={10} /> PREMIUM
        </div>
      )}
      {template.isFree ? (
        <div className="absolute top-3 right-3 z-10 bg-emerald text-white font-body text-xs font-semibold px-3 py-1.5 rounded-full">
          FREE
        </div>
      ) : (
        <div className="absolute top-3 right-3 z-10 btn-gold text-xs px-3 py-1.5 rounded-full">
          ₹{template.priceInr}
        </div>
      )}

      {/* Template Preview - Uses actual template component */}
      <div className="h-72 overflow-hidden relative bg-background">
        <div
          className="w-full h-full"
          style={{ animation: "autoScroll 25s linear infinite" }}
        >
          <DynamicTemplatePreview
            templateId={template.id}
            theme={templateTheme}
          />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
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

        {draftInfo ? (
          <>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 my-3">
              <p className="font-body text-xs text-amber-900/80">
                Draft:{" "}
                {draftInfo.brideName && draftInfo.groomName
                  ? `${draftInfo.brideName} & ${draftInfo.groomName}`
                  : "Draft in progress"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/edit/${draftInfo.invitationId}`)}
                className="w-full btn-outline-accent px-3 py-2 rounded-lg text-sm font-body font-semibold flex items-center justify-center gap-1.5"
              >
                <Pencil size={16} /> Continue Editing
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full btn-outline-accent px-3 py-2 rounded-lg text-sm font-body font-semibold flex items-center justify-center gap-1.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={16} /> Start Fresh
              </button>
            </div>
          </>
        ) : (
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
        )}

        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-lg font-semibold mb-2">
                Start Fresh?
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-6">
                You already have a draft for this template. Starting fresh will
                delete your current draft and all uploaded photos. Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-outline-accent px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDraft}
                  disabled={isDeleting}
                  className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Start Fresh"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const AllTemplatesPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [drafts, setDrafts] = useState<Map<number, DraftInfo>>(new Map());
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const { isAuthenticated } = useAuthStore();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load drafts if logged in
  useEffect(() => {
    if (isAuthenticated) {
      getMyDrafts()
        .then((draftList) => {
          const draftMap = new Map();
          draftList.forEach((draft) => {
            draftMap.set(draft.templateId, draft);
          });
          setDrafts(draftMap);
        })
        .catch(() => {
          // Silently ignore errors
        })
        .finally(() => {
          setLoadingDrafts(false);
        });
    } else {
      setLoadingDrafts(false);
    }
  }, [isAuthenticated]);

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
                  <TemplateCard
                    key={t.id}
                    template={t}
                    draftInfo={drafts.get(t.id)}
                    onDraftDelete={() => {
                      const newDrafts = new Map(drafts);
                      newDrafts.delete(t.id);
                      setDrafts(newDrafts);
                    }}
                  />
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
