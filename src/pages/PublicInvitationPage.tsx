import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Invitation } from '@/types';
import { getInvitationBySlug, recordView } from '@/api/invitations';
import { SAMPLE_INVITATION } from '@/mock/sampleInvitation';
import InvitationHero from '@/components/invitation/HeroSection';
import CoupleSection from '@/components/invitation/CoupleSection';
import CountdownTimer from '@/components/invitation/CountdownTimer';
import EventsSection from '@/components/invitation/EventsSection';
import GallerySection from '@/components/invitation/GallerySection';
import RsvpSection from '@/components/invitation/RsvpSection';
import InvitationFooter from '@/components/invitation/InvitationFooter';
import FloatingMusicPlayer from '@/components/invitation/FloatingMusicPlayer';
import { Heart } from 'lucide-react';

const PublicInvitationPage = () => {
  const { code, slug } = useParams<{ code: string; slug: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (code && slug) {
        recordView(code, slug);
        try {
          const data = await getInvitationBySlug(code, slug);
          setInvitation(data);
        } catch {
          setInvitation(SAMPLE_INVITATION);
        }
      } else {
        setInvitation(SAMPLE_INVITATION);
      }
      setLoading(false);
    };
    load();
  }, [code, slug]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
        {/* Loading petals */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-petal"
            style={{
              left: `${Math.random() * 100}%`,
              width: 10 + Math.random() * 8,
              height: 10 + Math.random() * 8,
              background: 'hsl(var(--primary) / 0.4)',
              '--petal-opacity': 0.5,
              '--fall-duration': `${6 + Math.random() * 6}s`,
              '--fall-delay': `${Math.random() * 3}s`,
              '--drift': `${-40 + Math.random() * 80}px`,
            } as React.CSSProperties}
          />
        ))}
        <Heart className="w-8 h-8 text-primary fill-primary animate-pulse mb-4" />
        <p className="font-heading text-xl text-foreground">Loading your invitation...</p>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div data-theme={invitation.templateTheme} className="min-h-screen bg-background text-foreground">
      <InvitationHero invitation={invitation} />
      <CoupleSection invitation={invitation} />
      <CountdownTimer invitation={invitation} />
      <EventsSection invitation={invitation} />
      <GallerySection invitation={invitation} />
      <RsvpSection invitation={invitation} />
      <InvitationFooter invitation={invitation} />
      {invitation.musicUrl && (
        <FloatingMusicPlayer musicUrl={invitation.musicUrl} musicName={invitation.musicName} />
      )}
    </div>
  );
};

export default PublicInvitationPage;
