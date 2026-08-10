import api from './axiosInstance';

export const furnitureApi = {
  getPublicFurniture: async (params) => {
    // Remove 'available' parameter since backend only returns AVAILABLE furniture
    const { available, ...cleanParams } = params;
    const res = await api.get('/furniture/public', { params: cleanParams });
    return res.data;
  },
  getOwnerFurniture: async (params) => {
    const res = await api.get('/furniture/owner', { params });
    return res.data;
  },
  getAdminFurniture: async (params) => {
    const res = await api.get('/furniture/admin', { params });
    return res.data;
  },
  getFurniture: async () => {
    const res = await api.get('/furniture/admin');
    return res.data;
  },
  getFurnitureById: async (id) => {
    const res = await api.get(`/furniture/${id}`);
    return res.data;
  },
  createFurniture: async (data) => {
    const res = await api.post('/furniture', data);
    return res.data;
  },
  updateFurniture: async (id, data) => {
    const res = await api.put(`/furniture/${id}`, data);
    return res.data;
  },
  deleteFurniture: async (id) => {
    await api.delete(`/furniture/${id}`);
  },
  approveFurniture: async (id) => {
    const res = await api.patch(`/furniture/${id}/approve`);
    return res.data;
  },
  rejectFurniture: async (id) => {
    const res = await api.patch(`/furniture/${id}/reject`);
    return res.data;
  },
  markAsRented: async (id) => {
    const res = await api.patch(`/furniture/${id}/rent`);
    return res.data;
  },
  markAsAvailable: async (id) => {
    const res = await api.patch(`/furniture/${id}/available`);
    return res.data;
  },
};
