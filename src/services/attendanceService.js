// src/services/attendanceService.js
import api from './api';

export const attendanceServiceStop = {
  // Create attendance session
  createAttendance: async (data) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },

  // Get module attendance
  getModuleAttendance: async (moduleId) => {
    const response = await api.get(`/attendance/module/${moduleId}`);
    return response.data;
  },

  // Update student attendance status
  updateAttendance: async (attendanceId, studentId, data) => {
    const response = await api.patch(
      `/attendance/${attendanceId}/student/${studentId}`,
      data
    );
    return response.data;
  },

  // Generate QR code
  generateQRCode: async (attendanceId) => {
    const response = await api.get(`/attendance/${attendanceId}/qr`);
    return response.data;
  },

  // Mark attendance using QR code
  markAttendanceQR: async (qrData) => {
    const response = await api.post('/attendance/qr-mark', { qrData });
    return response.data;
  },

  // Get student's attendance for a module
  getStudentAttendance: async (moduleId) => {
    const response = await api.get(`/attendance/student/module/${moduleId}`);
    return response.data;
  },

  // Update session status
  updateSessionStatus: async (attendanceId, status) => {
    const response = await api.patch(`/attendance/${attendanceId}/status`, { status });
    return response.data;
  },

  // Get attendance stats
  getAttendanceStats: async (moduleId) => {
    const response = await api.get(`/attendance/stats/module/${moduleId}`);
    return response.data;
  },

  // Validate attendance session
  validateSession: async (attendanceId) => {
    const response = await api.get(`/attendance/${attendanceId}/validate`);
    return response.data;
  },

  // Get attendance by date range
  getAttendanceByDateRange: async (moduleId, startDate, endDate) => {
    const response = await api.get(
      `/attendance/module/${moduleId}/range?start=${startDate}&end=${endDate}`
    );
    return response.data;
  },

  // Export attendance to CSV
  exportAttendance: async (moduleId) => {
    const response = await api.get(`/attendance/module/${moduleId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Import attendance from CSV
  importAttendance: async (moduleId, formData) => {
    try {
      const response = await api.post(
        `/attendance/module/${moduleId}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('CSV Import Error:', error);
      throw error;
    }
  },

  // Get today's session
  getTodaySession: async (moduleId) => {
    const response = await api.get(`/attendance/module/${moduleId}/today`);
    return response.data;
  },

  // Get active sessions
  getActiveSessions: async (moduleId) => {
    const response = await api.get(`/attendance/module/${moduleId}/active`);
    return response.data;
  },

  // Update multiple students' attendance
  updateBulkAttendance: async (attendanceId, studentsData) => {
    const response = await api.patch(
      `/attendance/${attendanceId}/bulk-update`,
      { students: studentsData }
    );
    return response.data;
  }
};

// Helper functions
export const formatAttendanceDate = (date) => {
  return date.toISOString().split('T')[0];
};

export const formatTimeForAPI = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateAttendancePercentage = (present, total) => {
  if (total === 0) return 0;
  return ((present / total) * 100).toFixed(1);
};

export const isQRCodeExpired = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    return new Date() > new Date(data.expiresAt);
  } catch (error) {
    console.error('QR validation error:', error);
    return true;
  }
};

export default attendanceServiceStop;