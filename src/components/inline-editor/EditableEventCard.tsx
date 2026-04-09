import { useState } from 'react';
import { TemplateMode, EventData } from '@/templates/types';
import { MapPin, Trash2, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import EditableText from './EditableText';
import { formatEventDate, formatTime } from '@/utils/formatDate';

interface EditableEventCardProps {
  event: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onDelete: () => void;
  mode: TemplateMode;
  index: number;
  className?: string;
}

const eventIcons: Record<string, string> = {
  Haldi: '🌼',
  Mehendi: '🌿',
  Sangeet: '🎵',
  Wedding: '💒',
  Reception: '🥂',
  Engagement: '💍',
};

const EditableEventCard = ({
  event,
  onUpdate,
  onDelete,
  mode,
  index,
  className = '',
}: EditableEventCardProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const icon = eventIcons[event.eventName] || '✨';

  // View/Demo mode: beautiful static card
  if (mode !== 'edit') {
    return (
      <div className={cn(
        'bg-card rounded-2xl p-6 border border-border card-hover',
        className
      )}>
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="font-heading text-xl font-semibold mb-2">{event.eventName}</h3>
        <p className="font-body text-sm text-muted-foreground mb-1">
          {formatEventDate(event.eventDate)} · {formatTime(event.eventTime)}
        </p>
        <p className="font-body text-sm font-medium mt-3">{event.venueName}</p>
        <p className="font-body text-xs text-muted-foreground">{event.venueAddress}</p>
        {event.mapsUrl && (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 font-body text-xs text-primary hover:underline"
          >
            <MapPin size={14} /> View on Map
          </a>
        )}
      </div>
    );
  }

  // Edit mode: editable card
  return (
    <div className={cn(
      'bg-card rounded-2xl p-6 border border-border relative group',
      className
    )}>
      {/* Delete button */}
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-3 right-3 p-2 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
        title="Delete event"
      >
        <Trash2 size={16} />
      </button>

      <div className="text-3xl mb-3">{icon}</div>

      {/* Event Name */}
      <EditableText
        value={event.eventName}
        onSave={(val) => onUpdate({ eventName: val })}
        mode={mode}
        placeholder="Event Name"
        className="font-heading text-xl font-semibold mb-2 block"
        as="h3"
      />

      {/* Date & Time */}
      <div className="flex flex-wrap items-center gap-3 mb-3 font-body text-sm text-muted-foreground">
        {/* Date picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Calendar size={14} />
            {event.eventDate ? formatEventDate(event.eventDate) : 'Set Date'}
          </button>
          {showDatePicker && (
            <div className="absolute top-full left-0 mt-1 z-10 bg-card border border-border rounded-lg p-2 shadow-lg">
              <input
                type="date"
                value={event.eventDate}
                onChange={(e) => {
                  onUpdate({ eventDate: e.target.value });
                  setShowDatePicker(false);
                }}
                className="bg-transparent font-body text-sm text-foreground outline-none"
              />
            </div>
          )}
        </div>

        <span>·</span>

        {/* Time picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Clock size={14} />
            {event.eventTime ? formatTime(event.eventTime) : 'Set Time'}
          </button>
          {showTimePicker && (
            <div className="absolute top-full left-0 mt-1 z-10 bg-card border border-border rounded-lg p-2 shadow-lg">
              <input
                type="time"
                value={event.eventTime?.slice(0, 5) || ''}
                onChange={(e) => {
                  onUpdate({ eventTime: e.target.value + ':00' });
                  setShowTimePicker(false);
                }}
                className="bg-transparent font-body text-sm text-foreground outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Venue Name */}
      <EditableText
        value={event.venueName}
        onSave={(val) => onUpdate({ venueName: val })}
        mode={mode}
        placeholder="Venue Name"
        className="font-body text-sm font-medium block"
        as="p"
      />

      {/* Venue Address */}
      <EditableText
        value={event.venueAddress}
        onSave={(val) => onUpdate({ venueAddress: val })}
        mode={mode}
        placeholder="Venue Address"
        className="font-body text-xs text-muted-foreground mt-1 block"
        multiline
        as="p"
      />

      {/* Maps URL */}
      <div className="mt-3 flex items-center gap-1">
        <MapPin size={14} className="text-primary" />
        <EditableText
          value={event.mapsUrl || ''}
          onSave={(val) => onUpdate({ mapsUrl: val || null })}
          mode={mode}
          placeholder="Google Maps URL"
          className="font-body text-xs text-primary"
          as="span"
        />
      </div>
    </div>
  );
};

export default EditableEventCard;
