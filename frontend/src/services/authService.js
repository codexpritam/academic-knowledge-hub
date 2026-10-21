import api from './api';

export const authService = {
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  verifyGoogleToken: async (credential) => {
    return api.post('/auth/google/verify', { credential });
  },

  getGoogleAuthUrl: async () => {
    return api.get('/auth/google');
  }
};
