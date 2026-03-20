import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Invitation } from '@/types';
import { formatWeddingDate } from '@/utils/formatDate';
import { useMemo } from 'react';

const InvitationHero = ({ invitation }: { invitation: Invitation }) => {
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
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={invitation.couplePhotoUrl}
          alt={`${invitation.groomName} & ${invitation.brideName}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80" />
      </div>

      {/* Petals */}
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

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Floral ornament */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-accent text-4xl mb-4"
        >
          ✿
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="font-body italic text-sm text-card-foreground/80 mb-4"
        >
          Together with their families
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="font-script text-5xl sm:text-6xl md:text-7xl text-card-foreground mb-2"
          style={{ lineHeight: 1.2 }}
        >
          {invitation.brideName.split(' ')[0]}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-accent text-2xl my-2"
        >
          ✦
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="font-script text-5xl sm:text-6xl md:text-7xl text-card-foreground mb-6"
          style={{ lineHeight: 1.2 }}
        >
          {invitation.groomName.split(' ')[0]}
        </motion.h1>

        {/* Gold line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="w-32 h-px bg-accent mx-auto mb-6 origin-left"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="font-heading text-sm md:text-base text-card-foreground/90"
        >
          {formatWeddingDate(invitation.weddingDate)}
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center"
      >
        <p className="font-body text-xs text-card-foreground/70 mb-2">Open Invitation</p>
        <ChevronDown className="w-6 h-6 text-card-foreground/70 mx-auto" />
      </motion.div>
    </section>
  );
};

export default InvitationHero;
