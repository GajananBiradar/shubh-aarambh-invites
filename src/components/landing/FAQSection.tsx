import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  { q: 'How long does my invitation link stay active?', a: 'Your invitation link is active forever! There\'s no expiry. Your guests can open it anytime before, during, and after the wedding.' },
  { q: 'Can I edit my invitation after publishing?', a: 'Absolutely! You can edit any detail — events, photos, music — anytime from your dashboard. Changes go live instantly.' },
  { q: 'Can I add multiple events like Haldi, Mehendi, Sangeet?', a: 'Yes! You can add up to 8 events including Haldi, Mehendi, Sangeet, Wedding, Reception, and custom events.' },
  { q: 'What if my guests have trouble opening the link?', a: 'Our invitations work on all devices — phones, tablets, and desktops. No app needed, just a browser. If anyone faces issues, reach out to us!' },
  { q: 'Is the ₹500 payment secure?', a: 'Yes, we use Razorpay — India\'s most trusted payment gateway. Your payment details are encrypted and never stored on our servers.' },
  { q: 'Can I share the invite directly on WhatsApp?', a: 'Yes! After publishing, you get a ready-to-share WhatsApp message with your invitation link. Just tap and send!' },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-3xl md:text-4xl font-bold text-center mb-12"
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
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-body text-sm font-medium text-foreground"
              >
                {faq.q}
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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
                    <p className="px-5 pb-5 font-body text-sm text-muted-foreground">{faq.a}</p>
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
