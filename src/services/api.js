// client/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Module services
export const moduleService = {
  // Create module
  createModule: async (moduleData) => {
    try {
      const response = await api.post('/modules', moduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all modules
  getAllModules: async () => {
    try {
      const response = await api.get('/modules');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get lecturer's modules
  getLecturerModules: async () => {
    try {
      const response = await api.get('/modules/lecturer');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single module
  getModuleById: async (id) => {
    try {
      const response = await api.get(`/modules/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update module
  updateModule: async (id, moduleData) => {
    try {
      const response = await api.put(`/modules/${id}`, moduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete module
  deleteModule: async (id) => {
    try {
      const response = await api.delete(`/modules/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Student enrollment services
  addStudent: async (moduleId, studentData) => {
    try {
      const response = await api.post(`/modules/${moduleId}/students`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeStudent: async (moduleId, studentId) => {
    try {
      const response = await api.delete(`/modules/${moduleId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // CSV upload for bulk student enrollment
  uploadStudents: async (moduleId, formData) => {
    try {
      const response = await api.post(
        `/modules/${moduleId}/students/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get enrolled students
  getEnrolledStudents: async (moduleId) => {
    try {
      const response = await api.get(`/modules/${moduleId}/students`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Download CSV template
  getCSVTemplate: async () => {
    try {
      const response = await api.get('/modules/students/template', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Error handling helper
export const handleApiError = (error) => {
  console.error('API Error:', error);
  const errorMessage = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      'An unexpected error occurred';
  toast.error(errorMessage);
  return errorMessage;
};

// Helper functions
export const getAuthToken = () => localStorage.getItem('token');

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export default api;