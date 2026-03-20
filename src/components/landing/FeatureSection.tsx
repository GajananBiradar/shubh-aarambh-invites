import { motion } from 'framer-motion';
import { Sparkles, Users, Link2, Music, Image, Timer } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'Animated Invite', desc: 'Stunning scroll animations that bring your invitation to life.' },
  { icon: Users, title: 'RSVP Tracking', desc: 'Know who\'s coming with built-in RSVP management.' },
  { icon: Link2, title: 'Shareable Link', desc: 'One link to share on WhatsApp, Instagram, or anywhere.' },
  { icon: Music, title: 'Background Music', desc: 'Set the mood with your favourite wedding song.' },
  { icon: Image, title: 'Photo Gallery', desc: 'Showcase your best moments in a beautiful gallery.' },
  { icon: Timer, title: 'Countdown Timer', desc: 'Build excitement with a live countdown to your big day.' },
];

const FeatureSection = () => (
  <section id="features" className="py-20 bg-muted/50">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-heading text-3xl md:text-4xl font-bold text-center mb-12"
      >
        Everything You Need for the Perfect Invite
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="card-hover bg-card rounded-2xl p-6 border border-border group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
            <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureSection;
