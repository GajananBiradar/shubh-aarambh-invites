import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getInvitationById } from '@/api/invitations';
import CreateInvitationPage from './CreateInvitationPage';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * EditInvitationPage - Wraps CreateInvitationPage in edit mode
 * 
 * This page fetches the existing invitation data and passes it to
 * CreateInvitationPage which handles both create and edit flows
 * using the inline WYSIWYG template editor.
 */
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
      if (!invitationId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getInvitationById(invitationId);
        setInvitationData(data);
      } catch (err: any) {
        console.error('Failed to load invitation:', err);
        setError(true);
        
        if (err.response?.status === 404) {
          toast.error('Invitation not found');
        } else if (err.response?.status === 403) {
          toast.error('You do not have access to this invitation');
        } else {
          toast.error('Could not load invitation');
        }
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [invitationId, isAuthenticated, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="font-body text-sm text-muted-foreground">Loading invitation...</p>
      </div>
    );
  }

  // Error state
  if (error || !invitationData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-heading text-2xl font-bold mb-2">Could not load invitation</h1>
          <p className="font-body text-sm text-muted-foreground mb-6">
            The invitation may have been deleted or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline-accent px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pass to CreateInvitationPage in edit mode
  return (
    <CreateInvitationPage
      editMode
      editData={invitationData}
      editInvitationId={invitationId}
    />
  );
};

export default EditInvitationPage;
