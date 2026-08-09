import api from './axiosInstance';

export const orderApi = {
  // RENTER: get own orders
  getMyOrders: async (params = {}) => {
    const res = await api.get('/orders/my', { params });
    return res.data;
  },
  // ADMIN: get all orders
  getAllOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  createOrder: async (data) => {
    const res = await api.post('/orders', data);
    return res.data;
  },
  updateOrderStatus: async (id, data) => {
    const res = await api.patch(`/orders/${id}/status`, data);
    return res.data;
  },
  retryPayment: async (id) => {
    const res = await api.post(`/orders/${id}/retry-payment`);
    return res.data;
  },
  cancelOrder: async (id, data = {}) => {
    const res = await api.post(`/orders/${id}/cancel`, data);
    return res.data;
  },
  activateOrder: async (id, data = {}) => {
    const res = await api.post(`/orders/${id}/activate`, data);
    return res.data;
  },
  downloadInvoice: async (id) => {
    const res = await api.get(`/orders/${id}/invoice`, {
      responseType: 'blob'
    });
    return res;
  },
};
