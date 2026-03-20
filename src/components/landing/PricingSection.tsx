import { motion } from 'framer-motion';
import { Check, Lock, Zap, RotateCcw } from 'lucide-react';

const features = [
  'All animations included',
  'RSVP management',
  'Photo gallery',
  'Background music',
  'Lifetime shareable link',
  'Free updates',
];

const PricingSection = () => (
  <section id="pricing" className="py-20 bg-muted/50">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-heading text-3xl md:text-4xl font-bold text-center mb-4"
      >
        Simple, Honest Pricing
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-center text-muted-foreground font-body mb-12"
      >
        No subscriptions. No hidden fees.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto bg-card rounded-3xl border border-border p-8 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="text-center mb-6">
          <span className="font-heading text-5xl font-bold text-accent">₹500</span>
          <p className="font-body text-muted-foreground mt-2">One-time payment. Yours forever.</p>
        </div>
        <ul className="space-y-3 mb-8">
          {features.map(f => (
            <li key={f} className="flex items-center gap-3 font-body text-sm">
              <Check className="w-5 h-5 text-accent flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a href="/register" className="btn-gold w-full py-3 rounded-xl text-base block text-center">
          Create My Invitation
        </a>
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground font-body">
          <span className="flex items-center gap-1"><Lock size={12} /> Secure Payment</span>
          <span className="flex items-center gap-1"><Zap size={12} /> Instant Access</span>
          <span className="flex items-center gap-1"><RotateCcw size={12} /> Satisfaction Guaranteed</span>
        </div>
      </motion.div>
    </div>
  </section>
);

export default PricingSection;
