import api from './api';

export const userService = {
  getMyDocuments: async () => {
    return api.get('/users/me/documents');
  },

  getMyProfile: async () => {
    return api.get('/users/me/profile');
  },

  updateMyProfile: async (profileData) => {
    return api.patch('/users/me/profile', profileData);
  },

  deleteMyAccount: async () => {
    return api.delete('/users/me/account');
  }
};
