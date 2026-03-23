import { motion } from 'framer-motion';
import { Check, Lock, Zap, RefreshCcw } from 'lucide-react';

const freeFeatures = [
  'All cinematic animations',
  'RSVP management',
  'Photo gallery',
  'Background music',
  'Lifetime shareable link',
  'Free updates forever',
];

const PricingSection = () => (
  <section id="pricing" className="py-24 bg-secondary/30">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
          Simple pricing. No surprises.
        </h2>
        <p className="text-muted-foreground font-body font-light max-w-md mx-auto">
          Start with our free templates. Upgrade only if you want more.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free tier */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl border border-border p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="mb-6">
            <span className="font-body text-xs font-semibold text-emerald uppercase tracking-widest">Free</span>
            <h3 className="font-display text-2xl font-semibold mt-2">3 Beautiful Templates</h3>
            <p className="font-body text-sm text-muted-foreground mt-1">Completely free. No catch, no trial.</p>
          </div>
          <div className="text-center mb-6">
            <span className="font-display text-5xl font-bold text-emerald">₹0</span>
          </div>
          <ul className="space-y-3 mb-8">
            {freeFeatures.map(f => (
              <li key={f} className="flex items-center gap-3 font-body text-sm">
                <Check className="w-4 h-4 text-emerald flex-shrink-0" />
                <span className="font-light">{f}</span>
              </li>
            ))}
          </ul>
          <a href="#templates" className="btn-emerald w-full py-3 rounded-xl text-base block text-center">
            Start Free →
          </a>
        </motion.div>

        {/* Premium tier */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card rounded-2xl border-2 border-gold/30 p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="mb-6">
            <span className="font-body text-xs font-semibold text-gold uppercase tracking-widest">Premium</span>
            <h3 className="font-display text-2xl font-semibold mt-2">Exclusive Designs</h3>
            <p className="font-body text-sm text-muted-foreground mt-1">Hand-crafted premium templates.</p>
          </div>
          <div className="text-center mb-6">
            <span className="font-body text-sm text-muted-foreground">From </span>
            <span className="font-display text-5xl font-bold text-gold">₹349</span>
            <p className="font-body text-xs text-muted-foreground mt-1">per invitation · one-time</p>
          </div>
          <ul className="space-y-3 mb-8">
            {['Everything in Free', 'Premium exclusive designs', 'Priority support', 'Custom branding options'].map(f => (
              <li key={f} className="flex items-center gap-3 font-body text-sm">
                <Check className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="font-light">{f}</span>
              </li>
            ))}
          </ul>
          <a href="#templates" className="btn-gold w-full py-3 rounded-xl text-base block text-center">
            View Premium Templates →
          </a>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground font-body">
        <span className="flex items-center gap-1.5"><Lock size={13} /> Razorpay Secured</span>
        <span className="flex items-center gap-1.5"><Zap size={13} /> Instant Publish</span>
        <span className="flex items-center gap-1.5"><RefreshCcw size={13} /> Edit Anytime</span>
      </div>
    </div>
  </section>
);

export default PricingSection;
