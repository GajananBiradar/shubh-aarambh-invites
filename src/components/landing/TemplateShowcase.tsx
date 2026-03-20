import { motion } from 'framer-motion';
import { SAMPLE_TEMPLATES } from '@/mock/sampleInvitation';
import { SAMPLE_INVITATION } from '@/mock/sampleInvitation';
import { Eye, Sparkles } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

const MiniInvitePreview = ({ theme }: { theme: string }) => {
  const inv = SAMPLE_INVITATION;
  return (
    <div data-theme={theme} className="w-full bg-background text-foreground">
      {/* Mini hero */}
      <div className="h-48 bg-gradient-to-b from-primary/20 to-background flex flex-col items-center justify-center p-4">
        <p className="font-body text-[10px] text-muted-foreground italic">Together with their families</p>
        <p className="font-script text-2xl text-primary mt-1">{inv.groomName.split(' ')[0]} & {inv.brideName.split(' ')[0]}</p>
        <p className="text-[9px] text-muted-foreground mt-1 font-body">invite you to their wedding</p>
      </div>
      {/* Mini couple */}
      <div className="flex justify-center gap-4 py-6 px-3">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-1" />
          <p className="text-[9px] font-heading font-semibold">{inv.brideName.split(' ')[0]}</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent/20 mx-auto mb-1" />
          <p className="text-[9px] font-heading font-semibold">{inv.groomName.split(' ')[0]}</p>
        </div>
      </div>
      {/* Mini events */}
      <div className="px-3 py-4 space-y-2">
        {inv.events.slice(0, 3).map((e, i) => (
          <div key={i} className="bg-card rounded-md p-2 border border-border">
            <p className="text-[9px] font-heading font-semibold">{e.eventName}</p>
            <p className="text-[8px] text-muted-foreground font-body">{e.venueName}</p>
          </div>
        ))}
      </div>
      {/* Mini gallery */}
      <div className="grid grid-cols-3 gap-1 px-3 pb-4">
        {inv.galleryPhotos.slice(0, 3).map((p, i) => (
          <div key={i} className="aspect-square rounded bg-muted overflow-hidden">
            <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      {/* Spacer for scroll */}
      <div className="h-32 bg-gradient-to-t from-primary/10 to-background flex items-center justify-center">
        <p className="font-script text-lg text-primary">{inv.hashtag}</p>
      </div>
    </div>
  );
};

const TemplateCard = ({ template }: { template: typeof SAMPLE_TEMPLATES[0] }) => {
  const { triggerPaymentFlow } = usePayment();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-hover bg-card rounded-2xl overflow-hidden border border-border relative group"
    >
      {/* Badge */}
      <div className="absolute top-3 left-3 z-10 bg-card/90 backdrop-blur-sm text-foreground font-body text-xs font-medium px-3 py-1 rounded-full border border-border">
        {template.name}
      </div>
      <div className="absolute top-3 right-3 z-10 btn-gold text-xs px-3 py-1 rounded-full">
        ₹{template.price}
      </div>

      {/* Auto-scrolling preview */}
      <div className="h-72 overflow-hidden relative">
        <div style={{ animation: 'autoScroll 20s linear infinite' }}>
          <MiniInvitePreview theme={template.theme} />
        </div>
      </div>

      {/* Buttons */}
      <div className="p-4 flex gap-3">
        <button
          onClick={() => window.open(`/templates/${template.id}/demo`, '_blank')}
          className="flex-1 btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <Eye size={16} /> See Demo
        </button>
        <button
          onClick={() => triggerPaymentFlow(template.id)}
          className="flex-1 btn-gold px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
        >
          <Sparkles size={16} /> Create Yours
        </button>
      </div>
    </motion.div>
  );
};

const TemplateShowcase = () => (
  <section id="templates" className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-heading text-3xl md:text-4xl font-bold text-center mb-4"
      >
        Choose Your Perfect Invitation Style
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-center text-muted-foreground font-body mb-12 max-w-lg mx-auto"
      >
        Each template is crafted with love, featuring animations, music, and everything your guests need.
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {SAMPLE_TEMPLATES.map(t => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  </section>
);

export default TemplateShowcase;
