import api from './axios';

// Templates
export const getAdminTemplates = async () => {
  const { data } = await api.get('/api/admin/templates');
  return data;
};

export const updateTemplatePrice = async (id: string, prices: { priceInr: number; priceUsd: number; priceEur: number }) => {
  const { data } = await api.patch(`/api/admin/templates/${id}/price`, prices);
  return data;
};

export const toggleTemplateFree = async (id: string, isFree: boolean) => {
  const { data } = await api.patch(`/api/admin/templates/${id}/free`, { isFree });
  return data;
};

export const toggleTemplateActive = async (id: string, isActive: boolean) => {
  const { data } = await api.patch(`/api/admin/templates/${id}/status`, { isActive });
  return data;
};

export const createTemplate = async (templateData: any) => {
  const { data } = await api.post('/api/admin/templates', templateData);
  return data;
};

// Users
export const getAdminUsers = async () => {
  const { data } = await api.get('/api/admin/users');
  return data;
};

export const setUserFreeAccess = async (id: string, isFreeUser: boolean) => {
  const { data } = await api.patch(`/api/admin/users/${id}/free-access`, { isFreeUser });
  return data;
};

export const deactivateUser = async (id: string) => {
  const { data } = await api.patch(`/api/admin/users/${id}/deactivate`);
  return data;
};

// Quotes
export const getAdminQuotes = async () => {
  const { data } = await api.get('/api/admin/quotes');
  return data;
};

export const updateQuoteStatus = async (id: string, status: string) => {
  const { data } = await api.patch(`/api/admin/quotes/${id}/status`, { status });
  return data;
};

// Analytics
export const getPlatformAnalytics = async (from: string, to: string) => {
  const { data } = await api.get('/api/analytics/platform', { params: { from, to } });
  return data;
};

// Invitations
export const getAdminInvitations = async () => {
  const { data } = await api.get('/api/admin/invitations');
  return data;
};
