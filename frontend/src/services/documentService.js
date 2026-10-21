import api from './api';

export const documentService = {
  getDocuments: async (params = {}) => {
    return api.get('/documents', { params });
  },

  getDocumentById: async (id) => {
    return api.get(`/documents/${id}`);
  },

  uploadDocument: async (formData, onProgress) => {
    return api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },

  updateDocument: async (id, data) => {
    return api.patch(`/documents/${id}`, data);
  },

  deleteDocument: async (id) => {
    return api.delete(`/documents/${id}`);
  },

  getDistinctSubjects: async () => {
    return api.get('/documents/subjects');
  },

  getSystemStats: async () => {
    return api.get('/documents/stats');
  }
};
