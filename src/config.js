// Use REACT_APP_BACKEND_URL from .env files or fallback (Comment 9)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'  // Local development
    : 'https://foodles-backend.onrender.com'); // Production backend

export default API_BASE_URL;
