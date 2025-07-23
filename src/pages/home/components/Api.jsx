import axios from 'axios';

// Create an Axios instance with a base URL.
// Using environment variables for the API URL is a good practice as it allows
// for different configurations in development, staging, and production environments.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.bskmt.com"
});

export default api;