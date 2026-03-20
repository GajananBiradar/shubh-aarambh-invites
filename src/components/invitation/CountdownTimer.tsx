import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Invitation } from '@/types';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ invitation }: { invitation: Invitation }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const target = new Date(invitation.weddingDate + 'T09:00:00').getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setIsPast(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [invitation.weddingDate]);

  if (!invitation.showCountdown) return null;

  const boxes = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-primary/5"
    >
      <div className="container mx-auto px-4 text-center">
        {isPast ? (
          <div>
            <p className="font-heading text-2xl font-semibold mb-2">We tied the knot!</p>
            <p className="font-body text-muted-foreground italic">Thank you for being part of our journey 💕</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-4 mb-6">
              {boxes.map(b => (
                <div key={b.label} className="bg-card rounded-xl p-4 min-w-[70px] shadow-sm border border-border">
                  <p className="font-heading text-3xl md:text-4xl font-bold text-primary tabular-nums">
                    {String(b.value).padStart(2, '0')}
                  </p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mt-1">{b.label}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-muted-foreground italic">Until we say I Do 💍</p>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default CountdownTimer;
