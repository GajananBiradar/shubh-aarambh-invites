import api from './axios';
import { Template } from '@/types';
import { SAMPLE_TEMPLATES } from '@/mock/sampleInvitation';

export const getTemplates = async (): Promise<Template[]> => {
  try {
    const { data } = await api.get('/api/templates');
    return data;
  } catch {
    return SAMPLE_TEMPLATES;
  }
};

export const getTemplateById = async (id: string): Promise<Template> => {
  try {
    const { data } = await api.get(`/api/templates/${id}`);
    return data;
  } catch {
    return SAMPLE_TEMPLATES.find(t => t.id === id) || SAMPLE_TEMPLATES[0];
  }
};
