import { TemplateMode } from '@/templates/types';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddEventButtonProps {
  onAdd: () => void;
  mode: TemplateMode;
  className?: string;
  maxEvents?: number;
  currentCount?: number;
}

const AddEventButton = ({
  onAdd,
  mode,
  className = '',
  maxEvents = 8,
  currentCount = 0,
}: AddEventButtonProps) => {
  // Only show in edit mode
  if (mode !== 'edit') return null;

  const isDisabled = currentCount >= maxEvents;

  return (
    <button
      onClick={onAdd}
      disabled={isDisabled}
      className={cn(
        'w-full py-4 rounded-2xl border-2 border-dashed border-border',
        'flex items-center justify-center gap-2',
        'font-body text-sm text-foreground/85 bg-background/20',
        'transition-all',
        isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-primary/60 hover:text-primary hover:bg-primary/10 cursor-pointer',
        className
      )}
    >
      <Plus size={18} className="text-current" />
      {isDisabled ? `Maximum ${maxEvents} events` : 'Add Event'}
    </button>
  );
};

export default AddEventButton;
