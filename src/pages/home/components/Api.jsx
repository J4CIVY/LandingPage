import axios from 'axios';

// Create an Axios instance with a base URL.
// Using environment variables for the API URL is a good practice as it allows
// for different configurations in development, staging, and production environments.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.bskmt.com"
});

// Request interceptor to automatically add the authentication token to headers.
// This avoids having to add the token manually to every request.
api.interceptors.request.use(config => {
  // Retrieve the token from localStorage.
  const token = localStorage.getItem('token');
  if (token) {
    // Ensure the headers object exists before adding the Authorization header.
    // This prevents potential runtime errors.
    config.headers = config.headers || {}; 
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  // This function will be triggered for request errors (e.g., network issues).
  return Promise.reject(error);
});

// Response interceptor for global error handling.
// This can be used to handle common errors like 401 Unauthorized across the application.
api.interceptors.response.use(response => {
  // Any status code that lie within the range of 2xx cause this function to trigger.
  return response;
}, error => {
  // Any status codes that falls outside the range of 2xx cause this function to trigger.
  // Example: Handle 401 Unauthorized errors globally.
  if (error.response && error.response.status === 401) {
    console.warn('Unauthorized access detected. Redirecting to login...');
    // Here you would typically implement redirection logic.
    // For example, clearing user data from localStorage and redirecting to the login page.
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    // window.location.href = '/login'; 
    // The exact implementation depends on the routing library being used.
  }
  
  // It's important to return a rejected promise to allow further error handling (e.g., in a try-catch block).
  return Promise.reject(error);
});

export default api;

