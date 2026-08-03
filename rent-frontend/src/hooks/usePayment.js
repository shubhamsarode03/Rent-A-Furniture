import { useCallback } from 'react';
import { paymentApi } from '@/api/paymentApi';

export function usePayment() {
  const create = useCallback(async (payload) => {
    return await paymentApi.createPayment(payload);
  }, []);

  const verify = useCallback(async (payload) => {
    return await paymentApi.verifyPayment(payload);
  }, []);

  return { create, verify };
}
