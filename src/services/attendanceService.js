// src/services/attendanceServiceStop.js
import api from './api';

export const attendanceServiceStop = {
  // Create attendance session
  createAttendance: async (data) => {
    try {
      const response = await api.post('/attendance', data);
      return response.data;
    } catch (error) {
      console.error('Create attendance error:', error);
      throw error.response?.data || error;
    }
  },

  // Get module attendance
  getModuleAttendance: async (moduleId) => {
    try {
      const response = await api.get(`/attendance/module/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Get module attendance error:', error);
      throw error.response?.data || error;
    }
  },

  // Update student attendance status
  updateAttendance: async (attendanceId, studentId, data) => {
    try {
      const response = await api.patch(
        `/attendance/${attendanceId}/student/${studentId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Update attendance error:', error);
      throw error.response?.data || error;
    }
  },

  // Generate QR code for attendance session
  generateQRCode: async (attendanceId) => {
    try {
      const response = await api.get(`/attendance/${attendanceId}/qr`);
      
      // Validate the response
      if (!response.data?.data) {
        throw new Error('Invalid QR code generated');
      }

      return response.data;
    } catch (error) {
      console.error('Generate QR code error:', error);
      throw error.response?.data || error;
    }
  },


  // Mark attendance using QR code
  markAttendanceQR: async (data) => {
    try {
      // Validate QR data
      if (!data.attendanceId || !data.token) {
        throw new Error('Invalid QR code data');
      }

      const payload = {
        attendanceId: data.attendanceId,
        token: data.token,
        timestamp: new Date().toISOString()
      };

      const response = await api.post('/attendance/qr-mark', {
        qrData: JSON.stringify(payload)
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to mark attendance');
      }

      return response.data;
    } catch (error) {
      console.error('Mark attendance QR error:', error);
      throw error.response?.data || error;
    }
  },

  // Get student's attendance for a module
  getStudentAttendance: async (moduleId) => {
    try {
      const response = await api.get(`/attendance/student/module/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Get student attendance error:', error);
      throw error.response?.data || error;
    }
  },

  // Update session status
  updateSessionStatus: async (attendanceId, status) => {
    try {
      if (!['pending', 'active', 'completed'].includes(status)) {
        throw new Error('Invalid session status');
      }

      const response = await api.patch(`/attendance/${attendanceId}/status`, { 
        status,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Update session status error:', error);
      throw error.response?.data || error;
    }
  },

  // Validate attendance session and QR code
  validateQRSession: async (attendanceId) => {
    try {
      const response = await api.get(`/attendance/${attendanceId}/validate`);
      return response.data;
    } catch (error) {
      console.error('Validate QR session error:', error);
      throw error.response?.data || error;
    }
  },


  // Get attendance stats for a module
  getAttendanceStats: async (moduleId) => {
    try {
      const response = await api.get(`/attendance/stats/module/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Get attendance stats error:', error);
      throw error.response?.data || error;
    }
  },

  // Get attendance records by date range
  getAttendanceByDateRange: async (moduleId, startDate, endDate) => {
    try {
      const response = await api.get(
        `/attendance/module/${moduleId}/range?start=${startDate}&end=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error('Get attendance by date range error:', error);
      throw error.response?.data || error;
    }
  },

  // Export attendance to CSV
  exportAttendance: async (moduleId) => {
    try {
      const response = await api.get(`/attendance/module/${moduleId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export attendance error:', error);
      throw error.response?.data || error;
    }
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
      console.error('Import attendance error:', error);
      throw error.response?.data || error;
    }
  },

  // Get today's attendance session
  getTodaySession: async (moduleId) => {
    try {
      const response = await api.get(`/attendance/module/${moduleId}/today`);
      return response.data;
    } catch (error) {
      console.error('Get today session error:', error);
      throw error.response?.data || error;
    }
  },

  // Get active attendance sessions
  getActiveSessions: async (moduleId) => {
    try {
      const response = await api.get(`/attendance/module/${moduleId}/active`);
      return response.data;
    } catch (error) {
      console.error('Get active sessions error:', error);
      throw error.response?.data || error;
    }
  },

  // Update multiple students' attendance at once
  updateBulkAttendance: async (attendanceId, studentsData) => {
    try {
      const response = await api.patch(
        `/attendance/${attendanceId}/bulk-update`,
        { students: studentsData }
      );
      return response.data;
    } catch (error) {
      console.error('Update bulk attendance error:', error);
      throw error.response?.data || error;
    }
  }
};


export const isQRCodeExpired = (qrData) => {
  try {
    const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    if (!data.expiresAt) {
      return true;
    }

    const expiryTime = new Date(data.expiresAt).getTime();
    const currentTime = Date.now();
    // Add 30-second buffer for network latency
    return currentTime > (expiryTime + 30000);
  } catch (error) {
    console.error('QR validation error:', error);
    return true;
  }
};

// New helper functions for QR code handling
export const validateQRData = (qrData) => {
  try {
    const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    if (!data.attendanceId || !data.token) {
      return {
        isValid: false,
        error: 'Invalid QR code format'
      };
    }

    if (isQRCodeExpired(data)) {
      return {
        isValid: false,
        error: 'QR code has expired'
      };
    }

    return {
      isValid: true,
      data: data
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid QR code data'
    };
  }
};

export const formatQRPayload = (attendanceId, token) => {
  return {
    attendanceId,
    token,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes expiry
  };
};

// Keep existing helper functions
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

export const generateQRPayload = (attendanceId, token) => {
  return JSON.stringify({
    attendanceId,
    token,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes expiry
  });
};

export default attendanceServiceStop;