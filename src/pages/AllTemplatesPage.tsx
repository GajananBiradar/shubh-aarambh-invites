import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Sparkles,
  Crown,
  Search,
  AlertCircle,
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
import toast from "react-hot-toast";
import LazyTemplatePreview from "@/components/ui/LazyTemplatePreview";
import { warmTemplateExperience } from "@/lib/preloadTemplateExperience";
import { formatTemplatePrice } from "@/lib/pricing";

interface DraftInfo {
  invitationId: number;
  templateId: number;
  brideName: string;
  groomName: string;
  updatedAt: string;
}

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
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const warmPreview = () => {
    warmTemplateExperience(queryClient, template.id);
  };

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
      className="group max-w-[260px] mx-auto w-full cursor-pointer"
      onClick={() => window.open(`/templates/${template.id}/demo`, "_blank")}
      onMouseEnter={warmPreview}
      onFocus={warmPreview}
      onTouchStart={warmPreview}
    >
      {/* iPhone Frame */}
      <div className="relative rounded-[2rem] border-[3px] border-neutral-800 bg-neutral-900 p-[3px] shadow-xl shadow-black/20 group-hover:shadow-2xl group-hover:shadow-gold/10 group-hover:border-neutral-700 transition-all duration-500 group-hover:scale-[1.02]">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 z-20 w-[60px] h-[14px] bg-neutral-900 rounded-full" />

        {/* Screen area */}
        <div className="relative rounded-[1.7rem] overflow-hidden aspect-[9/19.5] bg-black">
          {/* Template preview inside screen */}
          <div className="absolute inset-0">
            <LazyTemplatePreview
              templateId={template.id}
              posterSrc={
                template.thumbnailUrl ||
                template.previewImageUrl ||
                template.previewImage ||
                template.defaultPhotos?.[0]?.photoUrl ||
                null
              }
              title={template.name}
            />
          </div>

          {/* Top badges */}
          {draftInfo && (
            <div className="absolute top-5 left-2.5 z-10 bg-amber-500/90 text-amber-950 font-body text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              ✏️ Draft
            </div>
          )}
          {template.isPremium && !draftInfo && (
            <div className="absolute top-5 left-2.5 z-10 bg-gold/90 text-background font-body text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Crown size={9} /> PREMIUM
            </div>
          )}
          {template.isFree ? (
            <div className="absolute top-5 right-2.5 z-10 bg-emerald text-white font-body text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              FREE
            </div>
          ) : (
            <div className="absolute top-5 right-2.5 z-10 btn-gold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm">
              {formatTemplatePrice(template)}
            </div>
          )}

          {/* Bottom overlay with actions */}
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-3 px-3">
            {draftInfo ? (
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit/${draftInfo.invitationId}`);
                  }}
                  className="flex-1 bg-white/20 backdrop-blur-sm text-white px-1.5 py-1.5 rounded-lg text-[10px] font-body font-semibold flex items-center justify-center gap-1 hover:bg-white/30 transition-colors"
                >
                  <Pencil size={11} /> Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="flex-1 bg-white/20 backdrop-blur-sm text-white px-1.5 py-1.5 rounded-lg text-[10px] font-body font-semibold flex items-center justify-center gap-1 hover:bg-red-500/60 transition-colors"
                >
                  <Trash2 size={11} /> Fresh
                </button>
              </div>
            ) : (
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
                    triggerPaymentFlow(template.id, template);
                  }}
                  className={`flex-1 ${template.isFree ? "bg-emerald-500 hover:bg-emerald-600" : "bg-amber-600 hover:bg-amber-700"} text-white px-1.5 py-1.5 rounded-lg text-[10px] font-body font-semibold flex items-center justify-center gap-1 transition-colors`}
                >
                  <Sparkles size={11} /> {template.isFree ? "Free" : "Use"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template name & category below frame */}
      <div className="mt-3 text-center px-1">
        <h3 className="font-display text-sm font-semibold leading-tight">
          {template.name}
        </h3>
        {template.category && (
          <span className="inline-block mt-1.5 font-body text-[10px] tracking-wide uppercase text-muted-foreground/70 border border-border/50 rounded-full px-2.5 py-0.5">
            {template.category.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
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
            <div className="flex flex-wrap gap-2 justify-center mb-12 sticky top-16 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-border/30">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`font-body text-xs px-5 py-2 rounded-full border transition-all duration-300 ${
                    activeFilter === tag
                      ? "bg-gold text-background border-gold shadow-md shadow-gold/20 scale-105"
                      : "bg-card text-muted-foreground border-border hover:border-gold/50 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto justify-items-center">
                {filtered.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    draftInfo={drafts.get(Number(t.id))}
                    onDraftDelete={() => {
                      const newDrafts = new Map(drafts);
                      newDrafts.delete(Number(t.id));
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
