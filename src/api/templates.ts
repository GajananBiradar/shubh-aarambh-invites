import api from './axios';
import { Template } from '@/types';
import { getPricingContext } from '@/lib/pricing';
import { useAuthStore } from '@/store/authStore';

export const getTemplates = async (): Promise<Template[]> => {
  try {
    const { user } = useAuthStore.getState();
    const { countryCode } = getPricingContext(user);
    const { data } = await api.get('/api/templates', { params: { countryCode } });
    return data;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    throw error;
  }
};

export const getTemplateById = async (id: string): Promise<Template> => {
  try {
    const { user } = useAuthStore.getState();
    const { countryCode } = getPricingContext(user);
    const { data } = await api.get(`/api/templates/${id}`, { params: { countryCode } });
    return data;
  } catch (error) {
    console.error('Failed to fetch template:', error);
    throw error;
  }
};

export const getTemplateDemoData = async (id: string): Promise<any> => {
  try {
    const { data } = await api.get(`/api/templates/${id}/demo-data`);
    return data;
  } catch (error) {
    console.error('Failed to fetch demo data:', error);
    throw error;
  }
};
