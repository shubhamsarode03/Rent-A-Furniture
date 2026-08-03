import api from './axiosInstance';

export const userApi = {
  getUser: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  updateUser: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
};
