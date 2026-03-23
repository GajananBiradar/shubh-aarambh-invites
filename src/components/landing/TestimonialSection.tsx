import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya & Arjun',
    city: 'Mumbai',
    initials: 'PA',
    quote: "Our guests couldn't stop talking about how beautiful the invite was. The Sangeet card had everyone emotional before the event even started.",
  },
  {
    name: 'Fatima & Zaid',
    city: 'Hyderabad',
    initials: 'FZ',
    quote: 'The Midnight Nawab template was exactly what we wanted. Elegant, dramatic, and perfectly us.',
  },
  {
    name: 'Sneha & Rohan',
    city: 'Pune',
    initials: 'SR',
    quote: "We started with a free template and it looked so good we didn't even need to upgrade. Absolutely stunning.",
  },
];

const TestimonialSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-3xl md:text-5xl font-semibold text-center mb-16"
      >
        Loved by Couples Across India
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="bg-card rounded-2xl p-8 border border-border"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-background font-body font-bold text-sm">
                {t.initials}
              </div>
              <div>
                <p className="font-display text-base font-semibold">{t.name}</p>
                <p className="font-body text-xs text-muted-foreground">{t.city}</p>
              </div>
            </div>
            <div className="flex gap-0.5 mb-4">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground italic leading-relaxed">"{t.quote}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialSection;
