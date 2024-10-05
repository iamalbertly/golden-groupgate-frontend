import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Simulate network error (uncomment for testing)
// api.interceptors.request.use(async (config) => {
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   throw new Error('Network Error');
// });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;