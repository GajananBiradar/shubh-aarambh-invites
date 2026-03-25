import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTemplateComponent, getTemplateTheme, getTemplateMetadata } from '@/templates';
import { InvitationData, TemplateComponent } from '@/templates/types';
import { getTemplateById, getTemplateDemoData } from '@/api/templates';
import { SAMPLE_TEMPLATES } from '@/mock/sampleInvitation';
import { usePayment } from '@/hooks/usePayment';
import { Loader2, Sparkles } from 'lucide-react';

const TemplateDemoPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { triggerPaymentFlow } = usePayment();

  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Load template component
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;
      
      setLoading(true);
      const component = await getTemplateComponent(templateId);
      if (component) {
        setTemplateComp(() => component);
      }
      setLoading(false);
    };

    loadTemplate();
  }, [templateId]);

  const isLoading = loading || templateLoading || demoLoading;

  // Build demo invitation data
  const theme = getTemplateTheme(templateId || '1');
  const metadata = getTemplateMetadata(templateId || '1');

  const demoInvitationData: InvitationData = {
    invitationId: null,
    templateId: parseInt(templateId || '1'),
    templateSlug: theme,
    brideName: 'Ananya',
    groomName: 'Vikram',
    brideBio: 'Designer who paints sunsets & dreams',
    groomBio: 'Architect who builds worlds & love',
    couplePhotoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    hashtag: '#AnanyaWedVikram',
    welcomeMessage: 'Together with their families, Ananya & Vikram joyfully invite you to be part of their celebration of love and new beginnings.',
    showCountdown: true,
    weddingDate: '2026-02-14',
    events: (demoData?.events || [
      { eventName: 'Haldi', eventDate: '2026-02-11', eventTime: '10:00:00', venueName: 'Sharma Residence', venueAddress: 'Banjara Hills, Hyderabad', mapsUrl: 'https://maps.google.com' },
      { eventName: 'Mehendi', eventDate: '2026-02-12', eventTime: '17:00:00', venueName: 'The Garden Club', venueAddress: 'Jubilee Hills, Hyderabad', mapsUrl: 'https://maps.google.com' },
      { eventName: 'Sangeet', eventDate: '2026-02-13', eventTime: '19:00:00', venueName: 'Taj Deccan', venueAddress: 'Road No 1, Hyderabad', mapsUrl: 'https://maps.google.com' },
      { eventName: 'Wedding', eventDate: '2026-02-14', eventTime: '08:00:00', venueName: 'Kalyana Mandapam', venueAddress: 'Secunderabad, Hyderabad', mapsUrl: 'https://maps.google.com' },
    ]).map((e: any, i: number) => ({
      id: i,
      eventName: e.eventName,
      eventDate: e.eventDate,
      eventTime: e.eventTime,
      venueName: e.venueName || '',
      venueAddress: e.venueAddress || '',
      mapsUrl: e.mapsUrl || null,
    })),
    galleryPhotos: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600',
    ].map((url, i) => ({ photoUrl: url, sortOrder: i, isDefault: true })),
    musicUrl: null,
    musicName: null,
    effectiveMusicUrl: demoData?.musicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    effectiveMusicName: metadata?.name ? `${metadata.name} BGM` : 'Wedding BGM',
    locale: 'en',
    slug: 'ananya-weds-vikram',
    accessCode: 'DEMO',
    status: 'PUBLISHED',
    templateDefaults: {
      defaultPhotos: [],
      defaultMusicUrl: demoData?.musicUrl || '',
      defaultMusicName: '',
      defaultVideoUrl: null,
    },
  };

  const showWatermark = demoData?.showWatermark !== false;
  const isFree = template?.isFree ?? false;
  const priceInr = template?.priceInr ?? 0;

  const ctaText = isFree
    ? 'Start Free — No Payment Needed'
    : `Use This Template — ₹${priceInr}`;

  if (isLoading || !TemplateComp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme} className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border h-12 flex items-center justify-between px-4">
        <span className="font-body text-sm text-foreground font-medium">
          {metadata?.name || 'Template'} · <span className="text-muted-foreground">DEMO PREVIEW</span>
        </span>
        <button
          onClick={() => triggerPaymentFlow(template?.id || '1')}
          className={`${isFree ? 'btn-emerald' : 'btn-gold'} px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5`}
        >
          <Sparkles size={12} />
          {ctaText}
        </button>
      </div>

      {/* Demo watermark */}
      {showWatermark && <div className="demo-watermark" />}

      <div className="pt-12">
        <TemplateComp
          mode="demo"
          data={demoInvitationData}
          onUpdate={() => {}}
          onSaveDraft={() => {}}
          onPublish={() => {}}
          isSaving={false}
          isPublishing={false}
        />
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
    </div>
  );
};

export default TemplateDemoPage;
