import { useParams } from 'react-router-dom';
import { SAMPLE_INVITATION, SAMPLE_TEMPLATES } from '@/mock/sampleInvitation';
import InvitationHero from '@/components/invitation/HeroSection';
import CoupleSection from '@/components/invitation/CoupleSection';
import CountdownTimer from '@/components/invitation/CountdownTimer';
import EventsSection from '@/components/invitation/EventsSection';
import GallerySection from '@/components/invitation/GallerySection';
import RsvpSection from '@/components/invitation/RsvpSection';
import InvitationFooter from '@/components/invitation/InvitationFooter';
import FloatingMusicPlayer from '@/components/invitation/FloatingMusicPlayer';
import { Sparkles } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';

const TemplateDemoPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const { triggerPaymentFlow } = usePayment();
  const template = SAMPLE_TEMPLATES.find(t => t.id === templateId) || SAMPLE_TEMPLATES[0];
  const invitation = { ...SAMPLE_INVITATION, templateTheme: template.theme };

  const ctaText = template.isFree
    ? '✨ Start Free — No Payment Needed'
    : `✨ Use This Template — ₹${template.priceInr}`;

  return (
    <div data-theme={template.theme} className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border h-12 flex items-center justify-between px-4">
        <span className="font-body text-sm text-foreground font-medium">
          {template.name} · {template.category} · <span className="text-muted-foreground">DEMO PREVIEW</span>
        </span>
        <button
          onClick={() => triggerPaymentFlow(template.id)}
          className={`${template.isFree ? 'btn-emerald' : 'btn-gold'} px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5`}
        >
          {ctaText}
        </button>
      </div>

      {/* Demo watermark */}
      <div className="demo-watermark" />

      <div className="pt-12">
        <InvitationHero invitation={invitation} />
        <CoupleSection invitation={invitation} />
        <CountdownTimer invitation={invitation} />
        <EventsSection invitation={invitation} />
        <GallerySection invitation={invitation} />
        <RsvpSection invitation={invitation} isDemo />
        <InvitationFooter invitation={invitation} />
      </div>

      {/* Bottom CTA bar */}
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="bg-card/90 backdrop-blur-xl border border-border rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl pointer-events-auto">
          <span className="font-body text-sm text-muted-foreground hidden sm:inline">Like what you see?</span>
          <button
            onClick={() => triggerPaymentFlow(template.id)}
            className={`${template.isFree ? 'btn-emerald' : 'btn-gold'} px-5 py-2 rounded-full text-sm flex items-center gap-1.5`}
          >
            <Sparkles size={14} />
            {template.isFree ? 'Start for Free →' : `Get This for ₹${template.priceInr} →`}
          </button>
        </div>
      </div>

      <FloatingMusicPlayer musicUrl={invitation.musicUrl} musicName="✨ Sample Wedding BGM" />
    </div>
  );
};

export default TemplateDemoPage;
