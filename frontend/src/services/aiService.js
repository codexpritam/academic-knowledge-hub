import api from './api';

export const aiService = {
  askQuestion: async (documentId, question) => {
    return api.post(`/documents/${documentId}/ask`, { question });
  }
};
