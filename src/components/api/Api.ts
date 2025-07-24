import axios from 'axios';

// Create an Axios instance with a base URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.bskmt.com"
});

export default api;