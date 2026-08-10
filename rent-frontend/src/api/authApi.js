import api from './axiosInstance';

export const authApi = {
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    // Backend sets HttpOnly JWT cookie
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    // Backend sets HttpOnly JWT cookie
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    // Backend clears HttpOnly JWT cookie
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
