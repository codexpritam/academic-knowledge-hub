import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (
      error.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      message = error.response.data.errors.join(', ');
    } else if (error.message) {
      message = error.message;
    }

    if (
      typeof message === 'string' &&
      message.includes('{"error":')
    ) {
      const jsonMatch = message.match(/\{[\s\S]*"error"[\s\S]*\}/);

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);

          if (parsed?.error?.message) {
            message = parsed.error.message;
          }
        } catch {
          // Keep original message
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;