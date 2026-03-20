import api from './axios';
import { AuthResponse } from '@/types';

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
};

export const registerApi = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post('/api/auth/register', { name, email, password });
  return data;
};
