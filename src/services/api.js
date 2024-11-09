// src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://eeng-lms-backend.onrender.com/api';

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
  // Create a new attendance session
  createAttendance: async (data) => {
    try {
      console.log('Creating attendance with data:', data);

      // Ensure all required fields are present
      if (!data.moduleId || !data.date || !data.startTime || !data.endTime) {
        throw new Error('Missing required fields');
      }

      const response = await api.post('/attendance', {
        moduleId: data.moduleId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type || 'lecture'
      });

      console.log('Raw attendance creation response:', response);

      // If the response is nested under a 'data' property
      const sessionData = response.data.data || response.data;

      if (!sessionData || !sessionData._id) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response format from server');
      }

      return {
        data: sessionData,
        success: true,
        message: 'Attendance session created successfully'
      };

    } catch (error) {
      console.error('API createAttendance error:', error);
      throw {
        response: {
          data: {
            message: error.message || 'Failed to create attendance session',
            error: error
          }
        }
      };
    }
  },

  updateSessionStatus: async (attendanceId, status) => {
    try {
      if (!attendanceId) {
        throw new Error('Attendance ID is required');
      }

      console.log('Updating session status:', { attendanceId, status });
      
      const response = await api.patch(`/attendance/${attendanceId}/status`, { 
        status,
        updatedAt: new Date().toISOString()
      });

      console.log('Update session status response:', response);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update session status');
      }

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Update session status error:', error);
      throw error.response?.data || error;
    }
  },

  // Get attendance records for a module
  getModuleAttendance: async (moduleId) => {
    try {
      if (!moduleId) {
        throw new Error('Module ID is required');
      }

      console.log('Fetching attendance for module:', moduleId);
      const response = await api.get(`/attendance/module/${moduleId}`);
      console.log('Module attendance response:', response);

      return {
        ...response,
        data: {
          ...response.data,
          data: response.data.data || [] // Ensure we always return an array
        }
      };
    } catch (error) {
      console.error('Get module attendance error:', error);
      throw error.response?.data || error;
    }
  },

  // Update attendance status for a student
  updateAttendance: async (attendanceId, studentId, data) => {
    try {
      // Validate parameters
      if (!attendanceId || !studentId || !data.status) {
        throw new Error('Missing required attendance update data');
      }

      // Validate status
      const validStatuses = ['present', 'absent', 'late'];
      if (!validStatuses.includes(data.status)) {
        throw new Error('Invalid attendance status');
      }

      console.log('Updating attendance:', { attendanceId, studentId, data });

      const response = await api.patch(
        `/attendance/${attendanceId}/student/${studentId}`,
        data
      );

      console.log('Update attendance response:', response);
      return response;
    } catch (error) {
      console.error('Update attendance error:', error);
      throw error.response?.data || error;
    }
  },

  // Generate QR code for attendance
  generateQRCode: async (attendanceId) => {
    try {
      if (!attendanceId) {
        throw new Error('Attendance ID is required');
      }

      console.log('Generating QR code for attendance:', attendanceId);
      const response = await api.get(`/attendance/${attendanceId}/qr`);
      console.log('Raw QR code response:', response);

      // If no QR data received, create a fallback
      if (!response.data) {
        const qrData = {
          attendanceId,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          type: 'attendance'
        };

        return {
          data: JSON.stringify(qrData)
        };
      }

      return response;
    } catch (error) {
      console.error('Generate QR code error:', error);
      throw error;
    }
  },

  // Mark attendance using QR code
  markAttendanceQR: async (qrData) => {
    try {
      if (!qrData) {
        throw new Error('QR data is required');
      }

      console.log('Marking attendance with QR code:', qrData);

      const response = await api.post('/attendance/qr-mark', {
        qrData,
        timestamp: new Date().toISOString()
      });

      console.log('Mark attendance QR response:', response);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to mark attendance');
      }

      return response;
    } catch (error) {
      console.error('Mark attendance QR error:', error);
      throw error.response?.data || error;
    }
  },

  // Get student's attendance for a module
  getStudentAttendance: async (moduleId, studentId) => {
    try {
      if (!moduleId) {
        throw new Error('Module ID is required');
      }

      const response = await api.get(`/attendance/student/module/${moduleId}`);
      console.log('Student attendance response:', response);

      return {
        ...response,
        data: {
          ...response.data,
          data: response.data.data || [] // Ensure we always return an array
        }
      };
    } catch (error) {
      console.error('Get student attendance error:', error);
      throw error.response?.data || error;
    }
  },

  // Validate attendance session
  validateAttendanceSession: async (attendanceId) => {
    try {
      if (!attendanceId) {
        throw new Error('Attendance ID is required');
      }

      const response = await api.get(`/attendance/${attendanceId}/validate`);
      return response.data?.isValid || false;
    } catch (error) {
      console.error('Validate attendance session error:', error);
      return false;
    }
  },

  // Get attendance statistics for a module
  getAttendanceStats: async (moduleId) => {
    try {
      if (!moduleId) {
        throw new Error('Module ID is required');
      }

      const response = await api.get(`/attendance/stats/module/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Get attendance stats error:', error);
      throw error.response?.data || error;
    }
  },

  // Check if QR code is expired
  isQRCodeExpired: (qrData) => {
    try {
      const parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      if (!parsedData.expiresAt) {
        return true;
      }

      const expiryTime = new Date(parsedData.expiresAt).getTime();
      return Date.now() > expiryTime;
    } catch (error) {
      console.error('QR code validation error:', error);
      return true; // Consider invalid QR codes as expired
    }
  },



  // Format QR code data
  formatQRData: (attendanceId) => {
    return JSON.stringify({
      attendanceId,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      type: 'attendance'
    });
  },



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

export const gradeService = {
  // Get module grades
  getModuleGrades: async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/grades/module/${moduleId}/grades`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get module grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Get grade statistics
  getGradeStatistics: async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/grades/module/${moduleId}/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get grade statistics error:', error);
      throw error.response?.data || error;
    }
  },

  // Update grade
  updateGrade: async (moduleId, studentId, gradeData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/grades/module/${moduleId}/student/${studentId}`, gradeData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update grade error:', error);
      throw error.response?.data || error;
    }
  },

  // Calculate final grades
  calculateAllFinalGrades: async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/grades/module/${moduleId}/calculate`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Calculate grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Export grades
  exportGrades: async (moduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/grades/module/${moduleId}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Import grades
  importGrades: async (moduleId, file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/grades/module/${moduleId}/import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Import grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Update attendance grade
  updateAttendanceGrade: async (moduleId, studentId, attendanceData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/grades/module/${moduleId}/student/${studentId}/attendance`, attendanceData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update attendance grade error:', error);
      throw error.response?.data || error;
    }
  }
};

export default api;