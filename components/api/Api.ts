import axios from 'axios';
import https from 'https';

// Create an Axios instance with a base URL.
const api = axios.create({
  baseURL: 'https://api.bskmt.com/api/v1',
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export default api;

