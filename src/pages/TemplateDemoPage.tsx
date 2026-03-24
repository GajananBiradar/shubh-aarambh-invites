import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SAMPLE_INVITATION, SAMPLE_TEMPLATES } from '@/mock/sampleInvitation';
import { getTemplateDemoData, getTemplateById } from '@/api/templates';
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
import { Skeleton } from '@/components/ui/skeleton';

const TemplateDemoPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const { triggerPaymentFlow } = usePayment();

  // Fetch real template data
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => getTemplateById(templateId || '1'),
    placeholderData: SAMPLE_TEMPLATES[0],
  });

  // Fetch real demo data
  const { data: demoData, isLoading: demoLoading } = useQuery({
    queryKey: ['template-demo', templateId],
    queryFn: () => getTemplateDemoData(templateId || '1'),
  });

  const isLoading = templateLoading || demoLoading;

  // Merge demo data with sample couple data
  const events = demoData?.events?.map((e: any) => ({
    id: e.eventName,
    eventName: e.eventName,
    date: e.eventDate,
    time: e.eventTime,
    venueName: '',
    venueAddress: '',
    mapsUrl: '',
  })) || SAMPLE_INVITATION.events;

  const invitation = {
    ...SAMPLE_INVITATION,
    templateTheme: template?.theme || SAMPLE_TEMPLATES[0].theme,
    events,
    musicUrl: demoData?.musicUrl || SAMPLE_INVITATION.musicUrl,
  };

  const showWatermark = demoData?.showWatermark !== false;
  const isFree = template?.isFree ?? false;
  const priceInr = template?.priceInr ?? 0;

  const ctaText = isFree
    ? '✨ Start Free — No Payment Needed'
    : `✨ Use This Template — ₹${priceInr}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div data-theme={template?.theme || 'crimson'} className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border h-12 flex items-center justify-between px-4">
        <span className="font-body text-sm text-foreground font-medium">
          {demoData?.templateName || template?.name || 'Template'} · <span className="text-muted-foreground">DEMO PREVIEW</span>
        </span>
        <button
          onClick={() => triggerPaymentFlow(template?.id || '1')}
          className={`${isFree ? 'btn-emerald' : 'btn-gold'} px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5`}
        >
          {ctaText}
        </button>
      </div>

      {/* Demo watermark */}
      {showWatermark && <div className="demo-watermark" />}

      <div className="pt-12">
        <InvitationHero invitation={invitation} />
        <CoupleSection invitation={invitation} />
        <CountdownTimer invitation={invitation} />
        {invitation.events && invitation.events.length > 0 && (
          <EventsSection invitation={invitation} />
        )}
        {invitation.galleryPhotos && invitation.galleryPhotos.length > 0 && (
          <GallerySection invitation={invitation} />
        )}
        <RsvpSection invitation={invitation} isDemo />
        <InvitationFooter invitation={invitation} />
      </div>

      {/* Bottom CTA bar */}
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="bg-card/90 backdrop-blur-xl border border-border rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl pointer-events-auto">
          <span className="font-body text-sm text-muted-foreground hidden sm:inline">Like what you see?</span>
          <button
            onClick={() => triggerPaymentFlow(template?.id || '1')}
            className={`${isFree ? 'btn-emerald' : 'btn-gold'} px-5 py-2 rounded-full text-sm flex items-center gap-1.5`}
          >
            <Sparkles size={14} />
            {isFree ? 'Start for Free →' : `Get This for ₹${priceInr} →`}
          </button>
        </div>
      </div>

      <FloatingMusicPlayer musicUrl={invitation.musicUrl} musicName={demoData?.templateName ? `${demoData.templateName} BGM` : '✨ Sample Wedding BGM'} />
    </div>
  );
};

export default TemplateDemoPage;
