import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SAMPLE_TEMPLATES, SAMPLE_INVITATION } from '@/mock/sampleInvitation';
import { Eye, Sparkles, Crown, Search } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import { Template } from '@/types';
import PageWrapper from '@/components/layout/PageWrapper';

const allTags = ['All', 'Free', 'Wedding', 'Save The Date', 'Engagement', 'Premium', 'Hindu', 'Christian', 'Muslim', 'Minimal', 'Royal', 'Floral'];

const MiniInvitePreview = ({ theme }: { theme: string }) => {
  const inv = SAMPLE_INVITATION;
  return (
    <div data-theme={theme} className="w-full bg-background text-foreground">
      <div className="h-52 bg-gradient-to-b from-primary/20 via-primary/5 to-background flex flex-col items-center justify-center p-6">
        <p className="font-body text-[10px] text-muted-foreground italic">Together with their families</p>
        <p className="font-script text-3xl text-primary mt-2">{inv.groomName.split(' ')[0]} & {inv.brideName.split(' ')[0]}</p>
        <div className="w-12 h-px bg-accent mt-3" />
      </div>
      <div className="flex justify-center gap-6 py-8 px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary/15 mx-auto mb-2 ring-2 ring-accent/20" />
          <p className="text-[9px] font-display font-semibold">{inv.brideName.split(' ')[0]}</p>
        </div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-accent/15 mx-auto mb-2 ring-2 ring-accent/20" />
          <p className="text-[9px] font-display font-semibold">{inv.groomName.split(' ')[0]}</p>
        </div>
      </div>
      <div className="px-4 py-4 space-y-2">
        {inv.events.slice(0, 2).map((e, i) => (
          <div key={i} className="bg-card rounded-lg p-3 border border-border">
            <p className="text-[9px] font-display font-semibold">{e.eventName}</p>
            <p className="text-[8px] text-muted-foreground font-body">{e.venueName}</p>
          </div>
        ))}
      </div>
      <div className="h-24 bg-gradient-to-t from-primary/8 to-background flex items-center justify-center">
        <p className="font-script text-lg text-primary">{inv.hashtag}</p>
      </div>
    </div>
  );
};

const TemplateCard = ({ template }: { template: Template }) => {
  const { triggerPaymentFlow } = usePayment();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card-hover bg-card rounded-2xl overflow-hidden border border-border relative group"
    >
      {template.isPremium && (
        <div className="absolute top-3 left-3 z-10 bg-gold/90 text-background font-body text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Crown size={10} /> PREMIUM
        </div>
      )}
      {template.isFree ? (
        <div className="absolute top-3 right-3 z-10 bg-emerald text-white font-body text-xs font-semibold px-3 py-1.5 rounded-full">✨ FREE</div>
      ) : (
        <div className="absolute top-3 right-3 z-10 btn-gold text-xs px-3 py-1.5 rounded-full">₹{template.priceInr}</div>
      )}
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
        <div className="flex flex-wrap gap-1.5 mt-2">
          {template.tags.map(tag => (
            <span key={tag} className="font-body text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => window.open(`/templates/${template.id}/demo`, '_blank')} className="flex-1 btn-outline-accent px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
            <Eye size={15} /> Demo
          </button>
          <button onClick={() => triggerPaymentFlow(template.id)} className={`flex-1 ${template.isFree ? 'btn-emerald' : 'btn-gold'} px-4 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2`}>
            <Sparkles size={15} /> {template.isFree ? 'Start Free' : `₹${template.priceInr}`}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AllTemplatesPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return SAMPLE_TEMPLATES;
    if (activeFilter === 'Free') return SAMPLE_TEMPLATES.filter(t => t.isFree);
    if (activeFilter === 'Premium') return SAMPLE_TEMPLATES.filter(t => t.isPremium);
    return SAMPLE_TEMPLATES.filter(t =>
      t.category === activeFilter || t.tags.includes(activeFilter)
    );
  }, [activeFilter]);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">All Templates</h1>
          <p className="font-body text-muted-foreground font-light">3 free templates to get you started. Premium designs when you're ready.</p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12 sticky top-16 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`font-body text-xs px-4 py-2 rounded-full border transition-all ${
                activeFilter === tag
                  ? 'bg-gold text-background border-gold'
                  : 'bg-card text-muted-foreground border-border hover:border-gold/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filtered.map(t => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-body text-muted-foreground">No templates match this filter. Try another category.</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AllTemplatesPage;
