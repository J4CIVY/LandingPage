import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.bskmt.com"
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    // It's good practice to ensure headers exist before assigning
    config.headers = config.headers || {}; 
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  // Handle request errors (e.g., network issues)
  return Promise.reject(error);
});

// Optional: Add a response interceptor for global error handling or token refresh
api.interceptors.response.use(response => {
  return response;
}, error => {
  // Example: If a 401 Unauthorized response is received, redirect to login
  if (error.response && error.response.status === 401) {
    console.warn('Unauthorized access. Redirecting to login...');
    // Depending on your routing setup, you might use window.location or a history object
    // window.location.href = '/login'; 
    // Or, if using React Router's useNavigate outside a component:
    // import { createBrowserHistory } from 'history';
    // const history = createBrowserHistory();
    // history.push('/login');
  }
  return Promise.reject(error);
});

export default api;