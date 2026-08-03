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
};
