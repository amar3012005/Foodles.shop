import axios from 'axios';

// Use REACT_APP_BACKEND_URL from .env files or fallback (Comment 9)
const API_URL = process.env.REACT_APP_BACKEND_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'  // Local development
    : 'https://foodles-backend-lpzp.onrender.com'); // Production backend

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add connection status check
const checkConnection = async () => {
  try {
    const response = await api.get('/health');
    return true;
  } catch (error) {
    console.error('🔴 Backend connection failed:', {
      url: API_URL,
      error: error.message
    });
    return false;
  }
};

// Check connection on init
checkConnection();

// Add request logging for debugging
api.interceptors.request.use(request => {
  return request;
});

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;