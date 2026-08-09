import axiosInstance from './axiosInstance';

export const addressApi = {
  getAddresses: async () => {
    const res = await axiosInstance.get('/addresses');
    return res.data;
  },
  getAddress: async (id) => {
    const res = await axiosInstance.get(`/addresses/${id}`);
    return res.data;
  },
  createAddress: async (data) => {
    const res = await axiosInstance.post('/addresses', data);
    return res.data;
  },
  updateAddress: async (id, data) => {
    const res = await axiosInstance.put(`/addresses/${id}`, data);
    return res.data;
  },
  deleteAddress: async (id) => {
    const res = await axiosInstance.delete(`/addresses/${id}`);
    return res.data;
  },
};
