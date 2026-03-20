import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Ananya & Vikram',
    city: 'Mumbai',
    initials: 'AV',
    quote: 'Our guests were blown away! Everyone kept asking how we made such a beautiful invite.',
  },
  {
    name: 'Sneha & Arjun',
    city: 'Pune',
    initials: 'SA',
    quote: 'The Mehendi event card looked so gorgeous. Best ₹500 we spent for the wedding!',
  },
  {
    name: 'Divya & Rahul',
    city: 'Hyderabad',
    initials: 'DR',
    quote: 'Super easy to set up and the music feature made everyone emotional. Loved it!',
  },
];

const TestimonialSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-heading text-3xl md:text-4xl font-bold text-center mb-12"
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
            transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-2xl p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-body font-bold text-sm">
                {t.initials}
              </div>
              <div>
                <p className="font-heading text-sm font-semibold">{t.name}</p>
                <p className="font-body text-xs text-muted-foreground">{t.city}</p>
              </div>
            </div>
            <div className="flex gap-0.5 mb-3">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground italic">"{t.quote}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialSection;
