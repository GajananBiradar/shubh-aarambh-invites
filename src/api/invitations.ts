import api from './axios';
import { Invitation } from '@/types';
import { SAMPLE_INVITATION } from '@/mock/sampleInvitation';

export const createInvitation = async (data: Partial<Invitation>): Promise<Invitation> => {
  const res = await api.post('/api/invitations', data);
  return res.data;
};

export const updateInvitation = async (id: string, data: Partial<Invitation>): Promise<Invitation> => {
  const res = await api.put(`/api/invitations/${id}`, data);
  return res.data;
};

export const publishInvitation = async (id: string): Promise<Invitation> => {
  const res = await api.post(`/api/invitations/${id}/publish`);
  return res.data;
};

export const getMyInvitations = async (): Promise<Invitation[]> => {
  try {
    const { data } = await api.get('/api/invitations/mine');
    return data;
  } catch {
    return [SAMPLE_INVITATION];
  }
};

export const checkDraft = async (templateId: number): Promise<{ hasDraft: boolean; invitationId: number | null }> => {
  try {
    const { data } = await api.get(`/api/invitations/draft-check?templateId=${templateId}`);
    return data;
  } catch {
    return { hasDraft: false, invitationId: null };
  }
};

export const getMyDrafts = async (): Promise<Array<{ invitationId: number; templateId: number; brideName: string; groomName: string; updatedAt: string }>> => {
  try {
    const { data } = await api.get('/api/invitations/my-drafts');
    return data;
  } catch {
    return [];
  }
};

export const getInvitationBySlug = async (code: string, slug: string): Promise<Invitation> => {
  try {
    const { data } = await api.get(`/api/invitations/${code}/${slug}`);
    return data;
  } catch {
    return SAMPLE_INVITATION;
  }
};

export const getInvitationPreview = async (id: string): Promise<Invitation> => {
  try {
    const { data } = await api.get(`/api/invitations/${id}/preview`);
    return data;
  } catch {
    return SAMPLE_INVITATION;
  }
};

export const checkSlug = async (
  slug: string,
  invitationId?: number | null,
): Promise<{ available: boolean; suggestion?: string }> => {
  try {
    const params = new URLSearchParams({ slug });
    if (invitationId) {
      params.set("invitationId", String(invitationId));
    }
    const { data } = await api.get(`/api/invitations/check-slug?${params.toString()}`);
    return data;
  } catch {
    return { available: true, suggestion: slug };
  }
};

export const recordView = async (code: string, slug: string): Promise<void> => {
  try {
    await api.post(`/api/invitations/view`, { code, slug });
  } catch { /* fire and forget */ }
};

export const deleteInvitation = async (id: string): Promise<void> => {
  await api.delete(`/api/invitations/${id}`);
};

export const getInvitationById = async (id: string): Promise<any> => {
  const { data } = await api.get(`/api/invitations/${id}`);
  return data;
};
