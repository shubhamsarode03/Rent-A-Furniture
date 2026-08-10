import { useCallback } from 'react';
import { paymentApi } from '@/api/paymentApi';
import { useQueryClient } from '@tanstack/react-query';

export function usePayment() {
  const queryClient = useQueryClient();

  const create = useCallback(async (payload) => {
    return await paymentApi.createPayment(payload);
  }, []);

  const verify = useCallback(async (payload) => {
    const result = await paymentApi.verifyPayment(payload);
    // Invalidate all relevant queries after successful payment
    queryClient.invalidateQueries({ queryKey: ['furniture'] });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order'] });
    return result;
  }, [queryClient]);

  const handleFailure = useCallback(async (razorpayOrderId) => {
    const result = await paymentApi.handlePaymentFailure(razorpayOrderId);
    // Invalidate orders to reflect payment failure status
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order'] });
    return result;
  }, [queryClient]);

  return { create, verify, handleFailure };
}
