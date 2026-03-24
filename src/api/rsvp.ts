import api from './axios';

export interface RsvpPayload {
  guestName: string;
  guestPhone: string;
  attending: string;
  guestCount: number;
  message?: string;
}

export const submitRsvp = async (invitationId: string, data: RsvpPayload): Promise<void> => {
  await api.post(`/api/rsvp/${invitationId}`, data);
};
