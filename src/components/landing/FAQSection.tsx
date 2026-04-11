import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "Are the free templates really free? No catch?",
    a: "Absolutely! Our free templates are completely free — forever. No trial period, no hidden fees, no watermark. You get all animations, RSVP, music, and a lifetime shareable link.",
  },
  {
    q: "Are the templates fully editable?",
    a: "Yes, everything on the template is fully editable! You can add or remove any section you want. For example, if you don't need the events section, gallery, or any other part — just click Edit and remove it. You have complete control over your invitation.",
  },
  {
    q: "Can I edit my invitation after publishing?",
    a: "Yes! You can edit any detail — events, photos, music — anytime from your dashboard. Changes go live instantly on your shared link.",
  },
  {
    q: "Will it work on all phones and devices?",
    a: "Our invitations are mobile-first and work beautifully on all phones, tablets, and desktops. No app needed — just a browser link.",
  },
  {
    q: "How do guests RSVP?",
    a: "Each invitation has a built-in RSVP form. Guests simply tap the RSVP button, fill in their details, and you'll see all responses in your dashboard — no spreadsheets needed.",
  },
  {
    q: "Can I share my invitation on WhatsApp?",
    a: "Absolutely! Every invitation comes with a unique shareable link. You can send it directly via WhatsApp, SMS, email, or any messaging app. There's even a one-tap WhatsApp share button built in.",
  },
  {
    q: "Is the payment secure?",
    a: "Yes, we use industry-leading payment gateways. Your payment details are encrypted and never stored on our servers.",
  },
  {
    q: "How long does it take to create an invitation?",
    a: "Most couples finish their invitation in under 10 minutes! Just pick a template, fill in your details, upload photos, and publish. It's that simple.",
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
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 font-body text-sm text-muted-foreground font-light leading-relaxed">
                      {faq.a}
                    </p>
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
