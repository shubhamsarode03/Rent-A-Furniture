import api from './axiosInstance';

export const categoryApi = {
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
  createCategory: async (data) => {
    const res = await api.post('/categories', data);
    return res.data;
  },
  updateCategory: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}`);
  },
};
