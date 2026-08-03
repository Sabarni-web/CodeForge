import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    // If unauthorized, could redirect or dispatch logout
    if (error.response?.status === 401) {
      // The component/thunk will handle the redirect
      console.warn('Unauthorized — token may be expired');
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;
