import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: 'Are the free templates really free? No catch?',
    a: 'Absolutely! 3 of our templates are completely free — forever. No trial period, no hidden fees, no watermark. You get all animations, RSVP, gallery, music, and a lifetime shareable link.',
  },
  {
    q: 'How is the price determined for paid templates?',
    a: 'Each template has its own price set individually based on its design complexity and features. Check the price badge on each template card. Prices range from ₹349 to ₹699.',
  },
  {
    q: 'Can I edit my invitation after publishing?',
    a: 'Yes! You can edit any detail — events, photos, music — anytime from your dashboard. Changes go live instantly on your shared link.',
  },
  {
    q: 'Will it work on all phones and devices?',
    a: 'Our invitations are mobile-first and work beautifully on all phones, tablets, and desktops. No app needed — just a browser link.',
  },
  {
    q: 'Can I add multiple ceremonies (Haldi, Mehendi, Sangeet)?',
    a: 'Yes! You can add up to 8 events including Haldi, Mehendi, Sangeet, Wedding, Reception, and custom events. Each with its own date, time, and venue.',
  },
  {
    q: 'Is the payment secure?',
    a: 'Yes, we use Razorpay — India\'s most trusted payment gateway. Your payment details are encrypted and never stored on our servers.',
  },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-5xl font-semibold text-center mb-16"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left font-body text-sm font-medium text-foreground"
              >
                {faq.q}
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 font-body text-sm text-muted-foreground font-light leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
