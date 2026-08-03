import api from './axiosInstance';

export const cartApi = {
  // Backend returns CartResponse[] (flat array, not {items, total} wrapper)
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },
  addToCart: async (data) => {
    const res = await api.post('/cart', data);
    return res.data;
  },
  removeFromCart: async (id) => {
    await api.delete(`/cart/${id}`);
  },
  clearCart: async () => {
    await api.delete('/cart');
  },
};
