import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTemplateComponent } from "@/templates";
import {
  InvitationData,
  TemplateComponent,
  PhotoData,
  EventData,
} from "@/templates/types";
import { getInvitationBySlug } from "@/api/invitations";
import { SAMPLE_INVITATION } from "@/mock/sampleInvitation";
import api from "@/api/axios";
import { Heart } from "lucide-react";

const PublicInvitationPage = () => {
  const { code, slug } = useParams<{ code: string; slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [TemplateComp, setTemplateComp] = useState<TemplateComponent | null>(
    null,
  );
  const [invitationData, setInvitationData] = useState<InvitationData | null>(
    null,
  );

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);

        // 1. Fetch invitation data
        let invitation;
        if (code && slug) {
          try {
            invitation = await getInvitationBySlug(code, slug);
          } catch (e) {
            // Use sample if not found
            invitation = SAMPLE_INVITATION;
          }
        } else {
          invitation = SAMPLE_INVITATION;
        }

        // 2. Record view (fire and forget) - only for numeric IDs (not demo mode)
        if (invitation.id && !isNaN(Number(invitation.id))) {
          api.post(`/api/invitations/${invitation.id}/view`).catch(() => {});
        }

        // 3. Determine template
        const templateSlug =
          invitation.template?.themeKey ||
          invitation.templateTheme ||
          "crimson";
        const templateIdStr =
          invitation.template?.id?.toString() ||
          invitation.templateId?.toString();
        const component = await getTemplateComponent(
          templateIdStr || templateSlug,
        );

        if (!component) {
          // Fallback to crimson
          const fallback = await getTemplateComponent("crimson");
          if (fallback) {
            setTemplateComp(() => fallback);
          } else {
            setError("Template not found");
            setLoading(false);
            return;
          }
        } else {
          setTemplateComp(() => component);
        }

        // 4. Map to InvitationData format
        const events: EventData[] = (invitation.events || []).map(
          (e: any, i: number) => ({
            id: e.id || i,
            eventName: e.eventName || "",
            eventDate: e.date || e.eventDate || "",
            eventTime: e.time || e.eventTime || "",
            venueName: e.venueName || "",
            venueAddress: e.venueAddress || "",
            mapsUrl: e.mapsUrl || null,
          }),
        );

        // Gallery: use user photos, fallback to template defaults
        const userPhotos = (invitation.galleryPhotos || []).map(
          (p: any, i: number) => {
            if (typeof p === "string")
              return { photoUrl: p, sortOrder: i, isDefault: false };
            return {
              photoUrl: p.photoUrl || p,
              sortOrder: p.sortOrder ?? i,
              isDefault: false,
            };
          },
        );
        const templateDefaultPhotos = (
          invitation.templateDefaultPhotos ||
          invitation.template?.defaultPhotos ||
          []
        ).map((p: any, i: number) => ({
          photoUrl: p.photoUrl,
          sortOrder: p.sortOrder ?? i,
          isDefault: true,
        }));
        const galleryPhotos: PhotoData[] =
          userPhotos.length > 0 ? userPhotos : templateDefaultPhotos;

        const data: InvitationData = {
          invitationId: invitation.id ? Number(invitation.id) : null,
          templateId: invitation.templateId
            ? Number(invitation.templateId)
            : invitation.template?.id || 1,
          templateSlug,
          brideName: invitation.brideName || "",
          groomName: invitation.groomName || "",
          brideBio:
            invitation.brideBio || invitation.invitationData?.bride_bio || "",
          groomBio:
            invitation.groomBio || invitation.invitationData?.groom_bio || "",
          couplePhotoUrl: invitation.couplePhotoUrl || null,
          bridePhotoUrl: invitation.bridePhotoUrl || null,
          groomPhotoUrl: invitation.groomPhotoUrl || null,
          hashtag:
            invitation.hashtag || invitation.invitationData?.hashtag || "",
          welcomeMessage:
            invitation.welcomeMessage ||
            invitation.invitationData?.welcome_message ||
            "",
          showCountdown:
            invitation.showCountdown ??
            invitation.invitationData?.show_countdown ??
            true,
          weddingDate:
            invitation.weddingDate ||
            invitation.invitationData?.wedding_date ||
            "",
          events,
          galleryPhotos,
          musicUrl: invitation.musicUrl || null,
          musicName: invitation.musicName || null,
          effectiveMusicUrl:
            (invitation as any).effectiveMusicUrl || invitation.musicUrl || "",
          effectiveMusicName:
            (invitation as any).effectiveMusicName ||
            invitation.musicName ||
            "Wedding BGM",
          locale: "en",
          slug: invitation.slug || "",
          accessCode: invitation.accessCode || invitation.code || code || null,
          status: invitation.status || "PUBLISHED",
          templateDefaults: {
            defaultPhotos:
              invitation.templateDefaultPhotos ||
              invitation.template?.defaultPhotos ||
              [],
            defaultMusicUrl:
              (invitation as any).templateDefaultMusicUrl ||
              invitation.template?.defaultMusicUrl ||
              "",
            defaultMusicName:
              (invitation as any).templateDefaultMusicName ||
              invitation.template?.defaultMusicName ||
              "",
            defaultVideoUrl:
              (invitation as any).templateDefaultVideoUrl ||
              invitation.template?.defaultVideoUrl ||
              null,
          },
        };

        setInvitationData(data);
        setLoading(false);
      } catch (e) {
        console.error("Failed to load invitation:", e);
        setError("Failed to load invitation");
        setLoading(false);
      }
    };

    loadInvitation();
  }, [code, slug]);

  // Loading state with petals
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-petal"
            style={
              {
                left: `${Math.random() * 100}%`,
                width: 10 + Math.random() * 8,
                height: 10 + Math.random() * 8,
                background: "hsl(var(--primary) / 0.4)",
                "--petal-opacity": 0.5,
                "--fall-duration": `${6 + Math.random() * 6}s`,
                "--fall-delay": `${Math.random() * 3}s`,
                "--drift": `${-40 + Math.random() * 80}px`,
              } as React.CSSProperties
            }
          />
        ))}
        <Heart className="w-8 h-8 text-primary fill-primary animate-pulse mb-4" />
        <p className="font-heading text-xl text-foreground">
          Opening your invitation...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !TemplateComp || !invitationData) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <Heart className="w-12 h-12 text-primary/30 mb-4" />
        <h1 className="font-heading text-xl font-semibold mb-2">Oops!</h1>
        <p className="font-body text-sm text-muted-foreground">
          {error || "Invitation not found"}
        </p>
      </div>
    );
  }

  // Render the template in view mode
  return (
    <TemplateComp
      mode="view"
      data={invitationData}
      onUpdate={() => {}}
      onSaveDraft={() => {}}
      onPublish={() => {}}
      isSaving={false}
      isPublishing={false}
    />
  );
};

export default PublicInvitationPage;
