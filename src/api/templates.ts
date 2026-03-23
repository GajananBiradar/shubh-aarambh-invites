import api from './axios';
import { Template } from '@/types';
import { SAMPLE_TEMPLATES } from '@/mock/sampleInvitation';

export const getTemplates = async (filters?: Record<string, string>): Promise<Template[]> => {
  try {
    const { data } = await api.get('/templates', { params: filters });
    return data;
  } catch {
    return SAMPLE_TEMPLATES;
  }
};

export const getTemplateById = async (id: string): Promise<Template> => {
  try {
    const { data } = await api.get(`/templates/${id}`);
    return data;
  } catch {
    return SAMPLE_TEMPLATES.find(t => t.id === id) || SAMPLE_TEMPLATES[0];
  }
};

export const getTemplateDemoData = async (id: string): Promise<any> => {
  try {
    const { data } = await api.get(`/templates/${id}/demo-data`);
    return data;
  } catch {
    return null;
  }
};
