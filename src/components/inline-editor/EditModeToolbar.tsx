import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditModeToolbarProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  onPreview?: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  invitationId: number | null;
  hasUnsavedChanges: boolean;
  slug?: string;
  onSlugChange?: (slug: string) => void;
  slugStatus?: "checking" | "available" | "taken" | "idle";
  className?: string;
  showPreviewMode?: boolean;
}

const EditModeToolbar = ({
  onSaveDraft,
  onPublish,
  onPreview,
  isSaving,
  isPublishing,
  invitationId,
  hasUnsavedChanges,
  slug = "",
  onSlugChange,
  slugStatus = "idle",
  className = "",
  showPreviewMode = false,
}: EditModeToolbarProps) => {
  const isDisabled = isSaving || isPublishing;

  // Handle back button - only auto-save if we have an invitationId (edit mode)
  const handleBack = async (e: React.MouseEvent) => {
    if (invitationId && hasUnsavedChanges) {
      // Edit mode: save draft before navigating back
      e.preventDefault();
      await onSaveDraft();
    }
    // Create mode or no changes: just navigate
    window.location.href = "/templates";
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-xl border-t border-border",
        "px-4 py-3 safe-area-bottom",
        className,
      )}
    >
      <div className="container mx-auto max-w-5xl flex items-center justify-between gap-3">
        {/* Left: Back button with auto-save */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Templates</span>
        </button>

        <div className="flex items-center gap-3 flex-1 justify-center">
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 min-w-[280px]">
            <span className="font-body text-xs text-muted-foreground">Slug</span>
            <input
              value={slug}
              onChange={(e) => onSlugChange?.(e.target.value)}
              placeholder="your-invite-slug"
              className="flex-1 bg-transparent outline-none font-body text-sm"
            />
            <span className="font-body text-[11px] text-muted-foreground">
              {slugStatus === "checking"
                ? "Checking..."
                : slugStatus === "taken"
                  ? "Taken"
                  : slugStatus === "available"
                    ? "Available"
                    : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
          {/* Save Draft - only show in edit mode (when invitationId exists) */}
          {invitationId && (
            <button
              onClick={onSaveDraft}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl",
                "font-body text-sm font-medium",
                "border border-border bg-card hover:bg-secondary transition-colors",
                isDisabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Draft</span>
                </>
              )}
            </button>
          )}

          {/* Preview/Publish button */}
          <button
            onClick={showPreviewMode && onPreview ? onPreview : onPublish}
            disabled={isDisabled}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2 rounded-xl",
              "font-body text-sm font-medium",
              showPreviewMode ? "btn-outline-accent" : "btn-gold",
              isDisabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {isPublishing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>
                  {showPreviewMode ? "Loading Preview..." : "Publishing..."}
                </span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{showPreviewMode ? "Preview" : "Publish"}</span>
              </>
            )}
          </button>
          </div>
        </div>

        {/* Right: Save status */}
        <div className="flex items-center gap-1.5 font-body text-xs text-muted-foreground min-w-[100px] justify-end">
          {isSaving ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <AlertCircle size={12} className="text-amber-500" />
              <span className="hidden sm:inline">Unsaved changes</span>
            </>
          ) : invitationId ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="hidden sm:inline">Saved</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EditModeToolbar;
