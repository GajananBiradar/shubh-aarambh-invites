import { Invitation } from '@/types';
import { Heart } from 'lucide-react';

const InvitationFooter = ({ invitation }: { invitation: Invitation }) => {
  const shareUrl = `${window.location.origin}/${invitation.code}/invite/${invitation.slug}`;
  const whatsappMsg = encodeURIComponent(
    `You're invited to ${invitation.groomName.split(' ')[0]} & ${invitation.brideName.split(' ')[0]}'s wedding celebrations! 💌 Open your beautiful invitation here: ${shareUrl} 🌸`
  );

  return (
    <section className="py-12 bg-background text-center">
      <p className="font-script text-3xl text-primary mb-2">
        {invitation.brideName.split(' ')[0]} & {invitation.groomName.split(' ')[0]}
      </p>
      <p className="font-body text-sm text-muted-foreground mb-6">{invitation.weddingDate}</p>

      <a
        href={`https://wa.me/?text=${whatsappMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] font-body font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        💚 Share on WhatsApp
      </a>

      {invitation.viewCount !== undefined && (
        <p className="font-body text-xs text-muted-foreground mt-6">💌 Opened {invitation.viewCount} times</p>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <p className="font-body text-xs text-muted-foreground flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-primary fill-primary" /> on WeddingInvites.in
        </p>
      </div>
    </section>
  );
};

export default InvitationFooter;
