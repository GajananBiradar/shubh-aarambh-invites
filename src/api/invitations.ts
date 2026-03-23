import api from './axios';
import { Invitation } from '@/types';
import { SAMPLE_INVITATION } from '@/mock/sampleInvitation';

export const createInvitation = async (data: Partial<Invitation>): Promise<Invitation> => {
  const res = await api.post('/invitations', data);
  return res.data;
};

export const updateInvitation = async (id: string, data: Partial<Invitation>): Promise<Invitation> => {
  const res = await api.put(`/invitations/${id}`, data);
  return res.data;
};

export const publishInvitation = async (id: string): Promise<Invitation> => {
  const res = await api.post(`/invitations/${id}/publish`);
  return res.data;
};

export const getMyInvitations = async (): Promise<Invitation[]> => {
  try {
    const { data } = await api.get('/invitations/mine');
    return data;
  } catch {
    return [SAMPLE_INVITATION];
  }
};

export const getInvitationBySlug = async (code: string, slug: string): Promise<Invitation> => {
  try {
    const { data } = await api.get(`/invitations/${code}/${slug}`);
    return data;
  } catch {
    return SAMPLE_INVITATION;
  }
};

export const getInvitationPreview = async (id: string): Promise<Invitation> => {
  try {
    const { data } = await api.get(`/invitations/${id}/preview`);
    return data;
  } catch {
    return SAMPLE_INVITATION;
  }
};

export const checkSlug = async (slug: string): Promise<boolean> => {
  try {
    const { data } = await api.get(`/invitations/check-slug?slug=${slug}`);
    return data.available;
  } catch {
    return true;
  }
};

export const recordView = async (code: string, slug: string): Promise<void> => {
  try {
    await api.post(`/invitations/view`, { code, slug });
  } catch { /* fire and forget */ }
};

// Legacy
export const checkPayment = async (templateId: string): Promise<boolean> => {
  try {
    const { data } = await api.get(`/payments/check?templateId=${templateId}`);
    return data.hasPaid;
  } catch {
    return import.meta.env.VITE_DEV_MODE === 'true';
  }
};
