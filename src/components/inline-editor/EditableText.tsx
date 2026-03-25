import { useState, useRef, useEffect } from 'react';
import { TemplateMode } from '@/templates/types';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  mode: TemplateMode;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  maxLength?: number;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const EditableText = ({
  value,
  onSave,
  mode,
  placeholder = 'Click to edit',
  className = '',
  inputClassName = '',
  multiline = false,
  maxLength,
  as: Component = 'span',
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onSave(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  // View/Demo mode: just render the text
  if (mode !== 'edit') {
    return (
      <Component className={className}>
        {value || placeholder}
      </Component>
    );
  }

  // Edit mode: show editable field
  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newVal = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
        setLocalValue(newVal);
      },
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      placeholder,
      className: cn(
        'bg-transparent border-b-2 border-primary/50 focus:border-primary outline-none w-full',
        'text-inherit font-inherit',
        inputClassName
      ),
      style: { font: 'inherit' },
    };

    return (
      <div className="relative inline-block w-full">
        {multiline ? (
          <textarea
            {...commonProps}
            rows={3}
            className={cn(commonProps.className, 'resize-none')}
          />
        ) : (
          <input type="text" {...commonProps} />
        )}
        {maxLength && (
          <span className="absolute right-0 -bottom-5 text-[10px] text-muted-foreground">
            {localValue.length}/{maxLength}
          </span>
        )}
      </div>
    );
  }

  // Edit mode: show text with hover effect
  return (
    <Component
      onClick={() => setIsEditing(true)}
      className={cn(
        className,
        'cursor-pointer relative group transition-all',
        'hover:bg-primary/10 hover:outline hover:outline-2 hover:outline-primary/30 hover:outline-offset-2 rounded',
        !value && 'text-muted-foreground italic'
      )}
    >
      {value || placeholder}
      <span className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil size={14} className="text-primary" />
      </span>
    </Component>
  );
};

export default EditableText;
