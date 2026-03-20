import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import PageWrapper from '@/components/layout/PageWrapper';
import { Heart } from 'lucide-react';

const EditInvitationPage = () => {
  const { invitationId } = useParams();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Heart className="w-12 h-12 text-primary/30 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Edit Invitation</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">
          Editing invitation #{invitationId}. The same wizard will load pre-populated with your existing data.
        </p>
        <p className="font-body text-xs text-muted-foreground">
          (Full edit wizard reuses the Create flow — coming with backend integration)
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm mt-6">
          Back to Dashboard
        </button>
      </div>
    </PageWrapper>
  );
};

export default EditInvitationPage;
