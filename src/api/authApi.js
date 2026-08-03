import api from './axiosInstance';

export const authApi = {
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    // Store token for axios interceptor
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    // Store token for axios interceptor
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    // Clear token
    localStorage.removeItem('token');
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
