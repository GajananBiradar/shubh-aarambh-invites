import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const stats = [
  { value: 500, suffix: '+', label: 'Couples' },
  { value: 50000, suffix: '+', label: 'Guests Reached' },
  { value: 4.9, suffix: '★', label: 'Average Rating', isDecimal: true },
  { value: 3, suffix: '', label: 'Free Templates' },
];

const CountUpNumber = ({ target, isDecimal, suffix }: { target: number; isDecimal?: boolean; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setCount(current);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [isInView, target]);

  const display = isDecimal ? count.toFixed(1) : Math.floor(count).toLocaleString();

  return (
    <span ref={ref} className="font-display text-4xl md:text-5xl font-bold text-gold">
      {display}{suffix}
    </span>
  );
};

const SocialProofStats = () => (
  <section className="py-16 bg-secondary/30 border-y border-border">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="text-center"
          >
            <CountUpNumber target={s.value} isDecimal={s.isDecimal} suffix={s.suffix} />
            <p className="font-body text-sm text-muted-foreground mt-2 font-light">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofStats;
