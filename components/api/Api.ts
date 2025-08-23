import axios from 'axios';

// Create an Axios instance with a base URL.
// SSL/TLS validation is now enabled for security
const api = axios.create({
  baseURL: 'https://api.bskmt.com/api/v1',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

