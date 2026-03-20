import api from './axios';
import { RsvpSubmission } from '@/types';

export const submitRsvp = async (invitationId: string, data: RsvpSubmission): Promise<void> => {
  await api.post(`/api/rsvp/${invitationId}`, data);
};
