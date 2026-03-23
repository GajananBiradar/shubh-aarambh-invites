import { motion } from 'framer-motion';
import { Palette, PenTool, Share2 } from 'lucide-react';

const steps = [
  { icon: Palette, num: '01', title: 'Choose Your Template', desc: 'Browse our designer-crafted collection. 3 free templates to start.' },
  { icon: PenTool, num: '02', title: 'Add Your Details', desc: 'Fill in your story, events, photos, and music. Save as draft anytime.' },
  { icon: Share2, num: '03', title: 'Share With Your Guests', desc: 'Publish and share one beautiful link with everyone, everywhere.' },
];

const HowItWorks = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-5xl font-semibold text-center mb-20"
      >
        Ready in minutes
      </motion.h2>
      <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-6 max-w-5xl mx-auto relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-px bg-border">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gold origin-left"
          />
        </div>
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 text-center relative z-10"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-card border border-border flex items-center justify-center mb-5 shadow-lg">
              <s.icon className="w-10 h-10 text-gold" />
            </div>
            <span className="font-body text-xs font-bold text-gold uppercase tracking-[0.2em]">{s.num}</span>
            <h3 className="font-display text-xl font-semibold mt-2 mb-3">{s.title}</h3>
            <p className="font-body text-sm text-muted-foreground font-light max-w-[220px] mx-auto leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
