import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Invitation } from '@/types';
import { getInvitationBySlug, recordView } from '@/api/invitations';
import api from '@/api/axios';
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
  const [viewCount, setViewCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      if (code && slug) {
        try {
          const data = await getInvitationBySlug(code, slug);
          setInvitation(data);

          // Fire and forget view recording
          if (data.id) {
            api.post(`/api/invitations/${data.id}/view`).catch(() => {});
            api.get(`/api/invitations/${data.id}/view-count`)
              .then(res => setViewCount(res.data?.count))
              .catch(() => {});
          }
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
        <p className="font-heading text-xl text-foreground">Opening your invitation...</p>
      </div>
    );
  }

  if (!invitation) return null;

  // Determine effective music URL
  const effectiveMusicUrl = (invitation as any).effectiveMusicUrl || invitation.musicUrl;
  // Override viewCount with fetched value
  const displayInvitation = { ...invitation, viewCount: viewCount ?? invitation.viewCount };

  return (
    <div data-theme={invitation.templateTheme} className="min-h-screen bg-background text-foreground">
      <InvitationHero invitation={displayInvitation} />
      <CoupleSection invitation={displayInvitation} />
      <CountdownTimer invitation={displayInvitation} />
      {displayInvitation.events && displayInvitation.events.length > 0 && (
        <EventsSection invitation={displayInvitation} />
      )}
      {displayInvitation.galleryPhotos && displayInvitation.galleryPhotos.length > 0 && (
        <GallerySection invitation={displayInvitation} />
      )}
      <RsvpSection invitation={displayInvitation} />
      <InvitationFooter invitation={displayInvitation} />
      {effectiveMusicUrl && (
        <FloatingMusicPlayer musicUrl={effectiveMusicUrl} musicName={invitation.musicName} />
      )}
    </div>
  );
};

export default PublicInvitationPage;
