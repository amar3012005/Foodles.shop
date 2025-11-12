import axios from 'axios';

// Use REACT_APP_BACKEND_URL from .env files or fallback (Comment 9)
const API_URL = process.env.REACT_APP_BACKEND_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'  // Local development
    : 'https://foodles-backend-lpzp.onrender.com'); // Production backend

console.log('🌐 API Configuration:', {
  environment: process.env.NODE_ENV,
  apiUrl: API_URL,
  configuredUrl: process.env.REACT_APP_BACKEND_URL || 'not set - using default',
  mode: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT',
  host: window.location.host
});

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
    console.log('🟢 Backend connected successfully:', {
      url: API_URL,
      status: response.data.status,
      services: response.data.services
    });
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
  console.log('📤 Making request to:', {
    url: `${request.baseURL}${request.url}`,
    method: request.method?.toUpperCase(),
    environment: process.env.NODE_ENV,
    origin: window.location.origin
  });
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('📥 Response Received:', {
      url: response.config.url,
      status: response.status,
      timestamp: new Date().toISOString()
    });
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