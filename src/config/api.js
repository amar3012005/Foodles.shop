import axios from 'axios';

// Use REACT_APP_BACKEND_URL from .env files or fallback (Comment 9)
const API_URL = process.env.REACT_APP_BACKEND_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'  // Local development
    : 'https://foodles-backend.onrender.com'); // Production backend

// Only log API configuration in development
if (process.env.NODE_ENV !== 'production') {
  console.log('🌐 API Configuration:', {
    environment: process.env.NODE_ENV,
    apiUrl: API_URL,
    configuredUrl: process.env.REACT_APP_BACKEND_URL || 'not set - using default',
    mode: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT',
    host: window.location.host
  });
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased from 10000 to 30000 (30 seconds) for payment verification
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add connection status check
const checkConnection = async () => {
  try {
    const response = await api.get('/health');
    if (process.env.NODE_ENV !== 'production') {
      console.log('🟢 Backend connected successfully:', {
        url: API_URL,
        status: response.data.status,
        services: response.data.services
      });
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('🔴 Backend connection failed:', {
        url: API_URL,
        error: error.message
      });
    }
    return false;
  }
};

// Check connection on init
checkConnection();

// Add request logging for debugging
api.interceptors.request.use(request => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('📤 Making request to:', {
      url: `${request.baseURL}${request.url}`,
      method: request.method?.toUpperCase(),
      environment: process.env.NODE_ENV,
      origin: window.location.origin
    });
  }
  return request;
});

api.interceptors.response.use(
  response => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('📥 Response Received:', {
        url: response.config.url,
        status: response.status,
        timestamp: new Date().toISOString()
      });
    }
    return response;
  },
  error => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

export default api;