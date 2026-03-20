import api from './axios';
import { PaymentOrder, PaymentVerification } from '@/types';

export const createOrder = async (templateId: string): Promise<PaymentOrder> => {
  const { data } = await api.post('/api/payments/create-order', { templateId });
  return data;
};

export const verifyPayment = async (verification: PaymentVerification): Promise<void> => {
  await api.post('/api/payments/verify', verification);
};

export const devBypass = async (templateId: string): Promise<void> => {
  await api.post('/api/payments/dev-bypass', {
    templateId,
    bypassToken: import.meta.env.VITE_DEV_BYPASS_TOKEN,
  });
};
