import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';

const FloatingPetals = () => {
  const petals = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 8 + Math.random() * 12,
    opacity: 0.3 + Math.random() * 0.5,
    duration: 7 + Math.random() * 8,
    delay: Math.random() * 10,
    drift: -80 + Math.random() * 160,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {petals.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.4))`,
            '--petal-opacity': p.opacity,
            '--fall-duration': `${p.duration}s`,
            '--fall-delay': `${p.delay}s`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const wordVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const HeroSection = () => {
  const headline = 'Your Love Story Deserves a Beautiful Beginning';
  const words = headline.split(' ');

  const scrollToTemplates = () => {
    document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-background to-muted animate-gradient-shift">
      <FloatingPetals />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6" style={{ lineHeight: 1.1 }}>
          {words.map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className="inline-block mr-[0.3em]"
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="font-body text-lg text-muted-foreground mb-8 text-balance max-w-xl mx-auto"
        >
          Create stunning digital wedding invitations that your guests will never forget.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button onClick={scrollToTemplates} className="btn-gold px-8 py-3 rounded-xl text-base">
            See Templates ↓
          </button>
          <a href="/register" className="btn-outline-accent px-8 py-3 rounded-xl text-base font-body">
            Create Your Invitation
          </a>
        </motion.div>
      </div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-8 h-8 text-muted-foreground" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
