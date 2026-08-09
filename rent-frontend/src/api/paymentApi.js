import api from './axiosInstance';

export const paymentApi = {
  createPayment: async (data) => {
    const res = await api.post('/payments/create', data);
    return res.data;
  },
  verifyPayment: async (data) => {
    const res = await api.post('/payments/verify', data);
    return res.data;
  },
  handlePaymentFailure: async (razorpayOrderId) => {
    const res = await api.post('/payments/failure', razorpayOrderId, {
      headers: { 'Content-Type': 'text/plain' }
    });
    return res.data;
  },
  // Returns a list of payments for the given order
  getPaymentsByOrder: async (orderId) => {
    const res = await api.get(`/payments/${orderId}`);
    return res.data;
  },
};
