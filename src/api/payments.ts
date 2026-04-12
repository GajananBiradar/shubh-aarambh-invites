import api from './axios';
import { PaymentOrder, PaymentVerification } from '@/types';

export interface PaymentCheckResponse {
  hasPaid: boolean;
  isFreeUser: boolean;
  isFreeTemplate: boolean;
  requiresPayment: boolean;
}

export const checkPayment = async (templateId: string): Promise<boolean> => {
  try {
    const { data } = await api.get(`/api/payments/check?templateId=${templateId}`);
    return data.hasPaid;
  } catch {
    return import.meta.env.VITE_DEV_MODE === 'true';
  }
};

export const checkPaymentStatus = async (templateId: string): Promise<PaymentCheckResponse> => {
  try {
    const { data } = await api.get(`/api/payments/check?templateId=${templateId}`);
    return data;
  } catch {
    // In dev mode, assume no payment required
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      return {
        hasPaid: true,
        isFreeUser: true,
        isFreeTemplate: true,
        requiresPayment: false,
      };
    }
    throw new Error('Failed to check payment status');
  }
};

export const initiatePayment = async (templateId: string, countryCode: string): Promise<PaymentOrder> => {
  const { data } = await api.post('/api/payments/initiate', { templateId, countryCode });
  return data;
};

export const verifyRazorpay = async (verification: PaymentVerification & { templateId: string }): Promise<void> => {
  await api.post('/api/payments/verify/razorpay', verification);
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
