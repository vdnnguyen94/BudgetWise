const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Enhanced fetch wrapper that handles 401 errors globally
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Add authorization header if token exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized (expired token)
    if (response.status === 401) {
      console.log('🚨 Token expired or invalid - logging out');
      handleTokenExpiration();
      throw new Error('Session expired. Please login again.');
    }
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission.');
    }
    
    return response;
  } catch (error) {
    // Network errors
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

/**
 * Handle token expiration - clear storage and redirect
 */
const handleTokenExpiration = () => {
  // Clear all auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  
  // Dispatch custom event that App.js will listen to
  window.dispatchEvent(new Event('token-expired'));
  
  // Redirect to home/login after a brief delay
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
};

/**
 * Check if token is expired (client-side check)
 */
export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return true;
  }
  
  try {
    // Decode JWT token (without verifying signature - that's backend's job)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If we can't decode, assume expired
  }
};

/**
 * Get token expiration time in human readable format
 */
export const getTokenExpiration = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = new Date(payload.exp * 1000);
    return expirationTime;
  } catch (error) {
    return null;
  }
};

export default {
  apiFetch,
  isTokenExpired,
  getTokenExpiration,
  handleTokenExpiration
};