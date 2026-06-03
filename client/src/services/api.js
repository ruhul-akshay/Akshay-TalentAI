
/**
 * API Service for connecting the React frontend with the Node.js backend.
 * This file centralizes all backend communication.
 */

// Use environment variable for backend URL or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Core helper function for making API requests.
 * Handles authentication headers, FormData, and common error cases.
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/api/jobs')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - The parsed JSON response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  // Clean endpoint: ensure it starts with / and remove BASE_URL if present
  const path = endpoint.startsWith('http') 
    ? endpoint 
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // Check if body is FormData to allow browser to set correct multipart boundary
  const isFormData = options.body instanceof FormData;

  const config = {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  // Automatically stringify body if it's a plain object
  if (options.body && typeof options.body === 'object' && !isFormData) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(path, config);

    // Handle session expiration
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
};

// Simplified convenience methods
export const api = {
  get: (endpoint, headers = {}) => apiRequest(endpoint, { method: 'GET', headers }),
  
  post: (endpoint, body, headers = {}) => apiRequest(endpoint, { method: 'POST', body, headers }),
  
  put: (endpoint, body, headers = {}) => apiRequest(endpoint, { method: 'PUT', body, headers }),
  
  delete: (endpoint, headers = {}) => apiRequest(endpoint, { method: 'DELETE', headers }),

  // For multi-part file uploads
  upload: (endpoint, formData, headers = {}) => apiRequest(endpoint, { 
    method: 'POST', 
    body: formData, 
    headers 
  }),
};

export default api;
