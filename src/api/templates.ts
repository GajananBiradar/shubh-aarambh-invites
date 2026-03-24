import api from './axios';
import { Template } from '@/types';

export const getTemplates = async (filters?: Record<string, string>): Promise<Template[]> => {
  try {
    const { data } = await api.get('/api/templates', { params: filters });
    return data;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    throw error;
  }
};

export const getTemplateById = async (id: string): Promise<Template> => {
  try {
    const { data } = await api.get(`/api/templates/${id}`);
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
