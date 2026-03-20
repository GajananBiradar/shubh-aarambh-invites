import { motion } from 'framer-motion';
import { Invitation, WeddingEvent } from '@/types';
import { MapPin } from 'lucide-react';
import { formatEventDate, formatTime } from '@/utils/formatDate';

const eventIcons: Record<string, string> = {
  Haldi: '🌼',
  Mehendi: '🌿',
  Sangeet: '🎵',
  Wedding: '💒',
  Reception: '🥂',
};

const EventCard = ({ event, index }: { event: WeddingEvent; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    className="card-hover bg-card rounded-2xl p-6 border border-border"
  >
    <div className="text-3xl mb-3">{eventIcons[event.eventName] || '✨'}</div>
    <h3 className="font-heading text-xl font-semibold mb-2">{event.eventName}</h3>
    <p className="font-body text-sm text-muted-foreground mb-1">
      {formatEventDate(event.date)} · {formatTime(event.time)}
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
  </motion.div>
);

const EventsSection = ({ invitation }: { invitation: Invitation }) => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8 }}
    className="py-16 bg-background"
  >
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="font-heading text-3xl font-bold text-center mb-10">Join Us For Our Celebrations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {invitation.events.map((e, i) => (
          <EventCard key={i} event={e} index={i} />
        ))}
      </div>
    </div>
  </motion.section>
);

export default EventsSection;
