import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";

const FloatingPetals = () => {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 6 + Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.25,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 12,
        drift: -60 + Math.random() * 120,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-petal"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, hsl(var(--gold) / 0.5), hsl(var(--gold-light) / 0.2))`,
              "--petal-opacity": p.opacity,
              "--fall-duration": `${p.duration}s`,
              "--fall-delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

const wordVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.08,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const HeroSection = () => {
  const headline = "Your Love Story Deserves a Beautiful Beginning";
  const words = headline.split(" ");

  const scrollToTemplates = () => {
    document
      .getElementById("templates")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Dark cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
      {/* Gold accent overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--gold)) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, hsl(var(--gold)) 0%, transparent 50%)`,
        }}
      />
      <FloatingPetals />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-px bg-gold mx-auto mb-8 origin-center"
        />

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-[1.1] mb-8">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="font-body text-lg md:text-xl text-muted-foreground mb-10 text-balance max-w-2xl mx-auto font-light"
        >
          Create stunning digital wedding invitations that your guests will
          never forget.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={scrollToTemplates}
            className="btn-gold px-10 py-4 rounded-xl text-base"
          >
            Browse Templates
          </button>
          <a
            href="/templates/1/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-accent px-10 py-4 rounded-xl text-base font-body"
          >
            See a Live Demo
          </a>
        </motion.div>
      </div>

      <motion.button
        onClick={scrollToTemplates}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-pointer group"
      >
        <span className="font-body text-xs text-muted-foreground group-hover:text-gold transition-colors">
          Scroll to explore
        </span>
        <ChevronDown className="w-7 h-7 text-gold animate-pulse" />
      </motion.button>
    </section>
  );
};

export default HeroSection;
