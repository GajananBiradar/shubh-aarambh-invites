import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_TEMPLATES, SAMPLE_INVITATION } from '@/mock/sampleInvitation';
import { Eye, Sparkles, Crown, ChevronDown, ChevronUp } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { Template } from '@/types';

const MiniInvitePreview = ({ theme }: { theme: string }) => {
  const inv = SAMPLE_INVITATION;
  return (
    <div data-theme={theme} className="w-full bg-background text-foreground">
      <div className="h-52 bg-gradient-to-b from-primary/20 via-primary/5 to-background flex flex-col items-center justify-center p-6">
        <p className="font-body text-[10px] text-muted-foreground italic tracking-wide">Together with their families</p>
        <p className="font-script text-3xl text-primary mt-2">{inv.groomName.split(' ')[0]} & {inv.brideName.split(' ')[0]}</p>
        <div className="w-12 h-px bg-accent mt-3" />
        <p className="text-[9px] text-muted-foreground mt-2 font-body tracking-widest uppercase">invite you to celebrate</p>
      </div>
      <div className="flex justify-center gap-6 py-8 px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/15 mx-auto mb-2 ring-2 ring-accent/20" />
          <p className="text-[9px] font-display font-semibold">{inv.brideName.split(' ')[0]}</p>
        </div>
        <div className="flex items-center text-accent text-xs">✦</div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-accent/15 mx-auto mb-2 ring-2 ring-accent/20" />
          <p className="text-[9px] font-display font-semibold">{inv.groomName.split(' ')[0]}</p>
        </div>
      </div>
      <div className="px-4 py-6 space-y-2">
        {inv.events.slice(0, 3).map((e, i) => (
          <div key={i} className="bg-card rounded-lg p-3 border border-border">
            <p className="text-[9px] font-display font-semibold">{e.eventName}</p>
            <p className="text-[8px] text-muted-foreground font-body">{e.venueName}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 px-4 pb-6">
        {inv.galleryPhotos.slice(0, 3).map((p, i) => (
          <div key={i} className="aspect-square rounded-md bg-muted overflow-hidden">
            <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      <div className="h-36 bg-gradient-to-t from-primary/8 to-background flex items-center justify-center">
        <p className="font-script text-xl text-primary">{inv.hashtag}</p>
      </div>
    </div>
  );
};

const PriceBadge = ({ template }: { template: Template }) => {
  if (template.isFree) {
    return (
      <div className="absolute top-3 right-3 z-10 bg-emerald text-white font-body text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
        ✨ FREE
      </div>
    );
  }
  return (
    <div className="absolute top-3 right-3 z-10 btn-gold text-xs px-3 py-1.5 rounded-full">
      ₹{template.priceInr}
    </div>
  );
};

const TemplateCard = ({ template, isComingSoon }: { template: Template; isComingSoon?: boolean }) => {
  const { triggerPaymentFlow } = usePayment();

  if (isComingSoon) {
    return (
      <div className="bg-card rounded-2xl overflow-hidden border border-border relative opacity-60">
        <div className="h-72 overflow-hidden relative">
          <div className="absolute inset-0 bg-muted/80 backdrop-blur-md flex items-center justify-center z-10">
            <span className="font-body text-sm font-semibold text-muted-foreground bg-background/80 px-4 py-2 rounded-full border border-border">
              Coming Soon
            </span>
          </div>
          <div className="filter blur-sm">
            <MiniInvitePreview theme="crimson" />
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-muted-foreground">New Template</h3>
          <p className="font-body text-xs text-muted-foreground mt-1">Stay tuned for more designs</p>
          <div className="flex gap-3 mt-4">
            <button disabled className="flex-1 btn-outline-accent px-4 py-2.5 rounded-xl text-sm opacity-40 cursor-not-allowed">Preview</button>
            <button disabled className="flex-1 btn-gold px-4 py-2.5 rounded-xl text-sm opacity-40 cursor-not-allowed">Coming Soon</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-hover bg-card rounded-2xl overflow-hidden border border-border relative group"
    >
      {template.isPremium && (
        <div className="absolute top-3 left-3 z-10 bg-gold/90 text-background font-body text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Crown size={10} /> PREMIUM
        </div>
      )}
      <PriceBadge template={template} />

      <div className="h-72 overflow-hidden relative">
        <div style={{ animation: 'autoScroll 25s linear infinite' }}>
          <MiniInvitePreview theme={template.theme} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-semibold">{template.name}</h3>
          <span className="font-body text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-full">{template.category}</span>
        </div>
        <p className="font-body text-xs text-muted-foreground line-clamp-1">{template.description}</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => window.open(`/templates/${template.id}/demo`, '_blank')}
            className="flex-1 btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Eye size={15} /> See Demo
          </button>
          <button
            onClick={() => triggerPaymentFlow(template.id)}
            className={`flex-1 ${template.isFree ? 'btn-emerald' : 'btn-gold'} px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2`}
          >
            <Sparkles size={15} /> {template.isFree ? 'Start Free' : 'Use This'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TemplateShowcase = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleTemplates = showAll ? SAMPLE_TEMPLATES : SAMPLE_TEMPLATES.slice(0, 6);

  return (
    <section id="templates" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4">
            Find Your Perfect Invitation
          </h2>
          <p className="text-muted-foreground font-body mb-16 max-w-lg mx-auto font-light">
            Start free. Upgrade when you're ready.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {visibleTemplates.map(t => (
            <TemplateCard key={t.id} template={t} />
          ))}
          {/* Coming soon cards */}
          {showAll && (
            <>
              <TemplateCard template={SAMPLE_TEMPLATES[0]} isComingSoon />
              <TemplateCard template={SAMPLE_TEMPLATES[0]} isComingSoon />
              <TemplateCard template={SAMPLE_TEMPLATES[0]} isComingSoon />
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-outline-accent px-8 py-3 rounded-xl text-sm inline-flex items-center gap-2"
          >
            {showAll ? (
              <>Show Less <ChevronUp size={16} /></>
            ) : (
              <>Show All Templates <ChevronDown size={16} /></>
            )}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TemplateShowcase;
