import { motion } from 'framer-motion';
import { Palette, PenTool, Share2 } from 'lucide-react';

const steps = [
  { icon: Palette, num: 1, title: 'Choose Template', desc: 'Pick from our curated collection of beautiful designs.' },
  { icon: PenTool, num: 2, title: 'Fill Your Details', desc: 'Add your events, photos, music, and personal touches.' },
  { icon: Share2, num: 3, title: 'Share the Love', desc: 'Get your unique link and share on WhatsApp instantly.' },
];

const HowItWorks = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-heading text-3xl md:text-4xl font-bold text-center mb-16"
      >
        Ready in Minutes
      </motion.h2>
      <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-4 max-w-4xl mx-auto relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-border">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-accent origin-left"
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
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mb-4">
              <s.icon className="w-8 h-8 text-accent" />
            </div>
            <span className="font-body text-xs font-bold text-accent uppercase tracking-widest">Step {s.num}</span>
            <h3 className="font-heading text-xl font-semibold mt-2 mb-2">{s.title}</h3>
            <p className="font-body text-sm text-muted-foreground max-w-[200px] mx-auto">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
