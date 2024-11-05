// src/services/api.js
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

// Attendance services
export const attendanceService = {
  createAttendance: async (data) => {
    try {
        console.log('Creating attendance with data:', data);
        const response = await api.post('/attendance', data);
        console.log('Create attendance response:', response);
        return response;
    } catch (error) {
        console.error('API createAttendance error:', error.response?.data || error);
        throw error;
    }
},

  getModuleAttendance: async (moduleId) => {
    try {
      const response = await api.get(`/attendance/module/${moduleId}`);
      return response;
    } catch (error) {
      console.error('API getModuleAttendance error:', error.response?.data || error);
      throw error;
    }
  },

  updateAttendance: async (attendanceId, studentId, data) => {
    try {
      const response = await api.patch(
        `/attendance/${attendanceId}/student/${studentId}`,
        data
      );
      return response;
    } catch (error) {
      console.error('API updateAttendance error:', error.response?.data || error);
      throw error;
    }
  },

  generateQRCode: async (attendanceId) => {
    try {
        console.log('Generating QR code for attendance ID:', attendanceId);
        const response = await api.get(`/attendance/${attendanceId}/qr`);
        console.log('Raw QR code response:', response);
        
        // If the response doesn't have data.data, create a fallback
        if (!response.data?.data) {
            response.data = {
                data: JSON.stringify({
                    attendanceId,
                    timestamp: new Date().toISOString(),
                    type: 'attendance'
                })
            };
        }
        
        return response;
    } catch (error) {
        console.error('API generateQRCode error:', error.response?.data || error);
        throw error;
    }
},

  markAttendanceQR: async (qrData) => {
    try {
      const response = await api.post('/attendance/qr-mark', qrData);
      return response;
    } catch (error) {
      console.error('API markAttendanceQR error:', error.response?.data || error);
      throw error;
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
  }
};

// Student services
export const studentService = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await api.get('/users/students');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get student details
  getStudentDetails: async (studentId) => {
    try {
      const response = await api.get(`/users/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get student attendance
  getStudentAttendance: async (moduleId) => {
    try {
      const response = await api.get(`/attendance/student/module/${moduleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
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

// File upload service
export const fileService = {
  uploadFile: async (formData, path) => {
    try {
      const response = await api.post(`/upload/${path}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getFile: async (fileId) => {
    try {
      const response = await api.get(`/files/${fileId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// QR Code service
export const qrCodeService = {
  generate: async (data) => {
    try {
      const response = await api.post('/qr/generate', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  verify: async (qrData) => {
    try {
      const response = await api.post('/qr/verify', qrData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// WebSocket setup for real-time updates (if needed)
export const setupWebSocket = (token) => {
  const ws = new WebSocket(`${process.env.VITE_WS_URL}?token=${token}`);
  
  ws.onopen = () => {
    console.log('WebSocket Connected');
  };
  
  ws.onclose = () => {
    console.log('WebSocket Disconnected');
  };
  
  return ws;
};

export default api;