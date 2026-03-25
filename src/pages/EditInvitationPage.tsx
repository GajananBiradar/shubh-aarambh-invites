import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import PageWrapper from '@/components/layout/PageWrapper';
import CreateInvitationPage from './CreateInvitationPage';
import { getInvitationById } from '@/api/invitations';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const EditInvitationPage = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadInvitation = async () => {
      try {
        const data = await getInvitationById(invitationId!);
        setInvitationData(data);
      } catch (err) {
        setError(true);
        toast.error('Could not load invitation');
      } finally {
        setLoading(false);
      }
    };

    if (invitationId) loadInvitation();
  }, [invitationId, isAuthenticated, navigate]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="font-body text-sm text-muted-foreground">Loading invitation...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !invitationData) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <p className="font-heading text-xl font-bold mb-2">Could not load invitation</p>
          <p className="font-body text-sm text-muted-foreground mb-6">The invitation may have been deleted or you don't have access.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <CreateInvitationPage
      editMode
      editData={invitationData}
      editInvitationId={invitationId}
    />
  );
};

export default EditInvitationPage;
