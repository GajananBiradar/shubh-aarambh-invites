import api from './axios';
import { PaymentOrder, PaymentVerification } from '@/types';

export const checkPayment = async (templateId: string): Promise<boolean> => {
  try {
    const { data } = await api.get(`/api/payments/check?templateId=${templateId}`);
    return data.hasPaid;
  } catch {
    return import.meta.env.VITE_DEV_MODE === 'true';
  }
};

export const initiatePayment = async (templateId: string, currency: string = 'INR'): Promise<PaymentOrder> => {
  const { data } = await api.post('/api/payments/initiate', { templateId, currency });
  return data;
};

export const verifyRazorpay = async (verification: PaymentVerification & { templateId: string }): Promise<void> => {
  await api.post('/api/payments/verify/razorpay', verification);
};

export const verifyStripe = async (data: any): Promise<void> => {
  await api.post('/api/payments/verify/stripe', data);
};

export const devBypass = async (templateId: string): Promise<void> => {
  await api.post('/api/payments/dev-bypass', {
    templateId,
    bypassToken: import.meta.env.VITE_DEV_BYPASS_TOKEN,
  });
};

// Legacy exports for backward compat
export const createOrder = initiatePayment;
export const verifyPayment = verifyRazorpay;
