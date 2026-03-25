import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditModeToolbarProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  invitationId: number | null;
  hasUnsavedChanges: boolean;
  className?: string;
}

const EditModeToolbar = ({
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
  invitationId,
  hasUnsavedChanges,
  className = '',
}: EditModeToolbarProps) => {
  const isDisabled = isSaving || isPublishing;

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'bg-card/95 backdrop-blur-xl border-t border-border',
      'px-4 py-3 safe-area-bottom',
      className
    )}>
      <div className="container mx-auto max-w-4xl flex items-center justify-between gap-3">
        {/* Left: Back link */}
        <Link
          to="/templates"
          className="flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Templates</span>
        </Link>

        {/* Center: Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveDraft}
            disabled={isDisabled}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl',
              'font-body text-sm font-medium',
              'border border-border bg-card hover:bg-secondary transition-colors',
              isDisabled && 'opacity-50 cursor-not-allowed'
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

          <button
            onClick={onPublish}
            disabled={isDisabled}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2 rounded-xl',
              'font-body text-sm font-medium',
              'btn-gold',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isPublishing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Publish</span>
              </>
            )}
          </button>
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
