import { useQuery } from '@tanstack/react-query';
import { getInvitationBySlug, getMyInvitations } from '@/api/invitations';
import { SAMPLE_INVITATION } from '@/mock/sampleInvitation';

export const useInvitation = (code: string, slug: string) => {
  return useQuery({
    queryKey: ['invitation', code, slug],
    queryFn: () => getInvitationBySlug(code, slug),
    placeholderData: SAMPLE_INVITATION,
    retry: 1,
  });
};

export const useMyInvitations = () => {
  return useQuery({
    queryKey: ['my-invitations'],
    queryFn: getMyInvitations,
    retry: 1,
  });
};
