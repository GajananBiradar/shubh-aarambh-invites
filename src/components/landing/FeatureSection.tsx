import { motion } from 'framer-motion';
import { Sparkles, Users, Link2, Music, Image, Timer } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'Cinematic Animations', desc: 'Every scroll, every reveal, every moment — crafted to perfection.' },
  { icon: Users, title: 'RSVP Management', desc: 'Know exactly who\'s celebrating with you. Real-time guest tracking.' },
  { icon: Link2, title: 'Instant Sharing', desc: 'One link. WhatsApp. Done. Share with everyone in seconds.' },
  { icon: Music, title: 'Background Music', desc: 'Set the emotional tone before they even scroll. Your song, your vibe.' },
  { icon: Image, title: 'Photo Gallery', desc: 'Show them your journey, not just your date. Beautiful masonry grid.' },
  { icon: Timer, title: 'Live Countdown', desc: 'Build the anticipation, day by day. Flip-card timer included.' },
];

const FeatureSection = () => (
  <section id="features" className="py-24 bg-secondary/30">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
          Everything your guests deserve
        </h2>
        <p className="text-muted-foreground font-body font-light max-w-md mx-auto">
          Every detail designed to make your invitation unforgettable.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="card-hover bg-card rounded-2xl p-8 border border-border group"
          >
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
              <f.icon className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
            <p className="font-body text-sm text-muted-foreground font-light leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureSection;
