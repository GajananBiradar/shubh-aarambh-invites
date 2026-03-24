import { motion } from 'framer-motion';
import { Invitation } from '@/types';
import { useState } from 'react';
import { submitRsvp } from '@/api/rsvp';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface RsvpSectionProps {
  invitation: Invitation;
  isDemo?: boolean;
}

const RsvpSection = ({ invitation, isDemo }: RsvpSectionProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [guestCount, setGuestCount] = useState(2);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (!phone.trim() || phone.length < 10) { toast.error('Please enter a valid 10-digit phone number'); return; }

    if (isDemo) {
      toast('This is a demo — create your invitation to receive real RSVPs 😊', { icon: '✨' });
      return;
    }

    setLoading(true);
    try {
      await submitRsvp(invitation.id || '', { name, phone, attending, guestCount });
      setSubmitted(true);
    } catch {
      toast.error('Could not submit RSVP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const attendOptions = [
    { value: 'yes' as const, label: '🌸 Joyfully Accept', },
    { value: 'maybe' as const, label: '💭 Yet to Decide' },
    { value: 'no' as const, label: '🙏 Regretfully Decline' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-background"
    >
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center text-accent text-lg mb-4">─── ✿ ───</div>
        <h2 className="font-heading text-3xl font-bold text-center mb-8">Will You Join Our Celebration?</h2>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center bg-card rounded-2xl p-8 border border-border"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-accent" />
            </motion.div>
            <p className="font-heading text-xl font-semibold mb-2">Thank you, {name}! 🎉</p>
            <p className="font-body text-sm text-muted-foreground">We can't wait to celebrate with you.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Your Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-1.5">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="10-digit phone number"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-2">Will you attend?</label>
              <div className="grid grid-cols-3 gap-2">
                {attendOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAttending(opt.value)}
                    className={`rounded-xl py-2.5 px-2 font-body text-xs font-medium transition-all border ${
                      attending === opt.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-body text-sm font-medium block mb-2">Number of Guests</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-10 h-10 rounded-xl border border-border bg-card font-body text-lg hover:bg-muted transition-colors"
                >
                  −
                </button>
                <span className="font-body text-lg font-semibold w-8 text-center tabular-nums">{guestCount}</span>
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.min(10, guestCount + 1))}
                  className="w-10 h-10 rounded-xl border border-border bg-card font-body text-lg hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 rounded-xl text-base disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send My RSVP'}
            </button>
          </form>
        )}
      </div>
    </motion.section>
  );
};

export default RsvpSection;
