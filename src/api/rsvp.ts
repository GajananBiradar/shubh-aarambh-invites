import api from './axios';

export interface RsvpPayload {
  guestName: string;
  guestPhone: string;
  attending: string;
  guestCount: number;
  message?: string;
}

export interface RsvpResponseItem {
  id: number;
  invitationId: number;
  guestName: string;
  guestPhone: string;
  attending: 'YES' | 'NO' | 'MAYBE';
  guestCount: number;
  message: string | null;
  submittedAt: string;
}

export const submitRsvp = async (invitationId: string, data: RsvpPayload): Promise<void> => {
  await api.post(`/api/rsvp/${invitationId}`, data);
};

export const getRsvps = async (invitationId: number): Promise<RsvpResponseItem[]> => {
  const { data } = await api.get<RsvpResponseItem[]>(`/api/rsvp/${invitationId}`);
  return data;
};
