import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const CustomTemplateCTA = () => (
  <section className="py-24 bg-card border-y border-border relative overflow-hidden">
    {/* Subtle pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `radial-gradient(circle at 30% 50%, hsl(var(--gold)) 0%, transparent 50%),
                        radial-gradient(circle at 70% 50%, hsl(var(--gold)) 0%, transparent 50%)`
    }} />
    <div className="container mx-auto px-4 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Sparkles className="w-8 h-8 text-gold mx-auto mb-6" />
        <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
          Have something unique in mind?
        </h2>
        <p className="font-body text-muted-foreground font-light max-w-lg mx-auto mb-10 text-lg">
          We'll craft a completely custom invitation tailored to your vision, culture, and style.
        </p>
        <a href="#quote-form" className="btn-gold px-10 py-4 rounded-xl text-base inline-flex items-center gap-2">
          Request a Custom Invitation →
        </a>
      </motion.div>
    </div>
  </section>
);

export default CustomTemplateCTA;
