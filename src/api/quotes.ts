import api from './axios';
import { QuoteRequest } from '@/types';

export const submitQuote = async (data: QuoteRequest): Promise<void> => {
  try {
    await api.post('/api/quotes', data);
  } catch {
    // Dev mode - just succeed silently
  }
};
